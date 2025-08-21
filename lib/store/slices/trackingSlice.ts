import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface trackingState {
  module: object;
  appName: string;
  appId: string;
  screen: string;
  position: object | undefined;
  clickToPlayTime: number;
  initPlayerTime: number;
}

const initialState: trackingState = {
  module: {},
  appName: '',
  appId: '',
  screen: '',
  position: undefined,
  clickToPlayTime: 0,
  initPlayerTime: 0,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    changeModule: (state, action: PayloadAction<object>) => {
      state.module = action.payload;
    },
    changeAppName: (state, action: PayloadAction<string>) => {
      state.appName = action.payload;
    },
    changeAppId: (state, action: PayloadAction<string>) => {
      state.appId = action.payload;
    },
    changeScreen: (state, action: PayloadAction<string>) => {
      state.screen = action.payload;
    },
    changePosition: (state, action: PayloadAction<object>) => {
      state.position = action.payload;
    },
    changeClickToPlayTime: (state, action: PayloadAction<number>) => {
      state.clickToPlayTime = action.payload;
    },
    changeInitPlayerTime: (state, action: PayloadAction<number>) => {
      state.initPlayerTime = action.payload;
    },
  },
});

// Export actions
export const {
  changeModule,
  changeAppName,
  changeAppId,
  changeScreen,
  changePosition,
  changeClickToPlayTime,
  changeInitPlayerTime,
} = trackingSlice.actions;

// Export reducer
export default trackingSlice.reducer;
