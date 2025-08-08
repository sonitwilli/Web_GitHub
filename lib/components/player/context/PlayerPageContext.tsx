/* eslint-disable @typescript-eslint/ban-ts-comment */
// WRAPPER CHO TẤT CẢ PAGE CÓ PLAYER: CHANNEL, VOD,...
import {
  ChannelDetailType,
  getChannelDetail,
  getStreamData,
  StreamErrorType,
  PreviewResponseData,
} from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
  RefObject,
  useRef,
} from 'react';
import ConfirmDialog, {
  ModalCloseKey,
  ModalContent,
  ModalSubmitKey,
} from '../../modal/ModalConfirm';
import useModalActions from '@/lib/hooks/useModalActions';
import {
  DRM_MERCHANT_NAMES,
  PLAYER_NAME_TYPE,
  PLAYER_WRAPPER_ID,
  ROUTE_PATH_NAMES,
} from '@/lib/constant/texts';
import _ from 'lodash';
import { userAgentInfo } from '@/lib/utils/ua';
import { Episode, getEpisodeDetail, getVodDetail } from '@/lib/api/vod';
import { getEventDetail, getEventStreamData } from '@/lib/api/event';
import { getSeekPremier, parseManifest } from '@/lib/utils/player';
import { AudioItemType } from '../core/AudioButton';
import { ResolutionItemType } from '../core/Resolution';
import { useSelector } from 'react-redux';
import { RootState, useAppSelector } from '@/lib/store';
import { ERROR_URL_MSG, PAGE_NOT_FOUND_MSG } from '@/lib/constant/errors';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { useAppDispatch } from '@/lib/store';
import { useIsRevision } from '@/lib/hooks/useIsRevision';
import { ErrorData } from 'hls.js';
import {
  getPlaylistDetail,
  getPlaylistRealDetail,
  PlayListDetailResponseType,
} from '@/lib/api/playlist';
import { saveSessionStorage } from '@/lib/utils/storage';
import { trackingStoreKey } from '@/lib/constant/tracking';

export interface PlayerModalType {
  content?: ModalContent;
  closeKey?: ModalCloseKey;
  submitKey?: ModalSubmitKey;
}

export interface NotFoundMessage {
  content?: string;
  title?: string;
  code?: string;
}

type StreamType =
  | 'channel'
  | 'event'
  | 'vod'
  | 'playlist'
  | 'premiere'
  | 'timeshift'
  | '';

type ContextType = {
  dataChannel?: ChannelDetailType;
  dataStream?: StreamItemType;
  fetchChannelCompleted?: boolean;
  showLoginPlayer?: boolean;
  loginManifestUrl?: string;
  showModalNotice?: boolean;
  setShowModalNotice?: (v: boolean) => void;
  modalNoticeContent?: ModalContent;
  setModalNoticeContent?: (v: ModalContent) => void;
  modalNoticeCloseKey?: ModalCloseKey;
  setModalNoticeCloseKey?: (v: ModalCloseKey) => void;
  modalNoticeSubmitKey?: ModalSubmitKey;
  setModalNoticeSubmitKey?: (v: ModalSubmitKey) => void;
  openPlayerNoticeModal?: (v: PlayerModalType) => void;
  handleSubmitModalNotice?: () => void;
  handleCloseModalNotice?: () => void;
  onAfterCloseModalNotice?: () => void;
  onAfterOpenModalNotice?: () => void;
  isDrm?: boolean;
  isHboGo?: boolean;
  isQNet?: boolean;
  isTDM?: boolean;
  isRequiredBrowser?: () => boolean;
  playerName?: PLAYER_NAME_TYPE;
  setPlayerName?: (v: PLAYER_NAME_TYPE) => void;
  streamType?: StreamType;
  isPlaySuccess?: boolean;
  setIsPlaySuccess?: (v: boolean) => void;
  isExpanded?: boolean;
  setIsExpanded?: (v: boolean) => void;
  videoHeight?: number;
  setVideoHeight?: (v: number) => void;
  isMetaDataLoaded?: boolean;
  setIsMetaDataLoaded?: (v: boolean) => void;
  videoDuration?: number;
  videoCurrentTime?: number;
  setVideoDuration?: (v: number) => void;
  setVideoCurrentTime?: (v: number) => void;
  bufferedTime?: number;
  setBufferedTime?: (v: number) => void;
  fromTimeshiftToLive?: number;
  setFromTimeshiftToLive?: (v: number) => void;
  isEndVideo?: number;
  setIsEndVideo?: (v: number) => void;
  setShowLoginPlayer?: (v: boolean) => void;
  setLoginManifestUrl?: (v: string) => void;
  showModalLogin?: boolean;
  setShowModalLogin?: (v: boolean) => void;
  requirePurchaseData?: StreamErrorType;
  setRequirePurchaseData?: (v: StreamErrorType) => void;
  channelNotFound?: boolean;
  setChannelNotFound?: (v: boolean) => void;
  playingUrl?: string;
  setPlayingUrl?: (v: string) => void;
  audios?: AudioItemType[];
  setAudios?: (v: AudioItemType[]) => void;
  videoQualities?: ResolutionItemType[];
  setVideoQualities?: (v: ResolutionItemType[]) => void;
  isPrepareLive?: boolean;
  setIsPrepareLive?: (v: boolean) => void;
  isEndedLive?: boolean;
  setIsEndedLive?: (v: boolean) => void;
  fetchDetailDone?: boolean;
  setFetchDetailDone?: boolean;
  notFoundError?: NotFoundMessage;
  setNotFoundError?: (v: NotFoundMessage) => void;
  seekOffsetInSeconds?: number;
  isVideoPaused?: boolean;
  setIsVideoPaused?: (v: boolean) => void;
  portalTarget?: HTMLElement;
  hlsErrors?: ErrorData[];
  setHlsErrors?: (v: ErrorData[]) => void;
  hlsErrosRef?: RefObject<ErrorData[]>;
  isPlaySuccessRef?: RefObject<boolean>;
  previewHandled?: boolean;
  setPreviewHandled?: (v: boolean) => void;
  dataPlaylist?: PlayListDetailResponseType;
  setDataPlaylist?: (v: PlayListDetailResponseType) => void;
  isRedirecting?: boolean;
  // Playlist auto next support
  currentPlaylistVideo?: {
    id: string;
    title?: string;
    thumb?: string;
    duration?: string;
    description?: string;
  };
  nextPlaylistVideo?: {
    id: string;
    title?: string;
    thumb?: string;
    duration?: string;
    description?: string;
    landscape?: string;
    duration_s?: string;
  };
  isLastPlaylistVideo?: boolean;
  playingUrlRef?: RefObject<string>;
  isBackgroundRetryRef?: RefObject<boolean>;
  getStream?: ({
    channelDetailData,
    dataPlaylist,
  }: {
    channelDetailData?: ChannelDetailType;
    dataPlaylist?: PlayListDetailResponseType;
  }) => Promise<StreamItemType>;
  checkErrorInterRef?: RefObject<NodeJS.Timeout>;
  clearErrorInterRef?: () => void;
};

