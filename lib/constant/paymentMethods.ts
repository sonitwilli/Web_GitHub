export interface MethodOptions {
  key: string;
  type: string;
  createTransactionUrl?: string;
  checkTransactionUrl?: string;
  createQRCodeUrl?: string;
  mobile?: boolean;
  hybrid?: boolean;
  redirect?: {
    prop: string;
  };
  text?: {
    title: string;
    steps?: {
      title: string;
      description: string;
      icon: string;
    }[];
    backgroundPayment?: string;
    note?: string;
  };
}

export const DISABLED_LIST: string[] = ['onepay_credit'];
export const DISABLED_MOBILE_LIST: string[] = [];
export const PAYMENT_V4_METHODS = [
  'foxpay',
  'foxpay_credit',
  'foxpay_atm',
  'applepayqr',
  'viet_qr',
];
export const PAYMENT_HUB_CONFIG = {
  apiCreate: 'paymentgw/payment_hub/create_transaction',
  apiCheck: 'paymentgw/payment_hub/check_transaction',
};
export const PAYMENT_METHODS: MethodOptions[] = [
  {
    key: 'grab_pay',
    type: 'redirect',
    createTransactionUrl: 'payment/grab_create',
  },

  {
    key: 'viettel_pay',
    type: 'redirect',
    createTransactionUrl: 'payment/viettel_create',
  },

  {
    key: 'momo_walle',
    type: 'redirect',
    createTransactionUrl: 'payment/momo_create',
  },

  {
    key: 'napas_atm',
    type: 'redirect',
    createTransactionUrl: 'payment/napas_create',
    redirect: {
      prop: 'napas_form_url',
    },
  },

  {
    key: 'airpay',
    type: 'qr',
    createTransactionUrl: 'payment/airpay_wap_create',
    createQRCodeUrl: 'payment/airpay_create',
    checkTransactionUrl: 'payment/airpay_check',
    hybrid: true,
    redirect: {
      prop: 'shopee_redirect_url',
    },
    text: {
      title: 'Quét mã QR với ShopeePay để thanh toán dịch vụ FPT Play',
      steps: [
        {
          title: 'Bước 1',
          description: 'Mở ứng dụng ShopeePay trên điện thoại.',
          icon: '/images/payments/airpay/icon-01.svg',
        },
        {
          title: 'Bước 2',
          description: 'Nhấp vào biểu tượng quét mã trên trang chủ.',
          icon: '/images/payments/airpay/icon-02.svg',
        },
        {
          title: 'Bước 3',
          description: 'Sử dụng trình quét mã để quét mã QR.',
          icon: '/images/payments/airpay/icon-03.svg',
        },
      ],
      backgroundPayment: '/images/payments/airpay/shopee.png',
      note: '',
    },
  },

  {
    key: 'zalo_pay',
    type: 'qr',
    createQRCodeUrl: 'payment/zalo_create_autodebit_transaction',
    checkTransactionUrl: 'payment/zalo_check',
    text: {
      title: 'Quét mã QR bằng ứng dụng ZaloPay để thanh toán dịch vụ FPT Play',
      steps: [
        {
          title: 'Bước 1',
          description: 'Mở ứng dụng ZaloPay trên điện thoại.',
          icon: '/images/payments/zalo_pay/icon-01.svg',
        },
        {
          title: 'Bước 2',
          description: 'Nhấp vào biểu tượng quét mã trên trang chủ.',
          icon: '/images/payments/zalo_pay/icon-02.svg',
        },
        {
          title: 'Bước 3',
          description: 'Sử dụng trình quét mã để quét mã QR.',
          icon: '/images/payments/zalo_pay/icon-03.svg',
        },
      ],
      backgroundPayment: '/images/payments/zalo_pay/zalo-bg.png',
      note: '',
    },
  },

  {
    key: 'vn_pay',
    type: 'qr',
    createQRCodeUrl: 'payment/vnpay_create',
    checkTransactionUrl: 'payment/vnpay_check',
    text: {
      title: 'Quét mã QR với Mobile Banking để thanh toán dịch vụ FPT Play',
      steps: [
        {
          title: 'Bước 1',
          description: 'Đăng nhập ứng dụng Mobile Banking.',
          icon: '/images/payments/vn_pay/vnpay_b1.png',
        },
        {
          title: 'Bước 2',
          description: 'Chọn tính năng quét mã thanh toán.',
          icon: '/images/payments/vn_pay/vnpay_b2.png',
        },
        {
          title: 'Bước 3',
          description: 'Di chuyển camera và quét mã ở trên màn hình FPT Play.',
          icon: '/images/payments/vn_pay/vnpay_b3.png',
        },
      ],
      backgroundPayment: '/images/payments/vn_pay/vnpay.png',
      note: '',
    },
  },

  {
    key: 'foxpay',
    type: 'qr',
    createTransactionUrl: 'payment/foxpay_create_pay_url_v4',
    createQRCodeUrl: 'payment/foxpay_create_v4',
    checkTransactionUrl: 'payment/foxpay_check_v4',
    hybrid: true,
    text: {
      title: 'Quét mã QR bằng ứng dụng FPT Pay để thanh toán dịch vụ FPT Play',
      steps: [
        {
          title: 'Bước 1',
          description: 'Mở ứng dụng FPT Pay trên điện thoại.',
          icon: '/images/payments/foxpay/icon-01.svg',
        },
        {
          title: 'Bước 2',
          description: 'Nhấp vào biểu tượng quét mã trên trang chủ.',
          icon: '/images/payments/foxpay/icon-02.svg',
        },
        {
          title: 'Bước 3',
          description: 'Sử dụng trình quét mã để quét mã QR.',
          icon: '/images/payments/foxpay/icon-03.svg',
        },
      ],
      backgroundPayment: '/images/payments/foxpay/foxpay.png',
      note: '',
    },
  },

  {
    key: 'foxpay_atm',
    type: 'redirect',
    createTransactionUrl: 'payment/foxpay_atm_create_v4',
    checkTransactionUrl: 'payment/foxpay_check_v4',
  },

  {
    key: 'foxpay_credit',
    type: 'foxpay_credit',
    createTransactionUrl: 'payment/foxpay_credit_create_v4',
    checkTransactionUrl: 'payment/foxpay_check_v4',
  },

  {
    key: 'viet_qr',
    type: 'qr',
    createQRCodeUrl: 'payment/vietqr_v4',
    checkTransactionUrl: 'payment/foxpay_check_v4',
    text: {
      title: 'Quét mã QR bằng ứng dụng VietQR để thanh toán dịch vụ FPT Play',
      steps: [
        {
          title: 'Bước 1',
          description: 'Mở ứng dụng VietQR trên điện thoại.',
          icon: '/images/payments/viet_qr/icon-01.svg',
        },
        {
          title: 'Bước 2',
          description: 'Chọn tính năng quét mã trong ứng dụng.',
          icon: '/images/payments/viet_qr/icon-02.svg',
        },
        {
          title: 'Bước 3',
          description: 'Sử dụng trình quét mã để quét mã QR.',
          icon: '/images/payments/viet_qr/icon-03.svg',
        },
      ],
      backgroundPayment: '/images/payments/viet_qr/vietqr-bg.png',
      note: '',
    },
  },
  {
    key: 'applepayqr',
    type: 'qr',
    createQRCodeUrl: 'payment/foxpay_applepay_create_v4',
    createTransactionUrl: 'payment/foxpay_applepay_create_v4',
    checkTransactionUrl: 'payment/foxpay_check_v4',
    text: {
      title:
        'Quét mã QR bằng ứng dụng Apple Pay để thanh toán dịch vụ FPT Play',
      steps: [
        {
          title: 'Bước 1',
          description: 'Mở ứng dụng Apple Pay trên điện thoại.',
          icon: '/images/payments/apple_pay/icon-01.svg',
        },
        {
          title: 'Bước 2',
          description: 'Chọn tính năng quét mã trong trang chủ.',
          icon: '/images/payments/apple_pay/icon-02.svg',
        },
        {
          title: 'Bước 3',
          description: 'Sử dụng trình quét mã để quét mã QR.',
          icon: '/images/payments/apple_pay/icon-03.svg',
        },
      ],
      backgroundPayment: '/images/payments/apple_pay/apple-pay-bg.png',
      note: 'Lưu ý: Chỉ khả dụng trên iOS và sử dụng trình duyệt Safari.',
    },
  },
];
