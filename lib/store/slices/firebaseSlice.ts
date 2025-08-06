import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotiDataType {
  id?: string;
  data?: {
    data?: { room_type?: string; room_id?: string }[];
  };
}

interface firebaseState {
  notiData?: NotiDataType[];
  notiFirebaseBell?: NotiDataType[];
}

const initialState: firebaseState = {
  notiData: [],
  notiFirebaseBell: [],
};

const firebaseSlice = createSlice({
  name: 'firebase',
  initialState,
  reducers: {
    changeNotiData: (state, action: PayloadAction<NotiDataType[]>) => {
      state.notiData = action.payload;
    },
    changeNotiFirebaseBell: (state, action: PayloadAction<NotiDataType[]>) => {
      state.notiFirebaseBell = action.payload;
    },
  },
});

// Export actions
export const { changeNotiData } = firebaseSlice.actions;
export const { changeNotiFirebaseBell } = firebaseSlice.actions;

// Export reducer
export default firebaseSlice.reducer;
