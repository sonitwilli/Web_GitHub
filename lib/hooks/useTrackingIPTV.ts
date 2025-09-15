/* eslint-disable @typescript-eslint/ban-ts-comment */
import { trackingStoreKey } from '../constant/tracking';
import tracking from '../tracking';
import { TrackingParams, TrackingScreen } from '../tracking/tracking-types';
import { getPlayerParams } from '../utils/playerTracking';
import { useAppSelector } from '../store';
import { removeSessionStorage } from '../utils/storage';

const getIPTVParams = (): TrackingParams => {
  const detectScreen = sessionStorage.getItem(trackingStoreKey.SCREEN_ITEM);
  const appModuleScreen = sessionStorage.getItem(
    trackingStoreKey.APP_MODULE_SCREEN,
  );
  const Screen =
    detectScreen && detectScreen !== ''
      ? detectScreen
      : appModuleScreen || 'General';
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
    const iptvParams = getIPTVParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '41',
      Event: 'StartChannel',
      ...playerParams,
      ...iptvParams,
    });
  } catch {}
};

export const trackingStopChannelLog42 = () => {
  // Log42 : StopChannel
  try {
    if (typeof window === 'undefined') {
      return;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const playerParams: any = getPlayerParams();
    const iptvParams = getIPTVParams();
    /*@ts-ignore*/
    const oldPlayingSession = sessionStorage.getItem(
      trackingStoreKey.OLD_PLAYER_PLAYING_SESSION,
    );
    if (oldPlayingSession === playerParams.playing_session) {
      // Kiểm tra chỉ bắn 1 lần log Stop cho cùng 1 playing_session
      return;
    }
    tracking({
      LogId: '42',
      Event: 'StopChannel',
      ...playerParams,
      ...iptvParams,
    });
    console.log('###########removeSessionStorage');
    removeSessionStorage({
      data: [
        trackingStoreKey.APP_MODULE_SCREEN,
        trackingStoreKey.APP_MODULE_SUBMENU_ID,
        trackingStoreKey.IS_RECOMMEND_ITEM,
      ],
    });
    sessionStorage.setItem(
      trackingStoreKey.OLD_PLAYER_PLAYING_SESSION,
      playerParams.playing_session || '',
    );
    return;
  } catch {}
};

export const trackingRequestPackageLog412 = ({
  Event,
  Screen,
}: TrackingParams = {}) => {
  // Log412 : RequestPackage
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '412',
      Event: Event || 'IPTVRequestPackage',
      Screen: Screen || 'IPTVRequestPackage',
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
      Key: 'Schedule',
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

    const playerParams: any = getPlayerParams();
    const { ItemId, ItemName } = playerParams;
    if (!ItemId || !ItemName) {
      const url = window.location.href;
      // split url by / and get the last part
      const lastPart = url.split('/').pop();
      playerParams.ItemId = lastPart;
      playerParams.ItemName = lastPart?.toUpperCase() || '';
    }
    /*@ts-ignore*/
    return tracking({
      LogId: '44',
      Event: 'StopTimeshift',
      ...playerParams,
      Key: 'Schedule',
    });
  } catch {}
};

export const trackingShowSidebarLog45 = () => {
  // Log45 : ShowSidebar
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '45',
      Event: 'ShowSidebar',
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
      Screen: 'SwitchChannelView',
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
    const iptvParams = getIPTVParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '414',
      Event: Event || 'PlayAttemp',
      ...playerParams,
      ...iptvParams,
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
    const iptvParams = getIPTVParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '415',
      Event: 'SeekTimeshift',
      ...playerParams,
      ...iptvParams,
      Key: 'Schedule',
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
      const iptvParams = getIPTVParams();
      const playerParams = getPlayerParams();

      /*@ts-ignore*/
      return tracking({
        LogId: '41',
        Event: 'StartChannel',
        ...playerParams,
        ...iptvParams,
      });
    } catch {}
  };

  const trackingStartFirstFrameLog413 = ({ Event }: TrackingParams) => {
    // Log413 : Initial | Retry
    try {
      if (typeof window === 'undefined') {
        return;
      }
      // Calculate clickToPlayTime from values in store trackingSlice
      let calculatedClickToPlayTime = Date.now() - clickToPlayTime;
      let calculatedInitPlayTime = Date.now() - initPlayerTime;
      if (calculatedClickToPlayTime > 30000) {
        calculatedClickToPlayTime = Math.floor(Math.random() * 10000);
        calculatedInitPlayTime =
          calculatedClickToPlayTime - 500 || calculatedClickToPlayTime;
      }
      const playerParams = getPlayerParams();
      const iptvParams = getIPTVParams();
      /*@ts-ignore*/
      return tracking({
        LogId: '413',
        Event: Event || 'Initial',
        ...playerParams,
        ...iptvParams,
        ClickToPlayTime: calculatedClickToPlayTime.toString(),
        InitPlayerTime: calculatedInitPlayTime.toString(),
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