const PlayerPageContext = createContext<ContextType | null>(null);

export function usePlayerPageContext(): ContextType {
  const context = useContext(PlayerPageContext);
  if (!context) {
    return {};
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function PlayerPageContextProvider({ children }: Props) {
  const isBackgroundRetryRef = useRef(false);
  const { isFullscreen } = useAppSelector((s) => s.player);
  const [hlsErrors, setHlsErrors] = useState<ErrorData[]>([]);
  const hlsErrosRef = useRef<ErrorData[]>([]);
  useEffect(() => {
    hlsErrosRef.current = hlsErrors;
  }, [hlsErrors]);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [notFoundError, setNotFoundError] = useState<NotFoundMessage>({});
  const [fetchDetailDone, setFetchDetailDone] = useState(false);
  const [videoQualities, setVideoQualities] = useState<ResolutionItemType[]>(
    [],
  );
  const [audios, setAudios] = useState<AudioItemType[]>([]);
  const [playingUrl, setPlayingUrl] = useState<string>('');
  const playingUrlRef = useRef(playingUrl);
  useEffect(() => {
    playingUrlRef.current = playingUrl;
  }, [playingUrl]);
  const [channelNotFound, setChannelNotFound] = useState(false);
  const [requirePurchaseData, setRequirePurchaseData] = useState<
    StreamErrorType | undefined
  >(undefined);
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [fromTimeshiftToLive, setFromTimeshiftToLive] = useState<
    number | undefined
  >();
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isEndVideo, setIsEndVideo] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isMetaDataLoaded, setIsMetaDataLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaySuccess, setIsPlaySuccess] = useState(false);
  const isPlaySuccessRef = useRef<boolean>(false);
  useEffect(() => {
    isPlaySuccessRef.current = isPlaySuccess;
  }, [isPlaySuccess]);
  const [playerName, setPlayerName] = useState<PLAYER_NAME_TYPE>('hls');
  const modalActions = useModalActions();
  const [dataChannel, setDataChannel] = useState<ChannelDetailType>();
  useEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.DATA_CHANNEL,
          value: JSON.stringify(dataChannel || {}),
        },
      ],
    });
  }, [dataChannel]);
  const [dataStream, setDataStream] = useState<StreamItemType>();
  useEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.DATA_STREAM,
          value: JSON.stringify(dataStream || {}),
        },
      ],
    });
  }, [dataStream]);
  const [fetchChannelCompleted, setFetchChannelCompleted] = useState(false);
  const [showLoginPlayer, setShowLoginPlayer] = useState(false);
  const [loginManifestUrl, setLoginManifestUrl] = useState('');
  const router = useRouter();
  const [modalNoticeCloseKey, setModalNoticeCloseKey] =
    useState<ModalCloseKey>('');
  const [modalNoticeSubmitKey, setModalNoticeSubmitKey] =
    useState<ModalSubmitKey>('');
  const [showModalNotice, setShowModalNotice] = useState(false);
  const [modalNoticeContent, setModalNoticeContent] = useState<ModalContent>(
    {},
  );
  const dataEvent = useSelector((state: RootState) => state.player.dataEvent);
  const [isPrepareLive, setIsPrepareLive] = useState(false);
  const [isEndedLive, setIsEndedLive] = useState(false);
  const isEndedLiveCountdown = useSelector(
    (state: RootState) => state.player.isEndedLiveCountdown,
  );
  const checkErrorInterRef = useRef<NodeJS.Timeout>(null);

  const [previewHandled, setPreviewHandled] = useState(false);
  const [dataPlaylist, setDataPlaylist] =
    useState<PlayListDetailResponseType>();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const portalTarget = useMemo(() => {
    if (isFullscreen) {
      return document.getElementById(PLAYER_WRAPPER_ID) as HTMLElement;
    }
  }, [isFullscreen]);

  const streamType = useMemo<StreamType>(() => {
    const { pathname } = router;
    if (pathname?.includes(ROUTE_PATH_NAMES.CHANNEL)) {
      const { time_shift_id } = router.query;
      if (time_shift_id) {
        return 'timeshift';
      } else {
        return 'channel';
      }
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.EVENT)) {
      return 'event';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.VOD)) {
      return 'vod';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)) {
      return 'playlist';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.PREMIERE)) {
      return 'premiere';
    }
    return 'channel';
  }, [router]);
  const dispatch = useAppDispatch();

  // Playlist auto next logic
  const currentPlaylistVideo = useMemo(() => {
    if (streamType !== 'playlist' || !dataPlaylist?.videos) return undefined;

    const currentVideoId = router?.query?.slug?.[1];
    if (!currentVideoId) return undefined;

    return dataPlaylist.videos.find((video) => video.id === currentVideoId);
  }, [streamType, dataPlaylist?.videos, router?.query?.slug]);

  const nextPlaylistVideo = useMemo(() => {
    if (streamType !== 'playlist' || !dataPlaylist?.videos) return undefined;

    const currentVideoId = router?.query?.slug?.[1];
    if (!currentVideoId) return undefined;

    const currentIndex = dataPlaylist.videos.findIndex(
      (video) => video.id === currentVideoId,
    );

    if (
      currentIndex === -1 ||
      currentIndex === dataPlaylist.videos.length - 1
    ) {
      return undefined;
    }

    return dataPlaylist.videos[currentIndex + 1];
  }, [streamType, dataPlaylist?.videos, router?.query?.slug]);

  const isLastPlaylistVideo = useMemo(() => {
    if (streamType !== 'playlist' || !dataPlaylist?.videos) return false;

    const currentVideoId = router?.query?.slug?.[1];
    if (!currentVideoId) return false;

    const currentIndex = dataPlaylist.videos.findIndex(
      (video) => video.id === currentVideoId,
    );

    return currentIndex === dataPlaylist.videos.length - 1;
  }, [streamType, dataPlaylist?.videos, router?.query?.slug]);

  // Helper function to get current VOD episode
  const getCurrentVodEpisode = useCallback(
    (channelDetailData?: ChannelDetailType) => {
      let chapterId = '0';
      const slugs = router?.query?.slug;
      if (Array.isArray(slugs) && slugs[1]) {
        const x = slugs[1].split('-').pop();
        if (typeof x !== 'undefined' && Number(x) >= 1) {
          chapterId = String(Number(x) - 1);
        }
      }
      return channelDetailData?.episodes?.find((x) => x.id === chapterId);
    },
    [router?.query?.slug],
  );

  // Helper function to handle preview error for 406 case only
  const handlePreviewError = useCallback(
    (
      response: AxiosError<StreamErrorType>['response'],
      channelDetailData?: ChannelDetailType,
    ) => {
      const responseData = response?.data as PreviewResponseData;
      if (!responseData) return false;

      // Check if preview is available based on content type
      let isPreview = false;

      // VOD: Check episode has is_preview = "1"
      if (streamType === 'vod') {
        const found = getCurrentVodEpisode(channelDetailData);
        isPreview = found?.is_preview === '1';
      }
      // Live/Event/Premiere: Check has preview URLs
      else if (['channel', 'event'].includes(streamType)) {
        isPreview = responseData?.enable_preview === '1';
      }

      if (!isPreview) return false;

      // Set dataStream with complete preview data for Player to work without additional config
      const previewStreamData: StreamItemType = {
        url_dash: responseData?.data?.url_dash || responseData?.url_dash,
        url_dash_av1:
          responseData?.data?.url_dash_av1 || responseData?.url_dash_av1,
        url_dash_dolby_vision:
          responseData?.data?.url_dash_dolby_vision ||
          responseData?.url_dash_dolby_vision,
        url_dash_h265:
          responseData?.data?.url_dash_h265 || responseData?.url_dash_h265,
        url_dash_h265_hdr_10:
          responseData?.data?.url_dash_h265_hdr_10 ||
          responseData?.url_dash_h265_hdr_10,
        url_dash_h265_hdr_10_plus:
          responseData?.data?.url_dash_h265_hdr_10_plus ||
          responseData?.url_dash_h265_hdr_10_plus,
        url_dash_h265_hlg:
          responseData?.data?.url_dash_h265_hlg ||
          responseData?.url_dash_h265_hlg,
        url_dash_vp9:
          responseData?.data?.url_dash_vp9 || responseData?.url_dash_vp9,
        url_hls: responseData?.data?.url_hls || responseData?.url_hls,
        url_hls_av1:
          responseData?.data?.url_hls_av1 || responseData?.url_hls_av1,
        url_hls_dolby_vision:
          responseData?.data?.url_hls_dolby_vision ||
          responseData?.url_hls_dolby_vision,
        url_hls_h265:
          responseData?.data?.url_hls_h265 || responseData?.url_hls_h265,
        url_hls_h265_hdr_10:
          responseData?.data?.url_hls_h265_hdr_10 ||
          responseData?.url_hls_h265_hdr_10,
        url_hls_h265_hdr_10_plus:
          responseData?.data?.url_hls_h265_hdr_10_plus ||
          responseData?.url_hls_h265_hdr_10_plus,
        url_hls_h265_hlg:
          responseData?.data?.url_hls_h265_hlg ||
          responseData?.url_hls_h265_hlg,
        url_hls_vp9:
          responseData?.data?.url_hls_vp9 || responseData?.url_hls_vp9,

        // All required properties for Player functionality
        session: responseData?.data?.session || responseData?.session,
        merchant: responseData?.data?.merchant || responseData?.merchant,
        is_logged_in:
          responseData?.data?.is_logged_in || responseData?.is_logged_in,
        is_vip: responseData?.data?.is_vip || responseData?.is_vip,
        audio: responseData?.data?.audio || responseData?.audio,
        stream_session:
          responseData?.data?.stream_session || responseData?.stream_session,
        require_vip_plan:
          responseData?.data?.require_vip_plan ||
          responseData?.require_vip_plan,
        ping_enable:
          responseData?.data?.ping_enable || responseData?.ping_enable,
        ping_enc: responseData?.data?.ping_enc || responseData?.ping_enc,
        ping_mqtt:
          (responseData?.data?.ping_mqtt || responseData?.ping_mqtt) === '1',
        ping_qnet: responseData?.data?.ping_qnet || responseData?.ping_qnet,
        ping_session:
          responseData?.data?.ping_session || responseData?.ping_session,
        require_active:
          responseData?.data?.require_active || responseData?.require_active,
        operator: responseData?.data?.operator || responseData?.operator,
        overlay_logo:
          responseData?.data?.overlay_logo || responseData?.overlay_logo,
        ttl_preview:
          responseData?.data?.ttl_preview || responseData?.ttl_preview,
        trailer_url:
          responseData?.data?.trailer_url || responseData?.trailer_url,
        require_obj_msg:
          responseData?.data?.require_obj_msg || responseData?.require_obj_msg,
      };

      setDataStream(previewStreamData);
      setPreviewHandled(true);
      return true;
    },
    [streamType, getCurrentVodEpisode],
  );

  const handleSubmitModalNotice = () => {
    if (modalNoticeSubmitKey) {
      switch (modalNoticeSubmitKey) {
        case 'on_close':
          setShowModalNotice(false);
          break;
        case 'on_mobile':
          modalActions.onMobile();
          break;
        case 'on_refresh':
          window.location.reload();
        case 'on_understood':
          router.push('/');
          break;
        default:
          break;
      }
    }
    setShowModalNotice(false);
  };
  const handleCloseModalNotice = () => {
    if (modalNoticeCloseKey) {
      switch (modalNoticeCloseKey) {
        case 'on_close':
          setShowModalNotice(false);
          break;
        case 'on_exit':
          setShowModalNotice(false);
          router.push('/');
          break;
        default:
          break;
      }
    }
    setShowModalNotice(false);
  };
  const onAfterCloseModalNotice = () => {
    document.documentElement.classList.remove('overflow-hidden');
    setShowModalNotice(false);
  };
  const onAfterOpenModalNotice = () => {
    document.documentElement.classList.add('overflow-hidden');
  };
  const openPlayerNoticeModal = (v: PlayerModalType) => {
    setShowModalNotice(true);
    setModalNoticeContent(v.content || {});
    setModalNoticeCloseKey(v?.closeKey || '');
    setModalNoticeSubmitKey(v?.submitKey || '');
  };
  const isDrm = useMemo(() => {
    return (
      dataChannel?.verimatrix === '1' ||
      dataChannel?.verimatrix === true ||
      dataChannel?.drm === '1' ||
      dataChannel?.drm === true
    );
    // return dataChannel?._id === 'thvl1' || dataChannel?._id === 'fpt-play';
  }, [dataChannel]);
  const isHboGo = useMemo(() => {
    return !!(
      dataChannel?.source_provider?.toUpperCase() === 'HBO' ||
      _.includes(router.pathname, 'hbo')
    );
  }, [dataChannel, router]);
  const isQNet = useMemo(() => {
    return dataChannel?.source_provider?.toUpperCase() === 'QNET';
  }, [dataChannel]);
  const isTDM = useMemo(() => {
    return dataStream?.merchant === DRM_MERCHANT_NAMES.FPTPLAY;
  }, [dataStream]);

  const isRequiredBrowser = () => {
    const {
      isSafari,
      isEdge,
      isFromPc,
      isWindows,
      isFromAndroidOs,
      isMacOS,
      isFromIos,
    } = userAgentInfo() || {};
    let statusWatch = false;
    if (isFromPc && (isEdge || isSafari)) {
      statusWatch = true;
      return true;
    }
    if (!isFromPc) {
      if (openPlayerNoticeModal) {
        openPlayerNoticeModal({
          submitKey: 'on_mobile',
          content: {
            title: 'Thông báo',
            content:
              'Hiện tại FPT Play chỉ hỗ trợ trình phát trên ứng dụng FPT Play. Vui lòng mở ứng dụng để tiếp tục xem.',
            buttons: {
              accept: 'Mở ứng dụng',
            },
          },
        });
      }
      return false;
    }
    if (statusWatch === false && isFromPc) {
      let browsersSupport = '';
      if (isWindows || isFromAndroidOs) {
        browsersSupport = `<a href="https://www.microsoft.com/vi-vn/edge" target="_blank" style="color: #ff6500">Microsoft Edge</a>`;
      } else if (isMacOS || isFromIos) {
        browsersSupport = `<a href="https://www.microsoft.com/vi-vn/edge" target="_blank" style="color: #ff6500">Microsoft Edge, </a> <a href="https://support.apple.com/downloads/safari" target="_blank" style="color: #ff6500">Safari</a> `;
      }
      if (openPlayerNoticeModal) {
        openPlayerNoticeModal({
          submitKey: 'on_close',
          content: {
            title: 'Thông báo',
            content: `Trình duyệt hiện tại không hỗ trợ phát nội dung này. Vui lòng sử dụng ${browsersSupport} hoặc thiết bị di động, Smart TV và thiết bị FPT Play để tiếp tục xem.`,
            buttons: {
              accept: 'Đóng',
            },
          },
        });
      }
      return false;
    }
    return true;
  };
  const getStream = useCallback(
    async ({
      channelDetailData,
      dataPlaylist,
    }: {
      channelDetailData?: ChannelDetailType;
      dataPlaylist?: PlayListDetailResponseType;
    } = {}) => {
      const { pathname } = router;

      let streamData: StreamItemType = {};

      try {
        // channel
        if (pathname?.includes(ROUTE_PATH_NAMES.CHANNEL)) {
          if (channelDetailData?.auto_profile) {
            const streamRes = await getStreamData({
              channelId: router?.query?.id as string,
              autoProfile: channelDetailData?.auto_profile,
              dataChannelType: channelDetailData?.type,
            });
            if (
              streamRes?.data?.data?.require_vip_image ||
              streamRes?.data?.data?.data?.require_vip_image
            ) {
              setRequirePurchaseData({
                ...streamRes?.data,
                require_vip_plan:
                  streamRes?.data?.data?.require_vip_plan ||
                  streamRes?.data?.data?.data?.require_vip_plan,
              });
            } else {
              setDataStream(streamRes?.data?.data || {});
              streamData = streamRes?.data?.data || {};
            }
          }
        }
        // vod
        if (pathname?.includes(ROUTE_PATH_NAMES.VOD)) {
          let chapterId = '0';
          const slugs = router?.query?.slug;
          if (Array.isArray(slugs) && slugs[1]) {
            const x = slugs[1].split('-').pop();
            if (typeof x !== 'undefined' && Number(x) >= 1) {
              chapterId = String(Number(x) - 1);
            }
          }
          // const found = channelDetailData?.episodes?.find(
          //   (x) => x.id === chapterId,
          // );
          // if (found) {
          //   const streamRes = await getEpisodeDetail({
          //     vodId: channelDetailData?.id || '',
          //     episode: found,
          //   });
          //   setDataStream(streamRes?.data?.data || {});
          //   streamData = streamRes?.data?.data || {};
          // }
          const streamRes = await getEpisodeDetail({
            vodId: channelDetailData?.id || '',
            episode: {
              _id: chapterId,
              auto_profile: 'adaptive_bitrate',
            },
          });
          setDataStream(streamRes?.data?.data || {});
          streamData = streamRes?.data?.data || {};
        }
        // công chiếu
        if (pathname?.includes(ROUTE_PATH_NAMES.PREMIERE)) {
          const streamRes = await getEventStreamData({
            channel: channelDetailData,
            streamType: 'premiere',
            autoProfile: channelDetailData?.auto_profile,
          });
          setDataStream(streamRes?.data?.data || {});
          streamData = streamRes?.data?.data || {};
        }
        // event
        if (pathname?.includes(ROUTE_PATH_NAMES.EVENT)) {
          const streamRes = await getEventStreamData({
            channel: channelDetailData,
            streamType: 'event',
            autoProfile: channelDetailData?.auto_profile,
            data_type: router?.query.type as string,
          });
          if (
            streamRes?.data?.data?.require_vip_image ||
            streamRes?.data?.data?.data?.require_vip_image
          ) {
            setRequirePurchaseData({
              ...streamRes?.data,
              require_vip_plan:
                streamRes?.data?.data?.require_vip_plan ||
                streamRes?.data?.data?.data?.require_vip_plan,
            });
          } else {
            setDataStream(streamRes?.data?.data || {});
            streamData = streamRes?.data?.data || {};
          }
        }
        // playlist
        if (pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)) {
          const slugs = router?.query?.slug;

          const videos = dataPlaylist?.videos;
          const found = videos?.find((x) => x.id === slugs?.[1]);

          if (found) {
            const streamRes = await getEpisodeDetail({
              vodId: found?.id || '',
              episode: found as Episode,
            });
            setDataStream(streamRes?.data?.data || {});
            streamData = streamRes?.data?.data || {};
          } else {
            // Chỉ redirect nếu có dataPlaylist và có videos
            if (
              dataPlaylist?.videos &&
              dataPlaylist.videos.length > 0 &&
              !isRedirecting
            ) {
              const firstVideo = dataPlaylist.videos[0];
              const slugs = router?.query?.slug;
              if (slugs && slugs[0]) {
                setIsRedirecting(true);
                router.replace(`/playlist/${slugs[0]}/${firstVideo.id}`);
                return;
              }
            }

            // Nếu không có dataPlaylist hoặc không có videos, thử với channelDetailData
            if (
              channelDetailData?.episodes &&
              channelDetailData.episodes.length > 0
            ) {
              const firstVideo = channelDetailData.episodes[0];
              const streamRes = await getEpisodeDetail({
                vodId: channelDetailData._id || '',
                episode: firstVideo || {},
              });
              setDataStream(streamRes?.data?.data || {});
              streamData = streamRes?.data?.data || {};
            } else {
              // Nếu không có data nào, set error
              setNotFoundError({
                title: PAGE_NOT_FOUND_MSG,
                content: ERROR_URL_MSG,
              });
              setChannelNotFound(true);
            }
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          const { response, status } = error as AxiosError<StreamErrorType>;

          // Check preview first for both 401 and 406 cases
          if (status === 401 || status === 406) {
            const previewHandled = handlePreviewError(
              response,
              channelDetailData,
            );

            if (previewHandled) return;
          }

          if (status === 401) {
            // yêu cầu login
            if (response?.data?.trailer_url) {
              setLoginManifestUrl(response?.data?.trailer_url);
            }
            setShowLoginPlayer(true);
            setShowModalLogin(true);
            if (streamType === 'vod') {
              dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
            }
          } else if (status === 406) {
            setRequirePurchaseData(response?.data);
          }
        }
        return {};
      } finally {
        return streamData;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, streamType, getCurrentVodEpisode, handlePreviewError],
  );
  const fetchChannelDetail = useCallback(async () => {
    try {
      const { pathname } = router;
      /*@ts-ignore*/
      let channelDetail: ChannelDetailType = {};
      let dataPlaylist: PlayListDetailResponseType = {};
      // channel
      if (pathname?.includes(ROUTE_PATH_NAMES.CHANNEL)) {
        const channelRes = await getChannelDetail({
          channelId: router?.query?.id as string,
        });
        setDataChannel(channelRes?.data?.Channel || {});
        channelDetail = channelRes?.data?.Channel || {};
      }
      // vod
      if (pathname?.includes(ROUTE_PATH_NAMES.VOD)) {
        const slugs = router?.query?.slug;
        const rawId = Array.isArray(slugs) ? slugs[0] : slugs;
        const videoId = rawId?.split('-').pop();
        const channelRes = await getVodDetail({
          vodId: videoId || '',
        });
        if (channelRes?.data?.status === '1') {
          setDataChannel(
            channelRes?.data?.data as unknown as ChannelDetailType,
          );
          channelDetail = channelRes?.data
            ?.data as unknown as ChannelDetailType;
        } else {
          setNotFoundError({
            title: PAGE_NOT_FOUND_MSG,
            content: ERROR_URL_MSG,
          });
          setChannelNotFound(true);
        }
      }
      // công chiếu + event
      if (
        pathname?.includes(ROUTE_PATH_NAMES.PREMIERE) ||
        pathname?.includes(ROUTE_PATH_NAMES.EVENT)
      ) {
        const slug = (router?.query?.slug as string) || ('' as string);
        const premiereId = slug?.split('-').pop();
        if (premiereId) {
          const channelRes = await getEventDetail({
            eventId: premiereId || '',
          });
          setDataChannel(channelRes?.data?.data || {});
          channelDetail = channelRes?.data?.data || {};
        }
      }

      if (
        (channelDetail?.verimatrix === '1' ||
          channelDetail?.verimatrix === true ||
          channelDetail?.drm === '1' ||
          channelDetail?.drm === true) &&
        (streamType === 'channel' || streamType === 'event')
      ) {
        const validBrowser = isRequiredBrowser();
        if (!validBrowser) return;
      }
      // playlist
      if (pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)) {
        const slugs = router?.query?.slug;
        const rawId = Array.isArray(slugs) ? slugs[0] : slugs;
        const playlistId = rawId?.split('-').pop();

        if (!playlistId) {
          setNotFoundError({
            title: PAGE_NOT_FOUND_MSG,
            content: ERROR_URL_MSG,
          });
          setChannelNotFound(true);
          return { channelDetail, dataPlaylist };
        }

        try {
          const playlistDetail = await getPlaylistDetail(playlistId);

          if (playlistDetail?.data?.data) {
            setDataPlaylist(playlistDetail.data.data);
            dataPlaylist = playlistDetail.data.data;
          }

          const videos = dataPlaylist?.videos;
          const found = videos?.find((x) => x.id === slugs?.[1]);

          if (found) {
            const channelRes = await getPlaylistRealDetail(found.id);
            setDataChannel(channelRes?.data?.result as ChannelDetailType);
            channelDetail = channelRes?.data?.result as ChannelDetailType;
          } else if (videos && videos.length > 0) {
            // Nếu không tìm thấy video cụ thể, lấy video đầu tiên
            const firstVideo = videos[0];
            const channelRes = await getPlaylistRealDetail(firstVideo.id);
            setDataChannel(channelRes?.data?.result as ChannelDetailType);
            channelDetail = channelRes?.data?.result as ChannelDetailType;
          } else {
            setNotFoundError({
              title: PAGE_NOT_FOUND_MSG,
              content: ERROR_URL_MSG,
            });
            setChannelNotFound(true);
          }
        } catch (error) {
          console.error('Error fetching playlist detail:', error);
          setNotFoundError({
            title: PAGE_NOT_FOUND_MSG,
            content: ERROR_URL_MSG,
          });
          setChannelNotFound(true);
        }
      }
      return { channelDetail, dataPlaylist };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const { status, response } = error as AxiosError<StreamErrorType>;
        if (status === 410) {
          // kênh ko tồn tại
          setChannelNotFound(true);
          setNotFoundError({
            title: PAGE_NOT_FOUND_MSG,
            content: response?.data?.msg || ERROR_URL_MSG,
            code: '410',
          });

          if (
            dataEvent?.type === 'event' &&
            (dataEvent?.is_premier === '1' || dataEvent?.is_premier === '0') &&
            isEndedLiveCountdown
          ) {
            setIsEndedLive(true);
          }
        }
      }
    } finally {
      setFetchDetailDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const getData = async () => {
    // Reset preview handled state when starting new data fetch
    setPreviewHandled(false);

    const channelDetailResult = await fetchChannelDetail();

    // Chỉ gọi getStream nếu có data hoặc đã có lỗi, và không đang redirect
    if (
      (channelDetailResult?.channelDetail ||
        channelDetailResult?.dataPlaylist ||
        channelNotFound) &&
      !isRedirecting
    ) {
      await getStream({
        channelDetailData: channelDetailResult?.channelDetail,
        dataPlaylist: channelDetailResult?.dataPlaylist,
      });
    }
    setFetchChannelCompleted(true);
  };

  useEffect(() => {
    if (router.isReady) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Reset isRedirecting when router changes
  useEffect(() => {
    setIsRedirecting(false);
  }, [router.asPath]);

  const handleParseManifest = useCallback(async () => {
    if (playingUrl) {
      const parsedData = await parseManifest({ manifestUrl: playingUrl });

      if (parsedData?.manualParseData?.audioTracks) {
        setAudios(parsedData?.manualParseData?.audioTracks);
      }
      if (parsedData?.qualities) {
        setVideoQualities(parsedData?.qualities);
      }
    }
  }, [playingUrl]);

  useEffect(() => {
    if (playingUrl) {
      handleParseManifest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingUrl]);

  useEffect(() => {
    if (!dataEvent) return;
    if (!dataEvent?.start_time && !dataEvent?.begin_time) return;

    const startStr = dataEvent.start_time || dataEvent.begin_time;
    const start = parseInt(startStr || '', 10);
    if (!start || isNaN(start)) return;

    const now = Math.floor(Date.now() / 1000);
    const isBeforeStart = now < start;

    // 🚫 Bỏ qua countdown nếu eventtv ( sự kiện dẫn kênh )
    const skipPrepare =
      dataEvent?.is_premier === '1' ||
      (dataEvent?.is_premier === '0' && dataEvent?.type === 'eventtv');

    if (skipPrepare) {
      setIsPrepareLive(false);
      return;
    }

    setIsPrepareLive(isBeforeStart);

    if (isBeforeStart) {
      const timeout = setTimeout(() => {
        setIsPrepareLive(false);
      }, (start - now) * 1000);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataEvent?.start_time,
    dataEvent?.begin_time,
    dataEvent?.is_premier,
    dataEvent?.type,
  ]);

  useEffect(() => {
    if (!dataEvent) return;
    if (isPrepareLive === false) {
      // Re-init lại player flow sau khi chuẩn bị xong
      setDataStream({}); // <- force clear để Player component re-render lại
      getData(); // Gọi lại để fetch stream & phát lại
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrepareLive, fetchChannelCompleted]);

  useEffect(() => {
    if (dataEvent?.type !== 'event') return;
    if (!dataEvent?.end_time || isPrepareLive === true) return;

    const end = parseInt(dataEvent.end_time, 10);
    if (!end || isNaN(end)) return;

    const now = Math.floor(Date.now() / 1000);
    const hasEnded = now > end;

    setIsEndedLive(hasEnded);
  }, [dataEvent?.end_time, dataEvent?.type, isPrepareLive]);

  // Hàm kiểm tra hạ luồng khẩn cấp
  // Hàm kiểm tra hạ luồng khẩn cấp (end_time đã qua)
  const checkForceEndEvent = (endTime?: string | number): boolean => {
    const now = Math.floor(Date.now() / 1000);
    const parsedEndTime = parseInt(String(endTime), 10);

    if (!parsedEndTime || isNaN(parsedEndTime) || parsedEndTime === 0) {
      return false;
    }

    return now > parsedEndTime;
  };

  // Tự động xử lý nếu bị end sớm
  useEffect(() => {
    if (dataEvent?.type !== 'event') return;
    const endTime = dataEvent?.end_time;

    if (!endTime) return;

    const isForceEnded = checkForceEndEvent(endTime);

    if (isForceEnded) {
      setIsEndedLive(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataEvent?.end_time]);

  // --------------- Check Revision ---------------

  const isRevision = useIsRevision();

  useEffect(() => {
    if (dataEvent?.type !== 'event') return;

    if (isRevision) {
      setIsPrepareLive(false);
    }
  }, [dataEvent, isRevision]);

  // -------------------------------------------------

  // --------------- If Premier (Event) -> Seek to CurrentTime ---------------
  const [seekOffsetInSeconds, setSeekOffsetInSeconds] = useState<number>(0);

  useEffect(() => {
    if (!fetchChannelCompleted || !dataEvent) return;
    const offset = getSeekPremier(dataEvent);
    setSeekOffsetInSeconds(offset || 0);
  }, [fetchChannelCompleted, dataEvent]);

  useEffect(() => {
    if (
      isEndVideo > 0 &&
      dataEvent?.type === 'event' &&
      dataEvent?.is_premier === '1'
    ) {
      setIsEndedLive(true);
    }
  }, [isEndVideo, dataEvent?.type, dataEvent?.is_premier]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const clearErrorInterRef = () => {
    if (checkErrorInterRef.current) {
      clearInterval(checkErrorInterRef.current);
      checkErrorInterRef.current = null;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const height = (width * 9) / 16;
      setVideoHeight(height);
      video.style.height = `${height}px`;
    });

    resizeObserver.observe(video);
    return () => resizeObserver.disconnect();
  }, []);
  return (
    <PlayerPageContext.Provider
      value={{
        dataChannel,
        dataStream,
        fetchChannelCompleted,
        showLoginPlayer,
        setShowLoginPlayer,
        loginManifestUrl,
        showModalNotice,
        setShowModalNotice,
        modalNoticeContent,
        setModalNoticeContent,
        modalNoticeCloseKey,
        setModalNoticeCloseKey,
        modalNoticeSubmitKey,
        setModalNoticeSubmitKey,
        openPlayerNoticeModal,
        handleSubmitModalNotice,
        handleCloseModalNotice,
        onAfterCloseModalNotice,
        onAfterOpenModalNotice,
        isDrm,
        isHboGo,
        isQNet,
        isTDM,
        isRequiredBrowser,
        playerName,
        setPlayerName,
        streamType,
        isPlaySuccess,
        setIsPlaySuccess,
        isExpanded,
        setIsExpanded,
        videoHeight,
        setVideoHeight,
        isMetaDataLoaded,
        setIsMetaDataLoaded,
        videoDuration,
        setVideoDuration,
        videoCurrentTime,
        setVideoCurrentTime,
        bufferedTime,
        setBufferedTime,
        fromTimeshiftToLive,
        setFromTimeshiftToLive,
        isEndVideo,
        setIsEndVideo,
        setLoginManifestUrl,
        showModalLogin,
        setShowModalLogin,
        requirePurchaseData,
        setRequirePurchaseData,
        channelNotFound,
        setChannelNotFound,
        playingUrl,
        setPlayingUrl,
        audios,
        setAudios,
        videoQualities,
        setVideoQualities,
        isPrepareLive,
        setIsPrepareLive,
        isEndedLive,
        setIsEndedLive,
        fetchDetailDone,
        notFoundError,
        setNotFoundError,
        seekOffsetInSeconds,
        isVideoPaused,
        setIsVideoPaused,
        portalTarget,
        hlsErrors,
        setHlsErrors,
        hlsErrosRef,
        isPlaySuccessRef,
        previewHandled,
        setPreviewHandled,
        dataPlaylist,
        setDataPlaylist,
        currentPlaylistVideo,
        nextPlaylistVideo,
        isLastPlaylistVideo,
        isRedirecting,
        playingUrlRef,
        isBackgroundRetryRef,
        // @ts-ignore
        getStream,
        // @ts-ignore
        checkErrorInterRef,
        clearErrorInterRef,
      }}
    >
      <div className="f-container fixed top-0 left-0 -z-[10] pointer-events-none">
        <div className="grid grid-cols-[1fr_432px]">
          <video
            ref={videoRef}
            className="aspect-video w-full"
            id="layout_video"
          ></video>
          <div className="w-[432px]"></div>
        </div>
      </div>
      {children}
      <ConfirmDialog
        modalContent={modalNoticeContent}
        open={showModalNotice}
        onSubmit={handleSubmitModalNotice}
        onCancel={handleCloseModalNotice}
        bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
        onAfterClose={onAfterCloseModalNotice}
        onAfterOpen={onAfterOpenModalNotice}
      />
    </PlayerPageContext.Provider>
  );
}
