/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
  onDevicesLimitResponse,
  onLogin3rdResponse,
} from './../../api/login/index';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '@/lib/components/container/AppContainer';
import {
  verifyUserWithPhoneNumber,
  verifyUserWithPhoneNumberResponse,
  onSendOTP,
  onSendOTPResponse,
  onResendOTP,
  onSubmitVerifyOTPResponse,
  onSubmitVerifyOTP,
  onLogin,
  getDevicesLimit,
  removeDevicesLimit,
} from '@/lib/api/login';
import { showToast } from '@/lib/utils/globalToast';
import axios from 'axios';
import {
  DEFAULT_ERROR_MSG,
  TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
  TITLE_SEND_OTP_FAIL,
  SERVICE_CONNECTION_FAILED_MESSAGE,
  TITLE_SYSTEM_ERROR,
  ERROR_OCCURRED_MESSAGE,
  INVALID_PHONE_MESSAGE,
  TITLE_SERVICE_ERROR,
} from '@/lib/constant/errors';
import { onLoginSuccess } from '../../utils/loginSuccessHandlers/onLoginSuccess';
import { handleUserInfo } from '../../utils/loginSuccessHandlers/handleUserInfo';
import { closeLoginModal, setVerifyToken } from '@/lib/store/slices/loginSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  CONFIRM_BUTTON_TEXT,
  CONTINUE_BUTTON_TEXT,
  EXIT_BUTTON_TEXT,
  LOGIN_PHONE_NUMBER,
  PATH_BEFORE_LOGIN_SSO,
  RETRY_BUTTON_TEXT,
  TYPE_LOGIN,
  UNDERSTOOD_BUTTON_TEXT,
  CLOSE_LOGIN_MODAL_NOW,
} from '@/lib/constant/texts';
import { Oidc } from '@/lib/oidc';
import { store } from '@/lib/store';
import { scaleImageUrl } from '@/lib/utils/methods';
import { resetLoginFlow } from '@/lib/store/slices/loginFlowSlice';
import {
  trackingCancelLoginLog145,
  trackingGetStatusConfigLog146,
  trackingLoginMethodLog144,
} from '@/lib/tracking/trackingLogin';
import useScreenSize from '@/lib/hooks/useScreenSize';

// --- Types ---
type LoginStep = 'phone' | 'otp' | 'notification' | 'deviceLimit';

type NotificationInput = Partial<{
  data?: {
    title?: string;
  };
  title?: string;
  msg?: string;
  buttons?: {
    accept?: string;
    cancel?: string;
  };
  action_callback?: boolean;
}>;

// --- Helpers ---
function buildNotificationContent(res?: NotificationInput) {
  return {
    title: res?.title || res?.data?.title || 'Thông báo',
    content: res?.msg || ERROR_OCCURRED_MESSAGE,
    buttons: {
      accept: res?.buttons?.accept || EXIT_BUTTON_TEXT,
      cancel: res?.buttons?.cancel || '',
    },
    action_callback: res?.action_callback ?? false,
  };
}

