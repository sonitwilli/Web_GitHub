import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { FC } from 'react';
import { ChannelDetailType, ScheduleItem } from '@/lib/api/channel';
import { PiClockCounterClockwiseBold } from 'react-icons/pi';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import styles from './BroadcastSchedule.module.css';

import {
  getVietnamTime,
  formatVietnamDateKey,
  formatVietnamTimeHHMM,
  formatVietnamDayMonth,
  formatVietnamFullDay,
} from '@/lib/utils/timeUtilsVN';
import { useOutsideClick } from '@/lib/hooks/useOutsideClick';
import { IoIosClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { setBroadcastFullscreen } from '@/lib/store/slices/broadcastSlice';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import useScreenSize from '@/lib/hooks/useScreenSize';

type Props = {
  scheduleList: ScheduleItem[];
  currentTime: number;
  selectedDate: string;
  stateErrorBroadcastSchedule: string;
  onDateChange: (date: string) => void;
  dataChannel: ChannelDetailType;
  isFullscreen?: boolean;
  onTimeShiftSelect?: (scheduleId: string) => void;
  activeScheduleId?: string;
  onClose?: () => void;
  visible?: boolean;
};

const BroadcastSchedule: FC<Props> = ({
  scheduleList,
  currentTime,
  selectedDate,
  stateErrorBroadcastSchedule,
  onDateChange,
  dataChannel,
  onTimeShiftSelect,
  activeScheduleId,
  isFullscreen,
  onClose,
  visible,
}) => {
  const {
    setFromTimeshiftToLive,
    streamType,
    isEndVideo,
    setShowLoginPlayer,
    showLoginPlayer,
  } = usePlayerPageContext();
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(getVietnamTime());
  const targetItemRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getVietnamTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = useMemo(
    () => formatVietnamDateKey(currentDate),
    [currentDate],
  );
  const yesterdayKey = useMemo(
    () => formatVietnamDateKey(new Date(currentDate.getTime() - 86400000)),
    [currentDate],
  );
  const tomorrowKey = useMemo(
    () => formatVietnamDateKey(new Date(currentDate.getTime() + 86400000)),
    [currentDate],
  );
  const labelForDate = useCallback(
    (date: string) => {
      if (date === yesterdayKey)
        return `Hôm qua, ${formatVietnamDayMonth(date).replaceAll('-', '/')}`;
      if (date === todayKey)
        return `Hôm nay, ${formatVietnamDayMonth(date).replaceAll('-', '/')}`;
      if (date === tomorrowKey)
        return `Ngày mai, ${formatVietnamDayMonth(date).replaceAll('-', '/')}`;
      return formatVietnamFullDay(date);
    },
    [yesterdayKey, todayKey, tomorrowKey],
  );
  const surroundingDates = useMemo(() => {
    const result: string[] = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      result.push(formatVietnamDateKey(date));
    }
    return result;
  }, [currentDate]);

  const nowTime = currentTime * 1000;
  // Use timeshift_limit from dataChannel to determine replay window
  // Default to 24 hours if timeshift_limit is not available
  const timeshiftLimitHours = dataChannel?.timeshift_limit || 24;
  const replayWindowStart = nowTime - timeshiftLimitHours * 60 * 60 * 1000;

  const renderSchedule = () => {
    targetItemRef.current = null;

    if (!scheduleList?.length) {
      return (
        <div className="text-platinum text-sm tablet:text-base pt-[116px] text-center">
          Lịch phát sóng đang được cập nhật
        </div>
      );
    }

    return scheduleList.map((item) => {
      const start = Number(item.start_time) * 1000;
      const end = Number(item.end_time) * 1000;
      const isLive = nowTime >= start && nowTime < end;
      const isPast = nowTime >= end;

      const isReplayable = isPast && end >= replayWindowStart;
      const isTimeshiftDisabled = dataChannel?.timeshift === 0;

      const isClickable =
        (isLive || isReplayable) &&
        !(isPast && isReplayable && isTimeshiftDisabled);

      const isActive = item.id === activeScheduleId;
      const isSelectedLive = isLive && !activeScheduleId;
      const showBg = isActive || isSelectedLive;
      const showLiveIcon = isActive || isSelectedLive;
      const progress = ((nowTime - start) / (end - start)) * 100;

      const baseClass = `flex items-center p-4 gap-6 w-full ${
        isClickable
          ? 'cursor-pointer'
          : 'cursor-default opacity-50 pointer-events-none'
      } ${showBg ? 'bg-charleston-green' : 'bg-eerie-black'} ${
        isPast && isClickable ? 'hover:bg-charleston-green' : ''
      }`;

      return (
        <div
          key={item.id}
          ref={(el) => {
            if ((isActive || isSelectedLive) && el) {
              targetItemRef.current = el;
            }
          }}
          className={baseClass}
          onClick={() => {
            if (
              setFromTimeshiftToLive &&
              isLive &&
              streamType === 'timeshift'
            ) {
              if (showLoginPlayer) {
                if (setShowLoginPlayer) {
                  setShowLoginPlayer(false);
                }
              }
              if (!window.hlsPlayer && !window.shakaPlayer) {
              } else {
                setFromTimeshiftToLive(new Date().getTime());
              }
            }
            if (!isClickable || !item.id) return;
            if (isLive && !isActive) {
              onTimeShiftSelect?.('');
              return;
            }
            if (!isActive) onTimeShiftSelect?.(item.id);
          }}
        >
          {isLive ? (
            <>
              <div className="pr-1 flex items-center justify-center">
                <div className="h-[20.86px] w-[44px] bg-[url('/images/svg/live_icon.svg')] bg-no-repeat" />
              </div>
              <div className="flex flex-col gap-4 w-full h-[68px] tablet:h-[87px]">
                <div className="flex items-center gap-6">
                  <p className="text-white-smoke text-sm tablet:text-base line-clamp-1 flex-1">
                    {item.title}
                  </p>
                  {showLiveIcon && (
                    <Image
                      src="/images/active_channel.gif"
                      alt="Live"
                      width={24}
                      height={24}
                      unoptimized
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[3px] bg-white/25 rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-[3px] bg-white/90"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm tablet:text-base text-platium">
                    <span>{formatVietnamTimeHHMM(start)}</span>
                    <span>{formatVietnamTimeHHMM(end)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <span
                className={`text-sm tablet:text-base w-[48px] ${
                  showBg || isPast ? 'text-white-smoke' : 'text-spanish-gray'
                }`}
              >
                {formatVietnamTimeHHMM(start)}
              </span>
              <span
                className={`flex-1 text-sm tablet:text-base line-clamp-2 ${
                  showBg || isPast ? 'text-white-smoke' : 'text-spanish-gray'
                }`}
              >
                {item.title}
              </span>
              {showLiveIcon ? (
                <Image
                  src="/images/active_channel.gif"
                  alt="Live"
                  width={24}
                  height={24}
                  unoptimized
                  className="object-contain"
                />
              ) : !showLiveIcon && isPast && isReplayable && isClickable ? (
                <PiClockCounterClockwiseBold
                  size={24}
                  className="text-spanish-gray"
                />
              ) : (
                <div className="w-[24px] h-[24px] mr-[4px]" />
              )}
            </>
          )}
        </div>
      );
    });
  };

  useOutsideClick(dropdownRef, () => setDropdownOpen(false));

  useEffect(() => {
    const container = containerRef.current;
    if (
      !scheduleList.length ||
      !container ||
      selectedDate !== todayKey ||
      (!visible && !isFullscreen)
    )
      return;
    if (!targetItemRef.current) return;

    const raf = requestAnimationFrame(() => {
      const element = targetItemRef.current!;

      let offset = 0;

      offset =
        element?.offsetTop -
        container?.clientHeight / (isFullscreen ? 2.4 : 1.3) +
        element?.clientHeight / 2;

      if (container?.clientHeight <= 500 && isFullscreen) {
        offset = offset - element?.clientHeight;
      }
      container?.scrollTo({ top: offset, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(raf);
  }, [
    scheduleList,
    currentTime,
    isFullscreen,
    selectedDate,
    todayKey,
    visible,
  ]);

  useEffect(() => {
    // console.log('isEndVideo :>> ', isEndVideo);
  }, [isEndVideo]);

  const { width } = useScreenSize();

  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  return (
    <>
      {isFullscreen && (
        <div
          className={`${styles.bgMaskFullscreen}  w-[calc(100vw-350px)] tablet:w-[calc(100vw-520px)] h-full absolute z-2 top-0 left-0`}
        />
      )}
      <div
        className={`w-full h-full bg-eerie-black ${
          isFullscreen
            ? 'w-[350px]! tablet:w-[520px]! absolute z-2 top-0 right-0 '
            : ''
        }`}
      >
        {isFullscreen && (
          <div className="flex justify-between items-center px-4 py-3 bg-eerie-black">
            <h2 className="text-white text-base font-semibold">
              Lịch phát sóng
            </h2>
            <IoIosClose
              onClick={() => {
                if (onClose) onClose();
                else dispatch(setBroadcastFullscreen(false));
              }}
              size={24}
              className="text-white cursor-pointer"
            />
          </div>
        )}
        <div className="w-full h-full flex flex-col">
          {/* Header with channel name and dropdown */}
          <div className="flex justify-between items-center p-4 bg-eerie-black gap-4 tablet:gap-6">
            <h2 className="text-white text-base tablet:text-lg font-semibold line-clamp-2 overflow-hidden text-ellipsis">
              {dataChannel?.name}
            </h2>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className={`flex items-center justify-between gap-2 px-[8px] py-[8px] tablet:px-[8px] tablet:py-[9px] xl:px-4 xl:py-3 rounded-[10px] bg-charleston-green! w-[167px] tablet:w-[190px] xl:w-[218px] cursor-pointer text-white-smoke text-sm tablet:text-base`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-[16px] h-[16px] tablet:w-[20px] tablet:h-[20px] flex items-center justify-center">
                    <Image
                      src="/images/svg/event.svg"
                      alt="event"
                      width={isMobile ? 12.81 : 16.01}
                      height={isMobile ? 14.4 : 18}
                      unoptimized
                      className="object-contain vertical-align-middle"
                    />
                  </div>
                  <span className="whitespace-nowrap text-white-smoke leading-[130%] font-regular">
                    {labelForDate(selectedDate)}
                  </span>
                </div>
                <MdOutlineKeyboardArrowDown
                  size={isMobile ? 16 : 20}
                  className={`transition-transform duration-300 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-[219px] tablet:w-[258px] rounded-[8px] bg-charleston-green shadow-lg z-10 pt-1 pb-1 tablet:pt-3 tablet:pb-3 overflow-hidden ${styles.dropdownContainer}`}
                >
                  {surroundingDates.map((date) => {
                    const isSelected = date === selectedDate;
                    return (
                      <div
                        key={date}
                        onClick={() => {
                          onDateChange(date);
                          setDropdownOpen(false);
                        }}
                        className={`flex justify-between items-center px-3 tablet:px-4 py-2 h-[34px] tablet:h-[45px] cursor-pointer text-sm tablet:text-base ${
                          isSelected
                            ? 'bg-black-olive text-white'
                            : 'text-white-smoke'
                        } hover:bg-black-olive`}
                      >
                        <span>{labelForDate(date)}</span>
                        {isSelected && (
                          <FaCheck className="ml-2 text-white text-xs" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main content area */}
          <div
            ref={containerRef}
            className={`flex-1 overflow-y-auto ${styles.scrollBar}`}
          >
            {stateErrorBroadcastSchedule === 'error-api' ? (
              <div className="text-sm tablet:text-base w-full bg-transparent flex justify-center text-platium pt-[115px] tablet:pt-[213px] xl:pt-[123px] pl-[33px] pr-[33px] h-[324px] tablet:h-[533px] xl:h-full text-center">
                Lấy thông tin lịch phát sóng không thành công. Vui lòng thử lại
                sau
              </div>
            ) : stateErrorBroadcastSchedule === 'no-data' ? (
              <div className="text-sm tablet:text-base w-full bg-transparent flex justify-center text-platium pt-[115px] tablet:pt-[213px] xl:pt-[123px] pl-[33px] pr-[33px] h-[324px] tablet:h-[533px] xl:h-full text-center">
                Lịch phát sóng đang được cập nhật
              </div>
            ) : (
              renderSchedule()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BroadcastSchedule;
