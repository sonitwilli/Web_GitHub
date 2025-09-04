import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import useCodec from '@/lib/hooks/useCodec';
import { useMonitorVideo } from '@/lib/hooks/useMonitorVideo';
import { loadJsScript } from '@/lib/utils/methods';
import {
  DRM_CONFIG,
  DRM_CONFIG_SIGMA,
  DRM_CONFIG_SIGMA_VOD,
} from '@/lib/constant/shaka';
import { store } from '@/lib/store';
import { userAgentInfo } from '@/lib/utils/ua';
import { VIDEO_ID } from '@/lib/constant/texts';
import { usePlayerPageContext } from '../../context/PlayerPageContext';
import { changeInitPlayerTime } from '@/lib/store/slices/trackingSlice';
import { useDispatch } from 'react-redux';
// Minimal Shaka player typing for monitor quality switching
type ShakaPlayerLike = {
  getVariantTracks?: () => Array<{ height?: number; bandwidth?: number }>;
  configure?: (cfg: unknown) => void;
  selectVariantTrack?: (
    track: { height?: number; bandwidth?: number },
    clearBuffer?: boolean,
  ) => void;
};

type Props = {
  src?: string; // Ưu tiên nếu có
  dataChannel?: ChannelDetailType;
  dataStream?: StreamItemType;
  onAddError?: (err: string) => void;
  onClearErrors?: () => void;
  requestedQuality?: string | number;
};

