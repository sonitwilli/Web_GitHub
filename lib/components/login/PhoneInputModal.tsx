import { CONTINUE_BUTTON_TEXT, LOGIN_PHONE_NUMBER } from '@/lib/constant/texts';
import { closeLoginModal } from '@/lib/store/slices/loginSlice';
import Link from 'next/link';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export type PhoneInputModalRef = {
  open: () => void;
  close: () => void;
  focus: () => void;
};

type Props = {
  content: {
    title?: string;
    placeholder?: string;
    buttons?: {
      accept?: string;
    };
  };
  error: string;
  onSubmit: (phone: string) => void;
  onClose: () => void;
};

const PhoneInputModal = forwardRef<PhoneInputModalRef, Props>(
  ({ content, error, onSubmit }, ref) => {
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState(true);
    const [errorResponse, setErrorResponse] = useState('');
    const [countdown, setCountdown] = useState(0);
    const dispatch = useDispatch();

    const {
      register,
      handleSubmit,
      watch,
      setValue,
      clearErrors,
      formState: { errors },
    } = useForm<{ phone: string }>({
      defaultValues: { phone: '' },
      mode: 'onSubmit',
    });

    const phone = watch('phone');

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);

        if (ref && typeof ref === 'object' && 'current' in ref && ref.current) {
          ref.current.focus();
        }
      },
      close: () => setVisible(false),
      focus: () => {
        // Focus input when called
        setTimeout(() => {
          const input = document.querySelector(
            'input[type="tel"]',
          ) as HTMLInputElement;
          if (input) {
            input.focus();
            input.select();
          }
        }, 200);
      },
    }));

    useEffect(() => {
      if (phone && phone.length > 10) {
        setValue('phone', phone.slice(0, 10));
      }
      if (phone === '') {
        clearErrors('phone');
        setErrorResponse('');
      }
    }, [phone, setValue, clearErrors]);

    useEffect(() => {
      if (typeof window !== 'undefined' && phone !== undefined) {
        localStorage.setItem(LOGIN_PHONE_NUMBER, phone);
      }
    }, [phone]);

    useEffect(() => {
      if (countdown > 0) {
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setErrorResponse('');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [countdown]);

    useEffect(() => {
      if (error === '') {
        setErrorResponse('');
      }
    }, [error]);

    useEffect(() => {
      if (errors.phone?.message) {
        setErrorResponse(errors.phone?.message);
      } else if (error) {
        setErrorResponse(error);
      }
    }, [error, errors.phone?.message]);

    const handleFormSubmit = ({ phone }: { phone: string }) => {
      if (!status) return;
      if (phone === '') {
        setErrorResponse('Nhập số điện thoại để tiếp tục');
      } else if (phone.length < 10) {
        setErrorResponse('Số điện thoại không hợp lệ');
      } else {
        onSubmit(phone);
        if (document.fullscreenElement) document.exitFullscreen();
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      setValue('phone', value);
    };

    if (!visible) return null;

    return (
      <div className="fixed top-1/2 left-1/2 z-[1002] w-[320px] tablet:w-[460px] transform -translate-x-1/2 -translate-y-1/2 rounded-[16px] p-[24px] tablet:p-[32px] bg-eerie-black">
        <h1 className="text-[20px] mb-4 tablet:mb-8 tablet:text-2xl text-center tablet:text-left font-semibold text-smoke-white">
          {content.title || 'Đăng nhập hoặc đăng ký'}
        </h1>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <input
            {...register('phone', {
              /* your validation here */
            })}
            autoFocus
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={content.placeholder || 'Số điện thoại'}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onInput={handleInput}
            className={`
              peer
              h-[48px] tablet:h-14 w-full rounded-[52px] px-4 
              placeholder:text-davys-grey text-white 
              border-[1px]
              ${errorResponse ? 'border-scarlet' : 'border-black-olive-404040'}
              focus:outline-none
            `}
          />

          {errorResponse && (
            <p className="mt-2 text-sm text-scarlet">
              {errors.phone?.message || errorResponse || error}
            </p>
          )}

          <button
            type="submit"
            disabled={!status}
            className={`text-[16px] mt-6 tablet:mt-8 h-12 w-full rounded-[52px] text-smoke-white font-medium transition-colors duration-300 cursor-pointer ${
              status
                ? 'fpl-bg border-none outline-none hover:opacity-90 active:scale-[0.98]'
                : 'cursor-not-allowed bg-charleston-green text-neutral-400'
            }`}
          >
            {content.buttons?.accept || CONTINUE_BUTTON_TEXT}
          </button>
          <span className="mt-8 flex items-center gap-2">
            <label className="relative inline-flex cursor-pointer items-start accept-checkbox">
              <input
                type="checkbox"
                checked={status}
                onChange={() => setStatus(!status)}
                className="peer sr-only custom-control-input"
              />
              <div className="h-[16px] w-[16px] shrink-0 rounded-[2px] border border-ash-grey bg-transparent peer-checked:border-none peer-checked:bg-[url('/images/svg/check.svg')] peer-checked:bg-no-repeat peer-checked:bg-cover" />
            </label>
            <span className="text-[10px] tablet:text-[14px] leading-[130%] tracking-[0.07px] text-dark-gray accept-text">
              Tôi đã đọc và đồng ý với{' '}
              <Link
                prefetch={false}
                href={'/dieu-khoan-su-dung'}
                className="ml-[3px] cursor-pointer text-fpl underline terms"
                onClick={() => {
                  dispatch(closeLoginModal());
                }}
              >
                Điều khoản sử dụng FPT Play
              </Link>
            </span>
          </span>
        </form>
      </div>
    );
  },
);

PhoneInputModal.displayName = 'PhoneInputModal';
export default PhoneInputModal;
