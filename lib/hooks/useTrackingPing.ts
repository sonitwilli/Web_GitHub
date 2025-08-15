/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef } from 'react';
import tracking from '../tracking';
import { getPlayerParams, trackPlayerChange } from '../utils/playerTracking';
import { VIDEO_ID } from '../constant/texts';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';

const pingTime = 60000;

export const trackingPingLog111 = async () => {
  // Log111: Ping
  try {
    if (typeof window === 'undefined') {
      return;
    }
    trackPlayerChange();
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return await tracking({
      LogId: '111',
      Event: 'Ping',
      ...playerParams,
    });
  } catch {}
};

export default function useTrackingPing() {
  const { isPlaySuccessRef } = usePlayerPageContext();
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPingTime = useRef(0);
  const isFirstPingDone = useRef(false);
  const handlePingPlayer = () => {
    if (!isPlaySuccessRef?.current) {
      return;
    }
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!video || video.paused) {
      return;
    }
    if (!isFirstPingDone?.current) {
      isFirstPingDone.current = true;
      trackingPingLog111();
    }

    const currentTime = new Date().getTime();
    const e = currentTime - lastPingTime.current;
    if (e >= pingTime) {
      if (lastPingTime.current > 0) {
        trackingPingLog111();
      }
      lastPingTime.current = currentTime;
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
