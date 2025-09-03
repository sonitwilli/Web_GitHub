import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  getBroadcastSchedule,
  getTimeShiftChannel,
  ScheduleItem,
  ChannelDetailType,
} from '@/lib/api/channel';

import { usePlayerPageContext } from '@/lib/components/player/context/PlayerPageContext';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { showToast } from '../utils/globalToast';
import { RootState } from '../store';
import {
  setSelectedDate,
  setActiveScheduleId,
  setCurrentTime,
  setScheduleList,
  setStateErrorBroadcastSchedule,
  clearCurrentTimeShiftProgram,
} from '../store/slices/broadcastScheduleSlice';
import { DEFAULT_ERROR_MSG, TITLE_SERVICE_ERROR } from '../constant/errors';

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
  } = broadcastScheduleState;

  const hasHandledQuery = useRef(false);

  // Check if item is currently live
  const isItemLive = useCallback((item: ScheduleItem) => {
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(item.start_time) && now < Number(item.end_time);
  }, []);

  // Find item by schedule ID
  const findItemById = useCallback(
    (scheduleId: string) => {
      return scheduleList.find((i) => i.id === scheduleId);
    },
    [scheduleList],
  );

  // Clear timeshift from URL
  const clearTimeshiftFromUrl = useCallback(() => {
    const q = router.query;
    if (q) {
      delete q.time_shift_id;
    }
    router.replace({ query: { ...q } }, undefined, { shallow: true });
  }, [router]);

  // Get context from PlayerPageContext
  const { setFromTimeshiftToLive, setShowLoginPlayer, setIsPlaySuccess } =
    usePlayerPageContext();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = Math.floor(Date.now() / 1000);
      dispatch(setCurrentTime(newTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Auto detect if current timeshift program becomes live and switch to live
  useEffect(() => {
    if (!activeScheduleId) return;

    const item = findItemById(activeScheduleId);
    if (!item) return;

    // Check if current timeshift item is now live
    if (isItemLive(item)) {
      // Clear timeshift and switch to live
      dispatch(setActiveScheduleId(''));
      onScheduleSelect?.('');
      if (setFromTimeshiftToLive) setFromTimeshiftToLive(Date.now());
      if (setIsPlaySuccess) setIsPlaySuccess(false);
      clearTimeshiftFromUrl();
    }
  }, [
    currentTime,
    activeScheduleId,
    findItemById,
    isItemLive,
    dispatch,
    onScheduleSelect,
    setFromTimeshiftToLive,
    setIsPlaySuccess,
    clearTimeshiftFromUrl,
  ]);

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

  // Handle timeshift selection
  const handleTimeShiftSelect = useCallback(
    async (scheduleId?: string) => {
      if (!scheduleId) {
        clearTimeshiftFromUrl();
        dispatch(setActiveScheduleId(''));
        dispatch(clearCurrentTimeShiftProgram()); // Clear timeshift title when going back to live
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

        if (res?.data?.data?.url) {
          dispatch(setActiveScheduleId(scheduleId));
          onScheduleSelect?.(res.data.data.url);
        } else {
          // Clear timeshift state and URL
          clearTimeshiftFromUrl();
          dispatch(setActiveScheduleId(''));
          onScheduleSelect?.('');

          // Show toast error when no URL returned
          showToast({
            title: TITLE_SERVICE_ERROR,
            desc: DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
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

        clearTimeshiftFromUrl();
        dispatch(setActiveScheduleId(''));
        dispatch(clearCurrentTimeShiftProgram()); // Clear timeshift title when error occurred
        onScheduleSelect?.('');

        // Show toast error when timeshift fails
        showToast({
          title: TITLE_SERVICE_ERROR,
          desc: DEFAULT_ERROR_MSG,
          timeout: 5000,
        });
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

  // Reset all stores when channel changes
  useEffect(() => {
    // Clear timeshift from URL without triggering re-render
    if (channelId !== router?.query?.id) {
      const q = router.query;
      if (q && q.time_shift_id) {
        delete q.time_shift_id;
        router.replace({ query: { ...q } }, undefined, { shallow: true });
      }
      hasHandledQuery.current = false;
    }
  }, [channelId, router]);

  // Auto handle timeshift when reload page with param time_shift_id
  useEffect(() => {
    if (!router.isReady || hasHandledQuery.current) return;

    // Wait for schedule API to complete (either with data or error state)
    if (!scheduleList.length && !stateErrorBroadcastSchedule) return;

    const urlScheduleId = router.query?.time_shift_id as string;
    if (
      urlScheduleId &&
      typeof urlScheduleId === 'string' &&
      urlScheduleId !== activeScheduleId
    ) {
      hasHandledQuery.current = true;

      // Only search in current scheduleList (today's schedule)
      const item = findItemById(urlScheduleId);

      if (item && isItemLive(item)) {
        // Schedule found and currently live, switch to live
        clearTimeshiftFromUrl();
        dispatch(setActiveScheduleId(''));
        dispatch(clearCurrentTimeShiftProgram()); // Clear timeshift title when switching to live
        onScheduleSelect?.('');
        if (setFromTimeshiftToLive) setFromTimeshiftToLive(Date.now());
        if (setIsPlaySuccess) setIsPlaySuccess(false);
      } else if (!item) {
        clearTimeshiftFromUrl();
        dispatch(setActiveScheduleId(''));
        onScheduleSelect?.('');
        if (setFromTimeshiftToLive) setFromTimeshiftToLive(Date.now());
        if (setIsPlaySuccess) setIsPlaySuccess(false);
      }
    }
  }, [
    router.isReady,
    router.query?.time_shift_id,
    activeScheduleId,
    scheduleList, // Wait for scheduleList to be populated
    stateErrorBroadcastSchedule, // Also wait for API completion (error state)
    handleTimeShiftSelect,
    findItemById,
    isItemLive,
    clearTimeshiftFromUrl,
    dispatch,
    onScheduleSelect,
    setFromTimeshiftToLive,
    setIsPlaySuccess,
  ]);

  useEffect(() => {
    if (router.query?.time_shift_id) {
      handleTimeShiftSelect(router.query?.time_shift_id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  };
}
