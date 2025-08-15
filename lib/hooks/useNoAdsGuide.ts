import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { StreamItemType } from '@/lib/api/stream';
import { DEVICE_ID } from '../constant/texts';
import { useAppSelector } from '@/lib/store';

interface UseNoAdsGuideProps {
  enableAds?: boolean;
  noAdsBuyPackageInstream?: StreamItemType;
  isVideoPaused?: boolean;
  // Skip intro conditions
  videoCurrentTime?: number;
  introFrom?: number;
  startContent?: number;
  // Additional conditions from image
  isPreviewMode?: boolean; // Review 5' mode
  isSkipIntroVisible?: boolean; // Skip intro
  isPlayerControlVisible?: boolean; // Player control bar
  isNextEpisodeGuideVisible?: boolean; // Next episode guide
  isUsageGuideVisible?: boolean; // Usage guide
  isWarningVisible?: boolean; // Warning situation
  isLogoAnimationAdsVisible?: boolean; // Logo animation ads
  isWatchCreditVisible?: boolean; // Watch credit button
  isStreamTvcVisible?: boolean; // Stream TVC ads
  isContentWarningVisible?: boolean; // Content warning (WC)
}

interface UseNoAdsGuideReturn {
  showNoAdsGuide: boolean;
  setShowNoAdsGuide: (show: boolean) => void;
  // Debug helpers
  getCurrentDailyCount: () => number;
  getDeviceId: () => string;
  canShowToday: () => boolean;
}

// Constants
const STORAGE_KEY_PREFIX = 'noads_guide_count_';
const AUTO_HIDE_DELAY = 5000;

// Utility functions
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createStorageKey = (deviceId: string): string => {
  const dateKey = formatDateKey(new Date());
  return `${STORAGE_KEY_PREFIX}${dateKey}_${deviceId}`;
};

