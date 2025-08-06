import { useState, useEffect, useCallback } from 'react';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import {
  IS_USER_SEEKING,
  SEEK_VIDEO_STARTTIME,
  VIDEO_ID,
} from '../constant/texts';

interface UseSkipIntroReturn {
  isVisible: boolean;
  skipIntro: () => void;
}

export const useSkipIntro = (
  startContent: number,
  introFrom: number,
  onSkip?: () => void,
): UseSkipIntroReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const { videoCurrentTime } = usePlayerPageContext();

  const skipIntro = useCallback(() => {
    // Get video element at runtime to ensure it exists
    const videoElement = document.getElementById(VIDEO_ID) as HTMLVideoElement;

    if (videoElement && startContent) {
      try {
        // Set session storage for tracking
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(IS_USER_SEEKING, '1');
          sessionStorage.setItem(
            SEEK_VIDEO_STARTTIME,
            new Date().getTime().toString(),
          );
        }

        videoElement.currentTime = startContent;

        // optional callback
        onSkip?.();
      } catch (error) {
        console.error('Skip intro error:', error);
      }
    }
  }, [startContent, onSkip]);

  useEffect(() => {
    const currentTime = videoCurrentTime ?? 0;
    if (currentTime > introFrom && currentTime < startContent) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [videoCurrentTime, introFrom, startContent]);

  return {
    isVisible,
    skipIntro,
  };
};
