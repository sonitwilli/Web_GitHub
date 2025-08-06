// store/slices/loginSlide.ts
import { createSlice } from "@reduxjs/toolkit";

interface LoginState {
  visible: boolean;
}

const initialState: LoginState = {
  visible: false,
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
  },
});

export const { openLoginModal, closeLoginModal } = loginSlice.actions;
export default loginSlice.reducer;
