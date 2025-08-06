import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse, AxiosError } from 'axios';
import { AppDispatch } from '@/lib/store'; // Adjust based on your Redux store setup
import { showToast } from '@/lib/utils/globalToast';
import { Dispatch, SetStateAction } from 'react';
import {
  SEND_OTP_TYPES,
  COUNT_DOWN_MESSAGE,
  DEFAULT_ERROR_MSG,
  TITLE_SEND_OTP_FAIL,
  SENT_OTP_MESSAGE,
  ERROR_CONNECTION,
  HAVING_ERROR,
  ERROR_UNKNOW,
} from '@/lib/constant/texts'; // Adjust path as needed
import { setVerifyToken } from '@/lib/store/slices/accountSlice';
import { setStoreVerifyToken } from '@/lib/store/slices/otpSlice';

// Interfaces for function parameters and responses
export interface VerifyOtpParams {
  phone: string;
  otpCode?: string;
  countryCode?: string;
  clientId?: string;
  pushRegId?: string | null;
  typeOtp?: string;
  type?: string;
}

export interface ResendOtpParams {
  phone: string;
  email?: string;
  countryCode?: string;
  clientId?: string;
  typeOtp?: string;
}

export interface OtpResponse {
  error_code: string;
  msg?: string;
  data?: {
    access_token?: string;
    verify_token?: string;
    seconds?: number;
    text_format?: { text: string }[];
  };
  seconds?: number;
  verify_token?: string;
  access_token?: string;
}

export interface VerifyContent {
  title?: string;
  content?: string | TrustedHTML;
  placeholder_input?: string;
  button?: { action: string; content: string }[];
  link_resent?: { action: string; content: string }[];
}

// Định nghĩa kiểu cho dữ liệu phản hồi từ API (cả thành công và lỗi)
interface ApiResponseData {
  error_code: string;
  msg?: string;
  data?: {
    verify_token?: string;
    seconds?: string;
    title?: string;
  };
}

