import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { showToast } from '@/lib/utils/globalToast';
import {
  doResend,
  doResendPayment,
  doResendWallet,
  doConfirmOtp,
  doConfirmOtpSso,
  doConfirmOtp24h,
  doConfirmOtp24hNewDevice,
  doResend24h,
  doResend24hNewDevice,
  doConfirmOtpResetPassword,
  doConfirmOtpDeleteMethods,
  doConfirmOtpCancelMethods,
  doConfirmOtpRegister,
  doRegister,
  doConfirmOtpChangePassword,
  doConfirmOtpDeleteAccount,
  doConfirmOtpLoginChangePass,
  doConfirmOtpForgetManagementCode,
  doConfirmOtpChangeManagementCode,
  doConfirmOtpDeletePaymentMethod,
  doConfirmOtpDeleteAutoExtend,
  doConfirmOtpDeleteAccountNewFlow,
  doResendOtpDeleteAccount,
  doResendOtpLoginChangePass,
  doResendOtpForgetManagementCode,
  doResendOtpDeleteAccountNewFlow,
  doResendOtpChangeManagementCode,
  doResendOtpDeletePaymentMethod,
  doResendOtpDeleteAutoExtend,
  VerifyOtpParams,
  ResendOtpParams,
  VerifyContent,
} from '@/lib/api/verify'; // Giả định các hàm và interface được export từ otpApi.ts
import { AppDispatch } from '@/lib/store';
import {
  COUNT_DOWN_MESSAGE,
  DEFAULT_ERROR_MSG,
  TITLE_SEND_OTP_FAIL,
  SENT_OTP_MESSAGE,
  ERROR_CONNECTION,
  HAVING_ERROR,
  ERROR_UNKNOW,
  WRONG_OTP,
} from '@/lib/constant/texts';

// Định nghĩa kiểu cho các tham số tùy chọn của hook
interface UseOtpOptions {
  handleUserInfo?: (token: string) => Promise<void>;
  loginSuccess?: () => void;
  openChangePasswordModal?: () => void;
  onHandleDeleteMethods?: () => void;
  onHandleCancelMethods?: () => void;
  openChangeManagementCode?: () => void;
  onDoDeleteAccountNewFlow?: (data: { verify_token: string }) => void;
  openNoticeModal?: (options: {
    title: string;
    content: string;
    isReload?: boolean;
  }) => void;
  changeHintText?: () => void;
  focusInput?: () => void;
  handleCountDownResend?: (options: { seconds?: number }) => void;
  handleOtpChangeManagementCodeSuccess?: () => void;
}

