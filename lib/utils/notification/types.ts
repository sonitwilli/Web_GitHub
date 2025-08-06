// types/notification.ts
export interface PreviewInfo {
  preview_title?: string;
  preview_description?: string;
  preview_img?: string;
  icon?: string;
}

export interface NotificationDetail {
  message_id?: string;
  type?: string;
  type_id?: string;
  title?: string;
  body?: string;
  url?: string;
  image?: string;
  preview_info?: {
    preview_title?: string;
    preview_description?: string;
    preview_img?: string;
    icon?: string;
  };
  priority_tag?: string;
  meta_data?: string[];
  ribbon_payment?: string;
}

export interface NotificationRoomDocument {
  id?: string;
  data?: {
    data?: NotificationDetail[];
  };
}

export interface SubscribedRoom {
  room_type?: string;
  room_id?: string;
}

export interface SubscribedRoomDocument {
  id?: string;
  data?: {
    data?: SubscribedRoom[];
  };
}
