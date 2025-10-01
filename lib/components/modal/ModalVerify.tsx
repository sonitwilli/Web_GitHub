import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ModalWrapper from './ModalWrapper';
import NoticeModal from '@/lib/components/modal/ModalNotice';
import ChangePasswordModal from '@/lib/components/modal/ModalChangePassword';
import { RootState } from '@/lib/store';
import { MASK_PHONE, SEND_OTP_TYPES } from '@/lib/constant/texts';
import { useOtp } from '@/lib/hooks/useVerify';
import { ResendOtpParams, VerifyOtpParams } from '@/lib/api/verify';
import { NoticeModalRef } from '@/lib/components/modal/ModalNotice';
import styles from './ModalVerify.module.css';
import ModalManagementCode from './ModalManagementCode';
import { setOtpType } from '@/lib/store/slices/otpSlice';
import { SwitchModeType } from '@/lib/api/login';

// Interface for VerifyContent
export interface VerifyContent {
  title?: string;
  content?: string | TrustedHTML;
  placeholder_input?: string;
  button?: { action: string; content: string }[];
  link_resent?: { action: string; content: string }[];
  switch_mode?: SwitchModeType;
}

// Interface for VerifyModalNewProps
interface VerifyModalNewProps {
  resendOtp?: boolean;
  contentClass?: string;
  overlayClass?: string;
  customUi?: {
    dialogClass?: string;
    hideHeaderClose?: boolean;
  };
  onResend?: () => void;
  onHandleCancelMethods?: () => void;
  onHandleDeleteMethods?: () => void;
  openManagementCodeModal?: () => void;
  onDoDeleteAccountNewFlow?: (data: { verify_token: string }) => void;
  isCustom?: boolean;
}

interface ModalManagementCodeRef {
  show: () => void;
}

// Interface for VerifyModalNewRef
export interface VerifyModalNewRef {
  openModal?: (options?: { trackingLogId?: number }) => void;
  closeModal?: () => void;
  verifyContent?: VerifyContent;
  phone?: string;
  handleCountDownResend?: (options?: { seconds?: number }) => void;
  overlayClass?: string;
}