// Custom Hook
export const useOtp = (options: UseOtpOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [wrongOtpMsg, setWrongOtpMsg] = useState<string | null>(null);
  const [verifyContent, setVerifyContent] = useState<VerifyContent>({});
  const [isDisableButtonConfirm, setIsDisableButtonConfirm] = useState(false);
  const [form, setForm] = useState<{ verify_input: string }>({
    verify_input: '',
  });

  const {
    handleUserInfo,
    loginSuccess,
    openChangePasswordModal,
    onHandleDeleteMethods,
    onHandleCancelMethods,
    onDoDeleteAccountNewFlow,
    openNoticeModal,
    openChangeManagementCode,
    changeHintText,
    focusInput,
    handleCountDownResend,
    handleOtpChangeManagementCodeSuccess,
  } = options;

  // Xử lý lỗi chung
  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof AxiosError) {
        const apiError = error as AxiosError<{
          error_code?: string;
          msg?: string;
          data?: { seconds?: string; title?: string };
        }>;
        if (apiError.response?.data) {
          if (apiError.response.status === 401) {
            // Implement requireLogin
            window.location.reload();
          } else {
            switch (apiError.response.data.error_code) {
              case '0':
              case '2':
                setWrongOtpMsg(COUNT_DOWN_MESSAGE);
                setIsDisableButtonConfirm(true);
                setTimeout(
                  () => setIsDisableButtonConfirm(false),
                  Number(apiError.response.data?.data?.seconds) * 1000,
                );
                handleCountDownResend?.({
                  seconds: Number(apiError.response.data?.data?.seconds),
                });
                break;
              case '7':
              case '8':
                setWrongOtpMsg(apiError.response.data?.msg || WRONG_OTP);
                break;
              default:
                setWrongOtpMsg(
                  apiError.response.data?.msg || DEFAULT_ERROR_MSG,
                );
                showToast({
                  title: TITLE_SEND_OTP_FAIL,
                  desc: apiError.response.data?.msg || SENT_OTP_MESSAGE,
                });
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
    },
    [handleCountDownResend],
  );

  // Các hàm resend OTP
  const wrappedDoResend = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResend(params);
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoResendPayment = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResendPayment(params);
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoResendWallet = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResendWallet(params);
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoResend24h = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResend24h(params);
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoResend24hNewDevice = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResend24hNewDevice(params);
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoResendOtpDeleteAccount = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResendOtpDeleteAccount(params);
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoResendOtpLoginChangePass = useCallback(
    async (params: ResendOtpParams) => {
      try {
        const response = await doResendOtpLoginChangePass(
          params,
          setForm,
          focusInput ?? (() => {}),
        );
        return response;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusInput],
  );

  const wrappedDoResendOtpForgetManagementCode = useCallback(
    async (params: ResendOtpParams) => {
      try {
        await doResendOtpForgetManagementCode(
          params,
          setWrongOtpMsg,
          setForm,
          setVerifyContent,
          handleCountDownResend ?? (() => {}),
          focusInput ?? (() => {}),
          openNoticeModal ?? (() => {}),
          changeHintText ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCountDownResend, focusInput, openNoticeModal, changeHintText],
  );

  const wrappedDoResendOtpDeleteAccountNewFlow = useCallback(
    async (params: ResendOtpParams) => {
      try {
        await doResendOtpDeleteAccountNewFlow(
          params,
          setWrongOtpMsg,
          setForm,
          setVerifyContent,
          handleCountDownResend ?? (() => {}),
          focusInput ?? (() => {}),
          openNoticeModal ?? (() => {}),
          changeHintText ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCountDownResend, focusInput, openNoticeModal, changeHintText],
  );

  const wrappedDoResendOtpChangeManagementCode = useCallback(
    async (params: ResendOtpParams) => {
      try {
        await doResendOtpChangeManagementCode(
          params,
          setWrongOtpMsg,
          setForm,
          setVerifyContent,
          handleCountDownResend ?? (() => {}),
          focusInput ?? (() => {}),
          openNoticeModal ?? (() => {}),
          changeHintText ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCountDownResend, focusInput, openNoticeModal, changeHintText],
  );

  const wrappedDoResendOtpDeletePaymentMethod = useCallback(
    async (params: ResendOtpParams) => {
      try {
        await doResendOtpDeletePaymentMethod(
          params,
          setWrongOtpMsg,
          setForm,
          setVerifyContent,
          handleCountDownResend ?? (() => {}),
          focusInput ?? (() => {}),
          openNoticeModal ?? (() => {}),
          changeHintText ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCountDownResend, focusInput, openNoticeModal, changeHintText],
  );

  const wrappedDoResendOtpDeleteAutoExtend = useCallback(
    async (params: ResendOtpParams) => {
      try {
        await doResendOtpDeleteAutoExtend(
          params,
          setWrongOtpMsg,
          setForm,
          setVerifyContent,
          handleCountDownResend ?? (() => {}),
          focusInput ?? (() => {}),
          openNoticeModal ?? (() => {}),
          changeHintText ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCountDownResend, focusInput, openNoticeModal, changeHintText],
  );

  // Các hàm xác minh OTP
  const wrappedDoConfirmOtp = useCallback(
    async (
      params: VerifyOtpParams,
      setIsRegister: (value: boolean) => void,
    ) => {
      try {
        if (!handleUserInfo) {
          setWrongOtpMsg('handleUserInfo is required for OTP confirmation');
          return;
        }
        await doConfirmOtp(
          params,
          dispatch,
          setWrongOtpMsg,
          handleUserInfo,
          loginSuccess ?? (() => {}),
          setIsRegister,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleUserInfo, loginSuccess],
  );

  const wrappedDoConfirmOtpSso = useCallback(
    async (
      params: VerifyOtpParams,
      setIsRegister: (value: boolean) => void,
    ) => {
      try {
        if (!handleUserInfo) {
          setWrongOtpMsg('handleUserInfo is required for OTP confirmation');
          return;
        }
        await doConfirmOtpSso(
          params,
          dispatch,
          setWrongOtpMsg,
          handleUserInfo,
          loginSuccess ?? (() => {}),
          setIsRegister,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleUserInfo, loginSuccess],
  );

  const wrappedDoConfirmOtp24h = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        if (!handleUserInfo) {
          setWrongOtpMsg('handleUserInfo is required for OTP confirmation');
          return;
        }
        await doConfirmOtp24h(
          params,
          dispatch,
          setWrongOtpMsg,
          handleUserInfo,
          loginSuccess ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleUserInfo, loginSuccess],
  );

  const wrappedDoConfirmOtp24hNewDevice = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        if (!handleUserInfo) {
          setWrongOtpMsg('handleUserInfo is required for OTP confirmation');
          return;
        }
        await doConfirmOtp24hNewDevice(
          params,
          dispatch,
          setWrongOtpMsg,
          handleUserInfo,
          loginSuccess ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleUserInfo, loginSuccess],
  );

  const wrappedDoConfirmOtpResetPassword = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpResetPassword(params, setWrongOtpMsg);
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoConfirmOtpDeleteMethods = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpDeleteMethods(
          params,
          dispatch,
          setWrongOtpMsg,
          onHandleDeleteMethods,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onHandleDeleteMethods],
  );

  const wrappedDoConfirmOtpCancelMethods = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpCancelMethods(
          params,
          dispatch,
          setWrongOtpMsg,
          onHandleCancelMethods,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onHandleCancelMethods],
  );

  const wrappedDoConfirmOtpRegister = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpRegister(params, setWrongOtpMsg, setVerifyContent);
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoRegister = useCallback(
    async (params: ResendOtpParams, setPhone: (phone: string) => void) => {
      try {
        const safeHandleCountDownResend = () => {
          handleCountDownResend?.({ seconds: undefined });
        };
        await doRegister(
          params,
          setPhone,
          setVerifyContent,
          safeHandleCountDownResend,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCountDownResend],
  );

  const wrappedDoConfirmOtpChangePassword = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpChangePassword(
          params,
          dispatch,
          setWrongOtpMsg,
          openChangePasswordModal ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openChangePasswordModal],
  );

  const wrappedDoConfirmOtpDeleteAccount = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpDeleteAccount(
          params,
          dispatch,
          setWrongOtpMsg,
          onDoDeleteAccountNewFlow,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onDoDeleteAccountNewFlow],
  );

  const wrappedDoConfirmOtpLoginChangePass = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpLoginChangePass(params, dispatch, setWrongOtpMsg);
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wrappedDoConfirmOtpForgetManagementCode = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpForgetManagementCode(
          params,
          dispatch,
          setWrongOtpMsg,
          setIsDisableButtonConfirm,
          openNoticeModal ?? (() => {}),
          openChangeManagementCode ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openNoticeModal],
  );

  const wrappedDoConfirmOtpChangeManagementCode = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpChangeManagementCode(
          params,
          dispatch,
          setWrongOtpMsg,
          setIsDisableButtonConfirm,
          openNoticeModal ?? (() => {}),
          handleOtpChangeManagementCodeSuccess ?? (() => {}),
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openNoticeModal],
  );

  const wrappedDoConfirmOtpDeletePaymentMethod = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpDeletePaymentMethod(
          params,
          dispatch,
          setWrongOtpMsg,
          setIsDisableButtonConfirm,
          openNoticeModal ?? (() => {}),
          onHandleDeleteMethods,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openNoticeModal, onHandleDeleteMethods],
  );

  const wrappedDoConfirmOtpDeleteAutoExtend = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpDeleteAutoExtend(
          params,
          dispatch,
          setWrongOtpMsg,
          setIsDisableButtonConfirm,
          openNoticeModal ?? (() => {}),
          onHandleCancelMethods,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openNoticeModal, onHandleCancelMethods],
  );

  const wrappedDoConfirmOtpDeleteAccountNewFlow = useCallback(
    async (params: VerifyOtpParams) => {
      try {
        await doConfirmOtpDeleteAccountNewFlow(
          params,
          dispatch,
          setWrongOtpMsg,
          setIsDisableButtonConfirm,
          openNoticeModal ?? (() => {}),
          onDoDeleteAccountNewFlow,
        );
      } catch (error) {
        handleError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openNoticeModal, onDoDeleteAccountNewFlow],
  );

  return {
    wrongOtpMsg,
    setWrongOtpMsg,
    verifyContent,
    setVerifyContent,
    isDisableButtonConfirm,
    setIsDisableButtonConfirm,
    form,
    setForm,
    doResend: wrappedDoResend,
    doResendPayment: wrappedDoResendPayment,
    doResendWallet: wrappedDoResendWallet,
    doResend24h: wrappedDoResend24h,
    doResend24hNewDevice: wrappedDoResend24hNewDevice,
    doResendOtpDeleteAccount: wrappedDoResendOtpDeleteAccount,
    doResendOtpLoginChangePass: wrappedDoResendOtpLoginChangePass,
    doResendOtpForgetManagementCode: wrappedDoResendOtpForgetManagementCode,
    doResendOtpDeleteAccountNewFlow: wrappedDoResendOtpDeleteAccountNewFlow,
    doResendOtpChangeManagementCode: wrappedDoResendOtpChangeManagementCode,
    doResendOtpDeletePaymentMethod: wrappedDoResendOtpDeletePaymentMethod,
    doResendOtpDeleteAutoExtend: wrappedDoResendOtpDeleteAutoExtend,
    doConfirmOtp: wrappedDoConfirmOtp,
    doConfirmOtpSso: wrappedDoConfirmOtpSso,
    doConfirmOtp24h: wrappedDoConfirmOtp24h,
    doConfirmOtp24hNewDevice: wrappedDoConfirmOtp24hNewDevice,
    doConfirmOtpResetPassword: wrappedDoConfirmOtpResetPassword,
    doConfirmOtpDeleteMethods: wrappedDoConfirmOtpDeleteMethods,
    doConfirmOtpCancelMethods: wrappedDoConfirmOtpCancelMethods,
    doConfirmOtpRegister: wrappedDoConfirmOtpRegister,
    doRegister: wrappedDoRegister,
    doConfirmOtpChangePassword: wrappedDoConfirmOtpChangePassword,
    doConfirmOtpDeleteAccount: wrappedDoConfirmOtpDeleteAccount,
    doConfirmOtpLoginChangePass: wrappedDoConfirmOtpLoginChangePass,
    doConfirmOtpForgetManagementCode: wrappedDoConfirmOtpForgetManagementCode,
    doConfirmOtpChangeManagementCode: wrappedDoConfirmOtpChangeManagementCode,
    doConfirmOtpDeletePaymentMethod: wrappedDoConfirmOtpDeletePaymentMethod,
    doConfirmOtpDeleteAutoExtend: wrappedDoConfirmOtpDeleteAutoExtend,
    doConfirmOtpDeleteAccountNewFlow: wrappedDoConfirmOtpDeleteAccountNewFlow,
  };
};
