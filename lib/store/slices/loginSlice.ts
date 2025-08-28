// store/slices/loginSlide.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoginState {
  visible: boolean;
  storeVerifyToken: string;
}

const initialState: LoginState = {
  visible: false,
  storeVerifyToken: '',
};

export const loginSlice = createSlice({
  name: "loginSlice",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.visible = true;
    },
    closeLoginModal: (state) => {
      state.visible = false;
    },
    setVerifyToken: (state, action: PayloadAction<string>) => {
      state.storeVerifyToken = action.payload;
    },
  },
});

export const { openLoginModal, closeLoginModal, setVerifyToken } = loginSlice.actions;
export default loginSlice.reducer;
