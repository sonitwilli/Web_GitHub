/* eslint-disable @typescript-eslint/ban-ts-comment */
import { trackingStoreKey } from '../constant/tracking';
import { IS_NEXT_FROM_PLAYER } from '../constant/texts';
import tracking from '../tracking';
import { TrackingParams, TrackingScreen } from '../tracking/tracking-types';
import { getPlayerParams } from '../utils/playerTracking';
import { useAppSelector } from '../store';

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
export const trackingEnterIPTVLog40 = () => {
  // Log40 : EnterIPTV
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '40',
      Event: 'EnterIPTV',
      ...playerParams,
    });
  } catch {}
};

export const trackingStartChannelLog41 = () => {
  // Log41 : StartChannel
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '41',
      Event: 'StartChannel',
      ...playerParams,
    });
  } catch {}
};

export const trackingStopChannelLog42 = () => {
  // Log42 : StopChannel
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '42',
      Event: 'StopChannel',
      ...playerParams,
    });
  } catch {}
};

export const trackingRequestPackageLog412 = () => {
  // Log43 : RequestPackage
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '412',
      Event: 'RequestPackage',
      ...playerParams,
    });
  } catch {}
};

export const trackingStartTimeshiftLog43 = () => {
  // Log43 : StartTimeshift
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '43',
      Event: 'StartTimeshift',
      ...playerParams,
    });
  } catch {}
};
export const trackingPauseTimeshiftLog431 = () => {
  // Log431 : PauseTimeshift
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '431',
      Event: 'PauseTimeshift',
      ...playerParams,
    });
  } catch {}
};
export const trackingResumeTimeshiftLog432 = () => {
  // Log432 : ResumeTimeshift
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '432',
      Event: 'ResumeTimeshift',
      ...playerParams,
    });
  } catch {}
};

export const trackingStopTimeshiftLog44 = () => {
  // Log44 : StopTimeshift
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '44',
      Event: 'StopTimeshift',
      ...playerParams,
    });
  } catch {}
};

export const trackingShowScheduleLog46 = () => {
  // Log46 : ShowSchedule
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '46',
      Event: 'ShowSchedule',
      ...playerParams,
    });
  } catch {}
};

export const trackingExitScheduleLog461 = () => {
  // Log461 : ExitSchedule
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '461',
      Event: 'ExitSchedule',
      ...playerParams,
    });
  } catch {}
};
export const trackingPlayAttempLog414 = ({ Event }: TrackingParams) => {
  // Log414 : PlayAttemp
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '414',
      Event: Event || 'PlayAttemp',
      ...playerParams,
    });
  } catch {}
};

export const trackingSeekTimeshiftLog415 = () => {
  // Log415 : SeekTimeshift
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '415',
      Event: 'SeekTimeshift',
      ...playerParams,
    });
  } catch {}
};
export const useTrackingIPTV = () => {
  // Hook to access tracking state
  const { clickToPlayTime, initPlayerTime } = useAppSelector(
    (state) => state.tracking,
  );

  const trackingStartChannelLog41 = () => {
    // Log41 : StartChannel
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const playbackTrackingParams = getPlaybackParams();
      const playerParams = getPlayerParams();

      // Calculate clickToPlayTime from values in store trackingSlice
      const calculatedClickToPlayTime = Date.now() - clickToPlayTime;
      const calculatedInitPlayTime = Date.now() - initPlayerTime;

      /*@ts-ignore*/
      return tracking({
        LogId: '41',
        Event: 'StartChannel',
        ...playbackTrackingParams,
        ...playerParams,
        ClickToPlayTime: calculatedClickToPlayTime.toString(),
        InitPlayerTime: calculatedInitPlayTime.toString(),
      });
    } catch {}
  };

  const trackingStartFirstFrameLog413 = ({ Event }: TrackingParams) => {
    // Log413 : Initial | Retry
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const playerParams = getPlayerParams();
      /*@ts-ignore*/
      return tracking({
        LogId: '413',
        Event: Event || 'Initial',
        ...playerParams,
      });
    } catch {}
  };

  return {
    trackingEnterIPTVLog40,
    trackingStartChannelLog41,
    trackingStopChannelLog42,
    trackingRequestPackageLog412,
    trackingStartFirstFrameLog413,
  };
};
