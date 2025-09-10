import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from 'react';
import { useForm, Controller } from 'react-hook-form';
import ModalWrapper from './ModalWrapper';
import { HiEye } from 'react-icons/hi';
import { IoEyeOffOutline } from 'react-icons/io5';
import styles from './ModalCreateManagementCode.module.css';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface CreateManagementCodeModalProps {
  content?: string;
  contentValid?: string;
  placeHolder?: {
    password: string;
    confirmPassword: string;
  };
  contentClassName?: string;
  onResetPassword?: () => void;
  onSetPassword?: () => void;
}

export interface CreateManagementCodeModalRef {
  openModal?: () => void;
  closeModal?: () => void;
  form?: {
    password?: string;
    confirmPassword?: string;
  };
  errorResponseNewPassword?: string | null;
  setErrorResponseNewPassword?: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  setServerError: (msg: string) => void;
}

const CreateManagementCodeModal = forwardRef<
  CreateManagementCodeModalRef,
  CreateManagementCodeModalProps
>(
  (
    {
      content = 'Khôi phục mật khẩu',
      contentValid = 'Vui lòng nhập Mật khẩu tối đa 6 số (0-9)',
      placeHolder = {
        password: 'Mật khẩu',
        confirmPassword: 'Nhập lại mật khẩu',
      },
      contentClassName = '',
      onResetPassword,
      onSetPassword,
    }: CreateManagementCodeModalProps,
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [passwordFieldType, setPasswordFieldType] = useState<
      'password' | 'number'
    >('password');
    const [rePasswordFieldType, setRePasswordFieldType] = useState<
      'password' | 'number'
    >('password');
    const [errorResponseNewPassword, setErrorResponseNewPassword] = useState<
      string | null
    >(null);

    const passwordInputRef = useRef<HTMLInputElement>(null);

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      reset,
      watch,
    } = useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        password: '',
        confirmPassword: '',
      },
    });
    const password = watch('password');
    const confirmPassword = watch('confirmPassword');

    const openModal = () => {
      setIsOpen(true);
      // Clear form and reset error when opening modal
      reset();
      setErrorResponseNewPassword(null);

      // Auto focus after modal is opened
      setTimeout(() => {
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        } else {
          // Fallback: find input by placeholder
          const passwordInput = document.querySelector(
            'input[placeholder="' + placeHolder.password + '"]',
          ) as HTMLInputElement;
          if (passwordInput) {
            passwordInput.focus();
          }
        }
      }, 200);
    };

    const closeModal = () => {
      setIsOpen(false);
      reset();
      setErrorResponseNewPassword(null);
    };

    // Auto focus on password input when modal opens (backup)
    useEffect(() => {
      if (isOpen) {
        const timer = setTimeout(() => {
          // Try ref first
          if (passwordInputRef.current) {
            passwordInputRef.current.focus();
          } else {
            // Fallback: find input by placeholder
            const passwordInput = document.querySelector(
              'input[placeholder="' + placeHolder.password + '"]',
            ) as HTMLInputElement;
            if (passwordInput) {
              passwordInput.focus();
            }
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen, placeHolder.password]);

    // Additional focus attempt when form is reset
    useEffect(() => {
      if (isOpen && password === '' && confirmPassword === '') {
        const timer = setTimeout(() => {
          if (passwordInputRef.current) {
            passwordInputRef.current.focus();
          } else {
            // Fallback method
            const passwordInput = document.querySelector(
              'input[placeholder="' + placeHolder.password + '"]',
            ) as HTMLInputElement;
            if (passwordInput) {
              passwordInput.focus();
            }
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isOpen, password, confirmPassword, placeHolder.password]);

    useImperativeHandle(ref, () => ({
      openModal,
      closeModal,
      form: {
        password: watch('password'),
        confirmPassword: watch('confirmPassword'),
      },
      errorResponseNewPassword,
      setErrorResponseNewPassword,
      setServerError: (msg: string) => {
        setErrorResponseNewPassword('');
        setErrorResponseNewPassword(msg);
      },
    }));

    const onSubmit = () => {
      if (isValid) {
        onResetPassword?.();
        if (content === 'Thiết lập mật khẩu') {
          onSetPassword?.();
        }
      }
    };

    const changeVisiblePassword = () => {
      setPasswordFieldType(
        passwordFieldType === 'password' ? 'number' : 'password',
      );
    };

    const changeVisibleRePassword = () => {
      setRePasswordFieldType(
        rePasswordFieldType === 'password' ? 'number' : 'password',
      );
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      e.target.value = value;

      return value;
    };

    useEffect(() => {
      if (password && confirmPassword && password !== confirmPassword) {
        setErrorResponseNewPassword('Mã quản lý không trùng khớp');
      } else {
        setErrorResponseNewPassword(null);
      }
    }, [password, confirmPassword]);

    return (
      <ModalWrapper
        id="forgot-password-modal"
        open={isOpen}
        onHidden={closeModal}
        isCustom={true}
        contentClassName={`max-w-[calc(100%-32px)] sm:max-w-[460px] px-4 sm:px-8 py-6 sm:py-8 bg-raisin-black rounded-[16px] text-white shadow-lg ${contentClassName}`}
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]"
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
      >
        <div className="flex flex-col">
          {content && (
            <h4 className="text-center text-[20px] sm:text-2xl font-semibold text-white-smoke mb-4">
              {content}
            </h4>
          )}
          <p className="text-center text-base text-spanish-gray mb-8">
            {contentValid}
          </p>

          <form autoComplete="off" className="w-full">
            <div className="w-full mb-4">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="relative w-full">
                    <input
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        passwordInputRef.current = e;
                      }}
                      type={passwordFieldType}
                      placeholder={placeHolder.password}
                      maxLength={6}
                      onChange={(e) => field.onChange(handleInput(e))}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-form-type="other"
                      data-lpignore="true"
                      className={`${
                        errors.password || errorResponseNewPassword
                          ? 'border-scarlet focus:border-scarlet'
                          : 'border-black-olive-404040 focus:border-gray'
                      } w-full h-[56px] border bg-raisin-black bg-opacity-35 rounded-[104px] px-4 text-white text-base placeholder-[#616161] outline-none focus:ring-0`}
                    />
                    <button
                      type="button"
                      onClick={changeVisiblePassword}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                    >
                      {passwordFieldType === 'password' ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <HiEye size={18} />
                      )}
                    </button>
                  </div>
                )}
              />

              {errors.password?.message &&
                errors.password.message !== 'Mã quản lý không trùng khớp' && (
                  <p className="text-red-500 text-sm mt-3.5 text-left">
                    {errors.password.message}
                  </p>
                )}
            </div>

            <div className="w-full mb-4">
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <div className="relative w-full">
                    <input
                      {...field}
                      type={rePasswordFieldType}
                      placeholder={placeHolder.confirmPassword}
                      maxLength={6}
                      onChange={(e) => field.onChange(handleInput(e))}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-form-type="other"
                      data-lpignore="true"
                      className={`${
                        errors.confirmPassword || errorResponseNewPassword
                          ? 'border-scarlet focus:border-scarlet'
                          : 'border-black-olive-404040 focus:border-gray'
                      } w-full h-[56px] border bg-raisin-black bg-opacity-35 rounded-[104px] px-4 text-white text-base placeholder-[#616161] outline-none focus:ring-0`}
                    />
                    <button
                      type="button"
                      onClick={changeVisibleRePassword}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                    >
                      {rePasswordFieldType === 'password' ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <HiEye size={18} />
                      )}
                    </button>
                  </div>
                )}
              />

              {(errors.confirmPassword?.message ||
                errorResponseNewPassword) && (
                <p className="text-red-500 text-sm mt-3.5 text-left">
                  {errors.confirmPassword?.message || errorResponseNewPassword}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={
                password.length > 0 &&
                confirmPassword.length > 0 &&
                password !== confirmPassword
              }
              className={`cursor-pointer w-full mt-[16px] h-12 rounded-[40px] text-base font-medium ${
                password.length > 0 &&
                confirmPassword.length > 0 &&
                password === confirmPassword &&
                !errorResponseNewPassword
                  ? styles.enabledButton
                  : styles.disabledButton
              }`}
            >
              Xác nhận
            </button>
          </form>
        </div>
      </ModalWrapper>
    );
  },
);

CreateManagementCodeModal.displayName = 'CreateManagementCodeModal';

export default CreateManagementCodeModal;
