import { useEffect, useMemo, useState } from 'react';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { reaction, ReactionParamsType } from '@/lib/api/reaction';
import { useAppDispatch, useAppSelector } from '../store';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { trackingLog59 } from './useTrackingAppModule';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}

export default function useReaction({ slide, block }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const { notiData } = useAppSelector((state) => state.firebase);
  const { isLogged } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const isFavorite = useMemo(() => {
    if (!notiData || !notiData[0]) {
      return false;
    }
    const listFavorites = notiData[0].data?.data || [];
    const r =
      listFavorites?.findIndex(
        (item) =>
          item?.room_id ===
          String(
            slide?.type === 'event' || slide?.type === 'eventtv'
              ? slide?.highlight_id
              : slide?.id,
          ),
      ) >= 0;
    return r;
  }, [notiData, slide]);

  useEffect(() => {
    setIsLiked(isFavorite);
  }, [slide, notiData, isFavorite]);

  const handleReaction = async () => {
    if (!isLogged) {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      return;
    }
    if ((!slide?.id && !slide?._id) || !slide?.type) return;

    try {
      trackingLog59({
        Event: isLiked ? 'Unsubscribed' : 'Subscribed',
      });
      // if (String(slide?.is_coming_soon) === '1') {
      //   await subscribeVod({
      //     id: slide?.id || '',
      //     type: 'vod',
      //     value: isLiked ? 'unsub' : 'sub',
      //   });
      //   setIsLiked((prev) => !prev);
      // } else {
      //   const realId =
      //     slide?.type === 'event' || slide?.type === 'eventtv'
      //       ? slide?.highlight_id
      //       : slide?.id || slide?._id;
      //   const params: ReactionParamsType = {
      //     id: realId as string,
      //     type:
      //       slide?.type === 'event' || slide?.type === 'eventtv'
      //         ? 'event'
      //         : slide.type,
      //     value: isLiked ? 'dislike' : 'like',
      //   };
      //   await reaction(params);
      //   setIsLiked((prev) => !prev);
      // }
      const realId =
        slide?.type === 'event' || slide?.type === 'eventtv'
          ? slide?.highlight_id
          : slide?.id || slide?._id;
      const params: ReactionParamsType = {
        id: realId as string,
        type:
          block?.block_type === 'auto_expansion'
            ? 'vod'
            : slide?.type === 'event' || slide?.type === 'eventtv'
            ? 'event'
            : slide.type,
        value: isLiked ? 'dislike' : 'like',
      };
      await reaction(params);
      setIsLiked((prev) => !prev);
    } catch {}
  };
  return { isLiked, setIsLiked, handleReaction };
}
