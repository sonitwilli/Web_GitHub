import {
  useEffect,
  useCallback,
  useContext,
  useState,
  useLayoutEffect,
} from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import useCodec from '@/lib/hooks/useCodec';
import usePlayer from '@/lib/hooks/usePlayer';
import { loadJsScript } from '@/lib/utils/methods';
import {
  DRM_CONFIG,
  DRM_CONFIG_SIGMA,
  DRM_CONFIG_SIGMA_VOD,
} from '@/lib/constant/shaka';
import { store, useAppSelector } from '@/lib/store';
import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useDrmPlayer } from '@/lib/hooks/useDrmPlayer';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { userAgentInfo } from '@/lib/utils/ua';
import OverlayLogo from '../core/OverlayLogo';
import {
  BOOLEAN_TEXTS,
  HISTORY_TEXT,
  PLAYER_BOOKMARK_SECOND,
  VIDEO_CURRENT_TIME,
  VIDEO_ID,
} from '@/lib/constant/texts';
import dynamic from 'next/dynamic';
import styles from '../core/Text.module.css';
import { useRouter } from 'next/router';
import { useVodPageContext } from '../context/VodPageContext';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';

export interface ShakaErrorDetailType {
  severity?: number;
  category?: number;
  code?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  handled?: boolean;
  message?: string;
  stack?: string;
}

export interface ShakaErrorType {
  detail?: ShakaErrorDetailType;
}

const PlayerControlBar = dynamic(() => import('../control/PlayerControlBar'), {
  ssr: false,
});
type Props = {
  src?: string; // Ưu tiên nếu có
  dataChannel?: ChannelDetailType;
  dataStream?: StreamItemType;
};

