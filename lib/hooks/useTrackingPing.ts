/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef } from 'react';
import tracking from '../tracking';
import { getPlayerParams, trackPlayerChange } from '../utils/playerTracking';
import { VIDEO_ID } from '../constant/texts';

const pingTime = 60000;

export const trackingPingLog111 = async () => {
  // Log111: Ping
  try {
    if (typeof window === 'undefined') {
      return;
    }
    trackPlayerChange();
    const playerParams = getPlayerParams();
    console.log('--- TRACKING trackingPingLog111', new Date().toISOString(), {
      playerParams,
    });
    /*@ts-ignore*/
    return await tracking({
      LogId: '111',
      Event: 'Ping',
      ...playerParams,
      BufferLength: '',
    });
  } catch {}
};

export default function useTrackingPing() {
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
      trackingPingLog111();
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
  return { trackingPingLog111, handlePingPlayer };
}
