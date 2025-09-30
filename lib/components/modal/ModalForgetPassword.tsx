import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmDialog, {
  ModalContent,
} from '@/lib/components/modal/ModalConfirm';
import CreateManagementCodeModal, {
  CreateManagementCodeModalRef,
} from '@/lib/components/modal/ModalCreateManagementCode';
import VerifyModalNew, {
  VerifyModalNewRef,
} from '@/lib/components/modal/ModalVerify';
import { RootState } from '@/lib/store';
import { getUserInfo } from '@/lib/api/user';
import { showToast } from '@/lib/utils/globalToast';
import {
  onSendOTP,
  onResetPin,
  verifyUserChangeCodeManagement,
} from '@/lib/api/login';
import {
  ACCOUNT_UPDATED,
  ALREADY_SHOWN_MODAL_MANAGEMENT_CODE,
  DEFAULT_ERROR_MSG,
  ERROR_CONNECTION,
  HAVING_ERROR,
  SEND_OTP_TYPES,
  SENT_OTP_MESSAGE,
  TITLE_SEND_OTP_FAIL,
} from '@/lib/constant/texts';
import { convertMsg } from '@/lib/utils/profile';
import { changeUserInfo } from '@/lib/store/slices/userSlice';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { trackingLog198 } from '@/lib/hooks/useTrackingModule';
import { AxiosError } from 'axios';

interface User {
  user_phone?: string;
  allow_pin?: string;
}

export interface ForgetPasswordModalProfileRef {
  openModal: () => void;
  closeModal: () => void;
  setOpen: (open: boolean) => void;
}

interface ForgetPasswordModalProfileProps {
  Restep?: () => void;
  onCancel?: () => void;
}

const ForgetPasswordModalProfile = forwardRef<
  ForgetPasswordModalProfileRef,
  ForgetPasswordModalProfileProps
