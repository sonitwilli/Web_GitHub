// lib/store/slices/loginFlowSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { onLogin3rdResponse } from '@/lib/api/login';

interface LoginFlowState {
  errorCodeResult?: onLogin3rdResponse | null;
}

const initialState: LoginFlowState = {
  errorCodeResult: null,
};

const loginFlowSlice = createSlice({
  name: 'loginFlow',
  initialState,
  reducers: {
    handleErrorCode(state, action: PayloadAction<onLogin3rdResponse>) {
      // Lưu thẳng object result
      state.errorCodeResult = action.payload;
    },
    resetLoginFlow() {
      // Reset về trạng thái ban đầu
      return initialState;
    },
  },
});

export const { handleErrorCode, resetLoginFlow } = loginFlowSlice.actions;

export default loginFlowSlice.reducer;
