import { useCallback, useRef } from 'react';
import { replaceMpd } from '../utils/methods';

interface HlsEvents {
  MEDIA_ATTACHED: string;
  MANIFEST_PARSED: string;
}

interface HlsInstance {
  attachMedia: (video: HTMLVideoElement) => void;
  loadSource: (url: string) => void;
  destroy: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface HlsConstructor {
  isSupported: () => boolean;
  Events: HlsEvents;
  new (config?: Record<string, unknown>): HlsInstance;
}

interface ShakaPlayerInstance {
  load: (url: string) => Promise<void>;
  destroy: () => Promise<void>;
}

declare global {
  interface Window {
    Hls?: HlsConstructor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shaka?: any;
  }
}

type PlayerType = 'hls' | 'shaka';

type Options = {
  playerType: PlayerType;
  videoRef: React.RefObject<HTMLVideoElement>;
  onUrlChange?: (url: string) => void;
  autoplay?: boolean;
};

export function useStreamControls({
  playerType,
  videoRef,
  onUrlChange,
  autoplay = true,
}: Options) {
  const hlsRef = useRef<HlsInstance | undefined>(undefined);
  const shakaRef = useRef<ShakaPlayerInstance | undefined>(undefined);
  const opIdRef = useRef(0);
  const currentUrlRef = useRef<string | undefined>(undefined);

  // ---- Initialize & play new URL:
  const playUrl = useCallback(
    async (url?: string) => {
      if (!url) return;
      const video = videoRef.current;
      if (!video) return;

      const opId = ++opIdRef.current;

      if (opId !== opIdRef.current) return;

      currentUrlRef.current = url;

      try {
        // A) HLS
        if (playerType === 'hls') {
          // Hls.js if supported
          if (window.Hls?.isSupported()) {
            const hlsInstance = new window.Hls({});
            hlsRef.current = hlsInstance;
            hlsInstance.attachMedia(video);

            await new Promise<void>((resolve) => {
              const onAttached = () => {
                if (hlsInstance && window.Hls) {
                  hlsInstance.off(window.Hls.Events.MEDIA_ATTACHED, onAttached);
                }
                resolve();
              };
              if (hlsInstance && window.Hls) {
                hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, onAttached);
              }
            });

            // Autoplay after parse manifest
            await new Promise<void>((resolve) => {
              const onParsed = async () => {
                if (hlsInstance && window.Hls) {
                  hlsInstance.off(window.Hls.Events.MANIFEST_PARSED, onParsed);
                }
                if (opId !== opIdRef.current) return resolve();
                onUrlChange?.(url);
                if (autoplay) {
                  try {
                    // autoplay policy
                    video.muted = video.muted ?? true;
                    await video.play();
                  } catch {}
                }
                resolve();
              };
              if (hlsInstance && window.Hls) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, onParsed);
              }
            });

            hlsInstance.loadSource(replaceMpd(url));
            return;
          }
        }

        // B) DASH (Shaka)
        if (playerType === 'shaka') {
          if (!window.shaka) {
            return;
          }
          const shakaInstance = new window.shaka.Player(video);
          shakaRef.current = shakaInstance;
          try {
            await shakaInstance.load(replaceMpd(url));
            if (opId !== opIdRef.current) return;
            onUrlChange?.(url);
            if (autoplay) {
              try {
                video.muted = video.muted ?? true;
                await video.play();
              } catch {}
            }
          } catch {}
          return;
        }
      } catch {}
    },
    [playerType, videoRef, onUrlChange, autoplay],
  );

  return {
    playUrl,
  };
}