// API Functions
export const doResend = async (
  params: ResendOtpParams,
): Promise<AxiosResponse<OtpResponse>> => {
  const response = await axiosInstance.post('user/otp/resend_otp', {
    phone: params.phone,
    email: params.email || '',
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  return response;
};

export const doResendPayment = async (
  params: ResendOtpParams,
): Promise<AxiosResponse<OtpResponse>> => {
  const response = await axiosInstance.post('user/otpv1/resend', {
    type_otp: 'remove_wallet',
    phone: params.phone,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  return response;
};

export const doResendWallet = async (
  params: ResendOtpParams,
): Promise<AxiosResponse<OtpResponse>> => {
  const response = await axiosInstance.post('user/otpv1/resend', {
    type_otp: 'remove_auto_pay',
    phone: params.phone,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  return response;
};

export const doConfirmOtp = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  handleUserInfo: (token: string) => Promise<void>,
  loginSuccess: () => void,
  setIsRegister: (value: boolean) => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/verify', {
    phone: params.phone,
    otp_code: params.otpCode,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    push_reg_id: params.pushRegId || null,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      localStorage.setItem('token', result.data?.access_token);
      await handleUserInfo(result.data?.access_token);
      setIsRegister(false);
      loginSuccess();
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpSso = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  handleUserInfo: (token: string) => Promise<void>,
  loginSuccess: () => void,
  setIsRegister: (value: boolean) => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/verify', {
    phone: params.phone,
    otp_code: params.otpCode,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    push_reg_id: params.pushRegId || null,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      localStorage.setItem('token', result.data?.access_token);
      await handleUserInfo(result.data?.access_token);
      setIsRegister(false);
      loginSuccess();
      break;
    case '7':
      throw new Error(result.msg || 'Invalid OTP');
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtp24h = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  handleUserInfo: (token: string) => Promise<void>,
  loginSuccess: () => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/verify', {
    phone: params.phone,
    otp_code: params.otpCode,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      localStorage.setItem('token', result.access_token);
      await handleUserInfo(result.access_token);
      loginSuccess();
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtp24hNewDevice = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  handleUserInfo: (token: string) => Promise<void>,
  loginSuccess: () => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otpv1/verify', {
    phone: params.phone,
    type_otp: 'login_new_device',
    otp_code: params.otpCode,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      localStorage.setItem('token', result.data?.access_token);
      await handleUserInfo(result.data?.access_token);
      loginSuccess();
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doResend24h = async (
  params: ResendOtpParams,
): Promise<AxiosResponse<OtpResponse>> => {
  const response = await axiosInstance.post('user/otp/resend_otp', {
    phone: params.phone,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  return response;
};

export const doResend24hNewDevice = async (
  params: ResendOtpParams,
): Promise<AxiosResponse<OtpResponse>> => {
  const response = await axiosInstance.post('user/otpv1/resend', {
    phone: params.phone,
    type_otp: 'login_new_device',
  });
  return response;
};

export const doConfirmOtpResetPassword = async (
  params: VerifyOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/verify', {
    phone: params.phone,
    otp_code: params.otpCode,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    push_reg_id: params.pushRegId || null,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpDeleteMethods = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  onHandleDeleteMethods?: () => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otpv1/verify', {
    type_otp: 'remove_wallet',
    otp_code: params.otpCode,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      dispatch({
        type: 'otp/SET_STORE_VERIFY_TOKEN',
        payload: result.verify_token || Date.now().toString(),
      });
      onHandleDeleteMethods?.();
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpCancelMethods = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  onHandleCancelMethods?: () => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otpv1/verify', {
    type_otp: 'remove_auto_pay',
    otp_code: params.otpCode,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      dispatch({
        type: 'otp/SET_STORE_VERIFY_TOKEN',
        payload: result.verify_token || Date.now().toString(),
      });
      onHandleCancelMethods?.();
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpRegister = async (
  params: VerifyOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setVerifyContent: Dispatch<SetStateAction<VerifyContent>>, // Sửa kiểu ở đây
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/verify', {
    phone: params.phone,
    otp_code: params.otpCode,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    push_reg_id: params.pushRegId || null,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      setVerifyContent((prev: VerifyContent) => ({
        ...prev,
        content: result.msg || '',
      }));
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doRegister = async (
  params: ResendOtpParams,
  setPhone: (phone: string) => void,
  setVerifyContent: (content: VerifyContent) => void,
  handleCountDownResend: () => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/update_phone_otp', {
    phone: params.phone,
    email: params.email || '',
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  const result = response.data;
  setPhone(params.phone);
  switch (result.error_code) {
    case '0':
      setVerifyContent({
        title: 'Xác nhận OTP',
        content: `<p class="mess-content">Vui lòng nhập mã OTP được gửi qua tin nhắn SMS đến số điện thoại <span>${params.phone}</span></p>`,
        placeholder_input: 'Nhập mã OTP',
        button: [{ action: 'do_confirm_otp', content: 'Xác nhận' }],
        link_resent: [{ action: 'do_resend', content: 'Gửi lại' }],
      });
      handleCountDownResend();
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpChangePassword = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  openChangePasswordModal: () => void,
): Promise<void> => {
  const response = await axiosInstance.post('user/otp/verify', {
    phone: params.phone,
    otp_code: params.otpCode,
    country_code: params.countryCode || 'VN',
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    push_reg_id: params.pushRegId || null,
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      dispatch({
        type: 'otp/SET_STORE_VERIFY_TOKEN',
        payload: result.verify_token,
      });
      openChangePasswordModal();
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpDeleteAccount = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  onDoDeleteAccountNewFlow?: (data: { verify_token: string }) => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  const response = await axiosInstance.post('user/otpv1/verify', {
    otp_code: params.otpCode,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    type: 'delete_account',
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      dispatch({
        type: 'otp/SET_STORE_VERIFY_TOKEN',
        payload: result.verify_token,
      });
      onDoDeleteAccountNewFlow?.({
        verify_token: result.verify_token,
      });
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpLoginChangePass = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  const response = await axiosInstance.post('user/otpv1/verify', {
    otp_code: params.otpCode,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    type_otp: 'login_change_pass',
  });
  const result = response.data;
  switch (result.error_code) {
    case '0':
      dispatch({
        type: 'otp/SET_STORE_VERIFY_TOKEN',
        payload: result.verify_token || Date.now().toString(),
      });
      break;
    case '7':
    case '8':
      setHandleWrongOtpMsg(
        result.msg || 'Mã OTP không chính xác, vui lòng thử lại.',
      );
      break;
    default:
      throw new Error(result.msg || 'Unknown error');
  }
};

export const doConfirmOtpForgetManagementCode = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setIsDisableButtonConfirm: (value: boolean) => void,
  openNoticeModal: (options: {
    title: string;
    content: string;
    isReload?: boolean;
  }) => void,
  openChangePasswordModal: () => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/verify', {
      otp_code: params.otpCode,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE,
      phone: params.phone,
    });
    const result: ApiResponseData = response.data;
    switch (result.error_code) {
      case '0':
        dispatch(setVerifyToken(result.data?.verify_token || ''));
        openChangePasswordModal();
        break;
      case '2':
        setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
        setIsDisableButtonConfirm(true);
        setTimeout(
          () => setIsDisableButtonConfirm(false),
          Number(result.data?.seconds) * 1000,
        );
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title || 'Thông báo',
          content: result.msg || DEFAULT_ERROR_MSG,
          isReload: window.location.pathname !== '/tai-khoan/multi-profiles',
        });
        break;
      default:
        setHandleWrongOtpMsg(result.msg || DEFAULT_ERROR_MSG);
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
              setIsDisableButtonConfirm(true);
              setTimeout(
                () => setIsDisableButtonConfirm(false),
                Number(apiError.response.data?.data?.seconds) * 1000,
              );
              break;
            default:
              setHandleWrongOtpMsg(DEFAULT_ERROR_MSG);
          }
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }
    } else {
      showToast({
        title: ERROR_UNKNOW,
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doConfirmOtpChangeManagementCode = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setIsDisableButtonConfirm: (value: boolean) => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  handleOtpChangeManagementCodeSuccess: () => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/verify', {
      otp_code: params.otpCode,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE,
      phone: params.phone,
    });
    const result = response.data;
    switch (result.error_code) {
      case '0':
        dispatch(setStoreVerifyToken(result?.data?.verify_token || ''));
        handleOtpChangeManagementCodeSuccess();
        break;
      case '2':
        setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
        setIsDisableButtonConfirm(true);
        setTimeout(
          () => setIsDisableButtonConfirm(false),
          Number(result.data?.seconds) * 1000,
        );
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        setHandleWrongOtpMsg(result.msg || DEFAULT_ERROR_MSG);
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
              setIsDisableButtonConfirm(true);
              setTimeout(
                () => setIsDisableButtonConfirm(false),
                Number(apiError.response.data?.data?.seconds) * 1000,
              );
              break;
            default:
              setHandleWrongOtpMsg(DEFAULT_ERROR_MSG);
          }
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doConfirmOtpDeletePaymentMethod = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setIsDisableButtonConfirm: (value: boolean) => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  onHandleDeleteMethods?: () => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/verify', {
      otp_code: params.otpCode,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.DELETE_PAYMENT_METHOD,
      phone: params.phone,
    });
    const result = response.data;
    switch (result.error_code) {
      case '0':
        dispatch({
          type: 'otp/SET_STORE_VERIFY_TOKEN',
          payload: result.data?.verify_token,
        });
        onHandleDeleteMethods?.();
        break;
      case '2':
        setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
        setIsDisableButtonConfirm(true);
        setTimeout(
          () => setIsDisableButtonConfirm(false),
          Number(result.data?.seconds) * 1000,
        );
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        setHandleWrongOtpMsg(result.msg || DEFAULT_ERROR_MSG);
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
              setIsDisableButtonConfirm(true);
              setTimeout(
                () => setIsDisableButtonConfirm(false),
                Number(apiError.response.data?.data?.seconds) * 1000,
              );
              break;
            default:
              setHandleWrongOtpMsg(DEFAULT_ERROR_MSG);
          }
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doConfirmOtpDeleteAutoExtend = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setIsDisableButtonConfirm: (value: boolean) => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  onHandleCancelMethods?: () => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/verify', {
      otp_code: params.otpCode,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.DELETE_AUTO_EXTEND,
      phone: params.phone,
    });
    const result: ApiResponseData = response.data;
    switch (result.error_code) {
      case '0':
        await dispatch(setVerifyToken(result?.data?.verify_token || ''));
        onHandleCancelMethods?.();
        break;
      case '2':
        setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
        setIsDisableButtonConfirm(true);
        setTimeout(
          () => setIsDisableButtonConfirm(false),
          Number(result.data?.seconds) * 1000,
        );
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title || 'Thông báo',
          content: result.msg || DEFAULT_ERROR_MSG,
        });
        break;
      default:
        setHandleWrongOtpMsg(result.msg || DEFAULT_ERROR_MSG);
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
              setIsDisableButtonConfirm(true);
              setTimeout(
                () => setIsDisableButtonConfirm(false),
                Number(apiError.response.data?.data?.seconds) * 1000,
              );
              break;
            default:
              setHandleWrongOtpMsg(DEFAULT_ERROR_MSG);
          }
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doConfirmOtpDeleteAccountNewFlow = async (
  params: VerifyOtpParams,
  dispatch: AppDispatch,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setIsDisableButtonConfirm: (value: boolean) => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  onDoDeleteAccountNewFlow?: (data: { verify_token: string }) => void,
): Promise<void> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/verify', {
      otp_code: params.otpCode,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.DELETE_ACCOUNT,
      phone: params.phone,
    });
    const result = response.data;
    switch (result.error_code) {
      case '0':
        dispatch({
          type: 'otp/SET_STORE_VERIFY_TOKEN',
          payload: result.data?.verify_token,
        });
        onDoDeleteAccountNewFlow?.({
          verify_token: result.data?.verify_token,
        });
        break;
      case '2':
        setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
        setIsDisableButtonConfirm(true);
        setTimeout(
          () => setIsDisableButtonConfirm(false),
          Number(result.data?.seconds) * 1000,
        );
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        setHandleWrongOtpMsg(result.msg || DEFAULT_ERROR_MSG);
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              setHandleWrongOtpMsg(COUNT_DOWN_MESSAGE);
              setIsDisableButtonConfirm(true);
              setTimeout(
                () => setIsDisableButtonConfirm(false),
                Number(apiError.response.data?.data?.seconds) * 1000,
              );
              break;
            default:
              setHandleWrongOtpMsg(DEFAULT_ERROR_MSG);
          }
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doResendOtpDeleteAccount = async (
  params: ResendOtpParams,
): Promise<AxiosResponse<OtpResponse>> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return {} as AxiosResponse<OtpResponse>;
  }
  const response = await axiosInstance.post('user/otpv1/resend', {
    phone: params.phone,
    type_otp: 'delete_account',
  });
  return response;
};