// --- Hook ---
export function useLoginAPI({}: { visible: boolean; onClose: () => void }) {
  // State --------------------
  const dispatch = useDispatch();
  const storeVerifyToken = useSelector(
    (state: RootState) => state.loginSlice.storeVerifyToken,
  );
  const [step, setStep] = useState<LoginStep>('phone');

  // Phone --------------------
  const [resPhoneInput, setPhoneInput] = useState<
    verifyUserWithPhoneNumberResponse['data'] | null
  >(null);
  const [errorPhone, setErrorPhone] = useState('');
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // Otp --------------------
  const [resSendOTP, setResponseSendOTP] = useState<onSendOTPResponse | null>(
    null,
  );
  const [resVerifyOTP, setResVerifyOTP] =
    useState<onSubmitVerifyOTPResponse | null>(null);
  const [errorOtp, setErrorOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Noti --------------------
  const [notificationContent, setNotificationContent] =
    useState<NotificationInput | null>(null);

  // Devices Limit --------------------
  const [deviceLimitData, setDeviceLimitData] =
    useState<onDevicesLimitResponse | null>(null);
  const [reloadDeviceLimit, setReloadDeviceLimit] = useState(false);

  // Base --------------------
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isHidden] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const { configs } = useContext(AppContext);
  const { width } = useScreenSize();
  // Check if user is mobile
  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  // --- Effects ---
  useEffect(() => {
    if (configs?.image?.bg_signin_signup_tv) {
      const url = scaleImageUrl({
        imageUrl: configs.image.bg_signin_signup_tv,
        width: isTablet ? width : 1080,
      });
      if (url) setBackgroundImage(url as string);
    }
  }, [isTablet, configs]);

  useEffect(() => {
    setShowBack(
      step !== 'phone' && step !== 'notification' && step !== 'deviceLimit',
    );
  }, [step]);

  // --- Navigation ---
  const goToStep = useCallback((next: LoginStep) => setStep(next), []);

  const reset = useMemo(
    () => ({
      phone: () => {
        setErrorPhone('');
        setResponseSendOTP(null);
        setResVerifyOTP(null);
        setErrorOtp('');
        setNotificationContent(null);
      },
      otp: () => {
        setResponseSendOTP(null);
        setErrorOtp('');
      },
      verify: () => {
        setResVerifyOTP(null);
        setErrorOtp('');
      },
    }),
    [],
  );

  const getStateVisible = () => {
    const state = store.getState();
    const userState = state.loginSlice.visible;
    return userState;
  };

  const isVisible = getStateVisible();

  useEffect(() => {
    if (!isVisible) {
      reset.phone();
      reset.otp();
      reset.verify();
    }
  }, [isVisible, reset]);

  const resetToPhoneState = useCallback(() => {
    setStep('phone');
    setPhoneInput(null);
    setResponseSendOTP(null);
    setErrorPhone('');
    setErrorOtp('');
    reset.phone();
    reset.otp();
    reset.verify();
  }, [reset]);

  const showNotificationModal = useCallback(
    (res?: NotificationInput) => {
      resetToPhoneState();
      setNotificationContent(buildNotificationContent(res));
      setStep('notification');
    },
    [resetToPhoneState],
  );

  const handleLoginFID = useCallback(async (phone: string) => {
    try {
      const oidc = new Oidc({ phoneNumber: phone });
      await oidc.loginWithOidc();
      trackingGetStatusConfigLog146({});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      let fallback = SERVICE_CONNECTION_FAILED_MESSAGE;
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        fallback =
          data?.data?.errors ||
          data?.msg ||
          data?.message ||
          data?.detail ||
          fallback;
      }
      showToast({ title: TITLE_SYSTEM_ERROR, desc: fallback, timeout: 5000 });
      trackingGetStatusConfigLog146({ ErrMessage: err?.message || '' });
    }
  }, []);

  // --- Actions ---

  const cleanupLogin = useCallback(() => {
    dispatch(resetLoginFlow());
  }, [dispatch]);

  const onSubmitPhone = useCallback(
    async (phone: string) => {
      setErrorPhone('');
      try {
        reset.phone(); // reset

        const res = await verifyUserWithPhoneNumber({
          phone,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
          type: 'login_fpl',
        });

        const { error_code, data, msg } =
          res.data as verifyUserWithPhoneNumberResponse;

        // handle to set TYPE_LOGIN
        if (data?.login_type) {
          localStorage.setItem(TYPE_LOGIN, data?.login_type);
        }
        trackingLoginMethodLog144();
        switch (error_code) {
          case '0':
            if (data?.login_type === 'otp') {
              setPhoneInput(data);
              goToStep('otp');
            } else if (data?.login_type === 'fid') {
              cleanupLogin();
              if (!phone) return;
              localStorage.setItem(PATH_BEFORE_LOGIN_SSO, window.location.href);
              handleLoginFID(phone);
            }
            break;
          case '3':
          case '9':
            showNotificationModal(res.data as NotificationInput);
            break;
          case '11':
            setErrorPhone(msg || INVALID_PHONE_MESSAGE);
            break;
          default:
            setErrorPhone(msg || INVALID_PHONE_MESSAGE);
            break;
        }
      } catch (err: unknown) {
        let fallback = SERVICE_CONNECTION_FAILED_MESSAGE;
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          fallback =
            err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

          if (err.message === 'Network Error') {
            showToast({
              title: TITLE_SERVICE_ERROR,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            return;
          }

          if (data?.data?.seconds) {
            setPhoneCountdown(Number(data?.data?.seconds));
          }

          if (data?.error_code === '2') {
            setErrorPhone(data?.msg || '');
          } else {
            showToast({
              title: TITLE_SYSTEM_ERROR,
              desc: fallback,
              timeout: 5000,
            });
          }
        }
      }
    },
    [goToStep, handleLoginFID, reset, showNotificationModal],
  );

  const handleSendOTP = useCallback(
    async ({
      phone,
      verifyToken,
    }: {
      phone?: string;
      verifyToken?: string;
    }) => {
      try {
        const resSendOTP = await onSendOTP({
          phone: phone || '',
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
          type_otp: 'login_fpl',
          verify_token: verifyToken || '',
        });

        const dataSendOTP = resSendOTP.data;
        const caseAction = dataSendOTP?.error_code;

        switch (caseAction) {
          case '0':
            setResponseSendOTP(dataSendOTP);
            // Set countdown from successful OTP response
            if (dataSendOTP?.data?.seconds) {
              setOtpCountdown(Number(dataSendOTP.data.seconds));
            }
            break;
          case '2':
            setResponseSendOTP(dataSendOTP);
            // Set countdown from rate limit response
            if (dataSendOTP?.data?.seconds) {
              setOtpCountdown(Number(dataSendOTP.data.seconds));
            }
            break;
          case '1':
            showToast({
              title: TITLE_SEND_OTP_FAIL,
              desc: dataSendOTP?.msg || DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
          case '9':
            showNotificationModal(dataSendOTP);
            break;
          case '11':
            showToast({
              title: TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
              desc: dataSendOTP?.msg || DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
          default:
            showToast({
              title: TITLE_SEND_OTP_FAIL,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
        }
      } catch (err: unknown) {
        let fallback = '';
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          fallback =
            err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

          if (err.message === 'Network Error') {
            showToast({
              title: TITLE_SERVICE_ERROR,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            return;
          }

          setErrorOtp(fallback);

          if (data?.data?.seconds) {
            setOtpCountdown(Number(data?.data?.seconds));
          }

          showToast({
            title: data?.data?.title || TITLE_SEND_OTP_FAIL,
            desc: fallback || DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
        }
      }
    },
    [showNotificationModal],
  );

  const handleReSendOTP = useCallback(
    async ({ phone }: { phone?: string }) => {
      try {
        const resReSendOTP = await onResendOTP({
          phone: phone || '',
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
          type_otp: 'login_fpl',
        });

        const dataReSendOTP = resReSendOTP?.data;
        const caseAction = dataReSendOTP?.error_code;

        switch (caseAction) {
          case '0':
            setResponseSendOTP(dataReSendOTP || null);
            // Set countdown from successful resend OTP response
            if (dataReSendOTP?.data?.seconds) {
              setOtpCountdown(Number(dataReSendOTP.data.seconds));
            }
            break;
          case '2':
            setResponseSendOTP(dataReSendOTP || null);
            // Set countdown from rate limit resend response
            if (dataReSendOTP?.data?.seconds) {
              setOtpCountdown(Number(dataReSendOTP.data.seconds));
            }
            break;
          case '1':
            showToast({
              title: TITLE_SEND_OTP_FAIL,
              desc: dataReSendOTP?.msg || DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
          case '9':
            showNotificationModal(dataReSendOTP);
            break;
          case '11':
            showToast({
              title: TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
              desc: dataReSendOTP?.msg || DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
          default:
            showToast({
              title: TITLE_SEND_OTP_FAIL,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
        }
      } catch (err: unknown) {
        let fallback = '';
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          // Set countdown from error response (for any error with seconds)
          setErrorOtp(fallback);
          if (data?.data?.seconds) {
            setOtpCountdown(Number(data?.data?.seconds));
          }

          showToast({
            title: data?.data?.title || TITLE_SEND_OTP_FAIL,
            desc: fallback || DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
        }
      }
    },
    [showNotificationModal],
  );

  const handleGetDevicesLimit = useCallback(
    async (verifyToken?: string) => {
      if (!verifyToken) return;

      try {
        const res = await getDevicesLimit({
          verify_token: verifyToken,
        });

        const data = res?.data;

        if (data?.error_code === '0') {
          setDeviceLimitData(data);
          goToStep('deviceLimit');
        } else {
          showNotificationModal(data);
        }
      } catch (err) {
        let fallback = '';
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          fallback =
            err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

          if (err.message === 'Network Error') {
            showToast({
              title: TITLE_SERVICE_ERROR,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            return;
          }
        }

        showToast({
          title: TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
          desc: fallback || DEFAULT_ERROR_MSG,
          timeout: 5000,
        });
      }
    },
    [dispatch, goToStep, showNotificationModal],
  );

  const handleCaseLogin = useCallback(
    async ({ phone, verifyToken }: { phone: string; verifyToken: string }) => {
      if (!phone || !verifyToken) return;

      try {
        const resLogin = await onLogin({
          phone,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
          push_reg_id: '',
          verify_token: verifyToken,
        });

        const data = resLogin?.data;
        const caseAction = data?.error_code;
        const verifyTokenNextStep = resLogin?.data?.data?.verify_token;

        if (verifyTokenNextStep) {
          dispatch(setVerifyToken(verifyTokenNextStep));
        }

        switch (caseAction) {
          case '0':
            await onLoginSuccess(data, handleUserInfo, showNotificationModal);
            break;
          case '6':
          case '8':
          case '9':
            showNotificationModal(data);
            break;
          case '7':
            handleGetDevicesLimit(storeVerifyToken);
            break;
          default:
            showToast({
              title: data?.msg || TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
              desc: data?.msg || DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            break;
        }
      } catch (err) {
        let fallback = '';
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          fallback =
            err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

          if (err.message === 'Network Error') {
            showToast({
              title: TITLE_SERVICE_ERROR,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            return;
          }
        }

        showToast({
          title: TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
          desc: fallback || DEFAULT_ERROR_MSG,
          timeout: 5000,
        });
      }
    },
    [handleGetDevicesLimit, showNotificationModal, storeVerifyToken],
  );

  const handleVerifyOTP = useCallback(
    async ({ phone, otpCode }: { phone?: string; otpCode?: string }) => {
      try {
        if (!phone || !otpCode) return;
        reset.verify(); // reset

        const resVerifyOTP = await onSubmitVerifyOTP({
          phone,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
          type_otp: 'login_fpl',
          otp_code: otpCode,
        });

        const data = resVerifyOTP?.data;
        const errorCode = data?.error_code;

        switch (errorCode) {
          case '0':
            if (data?.data?.verify_token) {
              // Thành công → bạn có thể xử lý login tại đây
              handleCaseLogin({
                phone: localStorage.getItem(LOGIN_PHONE_NUMBER) as string,
                verifyToken: data.data.verify_token,
              });
            } else {
              // Đóng nếu không có verify_token
              dispatch(closeLoginModal());
            }
            break;
          case '9':
            showNotificationModal(data);
            break;
          case '11':
            setResVerifyOTP(data);
            setErrorOtp(data?.msg || '');
            break;
          default:
            setResVerifyOTP(data);
            setErrorOtp(data?.msg || '');
            break;
        }
      } catch (err: unknown) {
        let fallback = ERROR_OCCURRED_MESSAGE;
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          fallback =
            err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

          if (err.message === 'Network Error') {
            showToast({
              title: TITLE_SERVICE_ERROR,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            return;
          }

          if (data?.data?.seconds) {
            setOtpCountdown(Number(data?.data?.seconds));
          }
        }

        setErrorOtp(fallback);
      }
    },
    [dispatch, handleCaseLogin, reset, showNotificationModal],
  );

  const handleRemoveDevice = useCallback(
    async (deviceIds: string[]) => {
      if (!deviceIds?.length) return;

      try {
        const responseRemove = await removeDevicesLimit({
          list_ids: deviceIds,
          verify_token: storeVerifyToken,
          ignore_token: '0',
          required_login: '0',
        });

        const data = responseRemove?.data;
        const errorCode = data?.error_code;

        if (errorCode === '0') {
          await onLoginSuccess(data, handleUserInfo, showNotificationModal);
          cleanupLogin();
          return;
        }

        setDeviceLimitData(null);

        if (errorCode === '10') {
          showNotificationModal({
            ...data,
            buttons: {
              accept: RETRY_BUTTON_TEXT,
            },
            action_callback: true,
          });
          setReloadDeviceLimit(true);
          return;
        }

        showNotificationModal({
          ...data,
          buttons: {
            accept: EXIT_BUTTON_TEXT,
          },
        });
      } catch (err) {
        setDeviceLimitData(null);

        let fallback = '';
        if (axios.isAxiosError(err)) {
          const data = err.response?.data;
          fallback =
            data?.data?.errors ||
            data?.msg ||
            data?.message ||
            data?.detail ||
            fallback;

          fallback =
            err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

          if (err.message === 'Network Error') {
            showToast({
              title: TITLE_SERVICE_ERROR,
              desc: DEFAULT_ERROR_MSG,
              timeout: 5000,
            });
            return;
          }
        }

        showToast({
          title: TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
          desc: fallback || DEFAULT_ERROR_MSG,
          timeout: 5000,
        });
      }
    },
    [storeVerifyToken, showNotificationModal],
  );

  const handleCallback = useCallback(() => {
    if (reloadDeviceLimit) {
      handleGetDevicesLimit(storeVerifyToken);
      setReloadDeviceLimit(false);
      return;
    }
    goToStep('phone');
  }, [
    goToStep,
    reloadDeviceLimit,
    storeVerifyToken,
    handleGetDevicesLimit,
    dispatch,
  ]);

  const backToDefault = useCallback(() => {
    trackingCancelLoginLog145({
      Screen:
        step === 'otp'
          ? 'CancelOTP'
          : step === 'deviceLimit'
          ? 'LimitDevice'
          : 'PageLogin',
    });
    if (sessionStorage.getItem(CLOSE_LOGIN_MODAL_NOW)) {
      dispatch(closeLoginModal());
      sessionStorage.removeItem(CLOSE_LOGIN_MODAL_NOW);
      return;
    }
    resetToPhoneState();
  }, [resetToPhoneState, step]);

  const handleBack = useCallback(() => {
    if (step === 'otp' || step === 'notification') {
      goToStep('phone');
      trackingCancelLoginLog145({
        Screen: step === 'otp' ? 'CancelOTP' : 'PageLogin',
      });
    }
    if (step === 'deviceLimit') {
      trackingCancelLoginLog145({
        Screen: 'LimitDevice',
      });
    }
  }, [goToStep, step]);

  // handle error code - fid return back
  const handleGetDevicesLimitErrorCode = async (verifyToken?: string) => {
    if (!verifyToken || deviceLimitData) {
      return;
    }

    if (verifyToken) {
      dispatch(setVerifyToken(verifyToken));
    }

    try {
      const res = await getDevicesLimit({ verify_token: verifyToken });
      const data = res?.data;

      if (data?.error_code === '0') {
        setDeviceLimitData(data);
        goToStep('deviceLimit');
      } else {
        showNotificationModal(data);
      }
    } catch (err) {
      let fallback = '';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        fallback =
          data?.data?.errors ||
          data?.msg ||
          data?.message ||
          data?.detail ||
          fallback;

        fallback =
          err.message === 'Network Error' ? DEFAULT_ERROR_MSG : fallback;

        if (err.message === 'Network Error') {
          showToast({
            title: TITLE_SERVICE_ERROR,
            desc: DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
          return;
        }

        cleanupLogin(); // clear store data (because run 1 time)
      }
      showToast({
        title: TITLE_ERROR_CONNECT_FPTPLAY_SERVICES,
        desc: fallback || DEFAULT_ERROR_MSG,
        timeout: 5000,
      });
    }
  };

  const handleErrorCode = useCallback(
    (data: onLogin3rdResponse) => {
      if (!data) return;

      const errorCode = data?.error_code?.toString() || '';

      if (['6', '8', '9'].includes(errorCode)) {
        showNotificationModal(data);
        return;
      }

      if (errorCode === '7') {
        const verifyToken = data?.data?.verify_token;
        if (verifyToken && !deviceLimitData) {
          handleGetDevicesLimitErrorCode(verifyToken);
        }
        return;
      }
    },
    [handleGetDevicesLimitErrorCode, showNotificationModal],
  );

  // --- UI content ---
  const content = useMemo(
    () => ({
      phone: {
        title: 'Đăng nhập hoặc đăng ký',
        placeholder: 'Số điện thoại',
        buttons: { accept: CONTINUE_BUTTON_TEXT },
      },
      otp: {
        title: 'Xác thực mã OTP',
        placeholder: 'Mã OTP',
        buttons: { accept: CONFIRM_BUTTON_TEXT },
      },
      notification: notificationContent || {
        title: 'Thông báo',
        content: 'Đã có lỗi xảy ra',
        buttons: { accept: UNDERSTOOD_BUTTON_TEXT },
      },
      deviceLimit: {
        title: 'Vượt giới hạn thiết bị',
        content: 'Chọn thiết bị để đăng xuất',
        buttons: { accept: CONTINUE_BUTTON_TEXT, cancel: EXIT_BUTTON_TEXT },
      },
    }),
    [notificationContent],
  );

  const startCountdown = (
    duration: number,
    onTick: (value: number) => void,
    onDone: () => void,
  ) => {
    let time = duration;
    const timer = setInterval(() => {
      time -= 1;

      if (time <= 0) {
        clearInterval(timer);
        onDone();
      } else {
        onTick(time);
      }
    }, 1000);
  };

  useEffect(() => {
    if (otpCountdown > 0) {
      startCountdown(otpCountdown, setOtpCountdown, () => {
        setErrorOtp('');
        setResVerifyOTP(null);
      });
    }
  }, [otpCountdown]);

  useEffect(() => {
    if (phoneCountdown > 0) {
      startCountdown(phoneCountdown, setPhoneCountdown, () => {
        setErrorPhone('');
      });
    }
  }, [phoneCountdown]);

  return {
    step,
    goToStep,
    backgroundImage,
    isHidden,
    showBack,
    handleBack,
    content,
    errors: {
      phone: errorPhone,
      otp: errorOtp,
    },
    handlers: {
      onSubmitPhone,
      handleSendOTP,
      handleReSendOTP,
      handleVerifyOTP,
      handleRemoveDevice,
      handleCallback,
      backToDefault,
      handleErrorCode,
    },
    resPhoneInput,
    resSendOTP,
    resVerifyOTP,
    notificationContent,
    deviceLimitData,
    reset,
    otpCountdown,
  };
}
