import { useRef } from 'react';

export interface MonitorVideoAPI {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  autoplay: () => void;
  handlePlaying: () => void;
}

// Lightweight video helpers for Monitor players only (no global context/state)
export function useMonitorVideo(): MonitorVideoAPI {
  const videoRef = useRef<HTMLVideoElement>(null);

  const autoplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  };

  const handlePlaying = () => {
    // No-op placeholder to keep signature similar to usePlayer
  };

  return { videoRef, autoplay, handlePlaying };
}
