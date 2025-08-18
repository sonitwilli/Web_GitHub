import { useEffect, useLayoutEffect } from 'react';
import { saveSessionStorage } from '../utils/storage';
import { trackingStoreKey } from '../constant/tracking';
import { trackingPingLog111 } from './useTrackingPing';
import { changePageBlocks } from '../store/slices/blockSlice';
import { useAppDispatch } from '../store';

export default function usePlayerPageCycle() {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_PLAYING_SESSION,
          value: new Date().toISOString(),
        },
      ],
    });
    dispatch(changePageBlocks([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      console.log('--- PLAYER UNMOUNTED usePlayerPageCycle');
      const trackingState = sessionStorage.getItem(
        trackingStoreKey.PLAYER_TRACKING_STATE,
      );
      if (trackingState === 'start') {
        trackingPingLog111();
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.PLAYER_TRACKING_STATE,
              value: 'stop',
            },
          ],
        });
      }
    };
  }, []);
  return {};
}
