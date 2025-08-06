import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatbotState {
  isAlreadyRender?: boolean;
  chatbotOpen?: boolean;
  partnerToken?: string;
}

const initialState: ChatbotState = {
  isAlreadyRender: false,
  chatbotOpen: false,
  partnerToken: '',
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    changeIsAlreadyRender: (state, action: PayloadAction<boolean>) => {
      state.isAlreadyRender = action.payload;
    },
    changeChatbotOpen: (state, action: PayloadAction<boolean>) => {
      state.chatbotOpen = action.payload;
    },
    changePartnerToken: (state, action: PayloadAction<string>) => {
      state.partnerToken = action.payload;
    },
  },
});

export const { changeIsAlreadyRender, changeChatbotOpen, changePartnerToken } =
  chatbotSlice.actions;

export default chatbotSlice.reducer;
