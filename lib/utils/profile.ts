// Import hằng số (điều chỉnh đường dẫn theo dự án của bạn)
import {
  // MESSAGE_NO_CONNECTION,
  DEFAULT_ERROR_MSG,
  NUMBER_PR,
  TYPE_PR,
  DETAIL_PR,
} from '@/lib/constant/texts';
import { setCookie } from 'cookies-next';
import { Profile } from '@/lib/api/user';

// Định nghĩa interface cho tham số đầu vào
interface CheckErrorParams {
  error?: unknown; // Type của error trong khối catch thường là unknown
}

interface Cookie {
  remove: (key: string) => void;
}

export interface ConvertMsgParams {
  msg?: string;
  text_format?: string[];
}

export const removeProfile = ({ cookie }: { cookie?: Cookie } = {}): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(NUMBER_PR);
    localStorage.removeItem(TYPE_PR);
    localStorage.removeItem(DETAIL_PR);
  }

  if (cookie && cookie.remove) {
    cookie.remove(NUMBER_PR);
    cookie.remove(TYPE_PR);
    cookie.remove(DETAIL_PR);
  }

  // Duyệt qua tất cả các khóa trong localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Kiểm tra nếu khóa chứa "event_fpl_"
    if (key && key.includes('event_fpl_')) {
      localStorage.removeItem(key); // Xóa mục nếu tìm thấy chuỗi
      i--; // Giảm i để lặp lại do localStorage đã thay đổi kích thước
    }
  }
};

interface Cookie {
  set: (
    key: string,
    value: string,
    options?: { path?: string; maxAge?: number },
  ) => void;
  remove: (key: string) => void;
}

export const saveProfile = ({
  profile,
}: { cookie?: Cookie; profile?: Profile } = {}): void => {
  if (typeof localStorage !== 'undefined') {
    if (profile?.profile_id) {
      localStorage.setItem(NUMBER_PR, profile.profile_id);
    }
    if (profile?.profile_type) {
      localStorage.setItem(TYPE_PR, profile.profile_type);
    }
    if (profile) {
      localStorage.setItem(DETAIL_PR, JSON.stringify(profile));
    }
  }

  if (profile?.profile_id) {
    setCookie(NUMBER_PR, profile.profile_id, {
      path: '/',
      maxAge: 3600 * 24 * 365, // 1 năm
    });
  }
  if (profile?.profile_type) {
    setCookie(TYPE_PR, profile.profile_type, {
      path: '/',
      maxAge: 3600 * 24 * 365, // 1 năm
    });
  }
  // Lưu ý: Phần lưu DETAIL_PR bị comment trong code gốc
  // if (profile) {
  //   cookie.set(DETAIL_PR, JSON.stringify(profile), {
  //     path: '/',
  //     maxAge: 3600 * 24 * 365,
  //   })
  // }
};

// Hàm checkError với TypeScript
export const checkError = ({ error }: CheckErrorParams = {}): string => {
  // Kiểm tra xem error có phải là instance của Error và có thuộc tính message không
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (message.toUpperCase().includes('NETWORK')) {
      return DEFAULT_ERROR_MSG;
    }
  }
  return DEFAULT_ERROR_MSG;
};

export const convertMsg = ({
  msg = '',
  text_format = [],
}: ConvertMsgParams = {}): string => {
  try {
    if (msg) {
      const msgArray = msg.split(' ');
      const convertTexts: string[] = [];

      for (const text of msgArray) {
        if (text_format.includes(text)) {
          convertTexts.push(
            `<span style="color: white" class="nvm"><b>${text}</b></span>`,
          );
        } else {
          convertTexts.push(text);
        }
      }

      return convertTexts.join(' ');
    }

    return '';
  } catch {
    return msg;
  }
};