export const doResendOtpLoginChangePass = async (
  params: ResendOtpParams,
  setForm: (form: { verify_input: string }) => void,
  focusInput: () => void,
): Promise<AxiosResponse<OtpResponse>> => {
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return {} as AxiosResponse<OtpResponse>;
  }
  const response = await axiosInstance.post('user/otpv1/resend', {
    phone: params.phone,
    client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
    type_otp: 'login_change_pass',
  });
  if (response.data.error_code === '0') {
    setForm({ verify_input: '' });
    focusInput();
  }
  return response;
};

export const doResendOtpForgetManagementCode = async (
  params: ResendOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setForm: (form: { verify_input: string }) => void,
  setVerifyContent: Dispatch<SetStateAction<VerifyContent>>,
  handleCountDownResend: (options: { seconds?: number }) => void,
  focusInput: () => void,
  openNoticeModal: (options: {
    title: string;
    content: string;
    isReload?: boolean;
  }) => void,
  changeHintText: () => void,
): Promise<void> => {
  setHandleWrongOtpMsg('');
  setForm({ verify_input: '' });
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/resend_otp', {
      phone: params.phone,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE,
    });
    const result = response.data;
    const convertMsg = (data: {
      msg: string;
      text_format?: { text: string }[];
    }) => {
      let msg = data.msg;
      data.text_format?.forEach((format) => {
        msg = msg.replace(format.text, `<b>${format.text}</b>`);
      });
      return msg;
    };
    switch (result.error_code) {
      case '0':
        setVerifyContent((prev: VerifyContent) => ({
          ...prev,
          content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">${convertMsg(
            {
              msg: result.msg || '',
              text_format: result.data?.text_format || [],
            },
          )}</div></div>`,
        }));
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        focusInput();
        break;
      case '2':
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: COUNT_DOWN_MESSAGE,
        });
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
          isReload: window.location.pathname !== '/tai-khoan/multi-profiles',
        });
        break;
      default:
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: result.msg || SENT_OTP_MESSAGE,
        });
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError?.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: COUNT_DOWN_MESSAGE,
              });
              handleCountDownResend({
                seconds: Number(apiError.response.data?.data?.seconds),
              });
              break;
            default:
              changeHintText();
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: apiError.response.data?.msg || SENT_OTP_MESSAGE,
              });
          }
        }
      } else {
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doResendOtpDeleteAccountNewFlow = async (
  params: ResendOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setForm: (form: { verify_input: string }) => void,
  setVerifyContent: Dispatch<SetStateAction<VerifyContent>>,
  handleCountDownResend: (options: { seconds?: number }) => void,
  focusInput: () => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  changeHintText: () => void,
): Promise<void> => {
  setHandleWrongOtpMsg('');
  setForm({ verify_input: '' });
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/resend_otp', {
      phone: params.phone,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.DELETE_ACCOUNT,
    });
    const result = response.data;
    const convertMsg = (data: {
      msg: string;
      text_format?: { text: string }[];
    }) => {
      let msg = data.msg;
      data.text_format?.forEach((format) => {
        msg = msg.replace(format.text, `<b>${format.text}</b>`);
      });
      return msg;
    };
    switch (result.error_code) {
      case '0':
        setVerifyContent((prev: VerifyContent) => ({
          ...prev,
          content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">${convertMsg(
            {
              msg: result.msg || '',
              text_format: result.data?.text_format || [],
            },
          )}</div></div>`,
        }));
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        focusInput();
        break;
      case '2':
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: COUNT_DOWN_MESSAGE,
        });
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: result.msg || SENT_OTP_MESSAGE,
        });
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError?.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: COUNT_DOWN_MESSAGE,
              });
              handleCountDownResend({
                seconds: Number(apiError.response.data?.data?.seconds),
              });
              break;
            default:
              changeHintText();
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: apiError.response.data?.msg || SENT_OTP_MESSAGE,
              });
          }
        }
      } else {
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doResendOtpChangeManagementCode = async (
  params: ResendOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setForm: (form: { verify_input: string }) => void,
  setVerifyContent: Dispatch<SetStateAction<VerifyContent>>,
  handleCountDownResend: (options: { seconds?: number }) => void,
  focusInput: () => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  changeHintText: () => void,
): Promise<void> => {
  setHandleWrongOtpMsg('');
  setForm({ verify_input: '' });
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/resend_otp', {
      phone: params.phone,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE,
    });
    const result = response.data;
    const convertMsg = (data: {
      msg: string;
      text_format?: { text: string }[];
    }) => {
      let msg = data.msg;
      data.text_format?.forEach((format) => {
        msg = msg.replace(format.text, `<b>${format.text}</b>`);
      });
      return msg;
    };
    switch (result.error_code) {
      case '0':
        setVerifyContent((prev: VerifyContent) => ({
          ...prev,
          content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">${convertMsg(
            {
              msg: result.msg || '',
              text_format: result.data?.text_format || [],
            },
          )}</div></div>`,
        }));
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        focusInput();
        break;
      case '2':
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: COUNT_DOWN_MESSAGE,
        });
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: result.msg || SENT_OTP_MESSAGE,
        });
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError?.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: COUNT_DOWN_MESSAGE,
              });
              handleCountDownResend({
                seconds: Number(apiError.response.data?.data?.seconds),
              });
              break;
            default:
              changeHintText();
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: apiError.response.data?.msg || SENT_OTP_MESSAGE,
              });
          }
        }
      } else {
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doResendOtpDeletePaymentMethod = async (
  params: ResendOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setForm: (form: { verify_input: string }) => void,
  setVerifyContent: Dispatch<SetStateAction<VerifyContent>>,
  handleCountDownResend: (options: { seconds?: number }) => void,
  focusInput: () => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  changeHintText: () => void,
): Promise<void> => {
  setHandleWrongOtpMsg('');
  setForm({ verify_input: '' });
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/resend_otp', {
      phone: params.phone,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.DELETE_PAYMENT_METHOD,
    });
    const result = response.data;
    const convertMsg = (data: {
      msg: string;
      text_format?: { text: string }[];
    }) => {
      let msg = data.msg;
      data.text_format?.forEach((format) => {
        msg = msg.replace(format.text, `<b>${format.text}</b>`);
      });
      return msg;
    };
    switch (result.error_code) {
      case '0':
        setVerifyContent((prev: VerifyContent) => ({
          ...prev,
          content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">${convertMsg(
            {
              msg: result.msg || '',
              text_format: result.data?.text_format || [],
            },
          )}</div></div>`,
        }));
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        focusInput();
        break;
      case '2':
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: COUNT_DOWN_MESSAGE,
        });
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: result.msg || SENT_OTP_MESSAGE,
        });
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError?.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: COUNT_DOWN_MESSAGE,
              });
              handleCountDownResend({
                seconds: Number(apiError.response.data?.data?.seconds),
              });
              break;
            default:
              changeHintText();
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: apiError.response.data?.msg || SENT_OTP_MESSAGE,
              });
          }
        }
      } else {
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};

