import { FloatBubble } from '@/lib/components/buttons/SideTagButton';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidetagPosition {
  position: string; // "right bottom", "right top", "left bottom", "left top"
  hasPosition: boolean;
}

interface SidetagState {
  position: SidetagPosition;
  listFloatBubbles?: FloatBubble[];
}

const initialState: SidetagState = {
  position: {
    position: '',
    hasPosition: false,
  },
};

const sidetagSlice = createSlice({
  name: 'sidetag',
  initialState,
  reducers: {
    setSidetagPosition: (state, action: PayloadAction<SidetagPosition>) => {
      state.position = action.payload;
    },
    clearSidetagPosition: (state) => {
      state.position = {
        position: '',
        hasPosition: false,
      };
    },
    changeListFloatBubbles: (state, action: PayloadAction<FloatBubble[]>) => {
      state.listFloatBubbles = action.payload;
    },
  },
});

export const {
  setSidetagPosition,
  clearSidetagPosition,
  changeListFloatBubbles,
} = sidetagSlice.actions;
export default sidetagSlice.reducer;
