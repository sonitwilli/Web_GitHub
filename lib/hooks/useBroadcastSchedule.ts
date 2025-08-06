import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  getBroadcastSchedule,
  getTimeShiftChannel,
  ScheduleItem,
  ChannelDetailType,
} from '@/lib/api/channel';
import { getVietnamTime, formatVietnamDateKey } from '@/lib/utils/timeUtilsVN';
import { usePlayerPageContext } from '@/lib/components/player/context/PlayerPageContext';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { RootState } from '../store';
import {
  setSelectedDate,
  setActiveScheduleId,
  setCurrentTime,
  setScheduleList,
  setStateErrorBroadcastSchedule,
  setAllTimeShiftItems,
} from '../store/slices/broadcastScheduleSlice';

export function useBroadcastSchedule(
  channelId: string,
  dataChannel?: ChannelDetailType,
  onScheduleSelect?: (src: string) => void,
) {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get state from Redux store
  const broadcastScheduleState = useSelector(
    (state: RootState) => state.broadcastSchedule,
  );

  const {
    selectedDate,
    activeScheduleId,
    currentTime,
    scheduleList,
    stateErrorBroadcastSchedule,
    allTimeShiftItems,
  } = broadcastScheduleState;

  // Auto timeshift state
  const lastEndVideoTimeRef = useRef<number>(0);
  const hasHandledQuery = useRef(false);

  // Get context from PlayerPageContext
  const {
    isEndVideo,
    setFromTimeshiftToLive,
    streamType,
    showLoginPlayer,
    setShowLoginPlayer,
    setIsPlaySuccess,
  } = usePlayerPageContext();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = Math.floor(Date.now() / 1000);
      dispatch(setCurrentTime(newTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Fetch schedule
  const fetchBroadcastSchedule = useCallback(
    async (date: string) => {
      if (!channelId) return;
      try {
        const res = await getBroadcastSchedule({ channelId, daily: date });
        if (!res?.data?.data?.schedule_list?.length) {
          dispatch(setStateErrorBroadcastSchedule('no-data'));
        } else {
          dispatch(setScheduleList(res.data.data.schedule_list || []));
          dispatch(setStateErrorBroadcastSchedule(''));
        }
      } catch {
        dispatch(setStateErrorBroadcastSchedule('error-api'));
      }
    },
    [channelId, dispatch],
  );

  // Fetch schedule when selectedDate or channelId changes
  useEffect(() => {
    fetchBroadcastSchedule(selectedDate);
  }, [selectedDate, channelId, fetchBroadcastSchedule]);

  // Fetch all timeshift items for auto next functionality
  const fetchAllTimeShiftItems = useCallback(async () => {
    if (!channelId || !dataChannel) return;

    try {
      const allItems: ScheduleItem[] = [];
      const surroundingDates = [];

      // Generate surrounding dates (-2 to +4 days)
      for (let i = -2; i <= 4; i++) {
        const date = new Date(getVietnamTime());
        date.setDate(date.getDate() + i);
        surroundingDates.push(formatVietnamDateKey(date));
      }

      // Fetch schedule for all surrounding dates
      for (const date of surroundingDates) {
        try {
          const res = await getBroadcastSchedule({ channelId, daily: date });
          if (res?.data?.data?.schedule_list?.length) {
            allItems.push(...res.data.data.schedule_list);
          }
        } catch {
          return;
        }
      }

      if (allItems.length > 0) {
        dispatch(setAllTimeShiftItems(allItems));
      }
    } catch {
      return;
    }
  }, [channelId, dataChannel, dispatch]);

  useEffect(() => {
    if (channelId !== router?.query?.id) {
      dispatch(setAllTimeShiftItems([]));
      fetchAllTimeShiftItems();
    } else if (!allTimeShiftItems.length) {
      fetchAllTimeShiftItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllTimeShiftItems, channelId, router?.query?.id, dispatch]);

  // Check if item is currently live
  const isItemLive = useCallback((item: ScheduleItem) => {
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(item.start_time) && now < Number(item.end_time);
  }, []);

  // Find item by schedule ID
  const findItemById = useCallback(
    (scheduleId: string) => {
      return (
        scheduleList.find((i) => i.id === scheduleId) ||
        allTimeShiftItems.find((i) => i.id === scheduleId)
      );
    },
    [scheduleList, allTimeShiftItems],
  );

  // Clear timeshift from URL
  const clearTimeshiftFromUrl = useCallback(() => {
    const q = router.query;
    if (q) {
      delete q.time_shift_id;
    }
    router.replace({ query: { ...q } }, undefined, { shallow: true });
  }, [router]);

  // Reset all stores when channel changes
  useEffect(() => {
    // Clear timeshift from URL without triggering re-render
    if (channelId !== router?.query?.id) {
      const q = router.query;
      if (q && q.time_shift_id) {
        delete q.time_shift_id;
        router.replace({ query: { ...q } }, undefined, { shallow: true });
      }
    }
  }, [channelId, router]);

  // Handle timeshift selection
  const handleTimeShiftSelect = useCallback(
    async (scheduleId?: string) => {
      if (!scheduleId) {
        clearTimeshiftFromUrl();
        dispatch(setActiveScheduleId(''));
        onScheduleSelect?.('');
        return;
      }

      // Find the item
      const item = findItemById(scheduleId);
      if (!item) {
        return;
      }

      // Check if item is currently live
      if (isItemLive(item)) {
        // Currently live, don't allow timeshift
        dispatch(setActiveScheduleId(''));
        onScheduleSelect?.('');
        if (setFromTimeshiftToLive) setFromTimeshiftToLive(Date.now());
        if (setIsPlaySuccess) setIsPlaySuccess(false);
        clearTimeshiftFromUrl();
        return;
      }

      // Update URL with timeshift parameter
      const newQuery = { ...router.query, time_shift_id: scheduleId };
      router.replace({ query: newQuery }, undefined, { shallow: true });

      try {
        const res = await getTimeShiftChannel({
          scheduleId,
          ...(channelId ? { channelId } : {}),
        });

        if (res) {
          dispatch(setActiveScheduleId(scheduleId));
          onScheduleSelect?.(res.data?.data?.url);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            // Set active schedule ID first
            dispatch(setActiveScheduleId(scheduleId));

            // Hide controlbar by setting showLoginPlayer
            if (setShowLoginPlayer) {
              setShowLoginPlayer(true);
            }

            // Play trailer URL if available
            if (err.response?.data?.trailer_url) {
              onScheduleSelect?.(err.response?.data?.trailer_url);
            }

            setTimeout(() => {
              dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
            }, 1000);
            return;
          }
        }
        return;
      }
    },
    [
      router,
      dispatch,
      onScheduleSelect,
      channelId,
      setShowLoginPlayer,
      findItemById,
      isItemLive,
      clearTimeshiftFromUrl,
      setFromTimeshiftToLive,
      setIsPlaySuccess,
    ],
  );

  // Check if item is replayable
  const isItemReplayable = useCallback(
    (item: ScheduleItem) => {
      const nowTime = currentTime * 1000;
      const end = Number(item.end_time) * 1000;
      const replayWindowStart = nowTime - 24 * 60 * 60 * 1000; // 24 hours ago

      const isReplayable = end >= replayWindowStart && end < nowTime;
      const isTimeshiftDisabled = dataChannel?.timeshift === 0;

      return isReplayable && !isTimeshiftDisabled;
    },
    [currentTime, dataChannel],
  );

  // Find live item
  const findLiveItem = useCallback(() => {
    return allTimeShiftItems.find((item: ScheduleItem) => {
      const nowTime = currentTime * 1000;
      const end = Number(item.end_time) * 1000;
      return nowTime >= Number(item.start_time) * 1000 && nowTime < end;
    });
  }, [allTimeShiftItems, currentTime]);

  // Auto timeshift functionality
  const handleAutoNextItem = useCallback(() => {
    if (!allTimeShiftItems.length || !activeScheduleId) {
      return;
    }

    const currentIndex = allTimeShiftItems.findIndex(
      (item: ScheduleItem) => item.id === activeScheduleId,
    );

    if (currentIndex === -1) {
      return;
    }

    // Find next available timeshift item
    let nextIndex = currentIndex + 1;
    let nextItem: ScheduleItem | null = null;

    // Look for next timeshift item
    while (nextIndex < allTimeShiftItems.length) {
      const item = allTimeShiftItems[nextIndex];
      if (isItemReplayable(item)) {
        nextItem = item;
        break;
      }
      nextIndex++;
    }

    // If no next timeshift item, check if there's a live item
    if (!nextItem) {
      const liveItem = findLiveItem();

      if (liveItem) {
        try {
          // Switch to live
          if (setFromTimeshiftToLive && streamType === 'timeshift') {
            if (showLoginPlayer && setShowLoginPlayer) {
              setShowLoginPlayer(false);
            }
            if (window.hlsPlayer || window.shakaPlayer) {
              setFromTimeshiftToLive(new Date().getTime());
            }
          }

          // Update URL and state
          clearTimeshiftFromUrl();
          dispatch(setActiveScheduleId(''));
          onScheduleSelect?.('');
        } catch {
          return;
        }
        return;
      }
    }

    // Switch to next timeshift item
    if (nextItem) {
      try {
        handleTimeShiftSelect(nextItem.id);
      } catch {
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allTimeShiftItems,
    activeScheduleId,
    currentTime,
    dataChannel,
    handleTimeShiftSelect,
    isItemReplayable,
    findLiveItem,
    setFromTimeshiftToLive,
    streamType,
    showLoginPlayer,
    setShowLoginPlayer,
    clearTimeshiftFromUrl,
    onScheduleSelect,
    dispatch,
  ]);

  // Listen for video ended event via isEndVideo
  useEffect(() => {
    if (isEndVideo && isEndVideo > lastEndVideoTimeRef.current) {
      lastEndVideoTimeRef.current = isEndVideo;

      // Only auto next if we're in timeshift mode
      if (activeScheduleId) {
        // Add a small delay to ensure the video has fully ended
        setTimeout(() => {
          try {
            handleAutoNextItem();
          } catch {
            return;
          }
        }, 1000);
      }
    } else if (isEndVideo === 0) {
      // Reset the last end video time when isEndVideo is reset to 0
      lastEndVideoTimeRef.current = 0;
    }
  }, [isEndVideo, activeScheduleId, handleAutoNextItem]);

  // Auto handle timeshift when reload page with param time_shift_id
  useEffect(() => {
    if (!router.isReady || hasHandledQuery.current) return;
    const urlScheduleId = router.query?.time_shift_id as string;
    if (
      urlScheduleId &&
      typeof urlScheduleId === 'string' &&
      urlScheduleId !== activeScheduleId
    ) {
      hasHandledQuery.current = true;
      handleTimeShiftSelect(urlScheduleId);
    }
  }, [
    router.isReady,
    router.query?.time_shift_id,
    activeScheduleId,
    handleTimeShiftSelect,
  ]);

  // Setter functions
  const setSelectedDateCallback = useCallback(
    (date: string) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch],
  );

  const setActiveScheduleIdCallback = useCallback(
    (id: string) => {
      dispatch(setActiveScheduleId(id));
    },
    [dispatch],
  );

  return {
    scheduleList,
    currentTime,
    selectedDate,
    setSelectedDate: setSelectedDateCallback,
    stateErrorBroadcastSchedule,
    handleTimeShiftSelect,
    activeScheduleId,
    setActiveScheduleId: setActiveScheduleIdCallback,
    dataChannel,
    allTimeShiftItems,
  };
}