const ShakaMonitorPlayer: React.FC<Props> = ({
  src,
  dataChannel,
  dataStream,
  onAddError,
  onClearErrors,
  requestedQuality,
}) => {
  const { isTDM, setPlayerName, setPlayingUrl, streamType } =
    usePlayerPageContext();
  const dispatch = useDispatch();
  const { getUrlToPlay } = useCodec({ dataChannel, dataStream });
  const videoId = useMemo(
    () => `${VIDEO_ID}_${Math.random().toString(36).slice(2)}`,
    [],
  );
  const playerRefLocal = useRef<ShakaPlayerLike | null>(null);
  const { videoRef, autoplay } = useMonitorVideo();

  // Phát video với src (ưu tiên props.src) - per-instance (no globals)
  const playVideo = useCallback(
    ({ newUrl }: { newUrl?: string } = {}) => {
      const finalUrl = getUrlToPlay() || newUrl;

      // const finalUrl =
      //   'https://vodcdn.fptplay.net/POVOD/encoded/2024/07/11/asbeautifulasyou-2024-cn-003-1720705086/H264/stream.mpd';
      // const finalUrl =
      //   'https://vodcdn.fptplay.net/POVOD/encoded/2025/05/13/choicehusband-2023-cn-001-020c2597a0bebb80/H264/master.m3u8';
      const player = playerRefLocal.current as unknown as {
        load?: (url: string) => Promise<void>;
      } | null;
      if (player && player.load && finalUrl) {
        if (setPlayingUrl) {
          setPlayingUrl(finalUrl);
        }
        player
          .load(finalUrl)
          .then(() => {
            autoplay();
            onClearErrors?.();
          })
          .catch((error: unknown) => {
            const { playingVideoCodec } = store.getState().player || {};
            console.log(
              `--- PLAYER SHAKA ERROR LOAD MANIFEST ${playingVideoCodec}`,
              error,
            );

            onAddError?.(String(mapShakaErrorToCode(error)));
          })
          .finally(() => {});
      }
    },

    [getUrlToPlay, setPlayingUrl, autoplay, onClearErrors, onAddError],
  );

  // Hủy player
  const destroyShaka = useCallback(() => {
    const p = playerRefLocal.current as { destroy?: () => void } | null;
    if (p && typeof p.destroy === 'function') {
      try {
        p.destroy();
      } catch {}
    }
    playerRefLocal.current = null;
  }, []);

  // No global exposure to keep instances isolated

  // Monitor player: per-instance Shaka, no global ping to avoid conflicts when multi-players are running

  const initApp = () => {
    if (userAgentInfo()?.isSafari) {
      window.shaka.polyfill.installAll();
      window.shaka.polyfill.Orientation.install();
      window.shaka.polyfill.PatchedMediaKeysApple.install();
    } else {
      window.shaka.polyfill.installAll();
    }
    return !!window.shaka.Player.isBrowserSupported();
  };

  const mapShakaErrorToCode = (error: unknown): number => {
    const err = (error || {}) as { code?: number; category?: string };
    if (typeof err.code === 'number' && err.code > 0) return err.code;
    const c = String(err.category || '').toUpperCase();
    if (c.includes('DRM')) return 3000;
    if (c.includes('NETWORK')) return 1100;
    if (c.includes('MANIFEST')) return 1001;
    if (c.includes('MEDIA')) return 2000;
    if (c.includes('STREAM')) return 2100;
    return 7000;
  };
  const initDrm = async () => {
    if (userAgentInfo()?.isSafari) {
      // dynamic shape from shaka config types
      const sigma = DRM_CONFIG_SIGMA as unknown as {
        drm?: { servers?: unknown };
      };
      if (sigma.drm && 'servers' in sigma.drm) {
        delete sigma.drm.servers;
      }
      const sigmaVod = DRM_CONFIG_SIGMA_VOD as unknown as {
        drm?: { servers?: unknown };
      };
      if (sigmaVod.drm && 'servers' in sigmaVod.drm) {
        delete sigmaVod.drm.servers;
      }
    }
    const player = new window.shaka.Player(
      videoRef.current,
    ) as unknown as ShakaPlayerLike;
    // await player.attach(videoRef.current);
    // window.scrollTo({ top: 0 }); // chặn ko cho player auto scroll down
    // Configure DRM servers according to merchant/source
    if (player.configure) {
      if (isTDM) {
        // FPT Play merchant
        if (streamType === 'channel' || streamType === 'event') {
          player.configure(DRM_CONFIG_SIGMA);
        } else {
          player.configure(DRM_CONFIG_SIGMA_VOD);
        }
      } else {
        player.configure(DRM_CONFIG);
      }
    }
    playerRefLocal.current = player;
    // Bind per-instance error listener
    (player as unknown as EventTarget).addEventListener?.(
      'error',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (evt: any) => {
        const error = (evt && (evt.detail || evt)) as unknown;
        const { playingVideoCodec } = store.getState().player || {};
        console.log(
          `--- PLAYER SHAKA ERROR WHILE PLAYING ${playingVideoCodec}`,
          error,
        );
        onAddError?.(String(mapShakaErrorToCode(error)));
      },
    );
  };
  const loadAllSdks = () => {
    const shakaCdn = '/js/shaka/shaka-player.4.15.4.min.js';
    // const shakaCdn =
    //   'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.15.4/shaka-player.compiled.min.js';
    if (userAgentInfo()?.isSafari) {
      loadJsScript({
        id: 'shaka_ui_sdk',
        src: shakaCdn,
        cb: () => {
          initShaka();
        },
      });
    } else {
      loadJsScript({
        id: 'sigma_packer_sdk',
        src: '/js/sigma/sigma_packer_1.0.5.js',
        cb: () => {
          // Init sigma packer per window; safe for monitor as it is global SDK
          window.sigmaPacker = new window.SigmaPacker();
          window.sigmaPacker.onload = () => {
            loadJsScript({
              id: 'shaka_ui_sdk',
              src: shakaCdn,
              cb: () => {
                initShaka();
              },
            });
          };
          window.sigmaPacker.init();
        },
      });
    }
  };
  async function initShaka() {
    // no-op for monitor
    dispatch(changeInitPlayerTime(new Date().getTime()));
    initApp();
    await initDrm();
    // With per-instance player in monitor, load directly after DRM setup
    playVideo();
  }
  useEffect(() => {
    const finalUrl = getUrlToPlay();

    if (finalUrl) {
      if (typeof window.shaka !== 'undefined') {
        initShaka();
      } else {
        loadAllSdks();
      }
    }
    return () => {
      destroyShaka();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (src) {
      playVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useLayoutEffect(() => {
    if (setPlayerName) setPlayerName('shaka');
  }, [setPlayerName]);

  // React to requestedQuality prop changes
  useEffect(() => {
    const player = playerRefLocal.current;
    if (!player) return;
    if (typeof requestedQuality === 'undefined') return;
    const h = Number(requestedQuality);
    if (Number.isNaN(h)) {
      player.configure?.({
        abr: {
          enabled: true,
          restrictions: { maxBandwidth: Infinity, minBandwidth: 0 },
        },
      });
      return;
    }
    const tracks = player.getVariantTracks?.() || [];
    const founds = tracks.filter((t) => t?.height === h);
    if (!founds.length) return;
    founds.sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0));
    player.configure?.({ abr: { enabled: false } });
    player.selectVariantTrack?.(founds[0], false);
  }, [requestedQuality]);

  return (
    <>
      <video
        id={videoId}
        ref={videoRef}
        playsInline
        muted
        poster="/images/default-poster-horizontal.png"
        className={`w-full h-auto max-h-full block aspect-video`}
      />
    </>
  );
};

export default ShakaMonitorPlayer;
