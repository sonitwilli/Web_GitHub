import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state interface
interface VerifyTokenState {
  verify_token: string | null;
}

// Initial state
const initialState: VerifyTokenState = {
  verify_token: null,
};

// Create the slice
const verifyTokenSlice = createSlice({
  name: 'verifyToken',
  initialState,
  reducers: {
    setVerifyToken: (state, action: PayloadAction<string>) => {
      state.verify_token = action.payload;
    },
    clearVerifyToken: (state) => {
      state.verify_token = null;
    },
  },
});

// Export actions
export const { setVerifyToken, clearVerifyToken } = verifyTokenSlice.actions;

// Export reducer
export default verifyTokenSlice.reducer;