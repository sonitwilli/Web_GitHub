import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';

interface UseNoAdsGuideProps {
  enableAds?: boolean;
  noAdsBuyPackageInstream?: boolean;
  isVideoPaused?: boolean;
}

interface UseNoAdsGuideReturn {
  showNoAdsGuide: boolean;
  setShowNoAdsGuide: (show: boolean) => void;
}

export const useNoAdsGuide = ({
  enableAds,
  noAdsBuyPackageInstream,
  isVideoPaused,
}: UseNoAdsGuideProps): UseNoAdsGuideReturn => {
  const router = useRouter();
  const [showNoAdsGuide, setShowNoAdsGuide] = useState(false);
  const [hadSessionAdsTracking, setHadSessionAdsTracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const TIME_AUTO_HIDE = 5000;

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
    return enableAds && noAdsBuyPackageInstream && isVideoPaused;
  }, [enableAds, noAdsBuyPackageInstream, isVideoPaused]);

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
        // Ads tracking stopped, show the guide
        setShowNoAdsGuide(true);
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
  }, [clearMonitoringInterval, hadSessionAdsTracking]);

  // Auto-hide after 5 seconds when guide is shown
  useEffect(() => {
    if (showNoAdsGuide) {
      if (intervalRef.current) {
        clearMonitoringInterval();
      }

      setTimeout(() => {
        setShowNoAdsGuide(false);
      }, TIME_AUTO_HIDE);
    }
  }, [showNoAdsGuide, clearMonitoringInterval]);

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

  return {
    showNoAdsGuide,
    setShowNoAdsGuide,
  };
};
