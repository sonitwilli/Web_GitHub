import { useEffect, useState, useContext, useMemo } from 'react';
import { formatVietnamDayTimeLabel } from '@/lib/utils/timeUtilsVN';
import { useDispatch } from 'react-redux';
import { setIsEndedLiveCountdown } from '@/lib/store/slices/playerSlice';
import { AppContext } from '@/lib/components/container/AppContainer';

type DataEvent = {
  start_time?: number | string;
  begin_time?: number | string;
  end_time?: number | string;
  label_event?: string;
  type?: string;
};

type EventStatus = 'scheduled' | 'live' | 'ended' | null;

type Props = {
  dataEvent?: DataEvent;
};

export default function EventLiveStatus({ dataEvent }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState<EventStatus>(null);
  const dispatch = useDispatch();
  const { configs } = useContext(AppContext);

  // Background images from configs
  const isLiveBackground = useMemo(() => {
    return configs?.image?.bg_live;
  }, [configs]);

  const isTimeEventBackground = useMemo(() => {
    return configs?.image?.bg_time_event;
  }, [configs]);

  // Kiểm tra trạng thái kết thúc và cập nhật Redux một lần
  useEffect(() => {
    const parseTime = (val?: number | string): number =>
      typeof val === 'string' ? parseInt(val, 10) : val ?? 0;
    const getEndTime = (): number => parseTime(dataEvent?.end_time);

    if (dataEvent?.type !== 'event' || !dataEvent?.end_time) {
      dispatch(setIsEndedLiveCountdown(false));
      return;
    }

    const end = getEndTime();
    if (!end || isNaN(end)) {
      dispatch(setIsEndedLiveCountdown(false));
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const hasEnded = now > end;
    dispatch(setIsEndedLiveCountdown(hasEnded));
  }, [dataEvent, dispatch]);

  useEffect(() => {
    const parseTime = (val?: number | string): number =>
      typeof val === 'string' ? parseInt(val, 10) : val ?? 0;
    const getStartTime = (): number =>
      parseTime(dataEvent?.start_time) || parseTime(dataEvent?.begin_time);

    const getEndTime = (): number => parseTime(dataEvent?.end_time);

    const updateStatus = () => {
      const now = Math.floor(Date.now() / 1000);
      const start = getStartTime();
      const end = getEndTime();

      if (!start || !end) {
        setStatus(null);
        setEventStatus(null);
        return;
      }

      if (now < start) {
        const countdown = start - now;

        if (countdown < 1) {
          setStatus(null);
          setEventStatus(null);
        } else if (countdown < 60) {
          setStatus(`Còn ${countdown} giây nữa`);
          setEventStatus(null); // Không hiển thị "Phát sóng vào" khi còn ít hơn 1 phút
        } else if (countdown < 3600) {
          setStatus(`Còn ${Math.floor(countdown / 60)} phút nữa`);
          setEventStatus(null); // Không hiển thị "Phát sóng vào" khi còn ít hơn 1 giờ
        } else {
          setStatus(formatVietnamDayTimeLabel(start));
          setEventStatus('scheduled'); // Chỉ hiển thị "Phát sóng vào" khi còn hơn 1 giờ
        }
      } else if (now >= start && now <= end) {
        setStatus(dataEvent?.label_event || 'LIVE');
        setEventStatus('live');
      } else if (now > end) {
        setStatus('Đã kết thúc');
        setEventStatus('ended');
        dispatch(setIsEndedLiveCountdown(now > end));
      } else {
        setStatus(null);
        setEventStatus(null);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [dataEvent, dispatch]);

  if (!status) return null;

  const isLive = eventStatus === 'live';
  const isSchedule = eventStatus === 'scheduled';

  return (
    <div className="flex items-center gap-2 min-h-8 sm:gap-3">
      {isSchedule && (
        <span className="text-white font-medium text-base sm:text-[20px] leading-snug">
          Phát sóng vào
        </span>
      )}

      {isLive ? (
        <span
          className="flex items-center justify-center px-2 sm:px-3 py-1 sm:py-[6px] rounded-md sm:rounded-lg bg-gradient-to-r from-vivid-red to-rosso-corsa text-white text-sm sm:text-base font-medium tracking-wide min-w-[51px] h-8 sm:h-[32px]"
          style={{
            backgroundImage: isLiveBackground
              ? `url(${isLiveBackground})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {status}
        </span>
      ) : (
        <span
          className="flex items-center justify-center px-2.5 py-1 bg-jet rounded-md sm:rounded-lg"
          style={{
            backgroundImage: isTimeEventBackground
              ? `url(${isTimeEventBackground})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <span className="text-white-087 font-medium text-sm sm:text-[17px] leading-[20px]">
            {status}
          </span>
        </span>
      )}
    </div>
  );
}
