import { useCallback } from 'react';

type UsePlayVideoWithUrlProps = {
  playerType: 'shaka' | 'hls';
  videoRef?: React.RefObject<HTMLVideoElement>;
  setPlayingUrl?: (url: string) => void;
  autoplay?: () => void;
};

export function usePlayVideoWithUrl({
  playerType,
  videoRef,
  setPlayingUrl,
  autoplay,
}: UsePlayVideoWithUrlProps) {
  return useCallback(
    (url?: string) => {
      if (!url) return;

      if (
        playerType === 'shaka' &&
        typeof window !== 'undefined' &&
        window.shakaPlayer
      ) {
        if (setPlayingUrl) setPlayingUrl(url);
        window.shakaPlayer.load(url).then(() => {
          if (autoplay) autoplay();
        });
      } else if (
        playerType === 'hls' &&
        typeof window !== 'undefined' &&
        window.hlsPlayer &&
        videoRef?.current
      ) {
        window.hlsPlayer.loadSource(url);
        if (setPlayingUrl) setPlayingUrl(url);
      }
    },
    [playerType, videoRef, setPlayingUrl, autoplay],
  );
}
