import { VodHistoryResponseType } from '@/lib/api/vod';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isCheckHistory?: boolean;
  isCheckBookmark?: boolean;
  historyData?: VodHistoryResponseType;
}

const initialState: UserState = {
  isCheckHistory: true,
  isCheckBookmark: true,
  historyData: undefined,
};

const vodSlice = createSlice({
  name: 'vod-store',
  initialState,
  reducers: {
    changeIsCheckHistory: (state, action: PayloadAction<boolean>) => {
      state.isCheckHistory = action.payload;
    },
    changeIsCheckBookmark: (state, action: PayloadAction<boolean>) => {
      state.isCheckBookmark = action.payload;
    },
    changeHistoryData: (
      state,
      action: PayloadAction<VodHistoryResponseType | undefined>,
    ) => {
      state.historyData = action.payload;
    },
  },
});

export const {
  changeIsCheckHistory,
  changeIsCheckBookmark,
  changeHistoryData,
} = vodSlice.actions;

export default vodSlice.reducer;
