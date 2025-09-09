/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef } from 'react';
import tracking from '../tracking';
import { getPlayerParams, trackPlayerChange } from '../utils/playerTracking';
import { ROUTE_PATH_NAMES, VIDEO_ID } from '../constant/texts';
import { saveSessionStorage } from '../utils/storage';
import { trackingStoreKey } from '../constant/tracking';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { TrackingScreen } from '../tracking/tracking-types';

const pingTime = 60000;
export const checkScreen = (previewHandled?: boolean): TrackingScreen => {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    let value = 'PingVOD';
    const href = window.location.href;
    if (previewHandled) {
      if (href?.includes(ROUTE_PATH_NAMES.CHANNEL)) {
        value = 'PingPreviewLive';
      }
      if (href?.includes(ROUTE_PATH_NAMES.VOD)) {
        value = 'PingPreview';
      }
      if (href?.includes(ROUTE_PATH_NAMES.EVENT)) {
        value = 'PingPreviewShow';
      }
    } else {
      if (href?.includes(ROUTE_PATH_NAMES.CHANNEL)) {
        value = 'PingChannel';
      }
      if (href?.includes(ROUTE_PATH_NAMES.VOD)) {
        value = 'PingVOD';
      }
      if (href?.includes(ROUTE_PATH_NAMES.PREMIERE)) {
        value = 'PingPremiere';
      }
      if (href?.includes(ROUTE_PATH_NAMES.EVENT)) {
        value = 'PingLiveshow';
      }
    }
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_SCREEN,
          value,
        },
      ],
    });
    return value as TrackingScreen;
  } catch {
    return '';
  }
};
export const trackingPingLog111 = async ({
  isFinal,
}: { isFinal?: boolean } = {}) => {
  // Log111: Ping
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      if (video.paused) {
        return;
      }
      if (video.duration === video.currentTime) {
        return;
      }
    }
    trackPlayerChange();
    const screen = checkScreen();
    const playerParams = getPlayerParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sessionPingData: any = {};

    const previousPingData = sessionStorage.getItem(
      trackingStoreKey.PLAYER_PING_DATA,
    );

    if (previousPingData) {
      sessionPingData = JSON.parse(previousPingData);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pingData: any = {
      LogId: '111',
      Event: 'Ping',
      ...playerParams,
      Screen: screen,
      BufferLength: '',
    };
    const trackingState = sessionStorage.getItem(
      trackingStoreKey.PLAYER_TRACKING_STATE,
    );
    pingData.PingState = trackingState;
    console.log('--- TRACKING trackingPingLog111', new Date().toISOString(), {
      playerParams,
      trackingState,
      pingData,
      isFinal,
      sessionPingData,
    });

    /*@ts-ignore*/
    const res = await tracking({
      LogId: '111',
      Event: 'Ping',
      ...playerParams,
      Screen: screen,
      BufferLength: '',
      ChapterID: isFinal ? sessionPingData?.ChapterID : pingData?.ChapterID,
    });

    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_PING_DATA,
          value: JSON.stringify(pingData),
        },
      ],
    });
    return res;
  } catch {}
};

export default function useTrackingPing() {
  const { previewHandled } = usePlayerPageContext();
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  // const lastPingTime = useRef(0);
  const isFirstPingDone = useRef(false);
  const handlePingPlayer = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!video || video.paused) {
      return;
    }
    if (!isFirstPingDone?.current) {
      isFirstPingDone.current = true;
      const trackingState = sessionStorage.getItem(
        trackingStoreKey.PLAYER_TRACKING_STATE,
      );
      if (trackingState !== 'start') {
        trackingPingLog111();
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.PLAYER_TRACKING_STATE,
              value: 'start',
            },
          ],
        });
      }
    }

    if (!pingInterval?.current) {
      pingInterval.current = setInterval(() => {
        // const currentTime = new Date().getTime();
        // const e = currentTime - lastPingTime.current;
        // console.log({ e, currentTime, lastPingTime: lastPingTime.current });
        // if (e >= pingTime) {
        //   if (lastPingTime.current > 0) {

        //   }
        //   lastPingTime.current = currentTime;
        // }
        trackingPingLog111();
      }, pingTime);
    }
  };

  useEffect(() => {
    return () => {
      console.log('--- PLAYER UNMOUNTED useTrackingPing');
      if (pingInterval?.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = null;
      }
    };
  }, []);
  return {
    trackingPingLog111,
    handlePingPlayer,
    checkScreen: () => checkScreen(previewHandled),
  };
}
