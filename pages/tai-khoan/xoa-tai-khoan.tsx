import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
//
import { useDispatch, useSelector } from 'react-redux';
import NoticeModal, {
  NoticeModalRef,
} from '@/lib/components/modal/ModalNotice';
import VerifyModalNew, {
  VerifyModalNewRef,
  VerifyContent as VerifyModalContent,
} from '@/lib/components/modal/ModalVerify';
import DeleteAccountPolicyModal, {
  DeleteAccountPolicyModalRef,
} from '@/lib/components/delete-account/DeleteAccountPolicyModal';
import AccountInfoModal, {
  AccountInfoModalRef,
} from '@/lib/components/delete-account/AccountInfoModal';
import { RootState } from '@/lib/store';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { showToast } from '@/lib/utils/globalToast';
import { TITLE_SEND_OTP_FAIL, TOKEN, USER } from '@/lib/constant/texts';
// import tracking from '@/lib/tracking';
import { useDeleteAccount } from '@/lib/hooks/account/useDeleteAccount';
import { useRouter } from 'next/router';
import LogoFPTPlayLogin from '@/lib/components/svg/LogoFPTPlayLogin';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { AppContext } from '@/lib/components/container/AppContainer';
import { scaleImageUrl } from '@/lib/utils/methods';
import styles from '@/lib/components/login/LoginModal.module.css';
import { AxiosError } from 'axios';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { useNetwork } from '@/lib/components/contexts/NetworkProvider';
import { DEFAULT_ERROR_MSG, TITLE_SERVICE_ERROR } from '@/lib/constant/errors';
import {
  trackingAccessItemLog108,
  trackingLog198,
} from '@/lib/hooks/useTrackingModule';
import { resetProfiles } from '@/lib/store/slices/multiProfiles';

