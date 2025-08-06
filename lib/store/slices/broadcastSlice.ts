import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BroadcastState {
  showBroadcastScheduleFullscreen: boolean;
}

const initialState: BroadcastState = {
  showBroadcastScheduleFullscreen: false,
};

const broadcastSlice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    setBroadcastFullscreen: (state, action: PayloadAction<boolean>) => {
      state.showBroadcastScheduleFullscreen = action.payload;
    },
    toggleBroadcastFullscreen: (state) => {
      state.showBroadcastScheduleFullscreen =
        !state.showBroadcastScheduleFullscreen;
    },
  },
});

export const { setBroadcastFullscreen, toggleBroadcastFullscreen } =
  broadcastSlice.actions;

export default broadcastSlice.reducer;
