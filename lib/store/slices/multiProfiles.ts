import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/lib/api/user';

interface SideBarLeft {
  url?: string;
  text?: string;
}

interface MultiProfilesState {
  sideBarLeft?: SideBarLeft;
  profiles: Profile[];
  currentProfile?: Profile;
}

const initialState: MultiProfilesState = {
  sideBarLeft: {
    url: '/',
    text: 'Quay lại FPT Play',
  },
  profiles: [],
  currentProfile: undefined,
};

const multiProfilesSlice = createSlice({
  name: 'multiProfiles',
  initialState,
  reducers: {
    setSideBarLeft: (state, action: PayloadAction<SideBarLeft>) => {
      state.sideBarLeft = action.payload;
    },
    resetSideBarLeft: (state) => {
      state.sideBarLeft = undefined;
    },
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      state.profiles = action.payload;
    },
    resetProfiles: (state) => {
      state.profiles = [];
    },
    setCurrentProfile: (state, action: PayloadAction<Profile>) => {
      state.currentProfile = action.payload;
    },
    resetCurrentProfile: (state) => {
      state.currentProfile = undefined;
    },
  },
});

export const {
  setSideBarLeft,
  resetSideBarLeft,
  setProfiles,
  resetProfiles,
  setCurrentProfile,
  resetCurrentProfile,
} = multiProfilesSlice.actions;

export default multiProfilesSlice.reducer;