export const useNoAdsGuide = ({
  enableAds,
  noAdsBuyPackageInstream,
  isVideoPaused,
  isSkipIntroVisible,
  isPreviewMode = false,
  isPlayerControlVisible = false,
  isNextEpisodeGuideVisible = false,
  isUsageGuideVisible = false,
  isWarningVisible = false,
  isLogoAnimationAdsVisible = false,
  isWatchCreditVisible = false,
  isStreamTvcVisible = false,
  isContentWarningVisible = false,
}: UseNoAdsGuideProps): UseNoAdsGuideReturn => {
  const router = useRouter();
  const { configs } = useAppSelector((state) => state.app);
  const [showNoAdsGuide, setShowNoAdsGuide] = useState(false);
  const [hadSessionAdsTracking, setHadSessionAdsTracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get device ID
  const getDeviceId = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(DEVICE_ID) || '';
  }, []);

  // Get storage key for today and current device
  const getTodayStorageKey = useCallback((): string => {
    const deviceId = getDeviceId();
    return createStorageKey(deviceId);
  }, [getDeviceId]);

  // Get current count from localStorage
  const getCurrentCount = useCallback((): number => {
    if (typeof window === 'undefined') return 0;

    try {
      const storageKey = getTodayStorageKey();
      const stored = localStorage.getItem(storageKey);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }, [getTodayStorageKey]);

  // Save count to localStorage
  const saveCurrentCount = useCallback(
    (count: number): void => {
      if (typeof window === 'undefined') return;

      try {
        const storageKey = getTodayStorageKey();
        localStorage.setItem(storageKey, count.toString());
      } catch {}
    },
    [getTodayStorageKey],
  );

  // Clean old localStorage entries (keep only today's for current device)
  const cleanOldEntries = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      const currentStorageKey = getTodayStorageKey();
      const deviceId = getDeviceId();
      const todayDateKey = formatDateKey(new Date());
      const keysToRemove: string[] = [];

      // Collect keys to remove
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX) && key !== currentStorageKey) {
          // Parse key format: noads_guide_count_YYYY-MM-DD_deviceId
          const parts = key.replace(STORAGE_KEY_PREFIX, '').split('_');
          if (parts.length >= 2) {
            const keyDatePart = parts.slice(0, -1).join('_'); // YYYY-MM-DD
            const keyDeviceId = parts[parts.length - 1]; // deviceId

            // Remove if:
            // 1. Different device_id
            // 2. Different date (old entries)
            if (keyDeviceId !== deviceId || keyDatePart !== todayDateKey) {
              keysToRemove.push(key);
            }
          } else {
            // Remove malformed keys
            keysToRemove.push(key);
          }
        }
      }

      // Remove collected keys
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Do nothing
    }
  }, [getTodayStorageKey, getDeviceId]);

  // Check if can show guide based on frequency limit
  const canShowGuide = useCallback((): boolean => {
    const noadsFreq = configs?.noads_instream_freq;

    // If no frequency limit, allow unlimited
    if (!noadsFreq || noadsFreq.trim() === '') return true;

    const dailyLimit = parseInt(noadsFreq, 10);
    // If invalid limit, allow unlimited
    if (isNaN(dailyLimit) || dailyLimit <= 0) return true;

    // Check against daily limit
    const currentCount = getCurrentCount();
    return currentCount < dailyLimit; // Must be less than limit
  }, [configs?.noads_instream_freq, getCurrentCount]);

  const handleCount = useCallback(() => {
    const currentCount = getCurrentCount();
    saveCurrentCount(currentCount + 1);
  }, [getCurrentCount, saveCurrentCount]);

  // Check if any blocking UI elements are visible
  const hasBlockingUIVisible = useCallback((): boolean => {
    const hasBlocking =
      isPreviewMode ||
      isSkipIntroVisible ||
      isPlayerControlVisible ||
      false || // Handle undefined case
      isNextEpisodeGuideVisible ||
      isUsageGuideVisible ||
      isWarningVisible ||
      isLogoAnimationAdsVisible ||
      isWatchCreditVisible ||
      isStreamTvcVisible ||
      isContentWarningVisible;

    return hasBlocking;
  }, [
    isPreviewMode,
    isSkipIntroVisible,
    isPlayerControlVisible,
    isNextEpisodeGuideVisible,
    isUsageGuideVisible,
    isWarningVisible,
    isLogoAnimationAdsVisible,
    isWatchCreditVisible,
    isStreamTvcVisible,
    isContentWarningVisible,
  ]);

  // Clear interval
  const clearMonitoringInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset states when URL changes
  const resetStates = useCallback(() => {
    setShowNoAdsGuide(false);
    setHadSessionAdsTracking(false);
    clearMonitoringInterval();
  }, [clearMonitoringInterval]);

  // Check if conditions are met to start listening
  const shouldStartListening = useCallback(() => {
    return (
      enableAds &&
      noAdsBuyPackageInstream &&
      isVideoPaused &&
      !hasBlockingUIVisible()
    );
  }, [enableAds, noAdsBuyPackageInstream, isVideoPaused, hasBlockingUIVisible]);

  // Start monitoring sessionStorage
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearMonitoringInterval();
    }

    if (typeof window !== 'undefined') {
      let i = 0;

      if (sessionStorage && sessionStorage.getItem('session_ads_tracking')) {
        // Mark that ads tracking is running
        setHadSessionAdsTracking(true);
      } else if (hadSessionAdsTracking) {
        // Ads tracking stopped, check if can show guide
        handleCount();
        if (canShowGuide()) {
          // Track count and show guide
          setShowNoAdsGuide(true);
        }
        setHadSessionAdsTracking(false);
      }

      // counter if no ads tracking, clear interval
      i++;
      if (i > 3 && !hadSessionAdsTracking) {
        clearMonitoringInterval();
      } else {
        intervalRef.current = setTimeout(() => {
          startMonitoring();
        }, 1000);
      }
    }
  }, [
    clearMonitoringInterval,
    hadSessionAdsTracking,
    canShowGuide,
    handleCount,
  ]);

  // Auto-hide after 5 seconds when guide is shown
  useEffect(() => {
    if (showNoAdsGuide) {
      if (intervalRef.current) {
        clearMonitoringInterval();
      }

      setTimeout(() => {
        setShowNoAdsGuide(false);
      }, AUTO_HIDE_DELAY);
    }
  }, [showNoAdsGuide, clearMonitoringInterval]);

  // Hide NoAdsGuide if any blocking UI is visible
  useEffect(() => {
    if (hasBlockingUIVisible() && showNoAdsGuide) {
      setShowNoAdsGuide(false);
    }
  }, [hasBlockingUIVisible, showNoAdsGuide]);

  // Start/stop monitoring based on conditions
  useEffect(() => {
    if (shouldStartListening()) {
      startMonitoring();
    }
  }, [shouldStartListening, startMonitoring]);

  // Reset states when URL changes
  useEffect(() => {
    resetStates();
  }, [router.asPath, resetStates]);

  // Clean old localStorage entries on mount
  useEffect(() => {
    cleanOldEntries();
  }, [cleanOldEntries]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMonitoringInterval();
    };
  }, [clearMonitoringInterval]);

  return {
    showNoAdsGuide,
    setShowNoAdsGuide,
    // Debug helpers
    getCurrentDailyCount: getCurrentCount,
    getDeviceId,
    canShowToday: canShowGuide,
  };
};
