import { ModalContent } from '../components/modal/ModalConfirm';
import { PlayerModalType } from '../components/player/context/PlayerPageContext';

export const MSG_ERRS_DEFAULT = {
  error_get_stream: {
    title: 'Thông báo',
    content:
      'Đã xảy ra sự cố khi kết nối FPT Play! Vui lòng thử lại sau hoặc chọn một nội dung khác',
    subContent: '',
    buttons: [
      {
        key: 'on_exit',
        title: 'Thoát',
      },
      {
        key: 'on_refresh',
        title: 'Thử lại',
      },
    ],
  },
  ad_blocking: {
    title: 'Thông báo',
    content: 'Vui lòng tắt chức năng chặn quảng cáo để tiếp tục xem video!',
    subContent: '',
    buttons: [
      {
        key: 'on_refresh',
        title: 'Tải lại',
      },
    ],
  },
  error_stream: {
    title: 'Thông báo',
    content: 'Có lỗi không xác định, vui lòng F5 hoặc nhấn Tải lại để thử lại!',
    subContent: '',
    buttons: [
      {
        key: 'on_refresh',
        title: 'Tải lại',
      },
    ],
  },
  video_watching: {
    title: 'Thông báo',
    content: '',
    subContent: '',
    buttons: [
      {
        key: 'on_cancel',
        title: 'Xem từ đầu',
      },
      {
        key: 'on_success',
        title: 'Đồng ý',
      },
    ],
  },
  require_login: {
    title: 'Đăng nhập tài khoản',
    content: 'Bạn cần thực hiện đăng nhập để tiếp tục sử dụng dịch vụ',
    subContent: '',
    buttons: [
      {
        key: 'on_cancel',
        title: 'Đóng',
      },
      {
        key: 'on_login',
        title: 'Đăng nhập',
      },
    ],
  },
  unsupported_browser: {
    title: 'Trình duyệt không hỗ trợ',
    content:
      'Nội dung này không hỗ trợ xem trên các thiết bị root hoặc jaibreak,các trình duyệt không tương thích như Safari, Opera. Tải ứng dụng FPTPlay để có trải nghiệm tốt hơn.',
    subContent: '',
    buttons: [
      {
        key: 'on_exit',
        title: 'Thoát',
      },
    ],
  },
};
export const MSG_ERRS_API_HBO = {
  401: {
    title: 'Thông báo',
    content:
      'Tài khoản chưa xác thực để xem dịch vụ {type_drm}. Vui lòng gửi thông tin qua mail support@fpt.com để được hỗ trợ!',
    subContent: '',
    buttons: [
      {
        key: 'on_exit',
        title: 'Thoát',
      },
    ],
  },
  403: {
    title: 'Thông báo',
    content:
      'Tài khoản chưa xác thực để xem dịch vụ {type_drm}. Vui lòng thử lại hoặc gửi thông tin qua mail support@fpt.com để được hỗ trợ!',
    subContent: '',
    buttons: [
      {
        key: 'on_exit',
        title: 'Thoát',
      },
      {
        key: 'on_refresh',
        title: 'Thử lại',
      },
    ],
  },
  405: {
    title: 'Thông báo',
    content:
      'Tài khoản đang xem gói {type_drm} vượt quá 2 thiết bị đồng thời cùng lúc. Vui lòng vào mục Quản lý thiết bị trong Tài khoản để kiểm tra thiết bị đang kết nối.',
    subContent: '',
    buttons: [
      {
        key: 'on_exit',
        title: 'Thoát',
      },
      {
        key: 'on_refresh',
        title: 'Thử lại',
      },
    ],
  },
  426: {
    title: 'Thông báo',
    content:
      'Tài khoản chưa xác thực để xem dịch vụ {type_drm}. Vui lòng thử lại hoặc gửi thông tin qua mail support@fpt.com để được hỗ trợ!',
    subContent: '',
    buttons: [
      {
        key: 'on_exit',
        title: 'Thoát',
      },
      {
        key: 'on_refresh',
        title: 'Thử lại',
      },
    ],
  },
};

export interface ErrorAPI {
  [index: number]: ModalContent;
}

export const getMsgErrsApi = ({
  code,
  msg,
}: {
  code: number;
  msg: string;
}): PlayerModalType => {
  const defaultContent: ModalContent = {
    title: 'Thông báo',
    content: msg,
    buttons: {
      accept: 'Thoát',
    },
  };
  const res: PlayerModalType = {
    submitKey: 'on_exit',
    content: defaultContent,
  };

  switch (code) {
    case 47:
      res.closeKey = 'on_exit';
      res.submitKey = 'on_refresh';
      if (res.content)
        res.content.buttons = {
          accept: 'Thử lại',
          cancel: 'Thoát',
        };
      break;

    case 405:
    case 406:
      res.closeKey = 'on_exit';
      res.submitKey = 'on_refresh';
      if (res.content)
        res.content.buttons = {
          accept: 'Thử lại',
          cancel: 'Để sau',
        };
      break;

    default:
      break;
  }

  return res;
};
