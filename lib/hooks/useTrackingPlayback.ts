/* eslint-disable @typescript-eslint/ban-ts-comment */
import { trackingStoreKey } from '../constant/tracking';
import { IS_NEXT_FROM_PLAYER } from '../constant/texts';
import tracking from '../tracking';
import {
  TrackingEvent,
  TrackingParams,
  TrackingScreen,
} from '../tracking/tracking-types';
import { getContentData, getPlayerParams } from '../utils/playerTracking';
import { useAppSelector } from '../store';
import { getSeekEvent } from '../utils/seekTracking';

const getPlaybackParams = (): TrackingParams => {
  const detectScreen = sessionStorage?.getItem(IS_NEXT_FROM_PLAYER)
    ? 'Related'
    : sessionStorage.getItem(trackingStoreKey.SCREEN_ITEM);
  const appModuleScreen = sessionStorage.getItem(
    trackingStoreKey.APP_MODULE_SCREEN,
  );
  const Screen =
    detectScreen && detectScreen !== '' ? detectScreen : appModuleScreen;
  return { Screen: Screen as TrackingScreen };
};
export const trackingStartMovieLog51 = () => {
  // Log51 : StartMovie | StartTrailer
  try {
    if (typeof window === 'undefined') {
      return;
    }
    let Event: TrackingEvent = 'StartMovie';
    const playerParams = getPlayerParams();
    const {
      dataStream,
      dataChannel,
      requirePurchaseData,
      dataWatching,
      currentEpisode,
    } = getContentData();
    const isTrailer = dataStream?.is_trailer;
    if (isTrailer) {
      Event = 'StartTrailer';
    }
    console.log('--- TRACKING trackingStartMovieLog51', {
      Event,
      playerParams,
      dataChannel,
      dataStream,
      requirePurchaseData,
      dataWatching,
      currentEpisode,
    });
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '51',
      Event: Event || 'StartMovie',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingPlayAttempLog521 = ({ Event }: TrackingParams) => {
  // Log521 : PlayAttemp
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const { Screen } = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '521',
      Event: Event || 'PlayAttemp',
      ...playerParams,
      Screen,
    });
  } catch {}
};

