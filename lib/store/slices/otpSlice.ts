import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OtpState {
  otpType: string;
  storeVerifyToken: string;
}

const initialState: OtpState = {
  otpType: '',
  storeVerifyToken: '',
};

const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    setOtpType: (state, action: PayloadAction<string>) => {
      state.otpType = action.payload;
    },
    setStoreVerifyToken: (state, action: PayloadAction<string>) => {
      state.storeVerifyToken = action.payload;
    },
  },
});

export const { setOtpType, setStoreVerifyToken } = otpSlice.actions;
export default otpSlice.reducer;