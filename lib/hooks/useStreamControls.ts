import { useCallback, useEffect, useRef } from 'react';

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

type PlayerType = 'hls' | 'shaka' | 'native';

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

  // ---- Destroy:
  const destroy = useCallback(async () => {
    const video = videoRef.current;
    // 1) Exit PIP
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch {}

    // 2) Hls.js
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = undefined;
    }

    // 3) Shaka
    if (shakaRef.current) {
      try {
        await shakaRef.current.destroy();
      } catch {}
      shakaRef.current = undefined;
    }

    // 4) Video element
    if (video) {
      try {
        video.pause();
        // Handle MediaStream srcObject if present
        if ('srcObject' in video && video.srcObject) {
          video.srcObject = null;
        }
        if (video.src && video.src.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(video.src);
          } catch {}
        }
        video.removeAttribute('src');
        video.load(); // cancel any pending requests
      } catch {}
    }
  }, [videoRef]);

  // ---- Initialize & play new URL:
  const playUrl = useCallback(
    async (url?: string) => {
      if (!url) return;
      const video = videoRef.current;
      if (!video) return;

      const opId = ++opIdRef.current;

      // always destroy before playing new
      await destroy();
      if (opId !== opIdRef.current) return;

      try {
        // A) HLS
        if (playerType === 'hls') {
          // Hls.js if supported
          if (window.Hls?.isSupported()) {
            hlsRef.current = new window.Hls({});
            hlsRef.current.attachMedia(video);

            await new Promise<void>((resolve) => {
              const onAttached = () => {
                if (hlsRef.current && window.Hls) {
                  hlsRef.current.off(
                    window.Hls.Events.MEDIA_ATTACHED,
                    onAttached,
                  );
                }
                resolve();
              };
              if (hlsRef.current && window.Hls) {
                hlsRef.current.on(window.Hls.Events.MEDIA_ATTACHED, onAttached);
              }
            });

            // Autoplay after parse manifest
            await new Promise<void>((resolve) => {
              const onParsed = async () => {
                if (hlsRef.current && window.Hls) {
                  hlsRef.current.off(
                    window.Hls.Events.MANIFEST_PARSED,
                    onParsed,
                  );
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
              if (hlsRef.current && window.Hls) {
                hlsRef.current.on(window.Hls.Events.MANIFEST_PARSED, onParsed);
              }
            });

            hlsRef.current.loadSource(url);
            return;
          }
        }

        // B) DASH (Shaka)
        if (playerType === 'shaka') {
          if (!window.shaka) {
            return;
          }
          shakaRef.current = new window.shaka.Player(video);
          try {
            if (shakaRef.current) {
              await shakaRef.current.load(url);
              if (opId !== opIdRef.current) return;
              onUrlChange?.(url);
              if (autoplay) {
                try {
                  video.muted = video.muted ?? true;
                  await video.play();
                } catch {}
              }
            }
          } catch {}
          return;
        }
      } catch {}
    },
    [playerType, videoRef, destroy, onUrlChange, autoplay],
  );

  // Cleanup when unmount
  useEffect(() => {
    return () => {
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { playUrl, destroy };
}
