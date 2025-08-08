import { useLayoutEffect } from 'react';
import { saveSessionStorage } from '../utils/storage';
import { trackingStoreKey } from '../constant/tracking';

export default function useStorage() {
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
}
