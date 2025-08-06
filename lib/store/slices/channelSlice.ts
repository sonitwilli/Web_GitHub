import { SuggestChannelItemType } from '@/lib/api/channel';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChannelState {
  suggestChannels?: SuggestChannelItemType[];
}

const initialState: ChannelState = {
  suggestChannels: [],
};

export const channelSlice = createSlice({
  name: 'channelSlice',
  initialState,
  reducers: {
    changeSuggestChannels: (
      state,
      action: PayloadAction<SuggestChannelItemType[]>,
    ) => {
      state.suggestChannels = action.payload;
    },
  },
});

export const { changeSuggestChannels } = channelSlice.actions;
export default channelSlice.reducer;
