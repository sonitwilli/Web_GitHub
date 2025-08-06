import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { useVodPageContext } from '../components/player/context/VodPageContext';
import { AUTO_NEXT_COUNTDOWN_SECONDS } from '../constant/texts';
import { useNextEpisodeNavigation } from './useNextEpisodeNavigation';

interface UseWatchAndSkipCreditReturn {
  isVisible: boolean;
  showAnimation: boolean;
  countdown: number;
  watchCredit: () => void;
  skipToNext: () => void;
}

export const useWatchAndSkipCredit = (
  endContent?: number,
  hasNextEpisode?: boolean,
  onPlayNext?: () => void,
): UseWatchAndSkipCreditReturn => {
  const { videoCurrentTime, videoDuration, previewHandled } =
    usePlayerPageContext();
  const { nextEpisode, routerChapterId } = useVodPageContext();
  const router = useRouter();

  // Use the new navigation hook
  const { navigateToNextEpisode: navigateToNext } = useNextEpisodeNavigation({
    nextEpisode,
    routerChapterId,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasWatchedCredit, setHasWatchedCredit] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_NEXT_COUNTDOWN_SECONDS);
  const [autoNextTimer, setAutoNextTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Check if we should show the watch and skip credit buttons
  useEffect(() => {
    if (
      !hasNextEpisode ||
      !endContent ||
      endContent <= 0 ||
      !videoCurrentTime ||
      !videoDuration
    ) {
      setIsVisible(false);
      return;
    }

    // Show buttons when current time reaches end_content and user hasn't chosen to watch credits
    const shouldShow =
      videoCurrentTime >= endContent &&
      videoCurrentTime < videoDuration &&
      !hasWatchedCredit &&
      !isNavigating &&
      !previewHandled;

    setIsVisible(shouldShow);
  }, [
    videoCurrentTime,
    videoDuration,
    endContent,
    hasNextEpisode,
    hasWatchedCredit,
    isNavigating,
    previewHandled,
  ]);

  // Reset navigation state when URL changes
  useEffect(() => {
    setIsNavigating(false);
    setHasWatchedCredit(false);
  }, [router.asPath]);

  // Clear timers helper
  const clearTimers = useCallback(() => {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      setAutoNextTimer(null);
    }
  }, [autoNextTimer]);

  // Trigger animation when component becomes visible
  useEffect(() => {
    if (isVisible && !isNavigating) {
      // Small delay to ensure component is rendered before starting animation
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
      setCountdown(AUTO_NEXT_COUNTDOWN_SECONDS);
      clearTimers();
    }
  }, [isVisible, isNavigating, clearTimers]);

  // Navigate to next episode - similar to useAutoNextVideo
  const navigateToNextEpisode = useCallback(() => {
    if (nextEpisode && routerChapterId !== undefined) {
      // Immediately hide component to prevent flash
      setIsNavigating(true);
      setIsVisible(false);
      setShowAnimation(false);
      clearTimers();

      // Use the new navigation hook
      navigateToNext();
    }
  }, [nextEpisode, routerChapterId, navigateToNext, clearTimers]);

  // Start auto-next timer when animation starts - like useAutoNextVideo
  useEffect(() => {
    if (isVisible && showAnimation && !autoNextTimer && !isNavigating) {
      // Auto next after 6 seconds - same as animation duration
      const timer = setTimeout(() => {
        navigateToNextEpisode();
        if (onPlayNext) {
          onPlayNext();
        }
      }, AUTO_NEXT_COUNTDOWN_SECONDS * 1000);

      setAutoNextTimer(timer);
    }
  }, [
    isVisible,
    showAnimation,
    autoNextTimer,
    isNavigating,
    navigateToNextEpisode,
    onPlayNext,
  ]);

  // Clear timer when component becomes invisible or navigating
  useEffect(() => {
    if ((!isVisible || isNavigating) && autoNextTimer) {
      clearTimeout(autoNextTimer);
      setAutoNextTimer(null);
    }
  }, [isVisible, isNavigating, autoNextTimer]);

  // Handle watch credit button click
  const watchCredit = useCallback(() => {
    setHasWatchedCredit(true);
    setIsVisible(false);
    setShowAnimation(false);
    setCountdown(AUTO_NEXT_COUNTDOWN_SECONDS);
    clearTimers();
  }, [clearTimers]);

  // Handle skip to next episode
  const skipToNext = useCallback(() => {
    clearTimers();
    navigateToNextEpisode();
    if (onPlayNext) {
      onPlayNext();
    }
  }, [navigateToNextEpisode, onPlayNext, clearTimers]);

  // Reset state when video changes or when going back before end_content
  useEffect(() => {
    if (videoCurrentTime && endContent && videoCurrentTime < endContent) {
      setHasWatchedCredit(false);
      clearTimers();
    }
  }, [videoCurrentTime, endContent, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimer) {
        clearTimeout(autoNextTimer);
      }
    };
  }, [autoNextTimer]);

  return {
    isVisible: isVisible && !isNavigating,
    showAnimation,
    countdown,
    watchCredit,
    skipToNext,
  };
};
