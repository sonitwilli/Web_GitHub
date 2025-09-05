'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch, useAppSelector } from '@/lib/store';
import { formatVietnamDayTimeLabelLowerCase } from '@/lib/utils/timeUtilsVN';
import { subscribeEvent } from '@/lib/api/event';
import Spinner from '../svg/Spinner';
import { BiSolidBellOff } from 'react-icons/bi';
import { IoNotifications } from 'react-icons/io5';
import { StreamErrorType } from '@/lib/api/channel';
import RequirePurchase from '../player/core/RequirePurchase';
import styles from './EventCountdownTimer.module.css';
import { AxiosError } from 'axios';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { trackingAddAlarmLog174 } from '@/lib/hooks/useTrackingEvent';

type Props = {
  startTime: number;
  eventId?: string;
  onEnd?: () => void;
  requirePurchaseData?: StreamErrorType;
};

const CountdownTimer = ({
  startTime,
  eventId,
  onEnd,
  requirePurchaseData,
}: Props) => {
  const dispatch = useAppDispatch();
  const dataEvent = useSelector((state: RootState) => state.player.dataEvent);
  const [timeLeft, setTimeLeft] = useState(
    startTime - Math.floor(Date.now() / 1000),
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);

  const { notiData } = useAppSelector((state) => state.firebase);
  const { viewportType } = useScreenSize();
  const { isExpanded, videoHeight } = usePlayerPageContext();
  const isSubscribedFromList = useMemo(() => {
    if (!notiData || !notiData[0]) return false;

    const listFavorites = notiData[0].data?.data || [];

    return (
      listFavorites.findIndex(
        (item) => String(item?.room_id) === String(eventId),
      ) >= 0
    );
  }, [notiData, eventId]);

  useEffect(() => {
    if (!isUserAction) {
      setIsSubscribed(isSubscribedFromList);
    }
  }, [isSubscribedFromList, isUserAction]);

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = startTime - now;

      if (diff <= 0) {
        setTimeLeft(0);
        onEnd?.();
      } else {
        setTimeLeft(diff);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, onEnd]);

  if (timeLeft <= 0) return null;

  const handleToggleSubscribe = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setIsUserAction(true);
      const value = isSubscribed ? 'unsub' : 'sub';

      const res = await subscribeEvent({
        id: eventId,
        type: 'event',
        value,
      });

      if (Number(res?.data?.status) === 1) {
        setIsSubscribed(!isSubscribed);
      }
      trackingAddAlarmLog174({
        Event: value === 'sub' ? 'AddAlarm' : 'RemoveAlarm',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
        }
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCountdown = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;

    const formattedMin = min < 10 ? `0${min}` : `${min}`;
    const formattedSec = sec < 10 ? `0${sec}` : `${sec}`;

    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col justify-center items-center px-2 py-1 w-[36px] h-[34px] bg-black-olive-404040 rounded-md">
          <span className="text-white text-[16px] font-medium leading-[130%] tracking-[0.02em]">
            {formattedMin}
          </span>
        </div>
        <span className="text-white text-[16px] font-medium">:</span>
        <div className="flex flex-col justify-center items-center px-2 py-1 w-[36px] h-[34px] bg-black-olive-404040 rounded-md">
          <span className="text-white text-[16px] font-medium leading-[130%] tracking-[0.02em]">
            {formattedSec}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        isExpanded
          ? ''
          : viewportType === VIEWPORT_TYPE.DESKTOP
          ? 'f-container'
          : ''
      }`}
    >
      <div
        className={`h-full ${
          isExpanded ? '' : 'xl:grid xl:grid-cols-[1fr_432px]'
        }`}
      >
        <div
          className="w-full col-span-full relative"
          style={{
            height:
              viewportType === VIEWPORT_TYPE.DESKTOP
                ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
                : '',
          }}
        >
          <div className="relative h-full w-fit mx-auto">
            {requirePurchaseData ? (
              <RequirePurchase />
            ) : (
              <img
                src={
                  dataEvent?.image?.landscape_title ||
                  '/images/default-poster-horizontal.png'
                }
                alt="background"
                className="mx-auto h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/default-poster-horizontal.png';
                }}
              />
            )}
            <div className="absolute z-1 left-[17px] bottom-[17px] tablet:bottom-8 tablet:left-8">
              <div className="flex items-center justify-between gap-2 tablet:gap-4 bg-eerie-black rounded-xl p-4 w-[320px] tablet:w-[444px]">
                <div className="flex flex-col gap-2 w-fit">
                  <p className="text-white-smoke text-[16px] font-normal leading-[130%]">
                    {timeLeft >= 3600
                      ? `Chương trình sẽ bắt đầu vào ${formatVietnamDayTimeLabelLowerCase(
                          startTime,
                        )}`
                      : 'Chương trình sẽ bắt đầu sau'}
                  </p>

                  {timeLeft < 3600 && renderCountdown()}
                </div>

                <button
                  disabled={loading}
                  onClick={handleToggleSubscribe}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full max-w-[154px] whitespace-nowrap h-[40px] cursor-pointer
              font-roboto text-[16px] font-semibold tracking-[0.02em] 
              ${
                isSubscribed
                  ? `bg-black-olive text-white-smoke ${styles.cancelButton}`
                  : `fpl-bg text-white-smoke ${styles.orderButton}`
              }`}
                >
                  <div className="w-[24px] h-[24px] flex items-center justify-center">
                    {loading ? (
                      <Spinner size={24} />
                    ) : (
                      <>
                        {!isSubscribed ? (
                          <IoNotifications className="text-[24px]" />
                        ) : (
                          <BiSolidBellOff
                            style={{ transform: 'scaleX(-1)' }}
                            className="text-[24px]"
                          />
                        )}
                      </>
                    )}
                  </div>
                  {isSubscribed ? 'Hủy đặt lịch' : 'Đặt lịch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
