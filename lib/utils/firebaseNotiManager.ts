import {
  NotiDataType,
  initWatchRoomMessagesFromNotiData,
  DetailMessageItem,
} from '@/lib/plugins/firebase';

let hasSubscribed = false;

let callback: ((noti: DetailMessageItem) => void) | null = null;

export function subscribeFirebaseNoti(
  notiData: NotiDataType[],
  onNewNoti: (noti: DetailMessageItem) => void,
) {
  if (hasSubscribed) return;
  hasSubscribed = true;
  callback = onNewNoti;

  const isFirstSnapshot: Record<string, boolean> = {};

  initWatchRoomMessagesFromNotiData(notiData, (roomId, data) => {
    if (!isFirstSnapshot[roomId]) {
      isFirstSnapshot[roomId] = true;
      return; // Bỏ qua lần đầu
    }

    const newNoti = data?.detail_messages?.[0];
    if (newNoti && callback) {
      callback(newNoti);
    }
  });
}
