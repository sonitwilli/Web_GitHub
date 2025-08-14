import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { TITLE_SEND_OTP_FAIL, DEFAULT_ERROR_MSG } from '@/lib/constant/texts';
// import tracking from '@/lib/tracking';
import { useDeleteAccount } from '@/lib/hooks/account/useDeleteAccount';
import { useRouter } from 'next/router';
import LogoFPTPlayLogin from '@/lib/components/svg/LogoFPTPlayLogin';
import useScreenSize from '@/lib/hooks/useScreenSize';

export default function DeleteAccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.info);

  const verifyModalRef = useRef<VerifyModalNewRef>(null);
  const noticeModalRef = useRef<NoticeModalRef>(null);
  const policyModalRef = useRef<DeleteAccountPolicyModalRef>(null);
  const accountInfoRef = useRef<AccountInfoModalRef>(null);

  const [, setResendOtp] = useState(false);

  const isLogged = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }, []);

  const { width } = useScreenSize();
  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  useEffect(() => {
    if (!isLogged) {
      // Open global login modal wired in _app via Redux
      dispatch(openLoginModal());
    } else {
      checkDeleteAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged]);

  const { checkStatus, validate, sendOtp, doDisable } = useDeleteAccount();

  const checkDeleteAccount = async () => {
    const { status, packages, extras, content, message } = await checkStatus();

    if (status === 200 || status === 302) {
      // Store policy content for later use
      sessionStorage.setItem('delete_account_policy', content);

      // Set packages data and open account info modal
      accountInfoRef.current?.setPackages?.(packages, extras);
      accountInfoRef.current?.open?.();
    } else {
      noticeModalRef.current?.openModal({
        title: 'Thông báo',
        content: message || DEFAULT_ERROR_MSG,
        action: 'home',
        buttonContent: 'Đã hiểu',
      });
    }
  };

  const sendOtpDeleteAccount = async () => {
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
                  action: 'do_retry',
                  buttonContent: 'Thử lại',
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
    } catch {
      showToast({ title: TITLE_SEND_OTP_FAIL, desc: DEFAULT_ERROR_MSG });
    }
  };

  const handleSubmitPolicy = async () => {
    // Close policy modal first
    policyModalRef.current?.close();
    // Then send OTP and open verify modal
    await sendOtpDeleteAccount();
  };

  const handleContinueFromAccountInfo = async () => {
    accountInfoRef.current?.close?.();
    // Get stored policy content and open policy modal
    const policyContent = sessionStorage.getItem('delete_account_policy') || '';
    policyModalRef.current?.open(policyContent);
  };

  const doDeleteAccountNewFlow = async ({
    verify_token,
  }: {
    verify_token: string;
  }) => {
    try {
      const result = await doDisable(verify_token);
      if (result?.status === '1' || result?.status === 1) {
        // await tracking({
        //   Event: 'DeactivateSuccess',
        //   Screen: 'DeactivateAccount',
        //   Status: '1',
        //   user_id: user?.user_id_str,
        //   LogId: '198',
        //   AppId: 'MEGAHOME',
        //   AppName: 'MEGAHOME',
        // } as never);
        // logout and show notice
        noticeModalRef.current?.openModal({
          title: 'Thông báo',
          content: result?.msg || 'Xoá tài khoản thành công',
          action: 'home',
          buttonContent: 'Đã hiểu',
        });
      } else {
        noticeModalRef.current?.openModal({
          title: 'Thông báo',
          content: result?.msg || DEFAULT_ERROR_MSG,
          action: 'reload',
          buttonContent: 'Thử lại',
        });
      }
    } catch {
      noticeModalRef.current?.openModal({
        title: 'Thông báo',
        content: DEFAULT_ERROR_MSG,
        action: 'reload',
        buttonContent: 'Thử lại',
      });
    }
  };

  return (
    <div
      id="delete-account-page"
      className="min-h-[60vh] flex flex-col items-center py-10"
    >
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
      />
      <NoticeModal ref={noticeModalRef} />
    </div>
  );
}
