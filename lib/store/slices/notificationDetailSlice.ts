import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationRoomDocument } from '@/lib/utils/notification/types';

interface NotificationState {
  detailMessages: {
    id: string;
    data: NotificationRoomDocument;
  }[];
}

const initialState: NotificationState = {
  detailMessages: [],
};

const notificationDetailSlice = createSlice({
  name: 'notificationDetail',
  initialState,
  reducers: {
    updateNotificationRoom: (
      state,
      action: PayloadAction<{
        id: string;
        data: NotificationRoomDocument;
      }>,
    ) => {
      const idx = state.detailMessages.findIndex(
        (doc) => doc.id === action.payload.id,
      );

      if (idx !== -1) {
        state.detailMessages[idx] = {
          id: action.payload.id,
          data: action.payload.data,
        };
      } else {
        state.detailMessages.push({
          id: action.payload.id,
          data: action.payload.data,
        });
      }
    },
  },
});

export const { updateNotificationRoom } = notificationDetailSlice.actions;
export default notificationDetailSlice.reducer;
