import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BlockState {
  hoveredSlide?: BlockSlideItemType;
  hoveredBlock?: BlockItemType;
  timeStartBlockPlayer?: number;
  pageBlocks?: BlockItemType[];
}

const initialState: BlockState = {
  hoveredSlide: undefined,
  hoveredBlock: undefined,
  timeStartBlockPlayer: undefined,
  pageBlocks: [],
};

const blockSlice = createSlice({
  name: 'block-store',
  initialState,
  reducers: {
    changeTimeStartBlockPlayer: (state, action: PayloadAction<number>) => {
      state.timeStartBlockPlayer = action.payload;
    },
    changePageBlocks: (state, action: PayloadAction<BlockItemType[]>) => {
      state.pageBlocks = action.payload;
    },
  },
});

export const { changeTimeStartBlockPlayer, changePageBlocks } =
  blockSlice.actions;

export default blockSlice.reducer;
