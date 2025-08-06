import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { useVodPageContext } from '../components/player/context/VodPageContext';
import { useAppSelector, RootState, store } from '../store';
import { setIsAutoNextDisabled } from '../store/slices/playerSlice';
import { ChannelDetailType } from '../api/channel';
import { Episode } from '../api/vod';
import { AUTO_NEXT_COUNTDOWN_SECONDS } from '../constant/texts';
import { useDispatch } from 'react-redux';
import { useNextEpisodeNavigation } from './useNextEpisodeNavigation';

interface UseAutoNextVideoReturn {
  isVisible: boolean;
  autoNext: () => void;
  closeAutoNext: () => void;
  dataChannel?: ChannelDetailType;
  nextEpisode?: Episode;
}

export const useAutoNextVideo = (): UseAutoNextVideoReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const isAutoNextDisabled = useAppSelector(
    (state: RootState) => state.player.isAutoNextDisabled,
  );

  useEffect(() => {
    if (isVisible) {
      setIsCancelled(false);
      dispatch(setIsAutoNextDisabled(false));
    }
  }, [isVisible, router.asPath, dispatch]);

  // Reset cancelled state and navigation state when URL changes (new episode)
  useEffect(() => {
    setIsCancelled(false);
    setIsNavigating(false);
    dispatch(setIsAutoNextDisabled(false));
  }, [router.asPath, dispatch]);

  const {
    dataChannel,
    streamType,
    isEndVideo,
    previewHandled,
    currentPlaylistVideo,
    nextPlaylistVideo,
    isLastPlaylistVideo,
  } = usePlayerPageContext();
  const { nextEpisode, isFinalEpisode, routerChapterId } = useVodPageContext();

  // Use the new navigation hook
  const { navigateToNextEpisode: navigateToNext } = useNextEpisodeNavigation({
    nextEpisode,
    routerChapterId,
  });

  // Clear timers helper
  const clearTimers = useCallback(() => {
    if (countdownTimer) {
      clearTimeout(countdownTimer);
      setCountdownTimer(null);
    }
  }, [countdownTimer]);

  // Auto next function
  const autoNext = useCallback(() => {
    if (isAutoNextDisabled) {
      return;
    }

    if (streamType === 'vod' && nextEpisode && routerChapterId !== undefined) {
      // Immediately hide component to prevent flash
      setIsNavigating(true);
      setIsVisible(false);
      clearTimers();

      // Use the new navigation hook
      navigateToNext();
    } else if (
      streamType === 'playlist' &&
      nextPlaylistVideo &&
      currentPlaylistVideo
    ) {
      // Immediately hide component to prevent flash
      setIsNavigating(true);
      setIsVisible(false);
      clearTimers();

      // Navigate to next playlist video
      const slugs = router?.query?.slug;
      if (Array.isArray(slugs) && slugs[0]) {
        const baseSlug = slugs[0];
        const nextVideoUrl = `${baseSlug}/${nextPlaylistVideo.id}`;
        router.push(`/playlist/${nextVideoUrl}`);
      }
    }

    // Cleanup
    setIsCancelled(false);
  }, [
    streamType,
    nextEpisode,
    routerChapterId,
    navigateToNext,
    nextPlaylistVideo,
    currentPlaylistVideo,
    clearTimers,
    isAutoNextDisabled,
    router,
  ]);

  const closeAutoNext = useCallback(() => {
    setIsCancelled(true); // Mark as cancelled to prevent re-showing
    setIsVisible(false);
    clearTimers();
    // Clear the timer immediately
    if (countdownTimer) {
      clearTimeout(countdownTimer);
      setCountdownTimer(null);
    }
    dispatch(setIsAutoNextDisabled(true));
  }, [clearTimers, countdownTimer, dispatch]);

  // Listen to isEndVideo from PlayerPageContext
  useEffect(() => {
    // Check if video ended and should show auto next
    const shouldShowVod =
      streamType === 'vod' &&
      (isEndVideo ?? 0) > 0 &&
      nextEpisode &&
      !isFinalEpisode &&
      !isCancelled &&
      !isAutoNextDisabled &&
      !isNavigating &&
      !previewHandled;

    const shouldShowPlaylist =
      streamType === 'playlist' &&
      (isEndVideo ?? 0) > 0 &&
      nextPlaylistVideo &&
      !isLastPlaylistVideo &&
      !isCancelled &&
      !isAutoNextDisabled &&
      !isNavigating &&
      !previewHandled;

    const shouldShow = shouldShowVod || shouldShowPlaylist;

    if (shouldShow && !isVisible) {
      setIsVisible(true);
    } else if (isCancelled && isVisible) {
      // If cancelled while visible, hide immediately
      setIsVisible(false);
    }
  }, [
    streamType,
    isEndVideo,
    nextEpisode,
    isFinalEpisode,
    nextPlaylistVideo,
    isLastPlaylistVideo,
    isCancelled,
    isVisible,
    isAutoNextDisabled,
    isNavigating,
    previewHandled,
  ]);

  // Start timer when component becomes visible
  useEffect(() => {
    if (isVisible && !isCancelled && !countdownTimer && !isNavigating) {
      // Auto next after 6 seconds
      const autoTimer = setTimeout(() => {
        const currentState = store.getState();
        const isCurrentlyDisabled = currentState.player.isAutoNextDisabled;

        if (!isCurrentlyDisabled) {
          autoNext();
        }
      }, AUTO_NEXT_COUNTDOWN_SECONDS * 1000);

      setCountdownTimer(autoTimer);
    }
  }, [isVisible, isCancelled, countdownTimer, isNavigating, autoNext]);

  useEffect(() => {
    if ((!isVisible || isCancelled || isNavigating) && countdownTimer) {
      clearTimeout(countdownTimer);
      setCountdownTimer(null);
    }
  }, [isVisible, isCancelled, isNavigating, countdownTimer]);

  useEffect(() => {
    if ((isEndVideo ?? 0) === 0) {
      setIsCancelled(false);
      dispatch(setIsAutoNextDisabled(false));
    }
  }, [isEndVideo, dispatch]);

  useEffect(() => {
    return () => {
      if (countdownTimer) {
        clearTimeout(countdownTimer);
      }
    };
  }, [countdownTimer]);

  return {
    isVisible: isVisible && !isNavigating,
    autoNext,
    closeAutoNext,
    dataChannel,
    nextEpisode: streamType === 'vod' ? nextEpisode : nextPlaylistVideo,
  };
};
