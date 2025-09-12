import { useEffect, useLayoutEffect } from 'react';
import { saveSessionStorage } from '../utils/storage';
import { trackingStoreKey } from '../constant/tracking';
import { changePageBlocks } from '../store/slices/blockSlice';
import { useAppDispatch } from '../store';
import { changeClickToPlayTime } from '../store/slices/trackingSlice';
import { useRouter } from 'next/router';

export default function usePlayerPageCycle() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  useLayoutEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_PLAYING_SESSION,
          value: new Date().toISOString(),
        },
        {
          key: trackingStoreKey.PLAYER_CONTENT_SESSION,
          value: new Date().toISOString(),
        },
      ],
    });
    dispatch(changePageBlocks([]));
    dispatch(changeClickToPlayTime(new Date().getTime()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (!router.isReady) return;
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_IS_LANDING_PAGE,
          value: '1',
        },
      ],
    });
    console.log('--- TRACKING player page cycle', router.query);
    const {
      bookmark,
      landing_page,
      is_from_chatbot,
      block_index,
      position_index,
      from,
      id_related,
      ...restQuery
    } = router.query;
    if (
      bookmark !== undefined ||
      landing_page !== undefined ||
      is_from_chatbot !== undefined ||
      block_index ||
      position_index ||
      from ||
      id_related
    ) {
      if (landing_page) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.PLAYER_IS_LANDING_PAGE,
              value: '0',
            },
          ],
        });
      }
      if (block_index) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.BLOCK_INDEX,
              value: block_index as string,
            },
          ],
        });
      }
      if (position_index) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.POSITION_INDEX,
              value: position_index as string,
            },
          ],
        });
      }
      if (from) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.SCREEN_ITEM,
              value: from as string,
            },
          ],
        });
      }
      if (id_related) {
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.PLAYER_VOD_ID_RELATED,
              value: id_related as string,
            },
          ],
        });
      }
      router.replace(
        {
          pathname: router.pathname,
          query: restQuery,
        },
        undefined,
        { shallow: true },
      );
    }
    if (!from) {
      sessionStorage.removeItem(trackingStoreKey.SCREEN_ITEM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    return () => {
      console.log('--- PLAYER UNMOUNTED usePlayerPageCycle');
      // const trackingState = sessionStorage.getItem(
      //   trackingStoreKey.PLAYER_TRACKING_STATE,
      // );
      // if (trackingState === 'start') {
      //   trackingPingLog111({ isFinal: true });
      //   saveSessionStorage({
      //     data: [
      //       {
      //         key: trackingStoreKey.PLAYER_TRACKING_STATE,
      //         value: 'stop',
      //       },
      //     ],
      //   });
      // }
    };
  }, []);
  return {};
}
