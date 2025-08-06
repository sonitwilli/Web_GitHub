import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LivechatPopupInfo {
  userId?: string;
  userName?: string;
  avatar?: string;
  msgUid?: string;
  msg?: string;
}
export interface LivechatPopupDataItem {
  id?: string | number;
  title?: string;
  action?: string;
  selected?: string;
  button?: string;
}
export interface LivechatPopup {
  title?: string;
  info?: LivechatPopupInfo;
  data?: LivechatPopupDataItem[];
}

interface LiveChatState {
  height?: number;
  confirmDelete: {
    isOpen: boolean;
    metadata?: LivechatPopup;
  };
  deleteConfirmationResult: {
    metadata?: LivechatPopup;
    timestamp: number;
  } | null;
  warningModal: {
    isOpen: boolean;
    metadata?: LivechatPopup;
  };
  reportModal: {
    isOpen: boolean;
    metadata?: LivechatPopup;
  };
}

const initialState: LiveChatState = {
  height: undefined,
  confirmDelete: {
    isOpen: false,
    metadata: undefined,
  },
  deleteConfirmationResult: null,
  warningModal: {
    isOpen: false,
    metadata: undefined,
  },
  reportModal: {
    isOpen: false,
    metadata: undefined,
  },
};

const liveChatSlice = createSlice({
  name: 'liveChat',
  initialState,
  reducers: {
    setLiveChatHeight(state, action: PayloadAction<number>) {
      state.height = action.payload;
    },
    openConfirmDeleteModal(
      state,
      action: PayloadAction<{ metadata: LivechatPopup }>,
    ) {
      state.confirmDelete.isOpen = true;
      state.confirmDelete.metadata = action.payload.metadata;
    },
    closeConfirmDeleteModal(state) {
      state.confirmDelete.isOpen = false;
      // state.confirmDelete.metadata = undefined;
    },
    setDeleteConfirmationResult(
      state,
      action: PayloadAction<{ metadata: LivechatPopup }>,
    ) {
      state.deleteConfirmationResult = {
        metadata: action.payload.metadata,
        timestamp: new Date().getTime(),
      };
    },
    resetDeleteConfirmationResult(state) {
      state.deleteConfirmationResult = null;
    },
    openWarningModal(
      state,
      action: PayloadAction<{ metadata: LivechatPopup }>,
    ) {
      state.warningModal.isOpen = true;
      state.warningModal.metadata = action.payload.metadata;
    },
    closeWarningModal(state) {
      state.warningModal.isOpen = false;
      // state.warningModal.metadata = undefined;
    },
    setReportModal(state, action: PayloadAction<{ metadata: LivechatPopup }>) {
      state.reportModal.isOpen = true;
      state.reportModal.metadata = action.payload.metadata;
    },
    closeReportModal(state) {
      state.reportModal.isOpen = false;
      // state.reportModal.metadata = undefined;
    },
  },
});

export const {
  setLiveChatHeight,
  openConfirmDeleteModal,
  closeConfirmDeleteModal,
  setDeleteConfirmationResult,
  resetDeleteConfirmationResult,
  openWarningModal,
  closeWarningModal,
  setReportModal,
  closeReportModal,
} = liveChatSlice.actions;
export default liveChatSlice.reducer;
