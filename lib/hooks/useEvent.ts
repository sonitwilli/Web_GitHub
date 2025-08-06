/* eslint-disable @typescript-eslint/ban-ts-comment */

import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { parseTimeEvent, viToEn } from '@/lib/utils/methods';
import { useMemo, useState } from 'react';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}

export default function useEvent({ slide, block }: Props) {
  const [checkLive, setCheckLive] = useState(null);
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
      if (!slide) {
        return null;
      }
      const currentTime = new Date();
      const currentTimestamp = currentTime.getTime() / 1000;
      let status = null;
      if (
        currentTimestamp <
        parseInt(slide?.start_time || slide?.begin_time || '')
      ) {
        const countdowntime =
          parseInt(slide?.start_time || slide?.begin_time || '') -
          currentTimestamp;

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
            const second = countdowntime % 60;
            const min = Math.floor(countdowntime / 60);
            if (countdowntime < 1) {
              status = null;
            } else {
              const preSecond =
                Math.round(second) + 1 < 10
                  ? '0' + (Math.round(second) + 1)
                  : Math.round(second) + 1;
              const nextSecond =
                Math.round(second) < 10
                  ? '0' + Math.round(second)
                  : Math.round(second);
              const preMin = min + 1 < 10 ? '0' + (min + 1) : min + 1;
              const nextMin = min < 10 ? '0' + min : min;
              setPreSecond(preSecond);
              setNextSecond(nextSecond);
              setPreMin(preMin);
              setNextMin(nextMin);
              status = true;
            }
          }
        } else {
          status = parseTimeEvent(
            parseInt(slide?.start_time || slide?.begin_time || ''),
          );
        }
      } else if (
        currentTimestamp >
          parseInt(slide?.start_time || slide?.begin_time || '') &&
        currentTimestamp < parseInt(slide.end_time || '')
      ) {
        status = null;
      } else if (
        slide.end_time &&
        currentTimestamp > parseInt(slide.end_time)
      ) {
        status = 'Đã kết thúc';
      } else if (slide && !slide.end_time) {
        status = null;
      } else {
        status = null;
      }
      /*@ts-ignore*/
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
