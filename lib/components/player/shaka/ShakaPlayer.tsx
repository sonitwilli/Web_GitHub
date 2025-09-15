import {
  useEffect,
  useCallback,
  useState,
  useLayoutEffect,
  useMemo,
} from 'react';
import { ChannelDetailType, genExpiredLink } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import useCodec from '@/lib/hooks/useCodec';
import usePlayer from '@/lib/hooks/usePlayer';
import { loadJsScript, replaceMpd } from '@/lib/utils/methods';
import {
  DRM_CONFIG,
  DRM_CONFIG_SIGMA,
  DRM_CONFIG_SIGMA_VOD,
} from '@/lib/constant/shaka';
import { RootState, store, useAppSelector } from '@/lib/store';
import { useDrmPlayer } from '@/lib/hooks/useDrmPlayer';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { userAgentInfo } from '@/lib/utils/ua';
import OverlayLogo from '../core/OverlayLogo';
import { EXPIRED_TIME, PLAYER_NAME, VIDEO_ID } from '@/lib/constant/texts';
import dynamic from 'next/dynamic';
import styles from '../core/Text.module.css';
// import { useRouter } from 'next/router';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import {
  removePlayerSessionStorageWhenRender,
  trackingStartBuffering,
  trackPlayerChange,
} from '@/lib/utils/playerTracking';
import { saveSessionStorage } from '@/lib/utils/storage';
import { trackingStoreKey } from '@/lib/constant/tracking';
import {
  checkShakaResponseFilter,
  getRemainingBufferedTime,
} from '@/lib/utils/player';
import {
  trackingLogChangeResolutionLog113,
  trackingPlayAttempLog521,
} from '@/lib/hooks/useTrackingPlayback';
import CodecNotSupport from '../core/CodecNotSupport';
import { useDispatch, useSelector } from 'react-redux';
import { changeInitPlayerTime } from '@/lib/store/slices/trackingSlice';
import { trackingPlayAttempLog414 } from '@/lib/hooks/useTrackingIPTV';
import { trackingPlayAttempLog179 } from '@/lib/hooks/useTrackingEvent';
import useSubtitle from '@/lib/hooks/useSubtitle';
import useAudio from '@/lib/hooks/useAudio';

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
  queryEpisodeNotExist?: boolean;
};