export const trackingStopMovieLog52 = () => {
  // Log52 : StopMovie | StopTrailer
  try {
    if (typeof window === 'undefined') {
      return;
    }
    let Event: TrackingEvent = 'StopMovie';
    const playerParams = getPlayerParams();
    const { dataStream } = getContentData();
    const isTrailer = dataStream?.is_trailer;
    if (isTrailer) {
      Event = 'StopTrailer';
    }
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '52',
      Event: Event || 'StopMovie',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingPauseMovieLog53 = () => {
  // Log53 : PauseMovie | PauseTrailer
  try {
    if (typeof window === 'undefined') {
      return;
    }
    let Event: TrackingEvent = 'PauseMovie';
    const playerParams = getPlayerParams();
    const { dataStream } = getContentData();
    const isTrailer = dataStream?.is_trailer;
    if (isTrailer) {
      Event = 'PauseTrailer';
    }
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '53',
      Event: Event || 'PauseMovie',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingResumeMovieLog54 = () => {
  // Log54 : ResumeMovie | ResumeTrailer
  try {
    if (typeof window === 'undefined') {
      return;
    }
    let Event: TrackingEvent = 'ResumeMovie';
    const { dataStream } = getContentData();
    const playerParams = getPlayerParams();
    const { Screen } = getPlaybackParams();
    const isTrailer = dataStream?.is_trailer;
    if (isTrailer) {
      Event = 'ResumeTrailer';
    }
    /*@ts-ignore*/
    return tracking({
      LogId: '54',
      Event: Event || 'ResumeMovie',
      ...playerParams,
      Screen,
    });
  } catch {}
};

export const trackingNextMovieLog55 = () => {
  // Log55 : NextMovie | NextTrailer
  try {
    if (typeof window === 'undefined') {
      return;
    }
    let Event: TrackingEvent = 'NextMovie';
    const { dataStream } = getContentData();
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    const isTrailer = dataStream?.is_trailer;
    if (isTrailer) {
      Event = 'NextTrailer';
    }
    /*@ts-ignore*/
    return tracking({
      LogId: '55',
      Event: Event || 'NextMovie',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingSeekVideoLog514 = () => {
  // Log514 : SeekVideo
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    // Determine the appropriate event name based on direction
    let Event: TrackingEvent = 'Seek';
    const seekEvent = getSeekEvent();
    if (seekEvent?.direction === 'forward') {
      Event = 'SkipForward';
    } else if (seekEvent?.direction === 'backward') {
      Event = 'SkipBack';
    }
    const RealTimePlaying = seekEvent?.timestamp
      ? new Date().getTime() - seekEvent?.timestamp
      : 0;
    /*@ts-ignore*/
    return tracking({
      LogId: '514',
      Event: Event || 'Seek',
      ...playerParams,
      ...playbackTrackingParams,
      RealTimePlaying: RealTimePlaying.toString() || '0',
    });
  } catch {}
};

export const trackingPlaybackErrorLog515 = ({
  Event,
  Screen,
  ErrCode,
  ErrMessage,
  ErrUrl,
  ErrHeader,
}: TrackingParams) => {
  // Log515 : PlaybackError | RetryPlayer
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();

    /*@ts-ignore*/
    return tracking({
      LogId: '515',
      Event: Event || 'PlaybackError',
      ...playerParams,
      ...playbackTrackingParams,
      Screen,
      ErrCode,
      ErrMessage:
        ErrMessage ||
        'Kết nối tới dịch vụ tạm thời đang có lỗi hoặc gián đoạn. Bạn có thể thử lại sau hoặc chọn một nội dung khác.',
      ErrUrl,
      ErrHeader,
    });
  } catch {}
};

export const trackingChangeSubAudioLog518 = ({
  Event,
  ItemName,
}: TrackingParams) => {
  // Log518 : ChangeSubtitles | ChangeAudio
  try {
    if (typeof window === 'undefined' || !Event) {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();

    /*@ts-ignore*/
    return tracking({
      LogId: '518',
      Event: Event,
      ...playerParams,
      ...playbackTrackingParams,
      ItemName,
    });
  } catch {}
};
export const trackingChangeVideoQualityLog416 = ({
  ItemName,
}: TrackingParams) => {
  // Log416 : ChangeVideoQuality
  try {
    if (typeof window === 'undefined' || !Event) {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();

    /*@ts-ignore*/
    return tracking({
      LogId: '416',
      Event: 'ChangeVideoQuality',
      ...playerParams,
      ...playbackTrackingParams,
      ItemName,
    });
  } catch {}
};

export const trackingShareCommentLikeLog516 = ({ Event }: TrackingParams) => {
  // Log516 : TrackingShare | TrackingComment | TrackingLike
  try {
    if (typeof window === 'undefined' || !Event) {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();

    /*@ts-ignore*/
    return tracking({
      LogId: '516',
      Event: Event,
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingLogChangeResolutionLog113 = ({
  Resolution,
  isManual,
}: TrackingParams) => {
  // Log113 : ChangeResolution
  try {
    if (typeof window === 'undefined' || !Event) {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();

    /*@ts-ignore*/
    return tracking({
      LogId: '113',
      Event: 'ChangeResolution',
      ...playerParams,
      ...playbackTrackingParams,
      Resolution,
      isManual,
    });
  } catch {}
};

export const useTrackingPlayback = () => {
  // Hook to access tracking state
  const { clickToPlayTime, initPlayerTime, getDRMKeyTime } = useAppSelector(
    (state) => state.tracking,
  );

  const trackingStartFirstFrameLog520 = ({ Event }: TrackingParams) => {
    // Log520 : StartFirstFrame
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const playbackTrackingParams = getPlaybackParams();
      const playerParams = getPlayerParams();
      const {
        dataChannel,
        dataStream,
        requirePurchaseData,
        dataWatching,
        currentEpisode,
      } = getContentData();
      console.log('--- TRACKING trackingStartMovieLog51', {
        dataChannel,
        dataStream,
        requirePurchaseData,
        dataWatching,
        currentEpisode,
      });

      // Calculate clickToPlayTime from values in store trackingSlice
      const calculatedClickToPlayTime = Date.now() - clickToPlayTime;
      const calculatedInitPlayTime = Date.now() - initPlayerTime;
      console.log('--- TRACKING clickToPlayTime calculation', {
        clickToPlayTime,
        initPlayerTime,
        calculatedClickToPlayTime,
        calculatedInitPlayTime,
      });

      /*@ts-ignore*/
      return tracking({
        LogId: '520',
        Event: Event || 'Initial',
        ...playbackTrackingParams,
        ...playerParams,
        ClickToPlayTime: calculatedClickToPlayTime.toString(),
        InitPlayerTime: calculatedInitPlayTime.toString(),
      });
    } catch {}
  };

  const trackingGetDRMKeyLog166 = ({
    Status,
    ErrCode,
    ErrMessage,
  }: TrackingParams) => {
    // Log166: GetDRMKeySuccessfully | GetDRMKeyFailed
    try {
      if (typeof window === 'undefined' || !Event) {
        return;
      }
      const playerParams = getPlayerParams();
      const playbackTrackingParams = getPlaybackParams();
      const calculatedGetDRMKeyTime = Date.now() - getDRMKeyTime;
      /*@ts-ignore*/
      return tracking({
        LogId: '166',
        Event: Status === '1' ? 'GetDRMKeySuccessfully' : 'GetDRMKeyFailed',
        ...playerParams,
        ...playbackTrackingParams,
        Status,
        ErrCode,
        ErrMessage,
        RealTimePlaying: calculatedGetDRMKeyTime.toString(),
      });
    } catch {}
  };

  return {
    trackingStartMovieLog51,
    trackingStartFirstFrameLog520,
    trackingPlayAttempLog521,
    trackingStopMovieLog52,
    trackingPauseMovieLog53,
    trackingResumeMovieLog54,
    trackingNextMovieLog55,
    trackingSeekVideoLog514,
    trackingPlaybackErrorLog515,
    trackingChangeSubAudioLog518,
    trackingChangeVideoQualityLog416,
    trackingShareCommentLikeLog516,
    trackingGetDRMKeyLog166,
  };
};
