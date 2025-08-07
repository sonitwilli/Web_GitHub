import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PopupDataType {
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info?: any;
  data?: Daum[];
}

export interface Daum {
  title?: string;
  button?: string;
}

interface ChatbotState {
  isAlreadyRender?: boolean;
  chatbotOpen?: boolean;
  partnerToken?: string;
  timeOpenPopupLostNetwork?: number;
  popupData?: PopupDataType;
}

const initialState: ChatbotState = {
  isAlreadyRender: false,
  chatbotOpen: false,
  partnerToken: '',
  timeOpenPopupLostNetwork: undefined,
  popupData: undefined,
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
    changeTimeOpenPopupLostNetworkChatbot: (
      state,
      action: PayloadAction<number | undefined>,
    ) => {
      state.timeOpenPopupLostNetwork = action.payload;
    },
    changePopupDataChatbot: (
      state,
      action: PayloadAction<PopupDataType | undefined>,
    ) => {
      state.popupData = action.payload;
    },
  },
});

export const {
  changeIsAlreadyRender,
  changeChatbotOpen,
  changePartnerToken,
  changeTimeOpenPopupLostNetworkChatbot,
  changePopupDataChatbot,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;
