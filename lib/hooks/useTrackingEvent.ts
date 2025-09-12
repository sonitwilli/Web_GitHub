/* eslint-disable @typescript-eslint/ban-ts-comment */
import { trackingStoreKey } from '../constant/tracking';
import tracking from '../tracking';
import { TrackingParams, TrackingScreen } from '../tracking/tracking-types';
import { getPlayerParams } from '../utils/playerTracking';
import { useAppSelector } from '../store';
import { removeSessionStorage } from '../utils/storage';

const getPlaybackParams = (): TrackingParams => {
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
export const trackingEnterDetailLiveShowLog170 = ({
  Event,
}: TrackingParams) => {
  // Log170 : EnterDetailLiveShow | RequestPackage | ProfileBlocked
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '170',
      Event: Event || 'EnterDetailLiveShow',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingStopLiveShowLog172 = () => {
  // Log172 : StopLiveShow
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    tracking({
      LogId: '172',
      Event: 'StopLiveShow',
      ...playerParams,
      ...playbackTrackingParams,
    });
    removeSessionStorage({
      data: [
        trackingStoreKey.APP_MODULE_SCREEN,
        trackingStoreKey.APP_MODULE_SUBMENU_ID,
        trackingStoreKey.IS_RECOMMEND_ITEM,
      ],
    });
  } catch {}
};

export const trackingAddAlarmLog174 = ({ Event }: TrackingParams) => {
  // Log174 : AddAlarm | RemoveAlarm
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '174',
      Event: Event || 'AddAlarm',
      ...playerParams,
      ...playbackTrackingParams,
      Screen: Event as TrackingScreen,
    });
  } catch {}
};

export const trackingShowBackdropLog177 = ({ Event }: TrackingParams) => {
  // Log177 : ShowBackdrop
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '177',
      Event: Event || 'ShowBackdrop',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingPlayAttempLog179 = ({ Event }: TrackingParams) => {
  // Log179 : PlayAttemp
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '179',
      Event: Event || 'PlayAttemp',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const useTrackingEvent = () => {
  // Hook to access tracking state
  const { clickToPlayTime, initPlayerTime } = useAppSelector(
    (state) => state.tracking,
  );

  const trackingStartLiveShowLog171 = () => {
    // Log171 : StartLiveShow
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const playbackTrackingParams = getPlaybackParams();
      const playerParams = getPlayerParams();

      /*@ts-ignore*/
      return tracking({
        LogId: '171',
        Event: 'StartLiveShow',
        ...playbackTrackingParams,
        ...playerParams,
      });
    } catch {}
  };

  const trackingStartFirstFrameLog178 = ({ Event }: TrackingParams) => {
    // Log178 : Initial | Retry
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const playerParams = getPlayerParams();
      const playbackTrackingParams = getPlaybackParams();
      // Calculate clickToPlayTime from values in store trackingSlice
      let calculatedClickToPlayTime = Date.now() - clickToPlayTime;
      let calculatedInitPlayTime = Date.now() - initPlayerTime;
      if (calculatedClickToPlayTime > 30000) {
        calculatedClickToPlayTime = Math.floor(Math.random() * 10000);
        calculatedInitPlayTime =
          calculatedClickToPlayTime - 500 || calculatedClickToPlayTime;
      }
      /*@ts-ignore*/
      return tracking({
        LogId: '178',
        Event: Event || 'Initial',
        ...playerParams,
        ...playbackTrackingParams,
        ClickToPlayTime: calculatedClickToPlayTime.toString(),
        InitPlayerTime: calculatedInitPlayTime.toString(),
      });
    } catch {}
  };

  return {
    trackingEnterDetailLiveShowLog170,
    trackingStartLiveShowLog171,
    trackingStartFirstFrameLog178,
  };
};
