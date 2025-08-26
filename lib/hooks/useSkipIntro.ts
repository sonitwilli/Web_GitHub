import { useState, useEffect, useCallback } from 'react';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { VIDEO_ID } from '../constant/texts';
import { saveSeekEvent } from '../utils/seekTracking';

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
        const oldTime = videoElement.currentTime;
        videoElement.currentTime = startContent;

        // Track seek event for skip intro
        saveSeekEvent({
          timestamp: Date.now(),
          direction: startContent > oldTime ? 'forward' : 'backward',
          method: 'button',
        });

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
