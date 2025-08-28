// store/slices/loginSlide.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginState {
  visible: boolean;
  storeVerifyToken: string;
  storeVerifyTokenGetDevicesLimit: string;
}

const initialState: LoginState = {
  visible: false,
  storeVerifyToken: '',
  storeVerifyTokenGetDevicesLimit: '',
};

export const loginSlice = createSlice({
  name: 'loginSlice',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.visible = true;
    },
    closeLoginModal: (state) => {
      state.visible = false;
    },
    setVerifyTokenGetDevicesLimit: (state, action: PayloadAction<string>) => {
      state.storeVerifyTokenGetDevicesLimit = action.payload;
    },
    setVerifyToken: (state, action: PayloadAction<string>) => {
      state.storeVerifyToken = action.payload;
    },
  },
});

export const {
  openLoginModal,
  closeLoginModal,
  setVerifyToken,
  setVerifyTokenGetDevicesLimit,
} = loginSlice.actions;
export default loginSlice.reducer;