export default function DeleteAccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.info);
  const { isOffline } = useNetwork();

  const verifyModalRef = useRef<VerifyModalNewRef>(null);
  const noticeModalRef = useRef<NoticeModalRef>(null);
  const policyModalRef = useRef<DeleteAccountPolicyModalRef>(null);
  const accountInfoRef = useRef<AccountInfoModalRef>(null);

  const [, setResendOtp] = useState(false);
  const { configs } = useContext(AppContext);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { width } = useScreenSize();
  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  // --- Effects ---
  useEffect(() => {
    trackingAccessItemLog108({
      Event: 'DeactivateAccount',
    });
  }, []);

  useEffect(() => {
    if (configs?.image?.bg_signin_signup_tv) {
      const url = scaleImageUrl({
        imageUrl: configs.image.bg_signin_signup_tv,
        width: isTablet ? width : 1080,
      });
      if (url) {
        setBackgroundImage(url as string);
        setImageLoaded(false);
        setImageError(false);
      }
    }
  }, [isTablet, configs, width]);

  // Preload background image
  useEffect(() => {
    if (backgroundImage && !isTablet && !isMobile) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = backgroundImage;
    } else if (backgroundImage && (isTablet || isMobile)) {
      // For mobile/tablet, we load the image directly in img tag
      setImageLoaded(true);
    }
  }, [backgroundImage, isTablet, isMobile]);

  const isLogged = useSelector((state: RootState) => !!state.user.info);

  const { checkStatus, validate, sendOtp, doDisable } = useDeleteAccount();

  const checkDeleteAccount = useCallback(async () => {
    try {
      const { status, packages, extras, content, message } =
        await checkStatus();

      if (status === 200 || status === 302) {
        sessionStorage.setItem('delete_account_policy', content);
        accountInfoRef.current?.setPackages?.(packages, extras);
        accountInfoRef.current?.open?.();
      } else if (status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      } else {
        noticeModalRef.current?.openModal({
          title: 'Thông báo',
          content: message || DEFAULT_ERROR_MSG,
          action: 'home',
          buttonContent: 'Thoát',
        });
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
          return;
        }
        // Offline/network error → show toast only, do not switch modal
        if (!err.response || err.code === 'ERR_NETWORK') {
          showToast({
            title: TITLE_SERVICE_ERROR,
            desc: DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
          return;
        }
      }
      // Other errors: keep existing modal behavior
      noticeModalRef.current?.openModal({
        title: 'Thông báo',
        content: DEFAULT_ERROR_MSG,
        action: 'home',
        buttonContent: 'Thoát',
      });
    }
  }, [checkStatus, accountInfoRef, dispatch]);

  const sendOtpDeleteAccount = async () => {
    if (isOffline) {
      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: DEFAULT_ERROR_MSG,
        timeout: 5000,
      });
      return;
    }
    try {
      const v = await validate();
      if (v?.mask_phone && typeof window !== 'undefined') {
        sessionStorage.setItem('MASK_PHONE', v?.mask_phone || '');
      }
      if (!v?.verify_token) return;
      const phone = user?.user_phone || '';
      const result = await sendOtp(phone, v.verify_token);
      switch (result?.error_code) {
        case '0': {
          const convertMsg = (data: {
            msg: string;
            text_format?: { text: string }[];
          }) => {
            let msg = data.msg || '';
            (data.text_format || []).forEach((f) => {
              msg = msg.replace(f.text, `<b>${f.text}</b>`);
            });
            return msg;
          };

          // Format message for OTP modal
          const formattedMessage = convertMsg({
            msg:
              result?.msg ||
              'Nhập mã OTP được gửi qua tin nhắn SMS đến số điện thoại 081***2501',
            text_format: result?.data?.text_format || [],
          });

          const content: VerifyModalContent = {
            title: 'Xác thực mã OTP',
            content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">${formattedMessage}</div></div>`,
            placeholder_input: 'Mã OTP',
            button: [
              {
                action: 'do_confirm_otp_delete_account_new_flow',
                content: 'Xác nhận',
              },
            ],
            link_resent: [
              {
                action: 'do_resend_otp_delete_account_new_flow',
                content: 'Gửi lại',
              },
            ],
          };

          if (verifyModalRef.current) {
            verifyModalRef.current.verifyContent = content;
            verifyModalRef.current.openModal?.();
            setResendOtp(true);
            verifyModalRef.current.handleCountDownResend?.({
              seconds: Number(result?.data?.seconds) || 60,
            });
          }
          break;
        }
        case '2': {
          // Too many requests, show countdown in NoticeModal
          const seconds = Number(result?.data?.seconds) || 0;
          if (seconds > 0) {
            let countdown = seconds;
            const id = window.setInterval(() => {
              if (countdown > 0) {
                countdown -= 1;
                noticeModalRef.current?.openModal({
                  title: 'Thông báo',
                  content: `Quý khách đã gửi quá nhiều yêu cầu, vui lòng thử lại sau ${countdown} giây`,
                  action: 'home',
                  buttonContent: 'Thoát',
                });
              } else {
                window.clearInterval(id);
              }
            }, 1000);
          }
          break;
        }
        default: {
          showToast({
            title: TITLE_SEND_OTP_FAIL,
            desc: result?.msg || DEFAULT_ERROR_MSG,
          });
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
          return;
        }
        if (!error.response || error.code === 'ERR_NETWORK') {
          showToast({
            title: TITLE_SERVICE_ERROR,
            desc: DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
          return;
        }
      }
      showToast({ title: TITLE_SEND_OTP_FAIL, desc: DEFAULT_ERROR_MSG });
    }
  };

  const handleSubmitPolicy = async () => {
    if (isOffline) {
      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: DEFAULT_ERROR_MSG,
        timeout: 5000,
      });
      return;
    } else {
      // Close policy modal first
      policyModalRef.current?.close();
      // Then send OTP and open verify modal
      await sendOtpDeleteAccount();
    }
  };

  const handleContinueFromAccountInfo = async () => {
    if (isOffline) {
      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: DEFAULT_ERROR_MSG,
        timeout: 5000,
      });
      accountInfoRef.current?.open?.();
      return;
    } else {
      accountInfoRef.current?.close?.();
      // Get stored policy content and open policy modal
      const policyContent =
        sessionStorage.getItem('delete_account_policy') || '';
      policyModalRef.current?.open(policyContent);
    }
  };

  const doDeleteAccountNewFlow = async ({
    verify_token,
  }: {
    verify_token: string;
  }) => {
    if (isOffline) {
      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: DEFAULT_ERROR_MSG,
        timeout: 5000,
      });
      return;
    }
    try {
      const result = await doDisable(verify_token);

      // Close all modals first to prevent overlay issues
      verifyModalRef.current?.closeModal?.();
      policyModalRef.current?.close();
      accountInfoRef.current?.close();

      if (result?.status === '1' || result?.status === 1) {
        // Success case - account deleted successfully
        // await tracking({
        //   Event: 'DeactivateSuccess',
        //   Screen: 'DeactivateAccount',
        //   Status: '1',
        //   user_id: user?.user_id_str,
        //   LogId: '198',
        //   AppId: 'MEGAHOME',
        //   AppName: 'MEGAHOME',
        // } as never);

        // Logout user properly using the logout hook

        // Show success notice and redirect to home
        noticeModalRef.current?.openModal({
          title: result?.data?.title || 'Thông báo',
          content:
            result?.msg ||
            'Xóa tài khoản thành công. Cảm ơn bạn đã sử dụng dịch vụ.',
          action: 'home',
          buttonContent: 'Thoát',
        });
        trackingLog198({
          Event: 'DeactivateSuccess',
          Status: 'Success',
        });
        // Clear user data and logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN);
          localStorage.removeItem(USER);
          sessionStorage.clear();
          dispatch(resetProfiles());
        }
      } else if (result?.status === '401' || result?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      } else {
        // Error case - show error and use reload action like Nuxt
        const r: {
          data?: { title?: string };
          title?: string;
          msg?: string;
        } = result as unknown as {
          data?: { title?: string };
          title?: string;
          msg?: string;
        };
        noticeModalRef.current?.openModal({
          title: r?.data?.title || r?.title || 'Thông báo',
          content: result?.msg || DEFAULT_ERROR_MSG,
          action: 'home',
          buttonContent: 'Thoát',
        });
        trackingLog198({
          Event: 'DeactivateSuccess',
          Status: 'Fail',
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
          return;
        }
        if (!error.response || error.code === 'ERR_NETWORK') {
          showToast({
            title: TITLE_SERVICE_ERROR,
            desc: DEFAULT_ERROR_MSG,
            timeout: 5000,
          });
          return;
        }
      }
      trackingLog198({
        Event: 'DeactivateSuccess',
        Status: 'Fail',
      });
      let errorMsg = DEFAULT_ERROR_MSG;
      let title = 'Thông báo';
      if (error instanceof AxiosError) {
        title =
          error.response?.data?.title ||
          error.response?.data?.data?.title ||
          'Thông báo';
        errorMsg = error.response?.data?.msg || DEFAULT_ERROR_MSG;
      }
      // Exception case - close all modals and show error
      verifyModalRef.current?.closeModal?.();
      policyModalRef.current?.close();
      accountInfoRef.current?.close();

      noticeModalRef.current?.openModal({
        title,
        content: errorMsg,
        action: 'home',
        buttonContent: 'Thoát',
      });
    }
  };

  useEffect(() => {
    if (!isLogged || !localStorage.getItem(TOKEN)) {
      dispatch(openLoginModal());
    } else {
      checkDeleteAccount();
    }
  }, [checkDeleteAccount, dispatch, isLogged]);

  if (!isLogged) {
    return null;
  }

  return (
    <div
      id="delete-account-page"
      className="min-h-[60vh] flex flex-col items-center py-10"
    >
      {/* Background image (after loaded) */}
      <div className="absolute inset-0 z-[1] opacity-100">
        {/* Mask overlay */}
        <div
          className={`absolute inset-0 z-[2] bg-cover ${
            isTablet || isMobile ? styles.bgMaskMobile : styles.bgMask
          }`}
        />
        {/* Background image */}
        {isTablet || isMobile ? (
          <div className="absolute inset-0 z-[1] opacity-100">
            <img
              src={`${
                isMobile ? '/images/mobile-mask.png' : '/images/mask-tablet.png'
              }`}
              alt="shadow"
              className="absolute inset-0 z-[1] top-[10px] left-0 w-full h-auto object-cover"
              loading="lazy"
            />
            {backgroundImage && (
              <img
                src={backgroundImage}
                alt="background"
                className={`w-full h-auto object-fill transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
            {/* Fallback background color when image fails to load */}
            {(imageError || !backgroundImage) && (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
            )}
          </div>
        ) : (
          <>
            {backgroundImage && imageLoaded && !imageError && (
              <div
                className="absolute inset-0 z-[1] bg-cover bg-top max-md:bg-bottom opacity-100 transition-opacity duration-300"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
            )}
            {/* Fallback background when image fails to load or is loading */}
            {(!backgroundImage || !imageLoaded || imageError) && (
              <div className="absolute inset-0 z-[1] bg-gradient-to-b from-gray-900 to-black opacity-100" />
            )}
          </>
        )}
      </div>

      <div className="mb-8 flex flex-col items-center">
        <button
          onClick={() => {
            router.push('/');
          }}
          className="absolute z-[10000] top-[40px] tablet:top-12 left-1/2 -translate-x-1/2"
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
      </div>

      <DeleteAccountPolicyModal
        ref={policyModalRef}
        onSubmit={handleSubmitPolicy}
      />

      {/* Account info modal shown before policy */}
      <AccountInfoModal
        ref={accountInfoRef}
        onContinue={handleContinueFromAccountInfo}
      />

      <VerifyModalNew
        ref={verifyModalRef}
        onDoDeleteAccountNewFlow={doDeleteAccountNewFlow}
        onResend={() => setResendOtp(false)}
        overlayClass="fixed inset-0 bg-transparent flex justify-center items-center z-[9999] p-4"
        isCustom={false}
        contentClass="bg-eerie-black!"
      />

      <NoticeModal
        ref={noticeModalRef}
        contentClass="w-full max-w-md bg-eerie-black rounded-[16px] p-[32px] text-white shadow-lg"
        ModalContentClass="text-spanish-gray text-[16px] leading-[130%] tracking-[0.02em] font-normal"
      />
    </div>
  );
}
