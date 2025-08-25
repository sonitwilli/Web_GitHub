import { useEffect, useMemo, useRef, useState } from 'react';
import ProfileOtpInput from '@/lib/components/multi-profile/OtpInputWrapper';
import ConfirmDialog, {
  ConfirmDialogRef,
  ModalContent,
} from '@/lib/components/modal/ModalConfirm';
import axios from 'axios';
import { onLoginResponse, onQuickLogin } from '@/lib/api/login';
import {
  DEFAULT_ERROR_MSG,
  RETRY_BUTTON_TEXT,
  SHORT_BACK_TO_HOME_TEXT,
  UNDERSTOOD_BUTTON_TEXT,
  CLOSE_LOGIN_MODAL_NOW,
  CONFIRM_BUTTON_TEXT,
  QUICK_LOGIN_OTP_CODE,
} from '@/lib/constant/texts';
import { useDispatch } from 'react-redux';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { PLEASE_CHECK_NETWORK_ERROR } from '@/lib/constant/errors';
import { handleErrorCode } from '@/lib/store/slices/loginFlowSlice';
import { useRouter } from 'next/router';
import { RootState, store, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { changeUserInfo } from '@/lib/store/slices/userSlice';
import { resetProfiles } from '@/lib/store/slices/multiProfiles';
import { closeLoginModal } from '@/lib/store/slices/loginSlice';

export default function LoginFastDialog() {
  const [otp, setOtp] = useState('');
  const isComplete = otp.length === 6;

  const modalRef = useRef<ConfirmDialogRef>(null);
  const [modalContent, setModalContent] = useState<ModalContent>();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLogged } = useAppSelector((state) => state.user);

  const { width, height } = useScreenSize();

  const isToggleZIndex = useMemo(() => {
    return width <= 768 && height <= 600;
  }, [width, height]);

  const openModal = (content: ModalContent) => {
    setModalContent(content);
    modalRef.current?.openModal?.();
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    // Optionally sync to Redux or other store
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    handleSubmit(value);
  };

  const [otpKey, setOtpKey] = useState(0);

  const handleNextStep = (data?: ModalContent) => {
    const caseAction = data?.buttons?.accept;

    switch (caseAction) {
      case SHORT_BACK_TO_HOME_TEXT:
        setOtp('');
        setOtpKey((prev) => prev + 1); // Force remount OtpInput
        router.push('/');
        break;
      case RETRY_BUTTON_TEXT:
        setOtp('');
        setOtpKey((prev) => prev + 1); // Force remount OtpInput
        break;
      case UNDERSTOOD_BUTTON_TEXT:
        setOtp('');
        setOtpKey((prev) => prev + 1); // Force remount OtpInput
        break;
      default:
        setOtp('');
        setOtpKey((prev) => prev + 1); // Force remount OtpInput
        break;
    }
  };

  const handleSubmit = async (value?: string) => {
    if (!isLogged) {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      return;
    }

    const code = value || otp;
    if (!code || code.length !== 6) return;

    try {
      const { data: resp }: { data: onLoginResponse } = await onQuickLogin({
        login_key: code,
        push_reg_id: '',
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      });

      const message = resp.msg || DEFAULT_ERROR_MSG;

      switch (resp.error_code) {
        case '0':
          openModal({
            title: resp.data?.title || 'Thành công',
            content: message,
            buttons: { accept: SHORT_BACK_TO_HOME_TEXT },
          });
          if (sessionStorage.getItem(CLOSE_LOGIN_MODAL_NOW)) {
            sessionStorage.removeItem(CLOSE_LOGIN_MODAL_NOW);
          }
          break;

        case '7':
          if (resp.data?.verify_token) {
            // Lưu OTP code để sử dụng lại sau khi remove device
            sessionStorage.setItem(QUICK_LOGIN_OTP_CODE, code);
            dispatch(handleErrorCode(resp));
            dispatch(openLoginModal());
            sessionStorage.setItem(CLOSE_LOGIN_MODAL_NOW, 'true');
          } else {
            openModal({
              title: resp.data?.title || 'Thông báo',
              content: message,
              buttons: { accept: 'Đóng' },
            });
          }
          break;

        case '33':
        case '34':
        case '40':
          openModal({
            title: resp.data?.title || 'Thông báo',
            content: message,
            buttons: { accept: UNDERSTOOD_BUTTON_TEXT },
          });
          break;

        case '35':
          openModal({
            title: resp.data?.title || 'Thông báo',
            content: message,
            buttons: { accept: RETRY_BUTTON_TEXT },
          });
          break;

        default:
          openModal({
            title: resp.data?.title || 'Thông báo',
            content: message,
            buttons: { accept: 'Đóng' },
          });
          break;
      }
    } catch (err: unknown) {
      let fallbackMessage = DEFAULT_ERROR_MSG;

      if (axios.isAxiosError(err)) {
        const resData = err.response?.data;
        const errorDetail =
          resData?.data?.errors ||
          resData?.msg ||
          resData?.message ||
          resData?.detail;

        if (err.response?.status === 401) {
          // Update stores when user is not authenticated
          dispatch(changeUserInfo({}));
          dispatch(resetProfiles());
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));

          if ((store.getState() as RootState).loginSlice.visible) {
            dispatch(closeLoginModal());
          }
          return;
        }

        fallbackMessage =
          err.message === 'Network Error'
            ? PLEASE_CHECK_NETWORK_ERROR
            : errorDetail || fallbackMessage;

        openModal({
          title: 'Thông báo',
          content: fallbackMessage,
          buttons: { accept: 'Đóng' },
        });
      }

      openModal({
        title: 'Thông báo',
        content: fallbackMessage,
        buttons: { accept: 'Đóng' },
      });
    }
  };

  // Tự động submit lại OTP code khi page được reload sau khi remove device
  useEffect(() => {
    const savedOtpCode = sessionStorage.getItem(QUICK_LOGIN_OTP_CODE);
    if (savedOtpCode && savedOtpCode.length === 6) {
      // Xóa OTP code đã lưu trước
      sessionStorage.removeItem(QUICK_LOGIN_OTP_CODE);
      // Set OTP và trigger submit
      setOtp(savedOtpCode);
      // Sử dụng setTimeout để đảm bảo state đã được cập nhật
      setTimeout(() => {
        handleSubmit(savedOtpCode);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock scroll
  useEffect(() => {
    document.body.classList.add('overflow-hidden');

    return () => {
      document.body.classList.remove('overflow-hidden');
      sessionStorage.removeItem(QUICK_LOGIN_OTP_CODE);
    };
  }, []);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      scrollTo({ top: 0, behavior: 'smooth' });
      document.body.classList.add('overflow-hidden');
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isLogged === false) {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
    }
  }, [dispatch, isLogged]);

  return (
    <div
      className={`fixed inset-0 z-0 flex ${
        isToggleZIndex
          ? 'pt-40 items-start justify-center'
          : 'items-center justify-center'
      }`}
    >
      <div className="relative z-10 w-[320px] tablet:w-[460px] h-auto min-h-[300px] bg-eerie-black rounded-[16px] flex flex-col items-center justify-center px-6 tablet:px-8 py-6 gap-8">
        {/* Title */}
        <div className="w-full max-w-[396px] flex flex-col gap-4">
          <h2 className="text-[20px] tablet:text-[24px] leading-[130%] font-semibold text-white">
            Đăng nhập nhanh
          </h2>
          <p className="text-[14px] tablet:text-[16px] leading-[130%] text-spanish-gray">
            Vui lòng nhập mã kết nối hiển thị trên thiết bị TV
          </p>
        </div>

        {/* OTP */}
        <ProfileOtpInput
          key={otpKey}
          numInputs={6}
          inputType="text"
          inputClasses="mb-2"
          onChange={handleOtpChange}
          onComplete={handleOtpComplete}
        />

        {/* Button */}
        <button
          disabled={!isComplete}
          onClick={() => handleSubmit()}
          className={`w-full tablet:w-[396px] h-12 rounded-full text-[16px] font-semibold transition ${
            isComplete
              ? 'fpl-bg text-white-smoke cursor-pointer'
              : 'bg-charleston-green text-black-olive-404040'
          }`}
        >
          {CONFIRM_BUTTON_TEXT}
        </button>
      </div>

      {/* Modal */}
      <ConfirmDialog
        ref={modalRef}
        modalContent={modalContent}
        onSubmit={() => {
          handleNextStep(modalContent);
        }}
      />
    </div>
  );
}
