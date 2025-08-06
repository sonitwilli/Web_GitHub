import { trackingAnnouncementLog25 } from '../tracking/trackingCommon';

type ToastData = {
  title?: string;
  desc?: string;
  timeout?: number;
  icon?: string;
  wrapperStyle?: string;
  styleData?: string;
  iconSize?: number;
  preventOnClickOutside?: boolean;
  customIcon?: React.ReactNode;
};

let toastHandler: ((data: ToastData) => void) | null = null;

export const registerToastHandler = (handler: typeof toastHandler) => {
  toastHandler = handler;
};

export const showToast = (data: ToastData) => {
  setTimeout(() => {
    if (toastHandler) {
      toastHandler(data);
      trackingAnnouncementLog25({ ItemName: data.title + ', ' + data.desc });
    } else console.warn('Toast chưa sẵn sàng!');
  }, 0);
};
