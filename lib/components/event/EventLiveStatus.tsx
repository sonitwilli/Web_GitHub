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
    return configs?.image?.bg_live || '/images/bg_live_default.png';
  }, [configs]);

  const isTimeEventBackground = useMemo(() => {
    return configs?.image?.bg_time_event || '/images/bg_time_event_default.png';
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
        setStatus(dataEvent?.label_event || 'Live');
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
        <span className="relative flex items-center justify-center rounded-md text-white px-[8px] py-[4.5px] text-sm sm:text-base font-[600] h-[22px] tablet:h-[28px] w-fit overflow-hidden">
          {/* Background image layer - chỉ phủ phần text + padding */}
          <div
            className="absolute inset-0"
            style={{
              background: `url(${isLiveBackground}) no-repeat left center / auto 100%`,
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              width: '100%',
              height: '100%',
            }}
          />
          {/* Text layer - đảm bảo text luôn ở trên */}
          <span className="relative z-1">{status}</span>
        </span>
      ) : (
        <span className="relative flex items-center justify-center px-[8px] py-[4.5px] rounded-md sm:rounded-lg h-[22px] tablet:h-[28px] w-fit overflow-hidden">
          {/* Background image layer - chỉ phủ phần text + padding */}
          <div
            className="absolute inset-0"
            style={{
              background: `url(${isTimeEventBackground}) no-repeat left center / auto 100%`,
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              width: '100%',
              height: '100%',
            }}
          />
          {/* Text layer - đảm bảo text luôn ở trên */}
          <span className="relative z-1 text-white-087 font-medium text-sm sm:text-[17px] leading-[20px]">
            {status}
          </span>
        </span>
      )}
    </div>
  );
}
