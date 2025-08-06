import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BlockState {
  hoveredSlide?: BlockSlideItemType;
  hoveredBlock?: BlockItemType;
  timeStartBlockPlayer?: number;
}

const initialState: BlockState = {
  hoveredSlide: undefined,
  hoveredBlock: undefined,
  timeStartBlockPlayer: undefined,
};

const blockSlice = createSlice({
  name: 'block-store',
  initialState,
  reducers: {
    changeTimeStartBlockPlayer: (state, action: PayloadAction<number>) => {
      state.timeStartBlockPlayer = action.payload;
    },
  },
});

export const { changeTimeStartBlockPlayer } = blockSlice.actions;

export default blockSlice.reducer;
