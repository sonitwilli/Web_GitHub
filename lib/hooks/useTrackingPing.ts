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
    /*@ts-ignore*/
    return await tracking({
      LogId: '111',
      Event: 'Ping',
      ...playerParams,
    });
  } catch {}
};

export default function useTrackingPing() {
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  const handlePingPlayer = () => {
    if (!pingInterval?.current) {
      trackingPingLog111();
      pingInterval.current = setInterval(() => {
        const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
        if (video && !video.paused) {
          trackingPingLog111();
        }
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
