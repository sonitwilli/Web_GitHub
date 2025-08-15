'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useLoginAPI } from '@/lib/hooks/login/useLoginAPI';
import PhoneInputModal, { PhoneInputModalRef } from './PhoneInputModal';
import LogoFPTPlayLogin from '../svg/LogoFPTPlayLogin';
import { closeLoginModal } from '@/lib/store/slices/loginSlice';
import { onDevicesLimitResponse, onLogin3rdResponse } from '@/lib/api/login';
import { IoArrowBackCircle, IoCloseCircle } from 'react-icons/io5';
import { RootState } from '@/lib/store';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { LOGIN_PHONE_NUMBER, TYPE_LOGIN } from '@/lib/constant/texts';
import { trackingShowPopupLog191 } from '@/lib/tracking/trackingCommon';
import useScreenSize from '@/lib/hooks/useScreenSize';
import styles from './LoginModal.module.css';

const OTPInputModal = dynamic(() => import('./OTPInputModal'), { ssr: false });
const NotificationModal = dynamic(() => import('./NotificationModal'), {
  ssr: false,
});
const DeviceLimitModal = dynamic(() => import('./DeviceLimitModal'), {
  ssr: false,
});

type Props = {
  visible: boolean;
  onClose: () => void;
};

type NotificationContent = {
  title?: string;
  content?: string;
  buttons?: {
    accept?: string;
  };
  action_callback?: boolean;
};

export default function LoginModal({ visible, onClose }: Props) {
  const {
    step,
    backgroundImage,
    isHidden,
    showBack,
    content,
    errors,
    handlers,
    resPhoneInput,
    resSendOTP,
    resVerifyOTP,
    notificationContent,
    deviceLimitData,
  } = useLoginAPI({ visible, onClose });

  const phoneRef = useRef<PhoneInputModalRef>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const { errorCodeResult } = useSelector(
    (state: RootState) => state.loginFlow,
  );

  useEffect(() => {
    if (step === 'phone') {
      phoneRef.current?.open();
    }
  }, [step]);

  // Lazy load main background
  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      img.onload = () => setBgLoaded(true);
    }
  }, [backgroundImage]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setIsMounted(true), 50);
      phoneRef.current?.open();
      document.body.classList.add('overflow-hidden');
      sessionStorage.setItem(
        trackingStoreKey.LOGIN_SESSION,
        new Date().toISOString(),
      );
      localStorage.removeItem(LOGIN_PHONE_NUMBER);
      localStorage.removeItem(TYPE_LOGIN);
      trackingShowPopupLog191({
        ItemName: 'Đăng nhập',
      });
    }

    return () => {
      setIsMounted(false);
      document.body.classList.remove('overflow-hidden');
    };
  }, [visible]);

  useEffect(() => {
    if (errorCodeResult) {
      handlers.handleErrorCode(errorCodeResult as onLogin3rdResponse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCodeResult]);

  const handleClose = () => {
    handlers.backToDefault();
    onClose();
  };

  const { width } = useScreenSize();
  // Check if user is mobile
  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  const isDeleteAccount = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('/xoa-tai-khoan');
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center ease-out duration-300
        ${isMounted && bgLoaded ? 'opacity-100 block' : 'opacity-0 hidden'}
     `}
    >
      {/* Mask overlay */}
      <div
        className={`absolute inset-0 z-[1002] bg-cover ${
          isTablet || isMobile ? styles.bgMaskMobile : styles.bgMask
        }`}
      />

      {/* Background image (after loaded) */}
      {bgLoaded &&
        (isTablet || isMobile ? (
          <div className="absolute inset-0 z-[1001] opacity-100">
            <img
              src={`${
                isMobile ? '/images/mobile-mask.png' : '/images/mask-tablet.png'
              }`}
              alt="shadow"
              className="absolute inset-0 z-[1001] top-[10px] left-0 w-full h-auto object-cover"
            />
            <img
              src={backgroundImage}
              alt="background"
              className="w-full h-auto object-fill"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 z-[1001] bg-cover bg-top max-md:bg-bottom opacity-100"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ))}

      {/* Overlay */}
      <div className="absolute inset-0 z-[1003]">
        {/* Header controls */}
        {!isHidden && (
          <>
            {!isDeleteAccount && (
              <button
                className="absolute top-4 tablet:top-8 right-4 tablet:right-8 text-white text-2xl"
                onClick={handleClose}
              >
                <IoCloseCircle
                  size={isMobile ? 24 : 32}
                  className="text-white-06 hover:text-white-08 cursor-pointer"
                />
              </button>
            )}

            {showBack && (
              <button
                className="absolute top-8 left-8 text-white text-2xl"
                onClick={handlers.backToDefault}
              >
                <IoArrowBackCircle
                  size={isMobile ? 24 : 32}
                  className="text-white-06 hover:text-white-08 cursor-pointer"
                />
              </button>
            )}
          </>
        )}

        <button
          onClick={() => {
            dispatch(closeLoginModal());
            router.refresh();
          }}
          className="absolute top-[40px] tablet:top-12 left-1/2 -translate-x-1/2"
        >
          {isMobile ? (
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-[120px] h-auto"
            />
          ) : (
            <LogoFPTPlayLogin />
          )}
        </button>

        {/* Modal steps */}
        {step === 'phone' && (
          <PhoneInputModal
            ref={phoneRef}
            content={content.phone}
            error={errors.phone}
            onSubmit={handlers.onSubmitPhone}
            onClose={onClose}
          />
        )}

        {step === 'otp' && (
          <OTPInputModal
            resPhoneInput={resPhoneInput}
            resSendOTP={resSendOTP}
            resVerifyOTP={resVerifyOTP}
            error={errors.otp}
            handleSendOTP={(phone, verifyToken) =>
              handlers.handleSendOTP({ phone, verifyToken })
            }
            handleReSendOTP={(phone) => handlers.handleReSendOTP({ phone })}
            handleVerifyOTP={(phone, otpCode) =>
              handlers.handleVerifyOTP({ phone, otpCode })
            }
            onClose={onClose}
          />
        )}

        {step === 'notification' && (
          <NotificationModal
            isOpen
            contentObject={notificationContent as NotificationContent}
            onClose={handlers.backToDefault}
            onCallBack={handlers.handleCallback}
          />
        )}

        {step === 'deviceLimit' && (
          <DeviceLimitModal
            isOpen
            contentObject={content.deviceLimit}
            deviceLimitData={deviceLimitData as onDevicesLimitResponse}
            onClose={handlers.backToDefault}
            onRemoveDevices={handlers.handleRemoveDevice}
          />
        )}
      </div>
    </div>
  );
}
