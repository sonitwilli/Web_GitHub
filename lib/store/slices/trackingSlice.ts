import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface trackingState {
  module: object;
  appName: string;
  appId: string;
  screen: string;
  position: object | undefined;
}

const initialState: trackingState = {
  module: {},
  appName: '',
  appId: '',
  screen: '',
  position: undefined,
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
  },
});

// Export actions
export const {
  changeModule,
  changeAppName,
  changeAppId,
  changeScreen,
  changePosition,
} = trackingSlice.actions;

// Export reducer
export default trackingSlice.reducer;
