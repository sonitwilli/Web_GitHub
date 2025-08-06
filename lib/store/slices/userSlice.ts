import { UserInfoResponseType } from '@/lib/api/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLogged?: boolean;
  info?: UserInfoResponseType;
  token?: string;
}

const initialState: UserState = { isLogged: false, info: {}, token: '' };

const userSlice = createSlice({
  name: 'user-store',
  initialState,
  reducers: {
    changeIsLogged: (state, action: PayloadAction<boolean>) => {
      state.isLogged = action.payload;
    },
    changeUserInfo: (state, action: PayloadAction<UserInfoResponseType>) => {
      state.info = action.payload;
    },
    setUser: (state, action: PayloadAction<UserInfoResponseType>) => {
      state.info = action.payload;
      state.isLogged = !!action.payload; // Update isLogged based on whether user info exists
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { changeIsLogged, changeUserInfo, setUser, setToken } =
  userSlice.actions;

export default userSlice.reducer;
