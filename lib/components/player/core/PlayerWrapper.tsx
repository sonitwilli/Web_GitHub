// WRAPPER CHO TẤT CẢ PLAYER SHAKA, VIDEOJS
/* eslint-disable @next/next/no-css-tags */
import { ChannelDetailType } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Head from 'next/head';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import FingerPrintClient from './FingerPrintClient';
import dynamic from 'next/dynamic';
import {
  DEFAULT_IP_ADDRESS,
  IP_ADDRESS,
  PLAYER_WRAPPER,
  SHOW_REAL_TIME_CHAT,
  VIDEO_ID,
} from '@/lib/constant/texts';
import usePlayer from '@/lib/hooks/usePlayer';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { debounce } from 'lodash';
import ExpandButton from './ExpandButton';
import { useVodPageContext } from '../context/VodPageContext';
import LiveChat from '../../livechat/LiveChat';
import { setIsOpenLiveChat } from '@/lib/store/slices/playerSlice';
import { usePlayVideoWithUrl } from '@/lib/hooks/usePlayVideoWithUrl';
import React from 'react';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import MobilePopup from './MobilePopup';
import ResolutionContent from './ResolutionContent';
import SubtitleContent from './SubtitleContent';
import AudioContent from './AudioContent';
import SpeedContent from './SpeedContent';
import FingerPrintAPI from './FingerPrintAPI';
import { useBroadcastSchedule } from '@/lib/hooks/useBroadcastSchedule';
import { useKeyboardControls } from '@/lib/hooks/useKeyboardControls';
import { useNoAdsGuide } from '@/lib/hooks/useNoAdsGuide';
import { useAutoNextVideo } from '@/lib/hooks/useAutoNextVideo';
import { useNextRecommend } from '@/lib/hooks/useNextRecommend';
import { useSkipIntro } from '@/lib/hooks/useSkipIntro';
import { useWatchAndSkipCredit } from '@/lib/hooks/useWatchAndSkipCredit';
import { isSituationWarningVisible } from '@/lib/hooks/useSituationWarningVisibility';
import { PreviewType } from './Preview';
import { trackingShowPopupLog191 } from '@/lib/tracking/trackingCommon';
import { EpisodeTypeEnum } from '@/lib/api/vod';
import { trackingPlaybackErrorLog515 } from '@/lib/hooks/useTrackingPlayback';
import axios from 'axios';

const NoAdsGuide = dynamic(() => import('./NoAdsGuide'), { ssr: false });
const ListEspisodeComponent = dynamic(
  () => import('../../watch-video/ListEspisodeComponent'),
  { ssr: false },
);
const BroadcastScheduleWrapper = dynamic(
  () => import('@/lib/components/live/BroadcastScheduleWrapper'),
  { ssr: false },
);
const MiddleButtons = dynamic(() => import('./MiddleButtons'), { ssr: false });
const PlayerError = dynamic(() => import('./PlayerError'), { ssr: false });
const PlayerLogin = dynamic(() => import('./PlayerLogin'));
const Preview = dynamic(() => import('./Preview'), { ssr: false });
const DebugOverlay = dynamic(() => import('./DebugOverlay'), { ssr: false });
const MemoPreview = React.memo(Preview);

interface Props {
  children?: React.ReactNode;
  dataChannel?: ChannelDetailType;
  dataStream?: StreamItemType; // Adjust type as needed
  eventId?: string;
}

interface PlayerErrorType {
  content?: string;
  code?: string;
}

export type ControlPopupType =
  | 'resolution'
  | 'subtile'
  | 'audio'
  | 'speed'
  | null;
export interface FingerPrintDataType {
  type?: string;
  duration?: number;
  x?: number;
  y?: number;
}

export interface PlayerWrapperContextType {
  isFullscreen?: boolean;
  ip?: string;
  setIp?: (v: string) => void;

  fingerPrintData?: FingerPrintDataType;

  setFingerPrintData?: (v?: FingerPrintDataType) => void;
  showFingerPrintClient?: boolean;
  setShowFingerPrintClient?: (v: boolean) => void;
  playerError?: PlayerErrorType;
  setPlayerError?: (v: PlayerErrorType) => void;
  openPlayerErrorModal?: (v: PlayerErrorType) => void;
  closePlayerErrorModal?: () => void;
  controlPopupType?: ControlPopupType;
  setControlPopupType?: (v: ControlPopupType) => void;
  isUserInactive?: boolean;
}

export const PlayerWrapperContext = createContext<
  PlayerWrapperContextType & {
    setShowBroadcastSchedule?: (v: boolean) => void;
  }
