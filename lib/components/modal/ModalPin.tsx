import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import CustomImage from '../common/CustomImage';
import ProfileOtpInput from '@/lib/components/multi-profile/OtpInputWrapper';
import ProfileButton from '@/lib/components/common/ProfileButton';
import { PIN_TYPES, PROFILE_TYPES } from '@/lib/constant/texts';
import { Profile } from '@/lib/api/user';
import styles from './ModalPin.module.css';

// Định nghĩa interface cho các phương thức của ref
export interface ModalPinRef {
  setError: (error: string) => void;
}

interface ModalPinProps {
  profile?: Profile;
  type?: 'create' | 'access' | 'edit';
  title?: string;
  subTitle?: string;
  avatarUrl?: string;
  defaultValue?: string[];
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: (otp: string) => void;
  onForget?: () => void;
}

// Sử dụng forwardRef để hỗ trợ ref
const ModalPin = forwardRef<ModalPinRef, ModalPinProps>(
  (
    {
      profile = {} as Profile,
      type = 'create',
      title = 'Thiết lập mã PIN hồ sơ',
      subTitle = 'Vui lòng nhập mã PIN gồm 4 số (0-9) để tiến hành thiết lập mã PIN hồ sơ',
      avatarUrl = '',
      defaultValue = [],
      onConfirm,
      onForget,
    },
    ref,
  ) => {
    const [otp, setOtp] = useState<string[]>(defaultValue);
    const [error, setError] = useState<string>('');

    const otpComputed = useMemo(() => otp.join(''), [otp]);

    useEffect(() => {
      if (otpComputed.length === 4 && type === 'access') {
        handleConfirm();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otpComputed]);

    // Sử dụng useImperativeHandle để định nghĩa các phương thức của ref
    useImperativeHandle(ref, () => ({
      setError: (errorMessage: string) => {
        setError(errorMessage);
      },
    }));

    useEffect(() => {
      if (defaultValue.length) {
        setOtp(defaultValue);
      }
    }, [defaultValue]);

    useEffect(() => {
      if (type === 'access' && otp.join('').length === 4) {
        onConfirm?.(otp.join(''));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp]);

    const disabledConfirm = () => {
      const otpValue = otp.join('');
      if (!otpValue) return true;
      if (otpValue.length !== 4) return true;
      return false;
    };

    const handleConfirm = () => {
      onConfirm?.(otp.join(''));
    };

    const handleForget = () => {
      onForget?.();
    };

    return (
      <div className="pin-modal">
        <div className="flex items-center justify-center mb-10">
          <div className="relative">
            <CustomImage
              src={avatarUrl}
              alt=""
              className="w-[80px] xl:w-[120px] h-[80px] xl:h-[120px] rounded-full border-[2px] border-white-smoke"
            />
            {profile && profile.pin_type === PIN_TYPES.REQUIRED_PIN && (
              <img
                className="absolute w-[24px] xl:w-[32px] h-[24px] xl:h-[32px] right-0 xl:right-1.5 top-0 xl:top-1.5"
                src="/images/profiles/lock.png"
                alt="lock"
              />
            )}
            {profile && profile.profile_type === PROFILE_TYPES.KID_PROFILE && (
              <img
                className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-16"
                src="/images/profiles/child_2.png"
                alt="edit avatar"
                width={64}
                height={32}
              />
            )}
          </div>
        </div>
        <div className="text-center text-[20px] xl:text-2xl leading-[1.3] font-bold mb-3 tablet:mb-4 text-white-smoke">
          {title}
        </div>
        <div className="text-spanish-gray text-center text-base leading-[21px] font-normal mb-6">
          {subTitle}
        </div>
        <div className={`mb-0 ${error ? 'mb-2' : ''}`}>
          <ProfileOtpInput
            defaultValue={otp}
            inputClasses={error ? 'error' : ''}
            onChange={(value) => setOtp(value.split(''))}
          />
        </div>
        {error && (
          <div className="mt-4 mb-8 text-center text-scarlet text-sm leading-6">
            {error}
          </div>
        )}
        <div className="pin-modal__footer mt-6 tablet:mt-8">
          {type === 'access' && (
            <span
              className="block text-center text-sm tablet:text-base hover:text-fpl cursor-pointer transition-all duration-300 text-white-smoke"
              onClick={handleForget}
            >
              Quên mã PIN?
            </span>
          )}
          {(type === 'create' || type === 'edit') && (
            <div className="flex flex-row items-center gap-3 w-full">
              <ProfileButton
                width="full"
                disabled={disabledConfirm()}
                className={`${
                  disabledConfirm()
                    ? styles.disabledButton
                    : styles.enabledButton
                }`}
                onClickBtn={handleConfirm}
              >
                Xác Nhận
              </ProfileButton>
            </div>
          )}
        </div>
      </div>
    );
  },
);

// Đặt tên hiển thị cho component để dễ debug
ModalPin.displayName = 'ModalPin';

export default ModalPin;
