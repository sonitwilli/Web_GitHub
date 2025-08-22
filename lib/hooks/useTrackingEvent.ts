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

export const trackingStopLiveShowLog172 = ({ Event }: TrackingParams) => {
  // Log172 : StopLiveShow
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '172',
      Event: Event || 'StopLiveShow',
      ...playerParams,
      ...playbackTrackingParams,
    });
  } catch {}
};

export const trackingStartFirstFrameLog178 = ({ Event }: TrackingParams) => {
  // Log178 : Initial | Retry
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const playbackTrackingParams = getPlaybackParams();
    /*@ts-ignore*/
    return tracking({
      LogId: '178',
      Event: Event || 'Initial',
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

export const useTrackingPlayback = () => {
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

      // Calculate clickToPlayTime from values in store trackingSlice
      const calculatedClickToPlayTime = Date.now() - clickToPlayTime;
      const calculatedInitPlayTime = Date.now() - initPlayerTime;

      /*@ts-ignore*/
      return tracking({
        LogId: '171',
        Event: 'StartLiveShow',
        ...playbackTrackingParams,
        ...playerParams,
        ClickToPlayTime: calculatedClickToPlayTime.toString(),
        InitPlayerTime: calculatedInitPlayTime.toString(),
      });
    } catch {}
  };

  return {
    trackingEnterDetailLiveShowLog170,
    trackingStartLiveShowLog171,
  };
};