const VerifyModalNew = forwardRef<VerifyModalNewRef, VerifyModalNewProps>(
  (
    {
      contentClass = '',
      overlayClass = '',
      onResend,
      onHandleCancelMethods,
      onHandleDeleteMethods,
      onDoDeleteAccountNewFlow,
      openManagementCodeModal,
      isCustom = true,
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.user.info);
    const [isOpen, setIsOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [phone, setPhone] = useState('');
    const [otpPinCode, setOtpPinCode] = useState<string | null>(null);
    const [resendTimeout, setResendTimeout] = useState(0);
    const [isCountdownResend, setIsCountdownResend] = useState(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
      useState(false);
    const intervalResendRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRetryRef = useRef<NodeJS.Timeout | null>(null);
    const verifyInputRef = useRef<HTMLInputElement>(null);
    const noticeModalRef = useRef<NoticeModalRef>(null);
    const modalManagementCodeRef = useRef<ModalManagementCodeRef>(null);
    const [showOtherMethods, setShowOtherMethods] = useState(false);
    const modalType = useMemo(() => {
      const allowPin = currentUser?.allow_pin;

      return allowPin !== '1' ? 'forget' : 'management';
    }, [currentUser]);

    useEffect(() => {
      if (resendTimeout > 0) {
        setShowOtherMethods(false);
      }
    }, [resendTimeout]);

    // Initialize useOtp hook with options
    const {
      form,
      setForm,
      verifyContent,
      setVerifyContent,
      wrongOtpMsg,
      setWrongOtpMsg,
      isDisableButtonConfirm,
      doResend,
      doResendPayment,
      doResendWallet,
      doResend24h,
      doResend24hNewDevice,
      doResendOtpDeleteAccount,
      doResendOtpLoginChangePass,
      doResendOtpForgetManagementCode,
      doResendOtpDeleteAccountNewFlow,
      doResendOtpChangeManagementCode,
      doResendOtpDeletePaymentMethod,
      doResendOtpDeleteAutoExtend,
      doConfirmOtp,
      doConfirmOtpSso,
      doConfirmOtp24h,
      doConfirmOtp24hNewDevice,
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
    } = useOtp({
      handleUserInfo: async (token: string) => {
        if (token) {
          dispatch({ type: 'user/SET_TOKEN', payload: token });
          localStorage.setItem('token', token);
          await dispatch({ type: 'user/getUser' });
        }
      },
      loginSuccess: () => {
        noticeModalRef.current?.openModal({
          title: 'Thông báo',
          content: 'Đăng nhập thành công!',
          action: 'reload',
          buttonContent: 'OK',
        });
      },
      openChangePasswordModal: () => {
        setIsChangePasswordModalOpen(true);
      },
      openChangeManagementCode: () => {
        if (openManagementCodeModal) {
          openManagementCodeModal();
          setIsOpen(false);
        }
      },
      onHandleDeleteMethods,
      onHandleCancelMethods,
      onDoDeleteAccountNewFlow,
      openNoticeModal: (options: { title: string; content: string }) => {
        noticeModalRef.current?.openModal(options);
        setIsOpen(false);
      },
      changeHintText: () => {
        const maskPhone = localStorage.getItem(MASK_PHONE) || formatPhone();
        setVerifyContent((prev) => ({
          ...prev,
          content: `<div style="color: #959595;">Nhấn nút <b style="color: white">Gửi lại</b> mã để nhận OTP được gửi đến số điện thoại <b style="color: white">${maskPhone}</b></div>`,
        }));
      },
      focusInput: () => {
        verifyInputRef.current?.focus();
      },
      handleCountDownResend: (options: { seconds?: number } = {}) => {
        setResendTimeout(options.seconds || 60);
        onResend?.();
        setIsCountdownResend(false);
        if (intervalResendRef.current) {
          clearInterval(intervalResendRef.current);
        }
        intervalResendRef.current = setInterval(() => {
          setResendTimeout((prev) => {
            if (prev > 0) {
              return prev - 1;
            }
            clearInterval(intervalResendRef.current!);
            return 0;
          });
        }, 1000);
      },
      handleOtpChangeManagementCodeSuccess: () => {
        setIsOpen(false);

        if (modalType === 'forget') {
          dispatch(setOtpType(SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE));
          if (openManagementCodeModal) {
            openManagementCodeModal();
            setIsOpen(false);
          }
        } else {
          setTimeout(() => {
            modalManagementCodeRef.current?.show?.();
          }, 0);
        }
      },
    });

    useEffect(() => {
      // console.log('isRegister', isRegister);
    }, [isRegister]);

    // Memoize the content to prevent unnecessary re-renders
    const memoizedContent = useMemo(() => {
      if (verifyContent.placeholder_input === 'Nhập số điện thoại') {
        return null;
      }

      if (!verifyContent.content) {
        return null;
      }

      return (
        <div
          key="verify-content-stable"
          className="text-left text-white mt-4 mb-8"
          dangerouslySetInnerHTML={{
            __html: verifyContent.content as string,
          }}
        />
      );
    }, [verifyContent.content, verifyContent.placeholder_input]);

    const formatPhone = useCallback(() => {
      if (!currentUser?.user_phone) return '';
      const phone = currentUser.user_phone;
      let result = '';
      for (let i = 0; i < phone.length; i++) {
        if (i < 3 || i > 5) {
          result += phone[i];
        } else {
          result += '*';
        }
      }
      return result;
    }, [currentUser]);

    // Simple handler - let user type freely, then filter
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      maxLength: number,
    ) => {
      const inputValue = e.target.value;
      // Only keep numeric characters and limit length
      const numericValue = inputValue
        .replace(/[^0-9]/g, '')
        .slice(0, maxLength);
      setForm({ verify_input: numericValue });
    };

    // Handle paste events
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const paste = e.clipboardData.getData('text');
      const numericValue = paste.replace(/[^0-9]/g, '');
      if (numericValue) {
        const maxLength =
          verifyContent.placeholder_input === 'Nhập số điện thoại' ? 11 : 6;
        const value = numericValue.slice(0, maxLength);
        setForm({ verify_input: value });
      }
    };

    useImperativeHandle(ref, () => ({
      openModal: () => {
        setIsOpen(true);
        setForm({ verify_input: '' });
        setTimeout(() => {
          verifyInputRef.current?.focus();
        }, 100);
      },
      closeModal: () => {
        setIsOpen(false);
        setSubmitted(false);
        setOtpPinCode(null);
        setForm({ verify_input: '' });
        setWrongOtpMsg(null);
      },
      set verifyContent(value: VerifyContent) {
        setIsOpen(true);
        setVerifyContent(value);
      },
      set phone(value: string) {
        setPhone(value);
      },
      handleCountDownResend: (options = {}) => {
        handleCountDownResend(options);
      },
    }));

    // Auto focus input when modal opens
    useEffect(() => {
      if (isOpen && verifyInputRef.current) {
        const timer = setTimeout(() => {
          verifyInputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    // Auto focus input when verify content changes
    useEffect(() => {
      if (isOpen && verifyContent && verifyInputRef.current) {
        const timer = setTimeout(() => {
          verifyInputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [isOpen, verifyContent]);

    useEffect(() => {
      if (
        isCountdownResend &&
        verifyContent.placeholder_input !== 'Nhập số điện thoại'
      ) {
        handleCountDownResend();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCountdownResend, verifyContent.placeholder_input]);

    useEffect(() => {
      if (form.verify_input) {
        setWrongOtpMsg(null);
      }
    }, [form.verify_input, setWrongOtpMsg]);

    useEffect(() => {
      const resendInterval = intervalResendRef.current;
      const retryInterval = intervalRetryRef.current;
      return () => {
        if (resendInterval) clearInterval(resendInterval);
        if (retryInterval) clearInterval(retryInterval);
      };
    }, []);

    const validateInput = () => {
      if (!submitted) return true;
      const input = form.verify_input;
      if (verifyContent.placeholder_input === 'Nhập số điện thoại') {
        return (
          input &&
          /^\d+$/.test(input) &&
          input.length >= 9 &&
          input.length <= 11
        );
      }
      return input && /^\d+$/.test(input) && input.length === 6;
    };

    const handleCountDownResend = (options: { seconds?: number } = {}) => {
      setResendTimeout(options.seconds || 60);
      onResend?.();
      setIsCountdownResend(false);
      if (intervalResendRef.current) {
        clearInterval(intervalResendRef.current);
      }
      intervalResendRef.current = setInterval(() => {
        setResendTimeout((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
          clearInterval(intervalResendRef.current!);
          return 0;
        });
      }, 1000);
    };

    const onSubmit = async (action: string, typeOtp: string = '') => {
      if (isDisableButtonConfirm || !action) return;

      setWrongOtpMsg(null);
      setIsSubmitLoading(true);
      setTimeout(() => setIsSubmitLoading(false), 2000);

      try {
        const params: VerifyOtpParams = {
          phone,
          otpCode: otpPinCode || form.verify_input,
          countryCode: 'VN',
          clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
          pushRegId: null,
        };
        const resendParams: ResendOtpParams = {
          phone,
          countryCode: 'VN',
          clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
          typeOtp,
        };

        switch (action) {
          case 'do_resend':
            await doResend(resendParams);
            break;
          case 'do_resend_payment':
            await doResendPayment(resendParams);
            break;
          case 'do_resend_wallet':
            await doResendWallet(resendParams);
            break;
          case 'do_confirm_otp':
            setSubmitted(true);
            await doConfirmOtp(params, setIsRegister);
            break;
          case 'do_confirm_otp_sso':
            setSubmitted(true);
            await doConfirmOtpSso(params, setIsRegister);
            break;
          case 'do_resend_24h':
            await doResend24h(resendParams);
            break;
          case 'do_resend_24h_new_device':
            await doResend24hNewDevice(resendParams);
            break;
          case 'do_confirm_otp_24h':
            setSubmitted(true);
            await doConfirmOtp24h(params);
            break;
          case 'do_confirm_otp_24h_new_device':
            setSubmitted(true);
            await doConfirmOtp24hNewDevice(params);
            break;
          case 'do_confirm_otp_reset_password':
            setSubmitted(true);
            await doConfirmOtpResetPassword(params);
            break;
          case 'do_confirm_otp_delete_methods':
            setSubmitted(true);
            await doConfirmOtpDeleteMethods(params);
            break;
          case 'do_confirm_otp_cancel_methods':
            setSubmitted(true);
            await doConfirmOtpCancelMethods(params);
            break;
          case 'do_confirm_otp_register':
            setSubmitted(true);
            await doConfirmOtpRegister(params);
            break;
          case 'do_register':
            setSubmitted(true);
            if (validateInput()) {
              await doRegister(
                { ...resendParams, phone: form.verify_input },
                setPhone,
              );
            }
            break;
          case 'do_delete_web_token_from_social_login':
            setSubmitted(true);
            if (validateInput()) {
              setForm({ verify_input: '' });
              setSubmitted(false);
              setIsOpen(false);
              noticeModalRef.current?.openModal({
                title: 'Xác nhận xóa token',
                content: 'Bạn có chắc chắn muốn xóa token đăng nhập xã hội?',
                action: 'do_delete_web_token_from_social_login',
                buttonContent: 'Xác nhận',
              });
            }
            break;
          case 'do_confirm_otp_change_password':
            if (otpPinCode && otpPinCode.length === 4) {
              setSubmitted(true);
              await doConfirmOtpChangePassword(params);
            }
            break;
          case 'do_confirm_otp_delete_account':
            if (otpPinCode && otpPinCode.length === 4) {
              setSubmitted(true);
              await doConfirmOtpDeleteAccount(params);
            }
            break;
          case 'do_confirm_otp_login_change_pass':
            setSubmitted(true);
            await doConfirmOtpLoginChangePass(params);
            break;
          case 'do_resend_otp_delete_account':
            await doResendOtpDeleteAccount(resendParams);
            break;
          case 'do_resend_otp_login_change_pass':
            await doResendOtpLoginChangePass(resendParams);
            break;
          case 'do_resend_otp_forget_management_code':
            await doResendOtpForgetManagementCode(resendParams);
            break;
          case 'do_confirm_otp_forget_management_code':
            await doConfirmOtpForgetManagementCode(params);
            break;
          case 'do_confirm_otp_delete_account_new_flow':
            const userPhone = currentUser?.user_phone || '';
            setPhone(userPhone);

            // Create new params with the correct phone
            const deleteAccountParams: VerifyOtpParams = {
              phone: userPhone,
              otpCode: otpPinCode || form.verify_input,
              countryCode: 'VN',
              clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
              pushRegId: null,
            };

            if (userPhone) {
              await doConfirmOtpDeleteAccountNewFlow(deleteAccountParams);
            }
            break;
          case 'do_resend_otp_delete_account_new_flow':
            const userPhoneDeleteAccount = currentUser?.user_phone || '';
            setPhone(userPhoneDeleteAccount);

            const resendDeleteAccountParams: ResendOtpParams = {
              phone: userPhoneDeleteAccount,
              countryCode: 'VN',
              clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            };

            if (userPhoneDeleteAccount) {
              await doResendOtpDeleteAccountNewFlow(resendDeleteAccountParams);
            }
            break;
          case 'do_confirm_otp_change_management_code':
            await doConfirmOtpChangeManagementCode(params);
            break;
          case 'do_resend_otp_change_management_code':
            await doResendOtpChangeManagementCode(resendParams);
            break;
          case 'do_resend_otp_delete_payment_method':
            await doResendOtpDeletePaymentMethod(resendParams);
            break;
          case 'do_confirm_otp_delete_payment_method':
            await doConfirmOtpDeletePaymentMethod(params);
            break;
          case 'do_resend_otp_delete_auto_extend':
            await doResendOtpDeleteAutoExtend(resendParams);
            break;
          case 'do_confirm_otp_delete_auto_extend':
            await doConfirmOtpDeleteAutoExtend(params);
            break;
        }
      } catch (error) {
        console.log(error, 'error');
        // Error handling is managed by the hook
      } finally {
        setIsSubmitLoading(false);
      }
    };

    return (
      <>
        <ModalWrapper
          id="verify-modal"
          open={isOpen}
          isCustom={isCustom}
          onHidden={() => {
            setIsOpen(false);
            setOtpPinCode(null);
            setWrongOtpMsg(null);
          }}
          contentClassName={`w-full px-4 sm:px-8 outline-0 max-w-[calc(100%-32px)] sm:max-w-[460px] h-[360px] sm:h-auto bg-raisin-black rounded-[16px] py-6 sm:py-8 pt-0 text-white shadow-lg ${contentClass}`}
          overlayClassName={
            overlayClass ||
            `fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]`
          }
          shouldCloseOnEsc={false}
          shouldCloseOnOverlayClick={false}
        >
          <div className="content-verify">
            <h4 className="text-center text-[20px] mt-4 xl:mt-0 sm:text-[24px] leading-[1.3] font-semibold modal-content-tracking">
              {verifyContent.title}
            </h4>
            <div>
              {verifyContent.placeholder_input === 'Nhập số điện thoại' ? (
                <div className="form-container flex flex-col items-center">
                  <input
                    ref={verifyInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full h-12 px-4 bg-charleston-green text-white placeholder-davys-grey text-sm rounded-lg border-none focus:ring-0"
                    placeholder={verifyContent.placeholder_input}
                    value={form.verify_input}
                    onChange={(e) => handleInputChange(e, 11)}
                    onPaste={handlePaste}
                  />
                  {submitted && !validateInput() && (
                    <div className="text-red-500 text-sm mt-2">
                      {verifyContent.placeholder_input}
                    </div>
                  )}
                  {verifyContent.content && (
                    <p
                      className="text-left mt-3"
                      dangerouslySetInnerHTML={{
                        __html: verifyContent.content as string,
                      }}
                    />
                  )}
                </div>
              ) : (
                memoizedContent
              )}
              {verifyContent.placeholder_input !== 'Nhập số điện thoại' && (
                <div className="form-container mb-[32px]">
                  <div className="flex items-center gap-3 justify-between">
                    <input
                      ref={verifyInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`${styles['no-spinners']} ${
                        wrongOtpMsg
                          ? 'border-scarlet focus:border-scarlet'
                          : 'border-black-olive-404040 focus:border-gray'
                      } border outline-0 w-full h-[56px] px-4 bg-[rgba(0,0,0,0.05)] text-white placeholder-davys-grey text-base rounded-[104px] focus:ring-0`}
                      placeholder={verifyContent.placeholder_input}
                      value={form.verify_input}
                      onChange={(e) => handleInputChange(e, 6)}
                      onPaste={handlePaste}
                    />
                    {Array.isArray(verifyContent.link_resent) &&
                      verifyContent.link_resent.map((item, index) => (
                        <button
                          key={index}
                          className={`font-semibold text-base ${
                            resendTimeout
                              ? 'text-spanish-gray bg-charleston-green h-[56px] w-[56px] rounded-full flex-none cursor-default pointer-events-none'
                              : 'text-white-smoke text-nowrap h-[56px] px-6 rounded-[40px] fpl-bg cursor-pointer'
                          }`}
                          onClick={() =>
                            resendTimeout ? null : onSubmit(item.action, '')
                          }
                        >
                          {resendTimeout ? `${resendTimeout}s` : item.content}
                        </button>
                      ))}
                  </div>
                  {wrongOtpMsg && (
                    <div className="text-scarlet text-sm mt-2 font-[400] text-left">
                      {wrongOtpMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div
              className={`group-btn mt-5 ${
                isSubmitLoading ? 'cursor-wait' : ''
              }`}
            >
              {verifyContent.placeholder_input !== 'Nhập số điện thoại' ? (
                <>
                  {Array.isArray(verifyContent.button) &&
                    verifyContent.button.map((item, index) => (
                      <button
                        key={index}
                        className={`w-full h-[48px] sm:h-[56px] cursor-pointer rounded-[40px] text-base font-medium ${
                          form.verify_input.length >= 6
                            ? styles.enabledButton
                            : styles.disabledButton
                        } ${isSubmitLoading ? 'pointer-events-none' : ''}`}
                        onClick={() =>
                          onSubmit(
                            form.verify_input.length === 6 ? item.action : '',
                            '',
                          )
                        }
                      >
                        {item.content}
                      </button>
                    ))}
                  <div className="flex items-center justify-center gap-2 mt-[24px]">
                    <p className="text-spanish-gray text-base font-medium">
                      Chưa nhận được mã?{' '}
                    </p>
                    {verifyContent?.switch_mode?.modes &&
                      verifyContent.switch_mode.modes.length > 1 && (
                        <div className="text-center">
                          <button
                            onClick={() =>
                              resendTimeout
                                ? null
                                : setShowOtherMethods(!showOtherMethods)
                            }
                            className={`transition-colors text-[16px] font-medium ${
                              resendTimeout
                                ? 'text-gray cursor-default pointer-events-none'
                                : 'text-fpl cursor-pointer'
                            }`}
                          >
                            Chọn phương thức khác
                          </button>
                        </div>
                      )}
                  </div>
                  {/* Dropdown hiển thị các phương thức khác */}
                  {showOtherMethods && (
                    <div className="flex flex-col gap-[20px] mt-6">
                      {verifyContent?.switch_mode?.modes &&
                        verifyContent?.switch_mode?.modes.length > 0 &&
                        verifyContent.switch_mode.modes.map((mode, index) => {
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                onSubmit(
                                  verifyContent?.link_resent?.[0]?.action || '',
                                  mode.method || '',
                                );
                                setShowOtherMethods(false);
                              }}
                              className="w-full h-12 rounded-[52px] bg-charleston-green text-white-smoke font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-black-olive-404040 transition-colors"
                            >
                              {mode.icon && (
                                <img
                                  src={mode.icon}
                                  alt="icon"
                                  className="w-6 h-6"
                                />
                              )}
                              {mode.text}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={`w-full h-12 rounded-[40px] text-base font-medium ${
                    form.verify_input.length >= 9
                      ? styles.enabledButton
                      : styles.disabledButton
                  }`}
                  onClick={() =>
                    onSubmit(form.verify_input ? 'do_register' : '', '')
                  }
                >
                  Xác nhận
                </button>
              )}
            </div>
          </div>
        </ModalWrapper>
        <NoticeModal ref={noticeModalRef} />
        <ModalManagementCode
          ref={modalManagementCodeRef}
          isConfirm={currentUser?.allow_pin === '1' ? true : false}
        />
        <ChangePasswordModal
          contentClassName={contentClass}
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </>
    );
  },
);

VerifyModalNew.displayName = 'VerifyModalNew';

export default VerifyModalNew;