const ShakaPlayer: React.FC<Props> = ({ src, dataChannel, dataStream }) => {
  useLayoutEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(VIDEO_CURRENT_TIME);
      sessionStorage.removeItem(PLAYER_BOOKMARK_SECOND);
    }
  }, []);
  const { viewportType } = useScreenSize();
  const vodCtx = useVodPageContext();
  const {
    isHboGo,
    isQNet,
    isTDM,
    setPlayerName,
    showLoginPlayer,
    loginManifestUrl,
    isDrm,
    setPlayingUrl,
    streamType,
    previewHandled,
    isExpanded,
    clearErrorInterRef,
  } = usePlayerPageContext();

  const { handleIntervalCheckErrors, convertShakaError } = usePlayer();

  const { getUrlToPlay } = useCodec({ dataChannel, dataStream });
  const { isFullscreen } = useAppSelector((s) => s.player);
  const { historyData } = useAppSelector((s) => s.vod);
  const [isUserInteractive, setIsUserInteractive] = useState(false);
  const pageCtx = useContext(ChannelPageContext);
  const { selectedTimeShift } = pageCtx;
  const {
    videoRef,
    autoplay,
    videoContainerEleRef,
    handlePlaying,
    handleVolumeChange,
    handleLoadedMetaData,
    handleTimeUpdate,
    handleProgress,
    handleEnd,
    handlePaused,
  } = usePlayer();
  const router = useRouter();

  const observeControlbarShown = useCallback(() => {
    const controlsContainer = document.querySelector(
      '.shaka-controls-container',
    );
    if (!controlsContainer) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'shown') {
          const isActive = controlsContainer.getAttribute('shown') === 'true';
          // Update local state only
          setIsUserInteractive(isActive);
        }
      }
    });

    observer.observe(controlsContainer, { attributes: true });

    // Initial check and set local state
    const isInitiallyShown = controlsContainer.getAttribute('shown') === 'true';
    setIsUserInteractive(isInitiallyShown);
  }, []);
  const handleBookmark = () => {
    try {
      // chỉ bookmark nếu:
      // không có bookmark=false
      // id tập khác routerChapterId

      if (
        typeof historyData?.chapter_id !== 'undefined' &&
        vodCtx.routerChapterId !== 'undefined'
      ) {
        if (
          String(historyData?.chapter_id) !== String(vodCtx.routerChapterId)
        ) {
          return;
        }
      }
      if (streamType !== 'vod' && streamType !== 'playlist') {
        return;
      }
      const bookmark = router.query[HISTORY_TEXT.BOOK_MARK];
      if (bookmark === BOOLEAN_TEXTS.FALSE) {
        return;
      }
      if (historyData?.timeplayed && historyData?.timeplayed !== '0') {
        const t = Number(historyData?.timeplayed);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(PLAYER_BOOKMARK_SECOND, t.toString());
        }
        const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
        if (video) {
          video.currentTime = t;
        }
      }
    } catch {}
  };
  // Phát video với src (ưu tiên props.src)
  const playVideo = useCallback(
    ({ newUrl }: { newUrl?: string } = {}) => {
      const finalUrl = previewHandled
        ? getUrlToPlay() || dataStream?.trailer_url
        : showLoginPlayer && loginManifestUrl
        ? loginManifestUrl
        : newUrl || getUrlToPlay();

      // const finalUrl =
      //   'https://vodcdn.fptplay.net/POVOD/encoded/2024/07/11/asbeautifulasyou-2024-cn-003-1720705086/H264/stream.mpd';
      // const finalUrl =
      //   'https://vodcdn.fptplay.net/POVOD/encoded/2025/05/13/choicehusband-2023-cn-001-020c2597a0bebb80/H264/master.m3u8';
      if (window.shakaPlayer && finalUrl) {
        if (setPlayingUrl) {
          setPlayingUrl(finalUrl);
        }
        window.shakaPlayer
          .load(finalUrl)
          .then(() => {
            handleBookmark();
            autoplay();
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any) => {
            const { playingVideoCodec } = store.getState().player || {};
            console.log(
              `--- PLAYER SHAKA ERROR LOAD MANIFEST ${playingVideoCodec}`,
              error,
            );
            convertShakaError({
              detailErrors: error,
            });
            if (clearErrorInterRef) {
              clearErrorInterRef();
            }
            handleIntervalCheckErrors();
          })
          .finally(() => {
            observeControlbarShown();
          });
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      previewHandled,
      showLoginPlayer,
      loginManifestUrl,
      getUrlToPlay,
      setPlayingUrl,
      autoplay,
      observeControlbarShown,
    ],
  );

  // Hủy player
  const destroyShaka = useCallback(() => {
    if (window.shakaPlayer?.unload) {
      window.shakaPlayer?.unload?.();
      window.shakaPlayer = null;
    }
  }, []);

  const {
    initNetworkingEngine,
    initFairPlay,
    initFairPlaySigma,
    endPingHbo,
    initPing,
    endPingEnc,
    // checkDrmSupport,
  } = useDrmPlayer({
    playVideo,
    destroyPlayer: destroyShaka,
  });

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
  const initDrm = async () => {
    if (userAgentInfo()?.isSafari) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (DRM_CONFIG_SIGMA as any).drm.servers;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (DRM_CONFIG_SIGMA_VOD as any).drm.servers;
    }
    const player = new window.shaka.Player(videoRef.current);
    // await player.attach(videoRef.current);
    // window.scrollTo({ top: 0 }); // chặn ko cho player auto scroll down
    if (isTDM) {
      if (streamType === 'channel' || streamType === 'event') {
        player.configure(DRM_CONFIG_SIGMA);
      } else {
        player.configure(DRM_CONFIG_SIGMA_VOD);
      }
    } else {
      player.configure(DRM_CONFIG);
    }
    window.shakaPlayer = player;
    if (window?.shaka?.util?.EventManager) {
      window.eventManager = new window.shaka.util.EventManager();
      if (window.eventManager) {
        window.eventManager.listen(
          window.shakaPlayer,
          'error',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any) => {
            const { playingVideoCodec } = store.getState().player || {};
            console.log(
              `--- PLAYER SHAKA ERROR WHILE PLAYING ${playingVideoCodec}`,
              error,
            );
            convertShakaError({
              allErrors: error,
            });
            if (clearErrorInterRef) {
              clearErrorInterRef();
            }
            handleIntervalCheckErrors();
          },
        );
      }
    }
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
    if (isDrm) {
      if (isHboGo || isQNet) {
        endPingHbo();
      }
    }
    initApp();
    if (!window.shaka.Player.isBrowserSupported()) {
      console.error('Shaka Player not supported in this browser');
      return;
    }
    await initDrm();
    if (isDrm) {
      if (userAgentInfo()?.isSafari) {
        if (isTDM) {
          initFairPlaySigma({
            cb: () => {
              initPing();
            },
          });
        } else {
          initFairPlay({
            cb: () => {
              initPing();
            },
          });
        }
      } else {
        initNetworkingEngine();
        initPing();
      }
    } else {
      playVideo();
    }
  }
  useEffect(() => {
    const finalUrl = previewHandled
      ? getUrlToPlay() || dataStream?.trailer_url
      : showLoginPlayer && loginManifestUrl
      ? loginManifestUrl
      : getUrlToPlay();

    if (finalUrl) {
      if (typeof window.shaka !== 'undefined') {
        initShaka();
      } else {
        loadAllSdks();
      }
    }
    return () => {
      if (dataStream?.ping_enc) {
        endPingEnc();
      }
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

  return (
    <>
      <div
        ref={videoContainerEleRef}
        id="video-container"
        className={`relative w-full h-full flex items-center justify-center ${
          isFullscreen ? 'shaka-fullscreen' : ''
        } ${isUserInteractive ? 'shaka-user-active' : 'shaka-user-inactive'}`}
      >
        <OverlayLogo />
        <div
          id="player_top_mask"
          className="opacity-0 player_mask top_mask ease-out duration-500 bg-linear-to-b from-[rgba(13,13,12,0.6)] to-[rgba(13,13,12,0.001)] h-[136px] w-full absolute top-0 left-0 z-[1]"
        >
          {(dataChannel?.name || selectedTimeShift?.title) && (
            <div
              id="player_title"
              className="mt-[49px] mx-[32px] font-[500] leading-[150%] text-[28px] text-white line-clamp-1 max-w-1/2"
            >
              {selectedTimeShift?.title || dataChannel?.name}
            </div>
          )}
        </div>
        <video
          id={VIDEO_ID}
          ref={videoRef}
          playsInline
          muted
          poster="/images/default-poster-horizontal.png"
          className={`w-full h-auto max-h-full block aspect-video ${
            !isFullscreen && !isExpanded ? 'xl:rounded-[16px]' : ''
          } ${styles.video} ${
            viewportType !== VIEWPORT_TYPE.DESKTOP ? '!rounded-0' : ''
          }`}
          onPlaying={handlePlaying}
          onVolumeChange={handleVolumeChange}
          onLoadedMetadata={handleLoadedMetaData}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onEnded={handleEnd}
          onPause={handlePaused}
        />
        <div className="ads-instream absolute w-full h-full top-0 left-0"></div>
        <PlayerControlBar />
      </div>
    </>
  );
};

export default ShakaPlayer;
