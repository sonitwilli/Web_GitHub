import { useEffect, useLayoutEffect } from 'react';
import { saveSessionStorage } from '../utils/storage';
import { trackingStoreKey } from '../constant/tracking';
import { removePlayerSessionStorage } from '../utils/playerTracking';
import { trackingPingLog111 } from './useTrackingPing';

export default function usePlayerPageCycle() {
  useLayoutEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_PLAYING_SESSION,
          value: new Date().toISOString(),
        },
      ],
    });
  }, []);

  useEffect(() => {
    return () => {
      console.log('--- PLAYER UNMOUNTED usePlayerPageCycle');
      trackingPingLog111();
      removePlayerSessionStorage();
    };
  }, []);
  return {};
}
