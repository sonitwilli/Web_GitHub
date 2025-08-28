import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScheduleItem } from '@/lib/api/channel';
import { getVietnamTime, formatVietnamDateKey } from '@/lib/utils/timeUtilsVN';

interface BroadcastScheduleState {
  selectedDate: string;
  activeScheduleId: string;
  currentTime: number;
  scheduleList: ScheduleItem[];
  stateErrorBroadcastSchedule: string | 'error-api' | 'no-data';
}

const initialState: BroadcastScheduleState = {
  selectedDate: formatVietnamDateKey(getVietnamTime()),
  activeScheduleId: '',
  currentTime: Math.floor(Date.now() / 1000),
  scheduleList: [],
  stateErrorBroadcastSchedule: '',
};

const broadcastScheduleSlice = createSlice({
  name: 'broadcastSchedule',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setActiveScheduleId: (state, action: PayloadAction<string>) => {
      state.activeScheduleId = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setScheduleList: (state, action: PayloadAction<ScheduleItem[]>) => {
      state.scheduleList = action.payload;
    },
    setStateErrorBroadcastSchedule: (
      state,
      action: PayloadAction<string | 'error-api' | 'no-data'>,
    ) => {
      state.stateErrorBroadcastSchedule = action.payload;
    },

    resetBroadcastSchedule: (state) => {
      state.selectedDate = formatVietnamDateKey(getVietnamTime());
      state.activeScheduleId = '';
      state.currentTime = Math.floor(Date.now() / 1000);
      state.scheduleList = [];
      state.stateErrorBroadcastSchedule = '';
    },
  },
});

export const {
  setSelectedDate,
  setActiveScheduleId,
  setCurrentTime,
  setScheduleList,
  setStateErrorBroadcastSchedule,
  resetBroadcastSchedule,
} = broadcastScheduleSlice.actions;

export default broadcastScheduleSlice.reducer;
