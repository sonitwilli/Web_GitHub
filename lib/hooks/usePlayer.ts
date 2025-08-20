/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useContext, useEffect, useRef, useState } from 'react';
import { store, useAppDispatch, useAppSelector } from '../store';
import {
  ERROR_PLAYER_FPT_PLAY,
  PLAYER_BOOKMARK_SECOND,
  PLAYER_IS_RETRYING,
  PLAYER_NAME,
  PLAYER_WRAPPER,
  VIDEO_CURRENT_TIME,
  VIDEO_ID,
  VIDEO_TIME_BEFORE_ERROR,
  VOLUME_PLAYER,
} from '../constant/texts';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { PlayerWrapperContext } from '../components/player/core/PlayerWrapper';
import { useRouter } from 'next/router';
import useCodec, { VIDEO_CODEC_NAMES } from './useCodec';
import { setCodecError, setFullscreen } from '../store/slices/playerSlice';
import { trackingErrorLog17 } from '../tracking/trackingCommon';
import { ErrorData, ErrorDetails, ErrorTypes } from 'hls.js';
import { getTimeShiftChannel } from '../api/channel';
import { getSeekPremier } from '../utils/player';
import {
  ShakaErrorDetailType,
  ShakaErrorType,
} from '../components/player/shaka/ShakaPlayer';
import { useAdsPlayer } from './useAdsPlayer';
import {
  removePlayerSessionStorage,
  removePlayerSessionStorageWhenUnMount,
  trackingEndBuffering,
  trackPlayerChange,
} from '../utils/playerTracking';
import { trackingStoreKey } from '../constant/tracking';
import { saveSessionStorage } from '../utils/storage';
import useTrackingPing from './useTrackingPing';
import { UAParser } from 'ua-parser-js';
import { userAgentInfo } from '@/lib/utils/ua';

function getRandom(): number {
  return Math.floor(Math.random() * 11) + 3;
  // return 0;
}