export const doResendOtpDeleteAutoExtend = async (
  params: ResendOtpParams,
  setHandleWrongOtpMsg: (msg: string | null) => void,
  setForm: (form: { verify_input: string }) => void,
  setVerifyContent: Dispatch<SetStateAction<VerifyContent>>,
  handleCountDownResend: (options: { seconds?: number }) => void,
  focusInput: () => void,
  openNoticeModal: (options: { title: string; content: string }) => void,
  changeHintText: () => void,
): Promise<void> => {
  setHandleWrongOtpMsg('');
  setForm({ verify_input: '' });
  const isLogged = !!localStorage.getItem('token');
  if (!isLogged) {
    window.location.reload();
    return;
  }
  try {
    const response = await axiosInstance.post('account/otp/resend_otp', {
      phone: params.phone,
      client_id: params.clientId || process.env.NEXT_PUBLIC_CLIENT_ID,
      type_otp: SEND_OTP_TYPES.DELETE_AUTO_EXTEND,
    });
    const result = response.data;
    const convertMsg = (data: {
      msg: string;
      text_format?: { text: string }[];
    }) => {
      let msg = data.msg;
      data.text_format?.forEach((format) => {
        msg = msg.replace(format.text, `<b>${format.text}</b>`);
      });
      return msg;
    };

    switch (result.error_code) {
      case '0':
        setVerifyContent((prev: VerifyContent) => ({
          ...prev,
          content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">${convertMsg(
            {
              msg: result.msg || '',
              text_format: result.data?.text_format || [],
            },
          )}</div></div>`,
        }));
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        focusInput();
        break;
      case '2':
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: COUNT_DOWN_MESSAGE,
        });
        handleCountDownResend({
          seconds: Number(result.data?.seconds),
        });
        break;
      case '9':
        openNoticeModal({
          title: result.data?.title,
          content: result.msg,
        });
        break;
      default:
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: result.msg || SENT_OTP_MESSAGE,
        });
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<{
        error_code?: string;
        msg?: string;
        data?: {
          seconds?: string;
          title?: string;
        };
      }>;
      if (apiError?.response?.data) {
        if (apiError.response.status === 401) {
          // Implement requireLogin
        } else {
          switch (apiError.response.data.error_code) {
            case '2':
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: COUNT_DOWN_MESSAGE,
              });
              handleCountDownResend({
                seconds: Number(apiError.response.data?.data?.seconds),
              });
              break;
            default:
              changeHintText();
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: apiError.response.data?.msg || SENT_OTP_MESSAGE,
              });
          }
        }
      } else {
        changeHintText();
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }
    } else {
      showToast({
        title: 'Lỗi không xác định',
        desc: HAVING_ERROR,
      });
    }
  }
};