const ShakaPlayer: React.FC<Props> = ({ src, dataChannel, dataStream }) => {
  useLayoutEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      removePlayerSessionStorageWhenRender();
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_NAME,
            value: PLAYER_NAME.SHAKA,
          },
        ],
      });
    }
  }, []);
  const { viewportType } = useScreenSize();
  // const vodCtx = useVodPageContext();
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
    queryEpisodeNotExist,
    clearErrorInterRef,
    canShowSub,
  } = usePlayerPageContext();
  const dispatch = useDispatch();
  const {
    handleIntervalCheckErrors,
    convertShakaError,
    isValidForProfileType,
    handleBookmark,
  } = usePlayer();
  const { checkSubOnRender } = useSubtitle({ type: 'fullcreen' });
  const { checkAudioOnRender } = useAudio();
  const { getUrlToPlayH264, isVideoCodecNotSupported } = useCodec({
    dataChannel,
    dataStream,
    queryEpisodeNotExist,
  });
  const { isFullscreen } = useAppSelector((s) => s.player);
  // const { historyData } = useAppSelector((s) => s.vod);
  const [isUserInteractive, setIsUserInteractive] = useState(false);
  const { currentTimeShiftProgram } = useSelector(
    (state: RootState) => state.broadcastSchedule,
  );

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
    handleSeeked,
  } = usePlayer();
  // const router = useRouter();

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

  // Phát video với src (ưu tiên props.src)
  const playVideo = useCallback(
    async ({ newUrl }: { newUrl?: string } = {}) => {
      const finalUrl = previewHandled
        ? getUrlToPlayH264() || dataStream?.trailer_url
        : showLoginPlayer && loginManifestUrl
        ? loginManifestUrl
        : newUrl || getUrlToPlayH264();

      const expired = sessionStorage.getItem(EXPIRED_TIME);
      let realLink = finalUrl;
      if (expired && finalUrl && !isNaN(Number(expired))) {
        try {
          const res = await genExpiredLink({
            originalLink: finalUrl || '',
            timeMinus: expired,
          });
          if (res?.data?.data?.url) {
            realLink = res?.data?.data?.url;
          }
        } catch {}
      }

      if (window.shakaPlayer && realLink) {
        if (setPlayingUrl) {
          setPlayingUrl(realLink);
        }
        window.shakaPlayer
          .load(replaceMpd(realLink))
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
      getUrlToPlayH264,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('error', (error: any) => {
      console.log(`--- PLAYER SHAKA ERROR WHILE PLAYING TEST`, error);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('expirationupdated', (event: any) => {
      console.log('--- SHAKA: expirationupdated', event);
      console.log('--- SHAKA: Expiration time (ms):', event.expiration);
      if (event.expiration) {
        const expirationDate = new Date(event.expiration);
        console.log('--- SHAKA: Expires at:', expirationDate.toISOString());
      } else {
        console.log('--- SHAKA: The key never expires');
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('keystatuschanged', (event: any) => {
      try {
        console.log('--- SHAKA: keystatuschanged:', event);
        if (event.keyStatuses) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event.keyStatuses.forEach((status: unknown, keyId: any) => {
            const keyIdHex = window.shaka.util.Uint8ArrayUtils.toHex(
              new Uint8Array(keyId),
            );
            console.log('Key ID:', keyIdHex, 'Status:', status);
          });
        }
      } catch {}
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('adaptation', (e: any) => {
      console.log('--- PLAYER adaptation ' + new Date().getTime(), e);
      trackPlayerChange();
      trackingLogChangeResolutionLog113({
        Resolution: `${e?.newTrack?.width}x${e?.newTrack?.height}`,
        isManual: '0',
      });
      checkSubOnRender();
      checkAudioOnRender();
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('trackschanged', (ev: any) => {
      console.log('--- PLAYER trackschanged ' + new Date().getTime(), ev);
      trackPlayerChange();
    });
    player.addEventListener('texttrackvisibility', () => {
      trackPlayerChange();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('variantchanged', (ev: any) => {
      console.log('--- PLAYER variantchanged ' + new Date().getTime(), ev);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const active = player.getVariantTracks().find((t: any) => t.active);
      const isUserManual = sessionStorage.getItem(
        trackingStoreKey.IS_MANUAL_CHANGE_RESOLUTION,
      );
      checkSubOnRender();
      checkAudioOnRender();
      trackingLogChangeResolutionLog113({
        Resolution: `${active.width}x${active.height}`,
        isManual: isUserManual || '0',
      });
      sessionStorage.setItem(trackingStoreKey.IS_MANUAL_CHANGE_RESOLUTION, '0');
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addEventListener('abrstatuschanged', (e: any) => {
      console.log('--- PLAYER abrstatuschanged ' + new Date().getTime(), e);
      checkSubOnRender();
      checkAudioOnRender();
      if (e?.newStatus) {
        trackingLogChangeResolutionLog113({
          Resolution: `${e.newStatus.width}x${e.newStatus.height}`,
          isManual: '0',
        });
      }
    });

    player.addEventListener('loading', () => {
      const firstLoad = sessionStorage.getItem(
        trackingStoreKey.PLAYER_FIRST_LOAD,
      );
      console.log('--- SHAKA: LOADING', firstLoad);
      if (dataStream?.url) {
        if (!firstLoad) {
          saveSessionStorage({
            data: [
              {
                key: trackingStoreKey.PLAYER_FIRST_LOAD,
                value: new Date().getTime().toString(),
              },
            ],
          });
          switch (streamType) {
            case 'vod':
            case 'playlist':
              trackingPlayAttempLog521({
                Event: 'FirstLoad',
              });
              break;
            case 'event':
            case 'premiere':
              trackingPlayAttempLog179({
                Event: 'FirstLoad',
              });
              break;
            case 'channel':
            case 'timeshift':
              trackingPlayAttempLog414({
                Event: 'FirstLoad',
              });
              break;
          }
        } else {
          switch (streamType) {
            case 'vod':
            case 'playlist':
              trackingPlayAttempLog521({
                Event: 'PlayAttemp',
              });
              break;
            case 'event':
            case 'premiere':
              trackingPlayAttempLog179({
                Event: 'PlayAttemp',
              });
              break;
            case 'channel':
            case 'timeshift':
              trackingPlayAttempLog414({
                Event: 'PlayAttemp',
              });
              break;
          }
        }
      }
      console.log('--- SHAKA: LOAD MANIFEST');
    });
    const fragDownloadTimes = new Map();
    player
      .getNetworkingEngine()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .registerRequestFilter((type: any, request: any) => {
        if (type === window.shaka.net.NetworkingEngine.RequestType.SEGMENT) {
          fragDownloadTimes.set(request.uris[0], performance.now());
          const remaining = getRemainingBufferedTime();
          if (remaining === 0) {
            trackingStartBuffering();
            saveSessionStorage({
              data: [
                {
                  key: trackingStoreKey.PLAYER_START_BUFFER_TIME,
                  value: new Date().getTime().toString(),
                },
              ],
            });
          }
        }
      });

    player
      .getNetworkingEngine()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .registerResponseFilter((type: any, response: any) => {
        if (type === window.shaka.net.NetworkingEngine.RequestType.SEGMENT) {
          const uri = response.uri || response.originalUri || null;
          const start = fragDownloadTimes.get(uri);
          if (start) {
            const durationMs = performance.now() - start;
            fragDownloadTimes.delete(uri);
            saveSessionStorage({
              data: [
                {
                  key: trackingStoreKey.BUFFER_LENGTH,
                  value: String(durationMs),
                },
              ],
            });
          }
          checkShakaResponseFilter({ response });
        }
      });
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
    dispatch(changeInitPlayerTime(new Date().getTime()));
    if (!isValidForProfileType) {
      return;
    }
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

  const posterPlayer = useMemo(() => {
    if (dataChannel?.trailer_info?.url) {
      return '/images/default-poster-horizontal.png';
    }
    if (!queryEpisodeNotExist) {
      return '/images/default-poster-horizontal.png';
    }
    return (
      dataChannel?.image?.landscape || '/images/default-poster-horizontal.png'
    );
  }, [dataChannel, queryEpisodeNotExist]);
  useEffect(() => {
    const finalUrl = previewHandled
      ? getUrlToPlayH264() || dataStream?.trailer_url
      : showLoginPlayer && loginManifestUrl
      ? loginManifestUrl
      : getUrlToPlayH264();

    if (finalUrl) {
      if (typeof window.shaka !== 'undefined') {
        initShaka();
      } else {
        loadAllSdks();
      }
    }
    return () => {
      console.log('--- PLAYER UNMOUNTED shakaPlayer');

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
        {isVideoCodecNotSupported && (
          <div className="absolute left-0 top-0 w-full h-full">
            <CodecNotSupport />
          </div>
        )}
        {!isVideoCodecNotSupported && <OverlayLogo />}

        {(streamType === 'channel' ||
          streamType === 'event' ||
          streamType === 'premiere' ||
          streamType === 'timeshift') && (
          <div
            id="player_top_mask"
            className="opacity-0 player_mask top_mask ease-out duration-500 bg-linear-to-b from-[rgba(13,13,12,0.6)] to-[rgba(13,13,12,0.001)] h-[136px] w-full absolute top-0 left-0 z-[1]"
          >
            {(dataChannel?.name ||
              currentTimeShiftProgram?.title ||
              dataChannel?.title) && (
              <div
                id="player_title"
                className="mt-[49px] mx-[32px] font-[500] leading-[150%] text-[28px] text-white line-clamp-1 max-w-1/2"
              >
                {currentTimeShiftProgram?.title ||
                  dataChannel?.name ||
                  dataChannel?.title}
              </div>
            )}
          </div>
        )}
        <video
          id={VIDEO_ID}
          ref={videoRef}
          playsInline
          muted
          controls={false}
          webkit-playsinline="true"
          poster={posterPlayer}
          className={`w-full h-auto max-h-full block aspect-video ${
            !isFullscreen && !isExpanded ? 'xl:rounded-[16px]' : ''
          } ${styles.video} ${
            viewportType !== VIEWPORT_TYPE.DESKTOP ? '!rounded-0' : ''
          } ${canShowSub ? 'video-can-show-sub' : ''}`}
          onPlaying={handlePlaying}
          onVolumeChange={handleVolumeChange}
          onLoadedMetadata={handleLoadedMetaData}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onEnded={handleEnd}
          onPause={handlePaused}
          onSeeked={handleSeeked}
        />
        <div
          className={`ads-instream absolute w-full h-full top-0 left-0 overflow-hidden ${
            isFullscreen || isExpanded || viewportType !== VIEWPORT_TYPE.DESKTOP
              ? 'rounded-none'
              : 'rounded-[16px]'
          }`}
        ></div>
        <PlayerControlBar />
      </div>
    </>
  );
};

export default ShakaPlayer;
