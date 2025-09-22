/* eslint-disable @typescript-eslint/ban-ts-comment */

import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { parseTimeEvent, viToEn } from '@/lib/utils/methods';
import { useMemo, useState } from 'react';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}

export default function useEvent({ slide, block }: Props) {
  const [checkLive, setCheckLive] = useState<null | boolean | string>(null);
  const [preSecond, setPreSecond] = useState<string | number>('');
  const [nextSecond, setNextSecond] = useState<string | number>('');
  const [preMin, setPreMin] = useState<string | number>('');
  const [nextMin, setNextMin] = useState<string | number>('');

  const isShowLiveLabel = useMemo(() => {
    return (
      slide?.type === 'event' ||
      slide?.type === 'eventtv' ||
      (slide?.type === 'livetv' &&
        ['dang-phat-song', 'sap-phat-song'].includes(viToEn(block?.name || '')))
    );
  }, [slide, block]);

  const checkDataLive = () => {
    try {
      if (!slide) return null;

      const currentTimestamp = Date.now() / 1000;
      const startTs = parseInt(slide?.start_time || slide?.begin_time || '');
      const endTs = parseInt(slide?.end_time || '');

      let status: null | boolean | string = null;

      if (currentTimestamp < startTs) {
        const countdowntime = startTs - currentTimestamp;

        if (countdowntime < 3600) {
          if (
            block?.block_type !== 'highlight' &&
            block?.block_type !== 'horizontal_highlight'
          ) {
            if (countdowntime < 1) {
              status = null;
            } else if (countdowntime < 60) {
              status = `Còn ${Math.round(countdowntime)} giây nữa`;
            } else {
              const min = Math.floor(countdowntime / 60);
              status = `Còn ${min} phút nữa`;
            }
          } else {
            // Làm tròn tổng số giây còn lại rồi tách phút/giây
            const total = Math.max(0, Math.round(countdowntime));
            const curMin = Math.floor(total / 60);
            const curSec = total % 60;

            const preTotal = total + 1;
            const preMinVal = Math.floor(preTotal / 60);
            const preSecVal = preTotal % 60;

            const fmt = (v: number) => (v < 10 ? `0${v}` : `${v}`);

            setNextMin(fmt(curMin));
            setNextSecond(fmt(curSec));
            setPreMin(fmt(preMinVal));
            setPreSecond(fmt(preSecVal));
            status = true;
          }
        } else {
          status = parseTimeEvent(startTs);
        }
      } else if (currentTimestamp > startTs && currentTimestamp < endTs) {
        status = null;
      } else if (slide.end_time && currentTimestamp > endTs) {
        status = 'Đã kết thúc';
      } else if (slide && !slide.end_time) {
        status = null;
      } else {
        status = null;
      }

      /* @ts-ignore */
      setCheckLive(status);
    } catch {}
  };

  return {
    isShowLiveLabel,
    checkLive,
    checkDataLive,
    preSecond,
    nextSecond,
    preMin,
    nextMin,
  };
}