export default function usePlayer() {
  const {
    setIsPlaySuccess,
    setVideoHeight,
    videoHeight,
    setIsMetaDataLoaded,
    setVideoCurrentTime,
    setVideoDuration,
    setBufferedTime,
    setIsEndVideo,
    setIsVideoPaused,
    videoCurrentTime,
    hlsErrosRef,
    setHlsErrors,
    dataChannel,
    dataStream,
    setPlayingUrl,
    playingUrlRef,
    isBackgroundRetryRef,
    getStream,
    playerName,
    isVideoPaused,
    streamType,
    setRealPlaySeconds,
    clearErrorInterRef,
    queryEpisodeNotExist,
  } = usePlayerPageContext();
  const { handleLoadAds } = useAdsPlayer();
  const { getUrlToPlay } = useCodec({
    dataChannel,
    dataStream,
    queryEpisodeNotExist,
  });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { openPlayerErrorModal } = useContext(PlayerWrapperContext);
  const videoCurrentTimeRef = useRef(videoCurrentTime);
  useEffect(() => {
    videoCurrentTimeRef.current = videoCurrentTime;
  }, [videoCurrentTime]);
  const { closePlayerErrorModal } = useContext(PlayerWrapperContext);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerEleRef = useRef<HTMLDivElement>(null);
  const { isFullscreen } = useAppSelector((s) => s.player);
  const catchVideoInterval = useRef(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const retryCountRef = useRef(0);
  const retryGetStreamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryBackgroundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlayingHandled, setIsPlayingHandled] = useState(false);
  const [isInitAds, setIsInitAds] = useState(false);
  const { handlePingPlayer } = useTrackingPing();
  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);
  const previousCurrentTimeRef = useRef(0);
  // Real playing time accumulators
  const lastTimeForRealPlayRef = useRef(0);
  const realPlaySecondsAccRef = useRef(0);
  const handleUpdateRetryTimeout = () => {
    // mỗi lần retry: 3s, 3s, 3s, 6s, 30s, 1phút, 5 phút, 10 phút, 15 phút, dừng
    switch (retryCountRef.current) {
      case 1:
      case 2:
      case 3:
        return 3 + getRandom();
      case 4:
        return 6 + getRandom();
      case 5:
        return 30 + getRandom();
      case 6:
        return 1 * 60 + getRandom();
      case 7:
        return 5 * 60 + getRandom();
      case 8:
        return 10 * 60 + getRandom();
      case 9:
        return 15 * 60 + getRandom();
      case 10:
        return 30 * 60 + getRandom();
      case 11:
        return 60 * 60 + getRandom();
      case 12:
        return 2 * 60 * 60 + getRandom();
      case 13:
        return null;
    }
  };
  const clickFullScreen = () => {
    try {
      const wrapper = document.getElementById(PLAYER_WRAPPER);
  const ua = (userAgentInfo() || {}) as { isSafari?: boolean; isFromIos?: boolean };
  const isIosSafari = !!ua.isSafari && !!ua.isFromIos;

      // On iOS Safari, using native fullscreen on the video element triggers the browser's native controls
      // and hides our custom controls. Use a CSS-based fullscreen mode instead (toggle redux state)
      if (isIosSafari && wrapper) {
        if (isFullscreen) {
          // exit custom fullscreen
          dispatch(setFullscreen(false));
          wrapper.classList.remove('player-wrapper-ios-fullscreen');
        } else {
          // enter custom fullscreen (CSS-based)
          dispatch(setFullscreen(true));
          wrapper.classList.add('player-wrapper-ios-fullscreen');
        }
        return;
      }
      if (wrapper) {
        if (isFullscreen) {
          if (document.exitFullscreen) {
            document?.exitFullscreen();
            /*@ts-ignore*/
          } else if (document.webkitExitFullscreen) {
            /* Safari */
            /*@ts-ignore*/
            document.webkitExitFullscreen();
            /*@ts-ignore*/
          } else if (document.msExitFullscreen) {
            /* IE11 */
            /*@ts-ignore*/
            document.msExitFullscreen();
          }
        } else {
          if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
            /*@ts-ignore*/
          } else if (wrapper.webkitRequestFullscreen) {
            /* Safari */
            /*@ts-ignore*/
            wrapper.webkitRequestFullscreen();
            /*@ts-ignore*/
          } else if (wrapper.msRequestFullscreen) {
            /* IE11 */
            /*@ts-ignore*/
            wrapper.msRequestFullscreen();
            /*@ts-ignore*/
          } else if (wrapper.webkitEnterFullscreen) {
            /* IE11 */
            /*@ts-ignore*/
            wrapper.webkitEnterFullscreen();
          } else {
            const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
            /*@ts-ignore*/
            if (video?.webkitEnterFullscreen) {
              /*@ts-ignore*/
              video.webkitEnterFullscreen(); // iOS Safari
            } else if (video?.requestFullscreen) {
              video.requestFullscreen(); // Desktop Safari, Chrome, etc.
            }
          }
        }
      }
    } catch {}
  };

  const playVideo = () => {
    if (videoRef.current) {
      const time = 1;
      videoRef.current.play().catch((e) => {
        console.log(`Error  autoplay time ${time}:`, e);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch((error) => {
            console.log(`Error  autoplay time ${time}:`, error);
          });
        }
      });
    }
  };
  const autoplay = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      video
        .play()
        .then(() => {})
        .catch(() => {
          if (video) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
    }
  };

  const handlePlaying = async () => {
    const firstPlay = sessionStorage.getItem(
      trackingStoreKey.PLAYER_FIRST_PLAY_SUCCESS,
    );
    if (!firstPlay) {
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_FIRST_PLAY_SUCCESS,
            value: new Date().getTime().toString(),
          },
        ],
      });
    }
    trackPlayerChange();
    const retrying = sessionStorage.getItem(PLAYER_IS_RETRYING);
    console.log('--- PLAYER VIDEO PLAY SUCCESS', {
      count: retryCountRef.current,
      retrying,
    });
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (
      (streamType === 'vod' || streamType === 'timeshift') &&
      retrying === 'true'
    ) {
      const time = Number(sessionStorage.getItem(VIDEO_TIME_BEFORE_ERROR));
      if (time && time > 0) {
        video.currentTime = time;
      }
    }
    if (streamType === 'premiere' && retrying === 'true') {
      const dataEvent = store.getState().player.dataEvent;
      const offset = getSeekPremier(dataEvent);
      const time = Number(sessionStorage.getItem(VIDEO_TIME_BEFORE_ERROR));
      if (offset) {
        video.currentTime = offset;
      } else if (time && time > 0) {
        video.currentTime = time;
      }
    }
    if (setHlsErrors) setHlsErrors([]);
    if (setIsPlaySuccess) setIsPlaySuccess(true);
    if (closePlayerErrorModal) {
      closePlayerErrorModal();
    }
    if (setIsVideoPaused) setIsVideoPaused(false);
    // reset tracking pointer for real play time
    const vInit = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (vInit) {
      lastTimeForRealPlayRef.current = vInit.currentTime || 0;
    }

    if (router.query.time_shift_id) {
      if (setIsEndVideo) setIsEndVideo(0);
    }
    if (catchVideoInterval.current) {
      clearInterval(catchVideoInterval.current);
    }
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_IS_LANDING_PAGE,
          value: '1',
        },
      ],
    });
    const {
      bookmark,
      landing_page,
      is_from_chatbot,
      block_index,
      ...restQuery
    } = router.query;
    if (
      bookmark !== undefined ||
      landing_page !== undefined ||
      is_from_chatbot !== undefined ||
      block_index
    ) {
      if (landing_page) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.PLAYER_IS_LANDING_PAGE,
              value: '0',
            },
          ],
        });
      }
      if (block_index) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.BLOCK_INDEX,
              value: block_index as string,
            },
          ],
        });
      }
      router.replace(
        {
          pathname: router.pathname,
          query: restQuery,
        },
        undefined,
        { shallow: true },
      );
    }
    if (isBackgroundRetryRef) {
      isBackgroundRetryRef.current = false;
    }
    setRetryCount(0);
    retryCountRef.current = 0;
    previousCurrentTimeRef.current = 0;
    if (retryBackgroundTimeoutRef.current) {
      clearTimeout(retryBackgroundTimeoutRef.current);
      retryBackgroundTimeoutRef.current = null;
    }
    if (retryGetStreamTimeoutRef.current) {
      clearTimeout(retryGetStreamTimeoutRef.current);
      retryGetStreamTimeoutRef.current = null;
    }
    sessionStorage.removeItem(PLAYER_IS_RETRYING);

    // Set state để báo hiệu rằng tất cả thao tác đã hoàn thành
    setIsPlayingHandled(true);
    if (!isInitAds) {
      setIsInitAds(true);
      handleLoadAds();
    }
    if (clearErrorInterRef) clearErrorInterRef();
    clearIntervalErrorSafari();
    checkSafariError();
    const startBufferTime = sessionStorage.getItem(
      trackingStoreKey.PLAYER_START_BUFFER_TIME,
    );
    if (startBufferTime) {
      trackingEndBuffering();
    }
    handlePingPlayer();
  };

  const handleLoadedMetaData = () => {
    if (setIsMetaDataLoaded) setIsMetaDataLoaded(true);
  };

  const handleVolumeChange = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      const v = video.volume;
      localStorage.setItem(VOLUME_PLAYER, v as unknown as string);
    }
  };

  const checkRealTimePlaying = () => {
    if (typeof sessionStorage !== 'undefined') {
      const cur = new Date().getTime();
      const pre = sessionStorage.getItem(
        trackingStoreKey.PLAYER_FIRST_PLAY_SUCCESS,
      );
      const p = pre ? Number(pre) : cur;
      const value = Number(cur) - p;
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_REAL_TIME_PLAYING,
            value: Math.round(value / 1000).toString(),
          },
        ],
      });
    }
  };

  const handleTimeUpdate = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;

    if (video) {
      checkRealTimePlaying();
      const d = video.duration;
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_DURATION,
            value: String(d),
          },
        ],
      });
      const c = video.currentTime;
      sessionStorage.setItem(VIDEO_CURRENT_TIME, c as unknown as string);
      if (setVideoCurrentTime) {
        setVideoCurrentTime(c);
      }
      if (setVideoDuration) {
        setVideoDuration(d);
      }
      if (c > 0) {
        sessionStorage.setItem(VIDEO_TIME_BEFORE_ERROR, c as unknown as string);
      }
      // accumulate real play seconds only when advancing normally (avoid big jumps due to seeking)
      const last = lastTimeForRealPlayRef.current || 0;
      const delta = c - last;
      if (!isVideoPaused && delta > 0 && delta < 2) {
        realPlaySecondsAccRef.current += delta;
        if (setRealPlaySeconds) {
          setRealPlaySeconds(Math.floor(realPlaySecondsAccRef.current));
        }
      }
      lastTimeForRealPlayRef.current = c;
    }
  };

  const handleEnd = () => {
    if (setIsEndVideo) setIsEndVideo(new Date().getTime());
    const v2 = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (v2) {
      realPlaySecondsAccRef.current = Math.max(
        realPlaySecondsAccRef.current,
        v2.duration || 0,
      );
      if (setRealPlaySeconds) {
        setRealPlaySeconds(Math.floor(realPlaySecondsAccRef.current));
      }
    }
  };

  const handlePaused = () => {
    if (setIsVideoPaused) setIsVideoPaused(true);
  };

  const handleProgress = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      const buffer = video?.buffered;
      if (((buffer?.length > 0 && video.duration) || 0) > 0) {
        let currentBuffer = 0;
        const inSeconds = video.currentTime || 0;
        for (let i = 0; i < buffer.length; i++) {
          if (buffer.start(i) <= inSeconds && inSeconds <= buffer.end(i)) {
            currentBuffer = i;
            break;
          }
        }
        const b = buffer.end(currentBuffer);
        if (setBufferedTime) {
          setBufferedTime(b);
        }
      }
    }
  };

  const convertShakaError = ({
    allErrors,
    detailErrors,
  }: {
    allErrors?: ShakaErrorType;
    detailErrors?: ShakaErrorDetailType;
  }) => {
    const detail = allErrors?.detail || detailErrors || {};
    let code = detail?.code as unknown as ErrorTypes;
    if (detail?.data?.length) {
      if (detail?.data[1] === 403) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code = 403 as any;
      }
    }
    const hlsError: ErrorData = {
      type: code || (detail?.code as unknown as ErrorTypes),
      fatal: true,
      details: detail?.category as unknown as ErrorDetails,
      error: new Error(detail?.message),
    };
    console.log('--- PLAYER convertShakaError', detail);
    handleAddError({ error: hlsError });
  };

  const playVideoWithUrl = ({ url }: { url?: string } = {}) => {
    try {
      // const finalUrl =
      //   'https://vodcdn.fptplay.net/POVOD/encoded/2023/11/18/multi-legend-of-zhuohua-the-2023-cnf-001-1700300658/master.m3u8';
      if (url && window.hlsPlayer) {
        window.hlsPlayer.loadSource(url);
        if (setPlayingUrl) {
          setPlayingUrl(url);
        }
      } else if (url && window.shakaPlayer) {
        window.shakaPlayer
          .load(url)
          .then(() => {
            autoplay();
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any) => {
            console.log(`--- PLAYER SHAKA ERROR LOAD MANIFEST RETRY`, error);
            convertShakaError({
              detailErrors: error,
            });
            if (clearErrorInterRef) {
              clearErrorInterRef();
            }
            handleIntervalCheckErrors();
            clearIntervalErrorSafari();
            checkSafariError();
          });
      }
    } catch {}
  };

  const retryGetStream = () => {
    // Reset state khi retry
    setIsPlayingHandled(false);

    if (retryGetStreamTimeoutRef.current) {
      clearTimeout(retryGetStreamTimeoutRef.current);
    }
    const t = handleUpdateRetryTimeout();
    if (t) {
      retryGetStreamTimeoutRef.current = setTimeout(async () => {
        console.log('--- PLAYER RETRY GETSTREAM: ', {
          retryCountRef: retryCountRef.current,
          at: new Date().toISOString(),
          duration: t,
        });
        if (getStream) {
          if (streamType !== 'timeshift') {
            const newStream = await getStream({
              channelDetailData: dataChannel,
            });
            const newUrl = getUrlToPlay({ dataStream: newStream });
            if (newUrl) {
              if (clearErrorInterRef) clearErrorInterRef();
              playVideoWithUrl({ url: newUrl });
              if (setPlayingUrl) {
                setPlayingUrl(newUrl);
              }
            }
          } else {
            const channelId = router.query.id as string;
            const tsId = router.query.time_shift_id as string;
            const tsData = await getTimeShiftChannel({
              scheduleId: tsId,
              channelId,
            });
            console.log('tsData', tsData);
            if (tsData?.data?.data?.url) {
              if (clearErrorInterRef) clearErrorInterRef();
              playVideoWithUrl({ url: tsData?.data?.data?.url });

              if (setPlayingUrl) {
                setPlayingUrl(tsData?.data?.data?.url);
              }
            }
          }
        }
      }, t * 1000);
    } else {
      console.log('--- PLAYER STOP RETRY');
      if (window.checkErrorInterRef) {
        if (clearErrorInterRef) clearErrorInterRef();
      }
    }
  };

  const checkVideoCodec = () => {
    try {
      const { playingVideoCodec } = store.getState().player || {};
      if (playingVideoCodec) {
        // switch video codec
        if (playingVideoCodec !== VIDEO_CODEC_NAMES.H264_CODEC) {
          dispatch(setCodecError({ codec: playingVideoCodec, value: true }));
          const nextUrl = getUrlToPlay();
          if (nextUrl) {
            playVideoWithUrl({ url: nextUrl });
          }
        } else {
          if (!isBackgroundRetryRef?.current) {
            if (retryBackgroundTimeoutRef.current) {
              clearTimeout(retryBackgroundTimeoutRef.current);
            }
            const t = (3 + getRandom()) * 1000;
            // @ts-ignore
            isBackgroundRetryRef.current = true;
            retryBackgroundTimeoutRef.current = setTimeout(() => {
              console.log('--- PLAYER RETRY BACKGROUND', {
                retryCountRef: retryCountRef.current,
                at: new Date().toISOString(),
                duration: t,
                url: playingUrlRef?.current,
              });
              previousCurrentTimeRef.current = 0;
              if (clearErrorInterRef) clearErrorInterRef();
              playVideoWithUrl({ url: playingUrlRef?.current });
            }, t);
          } else {
            if (openPlayerErrorModal) {
              openPlayerErrorModal({
                code: hlsErrosRef?.current[0].type,
              });
            }
            retryCountRef.current += 1;
            setRetryCount((v) => v + 1);
            retryGetStream();
          }
        }
      }
    } catch {}
  };

  const handleAddError = ({ error }: { error?: ErrorData }) => {
    if (playerName === PLAYER_NAME.HLS) {
      if (error?.fatal) {
        // Reset state khi có error
        setIsPlayingHandled(false);

        trackingErrorLog17({
          Event: 'Error',
          ErrCode: error?.type,
          ErrMessage: `${ERROR_PLAYER_FPT_PLAY} (Mã lỗi ${error?.type})`,
          ItemName: `${ERROR_PLAYER_FPT_PLAY} (Mã lỗi ${error?.type})`,
          Url: getUrlToPlay(),
          ItemId: dataChannel?._id,
        });
        if (setHlsErrors) {
          /*@ts-ignore*/
          setHlsErrors((prev) => [
            ...(prev || []),
            {
              type: error.type,
              fatal: error.fatal,
              details: error.details,
              url: error.url,
            },
          ]);
        }
      }
    }
  };

  const isErrorCurrentTime = () => {
    const currentTime = sessionStorage.getItem(VIDEO_CURRENT_TIME)
      ? Number(sessionStorage.getItem(VIDEO_CURRENT_TIME))
      : 0;
    const result =
      currentTime === previousCurrentTimeRef.current && !isVideoPaused;
    console.log('--- PLAYER CHECK TIME', {
      currentTime,
      previousCurrentTimeRef: previousCurrentTimeRef.current,
      paused: isVideoPaused,
      isError: result,
    });
    if (result) {
      sessionStorage.setItem(PLAYER_IS_RETRYING, 'true');
    }
    return result;
  };

  const handleIntervalCheckErrors = () => {
    console.log('--- PLAYER handleIntervalCheckErrors', {
      checkErrorInterRef: window.checkErrorInterRef,
    });
    // chạy sau khi load source
    if (!window.checkErrorInterRef) {
      // @ts-ignore
      window.checkErrorInterRef = setInterval(() => {
        // if (document?.hidden) {
        //   return;
        // }
        console.log('--- PLAYER handleIntervalCheckErrors START', {
          checkErrorInterRef: window.checkErrorInterRef,
        });
        const currentTime = sessionStorage.getItem(VIDEO_CURRENT_TIME)
          ? Number(sessionStorage.getItem(VIDEO_CURRENT_TIME))
          : 0;
        const isError = isErrorCurrentTime();
        if (isError) {
          // @ts-ignore
          if (clearErrorInterRef) clearErrorInterRef();
          checkVideoCodec();
        } else {
          retryCountRef.current = 0;
          setRetryCount(0);
        }
        previousCurrentTimeRef.current = currentTime;
      }, 10000);
    }
  };

  const handleIntervalCheckErrorsSafari = () => {
    console.log('--- PLAYER handleIntervalCheckErrorsSafari', {
      safariCheckErrorInterRef: window.safariCheckErrorInterRef,
    });
    if (!window.safariCheckErrorInterRef) {
      window.safariCheckErrorInterRef = setInterval(() => {
        console.log('--- PLAYER handleIntervalCheckErrorsSafari START', {
          safariCheckErrorInterRef: window.safariCheckErrorInterRef,
          checkErrorInterRef: window.checkErrorInterRef,
        });
        if (window.checkErrorInterRef) {
          return;
        }
        const currentTime = sessionStorage.getItem(VIDEO_CURRENT_TIME)
          ? Number(sessionStorage.getItem(VIDEO_CURRENT_TIME))
          : 0;
        const isError = isErrorCurrentTime();
        if (isError) {
          clearIntervalErrorSafari();
          checkVideoCodec();
        } else {
          retryCountRef.current = 0;
          setRetryCount(0);
        }
        previousCurrentTimeRef.current = currentTime;
      }, 20000);
    }
  };

  const checkSafariError = () => {
    try {
      const parser = new UAParser(navigator.userAgent);
      const browser = parser.getBrowser().name;
      if (browser?.toUpperCase()?.includes('SAFARI')) {
        handleIntervalCheckErrorsSafari();
      }
    } catch {}
  };

  const clearIntervalErrorSafari = () => {
    if (window.safariCheckErrorInterRef) {
      clearInterval(window.safariCheckErrorInterRef);
      window.safariCheckErrorInterRef = null;
    }
  };

  const handleBeforeUnload = () => {
    sessionStorage.removeItem(VIDEO_CURRENT_TIME);
    sessionStorage.removeItem(VIDEO_TIME_BEFORE_ERROR);
    sessionStorage.removeItem(PLAYER_IS_RETRYING);
    sessionStorage.removeItem(PLAYER_BOOKMARK_SECOND);
    removePlayerSessionStorage();
  };

  useEffect(() => {
    if (
      videoHeight === 0 &&
      videoRef.current?.scrollHeight &&
      videoRef.current?.scrollHeight > 0
    ) {
      // if (setVideoHeight) {
      //   setVideoHeight(videoRef.current.scrollHeight);
      // }
    }
  }, [videoRef.current?.scrollHeight, setVideoHeight, videoHeight]);

  const handleClearInterval = () => {
    if (retryBackgroundTimeoutRef.current) {
      clearTimeout(retryBackgroundTimeoutRef.current);
      retryBackgroundTimeoutRef.current = null;
    }
    if (retryGetStreamTimeoutRef.current) {
      clearTimeout(retryGetStreamTimeoutRef.current);
      retryGetStreamTimeoutRef.current = null;
    }
    if (clearErrorInterRef) clearErrorInterRef();
    // Reset state khi cleanup
    setIsPlayingHandled(false);
    sessionStorage.removeItem(PLAYER_BOOKMARK_SECOND);
  };

  useEffect(() => {
    return () => {
      handleClearInterval();
      lastTimeForRealPlayRef.current = 0;
      realPlaySecondsAccRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (catchVideoInterval.current) {
      clearInterval(catchVideoInterval.current);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      removePlayerSessionStorageWhenUnMount();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setRetryCount(0);
      retryCountRef.current = 0;
      previousCurrentTimeRef.current = 0;
      setIsPlayingHandled(false);
      if (retryBackgroundTimeoutRef.current) {
        clearTimeout(retryBackgroundTimeoutRef.current);
        retryBackgroundTimeoutRef.current = null;
      }
      if (retryGetStreamTimeoutRef.current) {
        clearTimeout(retryGetStreamTimeoutRef.current);
        retryGetStreamTimeoutRef.current = null;
      }
    };
  }, []);
  return {
    playerRef,
    videoRef,
    playVideo,
    autoplay,
    videoContainerEleRef,
    clickFullScreen,
    handlePlaying,
    handleVolumeChange,
    handleLoadedMetaData,
    handleTimeUpdate,
    handleProgress,
    handleEnd,
    handlePaused,
    handleAddError,
    handleIntervalCheckErrors,
    convertShakaError,
    isPlayingHandled,
    setIsPlayingHandled,
    handleIntervalCheckErrorsSafari,
    checkSafariError,
    clearIntervalErrorSafari,
  };
}