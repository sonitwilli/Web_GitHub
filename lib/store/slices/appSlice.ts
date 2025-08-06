import { MessageConfigDataType } from '@/lib/api/app';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { ConfigDataType } from '@/lib/api/main';
import { MenuItem } from '@/lib/api/menu';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface appState {
  interacted: boolean;
  selectedMenuMoreItem?: MenuItem;
  activeMenuItem?: MenuItem;
  timeOpenModalRequireLogin?: number;
  topSliderHeight?: number;
  isMutedTrailerPlayer?: boolean;
  configs?: ConfigDataType;
  sharedBlock?: BlockItemType;
  sharedSlideItem?: BlockSlideItemType;
  messageConfigs?: MessageConfigDataType;
  adsLoaded?: boolean;
  tabActive?: boolean;
}

const initialState: appState = {
  interacted: false,
  selectedMenuMoreItem: undefined,
  activeMenuItem: undefined,
  timeOpenModalRequireLogin: undefined,
  topSliderHeight: 0,
  isMutedTrailerPlayer: true,
  configs: {},
  sharedBlock: undefined,
  sharedSlideItem: undefined,
  messageConfigs: {},
  adsLoaded: false,
  tabActive: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    changeInteracted: (state, action: PayloadAction<boolean>) => {
      state.interacted = action.payload;
    },
    changeSelectedMenuMoreItem: (state, action: PayloadAction<MenuItem>) => {
      state.selectedMenuMoreItem = action.payload;
    },
    changeActiveMenuItem: (state, action: PayloadAction<MenuItem>) => {
      state.activeMenuItem = action.payload;
    },
    changeTimeOpenModalRequireLogin: (state, action: PayloadAction<number>) => {
      state.timeOpenModalRequireLogin = action.payload;
    },
    changeTopSliderHeight: (state, action: PayloadAction<number>) => {
      state.topSliderHeight = action.payload;
    },
    changeIsMutedTrailerPlayer: (state, action: PayloadAction<boolean>) => {
      state.isMutedTrailerPlayer = action.payload;
    },
    changeConfigs: (state, action: PayloadAction<ConfigDataType>) => {
      state.configs = action.payload;
    },
    changeShareBlock: (state, action: PayloadAction<BlockItemType>) => {
      state.sharedBlock = action.payload;
    },
    changeSharedSlideItem: (
      state,
      action: PayloadAction<BlockSlideItemType>,
    ) => {
      state.sharedSlideItem = action.payload;
    },
    changeMessageConfigs: (
      state,
      action: PayloadAction<MessageConfigDataType>,
    ) => {
      state.messageConfigs = action.payload;
    },
    changeAdsLoaded: (state, action: PayloadAction<boolean>) => {
      state.adsLoaded = action.payload;
    },
    changeTabActive: (state, action: PayloadAction<boolean>) => {
      state.tabActive = action.payload;
    },
  },
});

// Export actions
export const {
  changeInteracted,
  changeSelectedMenuMoreItem,
  changeActiveMenuItem,
  changeTimeOpenModalRequireLogin,
  changeTopSliderHeight,
  changeIsMutedTrailerPlayer,
  changeConfigs,
  changeShareBlock,
  changeSharedSlideItem,
  changeMessageConfigs,
  changeAdsLoaded,
  changeTabActive,
} = appSlice.actions;

// Export reducer
export default appSlice.reducer;