>((props, ref) => {
  const { Restep, onCancel } = props;
  const forgotPasswordModalRef = useRef<CreateManagementCodeModalRef>(null);
  const verifyModalRef = useRef<VerifyModalNewRef>(null);

  const [open, setOpen] = useState(false);
  const [resendOtp, setResendOtp] = useState(false);
  const [intervalRetry, setIntervalRetry] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCountdownRetry, setIsCountdownRetry] = useState(false);

  const userInfo = useSelector((state: RootState) => state.user);
  const otpType = useSelector((state: RootState) => state.otp);
  const storeVerifyToken = useSelector(
    (state: RootState) => state.otp.storeVerifyToken,
  );

  const { verify_token } = useSelector(
    (state: RootState) => state.accountSlice,
  );

  const getCurrentUser = useCallback((): User | null => {
    if (typeof window === 'undefined') return null;
    const currentUserData = localStorage.getItem('user');
    return currentUserData ? JSON.parse(currentUserData) : null;
  }, []);

  const dispatch = useDispatch();

  const contentChangeManagementCode =
    userInfo?.info?.allow_pin === '1'
      ? 'Thiết lập mã quản lý thành công. Quý khách có thể tiếp tục trải nghiệm FPT Play.'
      : 'Đổi mã quản lý thành công. Quý khách có thể tiếp tục trải nghiệm FPT Play.';

  useEffect(() => {
    if (open) {
      if (otpType?.otpType === SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE) {
        doForgetManagementCode();
      }
      if (otpType?.otpType === SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE) {
        doChangeManagementCode();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, otpType]);

  const onSubmit = () => {
    if (userInfo?.info?.allow_pin === '1') {
      doCreateNewManagementCodeNewFlow();
    } else {
      doChangePasswordNewFlow();
    }
    trackingLog198({
      Event: 'ModifiedInformation',
      SubMenuId:
        userInfo?.info?.allow_pin === '1'
          ? 'Thiết lập mã quản lý'
          : 'Đổi mã quản lý',
    });
  };

  const requireLogin = () => {
    dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
  };

  const openConfirmModal = (content: ModalContent) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    onCancel?.();
  };

  const doForgetManagementCode = async () => {
    const phone = getCurrentUser()?.user_phone;
    if (!phone) return;
    setOpen(false);

    const resVrf = await verifyUserChangeCodeManagement({
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      phone,
      type: SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE,
    });

    const verifyResult = await resVrf.data;
    if (!verifyResult?.data?.verify_token) return;

    try {
      const resSend = await onSendOTP({
        phone,
        type_otp: SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE,
        verify_token: verifyResult?.data?.verify_token,
        method_otp: '',
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      });

      if (resSend?.data) {
        if (resSend?.status === 401) {
          requireLogin();
        } else {
          switch (resSend?.data?.error_code) {
            case '0': {
              break;
            }
            case '2': {
              handleError22(Number(resSend?.data?.data?.seconds));
              break;
            }
            default: {
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: resSend?.data?.msg || SENT_OTP_MESSAGE,
              });
              break;
            }
          }
        }
      } else {
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }

      const result = await resSend?.data;

      switch (result?.error_code) {
        case '0': {
          if (verifyModalRef.current) {
            verifyModalRef.current.verifyContent = {
              title: 'Xác thực mã OTP',
              content: `<div style="color: #959595;">${convertMsg(
                {
                  msg: result?.msg || '',
                  text_format: result?.data?.text_format || [],
                },
              )}</div>`,
              placeholder_input: 'Nhập mã OTP',
              button: [
                {
                  action: 'do_confirm_otp_forget_management_code',
                  content: 'Xác nhận',
                },
              ],
              link_resent: [
                {
                  action: 'do_resend_otp_forget_management_code',
                  content: 'Gửi lại OTP',
                },
              ],
              switch_mode: result?.data?.switch_mode,
            };
            verifyModalRef.current.phone = phone;
            setResendOtp(true);
            await verifyModalRef?.current?.openModal?.();
            if (verifyModalRef.current?.handleCountDownResend) {
              verifyModalRef.current.handleCountDownResend({
                seconds: Number(result?.data?.seconds),
              });
            }
          }
          break;
        }
        case '2': {
          handleError22(Number(result?.data?.seconds));
          break;
        }
        default: {
          showToast({
            title: TITLE_SEND_OTP_FAIL,
            desc: result?.msg || SENT_OTP_MESSAGE,
          });
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const doChangeManagementCode = async () => {
    const phone = getCurrentUser()?.user_phone;
    if (!phone) return;
    setOpen(false);

    const resVrf = await verifyUserChangeCodeManagement({
      phone,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      type: SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE,
    });
    const verifyResult = await resVrf.data;
    if (!verifyResult?.data?.verify_token) return;

    try {
      const resSend = await onSendOTP({
        phone,
        type_otp: SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE,
        verify_token: verifyResult?.data?.verify_token,
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      });
      if (resSend?.data) {
        if (resSend?.status === 401) {
          requireLogin();
        } else {
          switch (resSend?.data?.error_code) {
            case '0': {
              break;
            }
            case '2': {
              handleError22(Number(resSend?.data?.data?.seconds));
              break;
            }
            default: {
              showToast({
                title: TITLE_SEND_OTP_FAIL,
                desc: resSend?.data?.msg || SENT_OTP_MESSAGE,
              });
              break;
            }
          }
        }
      } else {
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: SENT_OTP_MESSAGE,
        });
      }

      const result = await resSend.data;
      switch (result.error_code) {
        case '0': {
          if (verifyModalRef.current) {
            verifyModalRef.current.verifyContent = {
              title: 'Xác thực mã OTP',
              content: `<div className="text-center"><div style="color: #959595;">${convertMsg(
                {
                  msg: result?.msg || '',
                  text_format: result?.data?.text_format || [],
                },
              )}</div></div>`,
              placeholder_input: 'Nhập mã OTP',
              button: [
                {
                  action: 'do_confirm_otp_change_management_code',
                  content: 'Xác nhận',
                },
              ],
              link_resent: [
                {
                  action: 'do_resend_otp_change_management_code',
                  content: 'Gửi lại',
                },
              ],
            };
            verifyModalRef.current.phone = phone;
            setResendOtp(true);
            await verifyModalRef?.current?.openModal?.();
            if (verifyModalRef.current?.handleCountDownResend) {
              verifyModalRef.current.handleCountDownResend({
                seconds: Number(result?.data?.seconds),
              });
            }
          }
          break;
        }
        case '0': {
          break;
        }
        case '2': {
          handleError22(Number(result?.data?.seconds));
          break;
        }
        default: {
          showToast({
            title: TITLE_SEND_OTP_FAIL,
            desc: result?.msg || SENT_OTP_MESSAGE,
          });
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const doChangePasswordNewFlow = async () => {
    try {
      const password = forgotPasswordModalRef?.current?.form?.password;
      const confirmPassword =
        forgotPasswordModalRef?.current?.form?.confirmPassword;

      const resPin = await onResetPin({
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        type: otpType?.otpType,
        verify_token: storeVerifyToken || verify_token || '',
        confirm_pin: confirmPassword,
        pin: password,
      });

      if (resPin) {
        if (forgotPasswordModalRef.current) {
          forgotPasswordModalRef.current?.setErrorResponseNewPassword?.(
            resPin?.data?.msg || DEFAULT_ERROR_MSG,
          );
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }

      const result = await resPin.data;

      switch (result.error_code) {
        case '0': {
          forgotPasswordModalRef?.current?.closeModal?.();
          reStartOldStep();
          showToast({
            title: ACCOUNT_UPDATED,
            desc: contentChangeManagementCode,
          });
          const res = await getUserInfo();
          dispatch(changeUserInfo(res?.data || {}));
          break;
        }
        case '9': {
          openConfirmModal({
            title: result?.data?.title || 'Thời gian thao tác đã hết',
            content:
              result?.msg ||
              `Đã quá thời gian để thực hiện thao tác này. Bạn có thể thử lại từ đầu.`,
            buttons: {
              accept: 'Đóng',
            },
          });
          forgotPasswordModalRef?.current?.closeModal?.();
          break;
        }
        default: {
          if (forgotPasswordModalRef.current) {
            forgotPasswordModalRef.current.setErrorResponseNewPassword?.(
              result.msg || DEFAULT_ERROR_MSG,
            );
          }
          break;
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{
          response?: { status?: number };
        }>;
        if (axiosError.response?.status === 401) {
          showToast({
            title: ERROR_CONNECTION,
            desc: HAVING_ERROR,
          });
          return;
        } else {
          showToast({
            title: ERROR_CONNECTION,
            desc: DEFAULT_ERROR_MSG,
          });
        }
      }
    }
  };

  const doCreateNewManagementCodeNewFlow = async () => {
    try {
      const password = forgotPasswordModalRef?.current?.form?.password;
      const confirmPassword =
        forgotPasswordModalRef?.current?.form?.confirmPassword;

      if (!password && !confirmPassword) {
        return;
      }

      const resPin = await onResetPin({
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        type: SEND_OTP_TYPES.CREATE_MANAGEMENT_CODE,
        verify_token: '',
        confirm_pin: confirmPassword,
        pin: password,
      });

      if (resPin) {
        if (forgotPasswordModalRef.current) {
          forgotPasswordModalRef.current?.setErrorResponseNewPassword?.(
            resPin?.data?.msg || DEFAULT_ERROR_MSG,
          );
        }
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
        });
      }

      const result = await resPin.data;

      switch (result.error_code) {
        case '0': {
          forgotPasswordModalRef?.current?.closeModal?.();
          reStartOldStep();
          showToast({
            title: ACCOUNT_UPDATED,
            desc: contentChangeManagementCode,
          });
          localStorage.setItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE, '1');
          const res = await getUserInfo();
          dispatch(changeUserInfo(res?.data || {}));
          break;
        }
        default: {
          if (forgotPasswordModalRef.current) {
            forgotPasswordModalRef?.current?.setServerError(
              result?.msg || DEFAULT_ERROR_MSG,
            );
          }
          break;
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{
          response?: { status?: number };
        }>;
        if (axiosError.response?.status === 401) {
          showToast({
            title: ERROR_CONNECTION,
            desc: HAVING_ERROR,
          });
          return;
        }
      }
    }
  };

  const handleError22 = (seconds?: number) => {
    if (seconds) {
      if (intervalRetry) {
        clearInterval(intervalRetry);
      }
      const newInterval = setInterval(() => {
        if (Number(seconds) > 0 && seconds) {
          seconds--;
          setIsCountdownRetry(true);
          openConfirmModal({
            title: 'Thông báo',
            content: `Quý khách đã gửi quá nhiều yêu cầu, vui lòng thử lại sau ${seconds} giây`,
            buttons: {
              accept: 'Thử lại',
            },
          });
          const modalElement = document.getElementById('modal-confirm');
          if (modalElement?.parentNode) {
            (modalElement.parentNode as HTMLElement).style.zIndex = '1043';
          }
        } else {
          clearInterval(newInterval);
          setIsCountdownRetry(false);
          closeConfirmModal();
        }
      }, 1000);
      setIntervalRetry(newInterval);
    } else {
      openConfirmModal({
        title: 'Thông báo',
        content: 'Bạn đã vượt quá số lần quy định. Vui lòng thử lại sau',
        buttons: {
          accept: 'Thử lại',
        },
      });
    }
  };

  const reStartOldStep = () => {
    if (sessionStorage && sessionStorage.getItem('password_form_event')) {
      const event = sessionStorage.getItem('password_form_event');
      switch (event) {
        case 'forget_pin':
        case 'update_profile':
          if (Restep) {
            Restep();
          }
          break;
        default:
          break;
      }
    }
  };

  useImperativeHandle(ref, () => ({
    setOpen: async (open: boolean) => {
      try {
        const res = await getUserInfo();
        if (res?.status === 401) {
          requireLogin();
          return;
        }

        dispatch(changeUserInfo(res?.data || {}));
        setOpen(open);
      } catch (error) {
        if (error instanceof AxiosError) {
          const axiosError = error as AxiosError<{
            response?: { status?: number };
          }>;
          if (axiosError.response?.status === 401) {
            requireLogin();
            return;
          }
        }
      }
    },
    openModal: () => {
      setOpen(true);
      forgotPasswordModalRef.current?.openModal?.();
    },
    closeModal: () => {
      setOpen(false);
      forgotPasswordModalRef.current?.closeModal?.();
      verifyModalRef.current?.closeModal?.();
      closeConfirmModal();
      onCancel?.();
    },
    setServerError: (msg: string | null) => {
      console.log('Server error received:', msg);
    },
  }));

  return (
    <div className="p-8">
      <ConfirmDialog
        open={isModalOpen}
        isCountdownRetry={isCountdownRetry}
        modalContent={modalContent || {}}
        onSubmit={() => {
          if (modalContent?.buttons?.accept === 'Thử lại') {
            closeConfirmModal();
          }
        }}
        onCancel={closeConfirmModal}
        onHidden={closeConfirmModal}
      />
      <CreateManagementCodeModal
        ref={forgotPasswordModalRef}
        content="Thiết lập mã quản lý"
        contentValid="Vui lòng nhập mã quản lý 6 số (0-9) để hoàn tất quá trình thay đổi"
        placeHolder={{
          password: 'Nhập mã quản lý mới',
          confirmPassword: 'Nhập lại mã quản lý mới',
        }}
        onResetPassword={onSubmit}
      />
      <VerifyModalNew
        ref={verifyModalRef}
        resendOtp={resendOtp}
        onResend={() => setResendOtp(false)}
        openManagementCodeModal={() => {
          forgotPasswordModalRef.current?.openModal?.();
        }}
      />
    </div>
  );
});

ForgetPasswordModalProfile.displayName = 'ForgetPasswordModalProfile';

export default ForgetPasswordModalProfile;