>({});

export default function PlayerWrapper({ children, eventId }: Props) {
  const {
    streamType,
    isPlaySuccess,
    videoHeight,
    isExpanded,
    fromTimeshiftToLive,
    showModalLogin,
    showLoginPlayer,
    isDrm,
    dataChannel,
    setIsExpanded,
    fetchChannelCompleted,
    isVideoPaused,
    previewHandled,
    dataStream,
    setPlayingUrl,
    isLastPlaylistVideo,
    dataPlaylist,
    showModalNotice,
  } = usePlayerPageContext();
  const { viewportType } = useScreenSize();
  const {
    episodeTypeName,
    isFinalEpisode,
    openEpisodesFullscreen,
    setOpenEpisodesFullscreen,
    fetchTop10Done,
  } = useVodPageContext();
  const { clickFullScreen } = usePlayer();
  const [controlPopupType, setControlPopupType] =
    useState<ControlPopupType>(null);
  const [playerError, setPlayerError] = useState<PlayerErrorType | undefined>(
    undefined,
  );
  const [isShowErrorModal, setIsShowErrorModal] = useState(false);
  const [showFingerPrintClient, setShowFingerPrintClient] = useState(false);
  const [fingerPrintData, setFingerPrintData] = useState<FingerPrintDataType>();
  const [ip, setIp] = useState('0.0.0.0');
  const pageCtx = useContext(ChannelPageContext);
  const { isTimeShift, setSrcTimeShift } = pageCtx;
  const { isFullscreen, isOpenLiveChat } = useAppSelector((s) => s.player);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const [showBroadcastSchedule, setShowBroadcastSchedule] = useState(false);
  const [isUserInactive, setIsUserInactive] = useState(false);
  const [debugVisible, setDebugVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('is_debug_player') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handler = () => {
      setDebugVisible((prev) => {
        const next = !prev;
        try {
          window.sessionStorage?.setItem('is_debug_player', String(next));
        } catch {}
        return next;
      });
    };
    window.addEventListener('toggle_debug_overlay', handler as EventListener);
    return () => {
      window.removeEventListener(
        'toggle_debug_overlay',
        handler as EventListener,
      );
    };
  }, []);

  // Get states from other hooks for blocking UI detection
  const { isVisible: isAutoNextVisible } = useAutoNextVideo();
  const { isVisible: isNextRecommendVisible } = useNextRecommend();
  const { isVisible: isSkipIntroVisible } = useSkipIntro(
    dataStream?.start_content ? Number(dataStream.start_content) : 0,
    dataStream?.intro_from ? Number(dataStream.intro_from) : 0,
  );

  // Detect WatchAndSkipCredit visibility
  const hasNextEpisode =
    dataChannel?.episodes && dataChannel.episodes.length > 1;
  const { isVisible: isWatchAndSkipCreditVisible } = useWatchAndSkipCredit(
    dataStream?.end_content ? Number(dataStream.end_content) : 0,
    hasNextEpisode,
    () => {},
  );

  // Detect LimitAgeOverlay visibility
  const isLimitAgeOverlayVisible = useMemo(() => {
    return dataChannel?.maturity_rating?.position === 'BR';
  }, [dataChannel?.maturity_rating]);

  // No need for hook - use global variable directly

  const { showNoAdsGuide, setShowNoAdsGuide } = useNoAdsGuide({
    enableAds: !!dataStream?.enable_ads,
    noAdsBuyPackageInstream:
      dataStream?.noads_buy_package_instream as StreamItemType,
    isVideoPaused,
    isPreviewMode: previewHandled,
    isSkipIntroVisible,
    isNextEpisodeGuideVisible: isAutoNextVisible || isNextRecommendVisible, // Next episode/recommend guides
    isUsageGuideVisible: !!showModalNotice, // Player notice modal (usage guide, warnings, etc.)
    isWarningVisible: !!playerError || isShowErrorModal, // Player error modal
    isLogoAnimationAdsVisible: !!showFingerPrintClient, // Fingerprint client overlay
    isWatchCreditVisible: false, // TODO: Connect to watch credit state
    isStreamTvcVisible: !!showBroadcastSchedule, // Broadcast schedule overlay
    isContentWarningVisible: controlPopupType !== null || !!showModalLogin, // Mobile control popups or login modal
    isLimitAgeOverlayVisible, // LimitAgeOverlay at BR position
    isWatchAndSkipCreditVisible, // WatchAndSkipCredit component visibility
    isSituationWarningVisible, // SituationWarning component visibility
  });

  // Lấy channelId từ dataChannel
  const channelId = useMemo(() => dataChannel?._id || '', [dataChannel]);
  // Sử dụng custom hook cho toàn bộ logic schedule (được xử lý trong BroadcastScheduleWrapper)
  useBroadcastSchedule(channelId, dataChannel);

  // check ẩn hiện nút expand
  const isShowExpandButton = useMemo(() => {
    if (streamType === 'channel') {
      return true;
    }
    if (streamType === 'vod') {
      return (
        (dataChannel?.episodes && dataChannel?.episodes?.length > 1) ||
        dataChannel?.episode_type === EpisodeTypeEnum.SERIES ||
        dataChannel?.episode_type === EpisodeTypeEnum.SEASON
      );
    }
    if (streamType === 'playlist') {
      return true;
    }
    if (streamType === 'timeshift') {
      return true;
    }
    return false;
  }, [dataChannel, streamType]);

  // trang vod nếu danh sách tập < 2 thì bật chế độ mở rộng
  useEffect(() => {
    if (fetchChannelCompleted && fetchTop10Done) {
      if (streamType === 'vod') {
        if (
          dataChannel?.episode_type === EpisodeTypeEnum.SINGLE ||
          !dataChannel?.episodes?.length ||
          dataChannel?.episodes?.length < 1
        ) {
          if (setIsExpanded) {
            setIsExpanded(true);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchChannelCompleted, fetchTop10Done, streamType, dataChannel]);

  // Logic mở rộng khi bật/tắt livechat
  useEffect(() => {
    if (
      fetchChannelCompleted &&
      (streamType === 'event' || streamType === 'premiere')
    ) {
      const lastTimesShowChatStatus = localStorage.getItem(SHOW_REAL_TIME_CHAT);
      dispatch(setIsOpenLiveChat(lastTimesShowChatStatus === '1'));
      const dataChannelComment =
        dataChannel?.comment && dataChannel?.comment_type === 'realtime';
      if (setIsExpanded) {
        setIsExpanded(!(dataChannelComment && isOpenLiveChat));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamType, fetchChannelCompleted, isOpenLiveChat, dataChannel]);

  const isPreviewActive = useMemo(() => {
    return !!previewHandled;
  }, [previewHandled]);

  const openPlayerErrorModal = (v: PlayerErrorType) => {
    setIsShowErrorModal(true);
    setPlayerError(v);
    trackingPlaybackErrorLog515({
      Event: 'Error',
      ErrCode: v.code,
      ErrMessage: v.content,
    });
    trackingShowPopupLog191();
  };

  const closePlayerErrorModal = () => {
    setIsShowErrorModal(false);
    setPlayerError(undefined);
  };

  const hideMouse = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.classList.add('player-wrapper-user-inactive');
    setIsUserInactive(true);
  }, []);

  const showMouse = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.classList.remove('player-wrapper-user-inactive');
    setIsUserInactive(false);
  }, []);

  const resetTimer = useCallback(() => {
    showMouse();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      hideMouse();
    }, 3000);
  }, [showMouse, hideMouse]);
  const debouncedMouseMove = useRef(debounce(resetTimer, 20)).current;

  const clickMask = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      // pause
      if (streamType === 'vod' || streamType === 'playlist') {
        if (video.paused) {
          video
            .play()
            .then(() => {})
            .catch(() => {});
        } else {
          video.pause();
        }
      }
    }
  };

  const getIp = async () => {
    try {
      const { data } = await axios.get('https://checkip.fptplay.net');
      if (data) {
        localStorage.setItem(IP_ADDRESS, data);
      }
    } catch {
      localStorage.setItem(IP_ADDRESS, DEFAULT_IP_ADDRESS);
    }
  };

  useEffect(() => {
    if (debugVisible) {
      getIp();
    }
  }, [debugVisible]);

  useEffect(() => {
    // Trigger initial timer
    resetTimer();

    return () => {
      // Clear main timer
      if (timerRef.current) clearTimeout(timerRef.current);
      // Cancel debounced calls
      debouncedMouseMove.cancel();
    };
  }, [resetTimer, debouncedMouseMove, fromTimeshiftToLive]);

  const playVideoWithUrl = usePlayVideoWithUrl({
    playerType: streamType === 'vod' ? 'hls' : 'shaka',
    setPlayingUrl,
  });

  const handleExitPreviewLive = useCallback(
    (url: string) => {
      playVideoWithUrl(url);
    },
    [playVideoWithUrl],
  );

  // Enable keyboard controls for player
  useKeyboardControls();

  const handleExitPreviewEvent = useCallback(() => {}, []);
  const handleBuyPackage = useCallback(() => {}, []);

  return (
    <PlayerWrapperContext
      value={{
        ip,
        setIp,
        fingerPrintData,
        setFingerPrintData,
        showFingerPrintClient,
        setShowFingerPrintClient,
        playerError,
        setPlayerError,
        openPlayerErrorModal,
        closePlayerErrorModal,
        controlPopupType,
        setControlPopupType,
        setShowBroadcastSchedule, // truyền vào context
        isUserInactive,
      }}
    >
      <Head>
        <link rel="stylesheet" href="/css/player/player.css" />
      </Head>
      <div
        ref={containerRef}
        id={PLAYER_WRAPPER}
        className={`xl:h-full ${PLAYER_WRAPPER} relative flex items-center justify-center ${
          isTimeShift ? 'time-shift' : ''
        } ${
          isFullscreen ? 'player-wrapper-fullscreen' : ''
        } player-wrapper-${streamType} ${
          isPlaySuccess ? 'player-wrapper-play-success' : ''
        } ${isExpanded ? 'player-wrapper-expanded bg-black' : ''} ${
          showLoginPlayer ? 'player-wrapper-login' : ''
        } ${
          isDrm ? 'player-wrapper-drm' : ''
        } player-wrapper-${episodeTypeName} ${
          isFinalEpisode || isLastPlaylistVideo
            ? 'player-wrapper-final-episode'
            : ''
        } ${
          dataChannel?.comment &&
          dataChannel?.comment_type === 'realtime' &&
          (streamType === 'event' || streamType === 'premiere')
            ? 'player-wrapper-chat'
            : ''
        } ${
          !!dataChannel?.episodes?.length && dataChannel?.episodes?.length <= 1
            ? 'player-wrapper-only-one-episode'
            : ''
        } ${isVideoPaused ? 'player-wrapper-paused' : ''}`}
        onMouseMove={debouncedMouseMove}
        onClick={debouncedMouseMove}
        data-height={videoHeight}
        style={{
          height:
            viewportType === VIEWPORT_TYPE.DESKTOP
              ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
              : '',
        }}
      >
        <div
          className="nvm dbclick click absolute w-full h-full top-0 left-0 z-[1]"
          onDoubleClick={(ev) => {
            ev.stopPropagation();
            clickFullScreen();
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            clickMask();
          }}
        ></div>
        {isShowErrorModal && !(streamType === 'channel' && previewHandled) ? (
          <PlayerError />
        ) : null}
        {showFingerPrintClient ? (
          <div className="absolute w-full h-full z-[2]">
            <FingerPrintClient />
          </div>
        ) : (
          ''
        )}
        {controlPopupType !== null ? (
          <MobilePopup onClose={() => setControlPopupType(null)}>
            {controlPopupType === 'resolution' && (
              <ResolutionContent
                onClick={() => setControlPopupType(null)}
                type="fullcreen"
              />
            )}
            {controlPopupType === 'subtile' && (
              <SubtitleContent
                onClick={() => setControlPopupType(null)}
                type="fullcreen"
              />
            )}
            {controlPopupType === 'audio' && (
              <AudioContent
                onClick={() => setControlPopupType(null)}
                type="fullcreen"
              />
            )}
            {controlPopupType === 'speed' && (
              <SpeedContent
                onClick={() => setControlPopupType(null)}
                type="fullcreen"
              />
            )}
          </MobilePopup>
        ) : (
          ''
        )}
        {children}

        {/* Debug overlay */}
        <DebugOverlay visible={debugVisible} dataChannel={dataChannel} />

        {/* Preview component for VOD and Live */}
        {isPreviewActive && (
          <MemoPreview
            type={streamType as PreviewType}
            isPreviewActive={isPreviewActive}
            isPreviewEnded={false}
            currentUser={null}
            isTvod={Boolean(dataChannel?.is_tvod === '1')}
            requireVipPlan=""
            paymentData={null}
            currentStream={dataStream}
            playerError={playerError}
            dataEndedPreviewEvent={null}
            onExitPreviewLive={handleExitPreviewLive}
            onExitPreviewEvent={handleExitPreviewEvent}
            onBuyPackage={handleBuyPackage}
          />
        )}

        {/* NoAds Guide */}
        <NoAdsGuide
          data={dataStream?.noads_buy_package_instream}
          onClose={() => setShowNoAdsGuide(false)}
          visible={showNoAdsGuide}
        />

        {viewportType === VIEWPORT_TYPE.DESKTOP && isShowExpandButton && (
          <div
            className={`absolute top-1/2 right-0 -translate-y-1/2 player-expand z-[2] ${
              isPlaySuccess ? '' : ''
            }`}
          >
            <ExpandButton />
          </div>
        )}
        {showModalLogin ? <PlayerLogin /> : ''}

        {/* Chỉ show danh sách tập nếu có ít nhất 2 tập */}
        {(streamType === 'vod' || streamType === 'playlist') &&
        isFullscreen &&
        ((dataChannel?.episodes && dataChannel?.episodes?.length > 1) ||
          (dataPlaylist?.videos && dataPlaylist?.videos?.length) ||
          ((dataChannel?.episode_type === EpisodeTypeEnum.SERIES ||
            dataChannel?.episode_type === EpisodeTypeEnum.SEASON) &&
            dataChannel?.episodes?.length)) ? (
          <div className={`${openEpisodesFullscreen ? '' : 'hidden'}`}>
            <div className="fixed z-[10] top-0 right-0 w-full h-full grid grid-cols-[1fr_min(520px,100vw)] sm:grid-cols-[1fr_520px]">
              <div className="h-full  bg-gradient-to-r from-[rgba(13,13,12,0)] to-[rgba(13,13,12,1)]"></div>
              <div className="flex justify-end">
                <ListEspisodeComponent position="fullscreen" />
              </div>
              <button
                aria-label="close episode list"
                className="hover:cursor-pointer absolute right-[12px] top-[12px]"
                onClick={() => {
                  if (setOpenEpisodesFullscreen) {
                    setOpenEpisodesFullscreen(!openEpisodesFullscreen);
                  }
                }}
              >
                <img
                  src="/images/close.png"
                  alt="close"
                  width={32}
                  height={32}
                />
              </button>
            </div>
          </div>
        ) : (
          ''
        )}
        {(streamType === 'event' || streamType === 'premiere') &&
          dataChannel?.comment &&
          dataChannel?.comment_type === 'realtime' &&
          isFullscreen && (
            <div
              className={`${
                isOpenLiveChat ? 'z-[10] h-full min-w-[24.3559%]' : 'hidden'
              }`}
            >
              <div className="w-full h-full">
                <LiveChat roomId={eventId || ''} type="event" />
              </div>
            </div>
          )}
        {viewportType === VIEWPORT_TYPE.MOBILE &&
          (streamType === 'vod' || streamType === 'playlist') &&
          isPlaySuccess && (
            <div className="MiddleButtons-container absolute z-[2] top-1/2 -translate-y-1/2 left-0 w-full px-[32px]">
              <MiddleButtons />
            </div>
          )}

        {/* Broadcast schedule chỉ show qua BroadcastScheduleWrapper khi showBroadcastSchedule && isFullscreen */}
        {showBroadcastSchedule && isFullscreen && (
          <div className="fixed z-[10] top-0 right-0 w-full h-full grid grid-cols-[1fr_min(520px,100vw)] sm:grid-cols-[1fr_520px]">
            <div className="h-full bg-gradient-to-r from-[rgba(13,13,12,0)] to-[rgba(13,13,12,1)]"></div>
            <div className="flex justify-end">
              <BroadcastScheduleWrapper
                channelId={channelId}
                dataChannel={dataChannel}
                onScheduleSelect={(src) => {
                  // Handle schedule selection - logic tương tự như trong ChannelPage
                  if (!src) {
                    // Reset về live
                    if (setSrcTimeShift) {
                      setSrcTimeShift('');
                    }
                    if (pageCtx.setIsTimeShift) {
                      pageCtx.setIsTimeShift(false);
                    }
                    if (setPlayingUrl) {
                      setPlayingUrl('');
                    }
                    return;
                  }

                  // Chuyển sang timeshift
                  if (setSrcTimeShift) {
                    setSrcTimeShift(src);
                  }
                  if (pageCtx.setIsTimeShift) {
                    pageCtx.setIsTimeShift(true);
                  }
                  if (setPlayingUrl) {
                    setPlayingUrl(src);
                  }
                }}
                isFullscreen={true}
                onClose={() => setShowBroadcastSchedule(false)}
                visible={true}
              />
            </div>
            <button
              aria-label="close broadcast schedule"
              className="hover:cursor-pointer absolute right-[12px] top-[12px]"
              onClick={() => setShowBroadcastSchedule(false)}
            >
              <img src="/images/close.png" alt="close" width={32} height={32} />
            </button>
          </div>
        )}
        <FingerPrintAPI />
      </div>
    </PlayerWrapperContext>
  );
}
