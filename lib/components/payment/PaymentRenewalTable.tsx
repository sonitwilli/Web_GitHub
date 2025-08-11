import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import PaymentRenewalTableHeader from '@/lib/components/payment/PaymentRenewalTableHeader';
import PaymentRenewalTableRow from '@/lib/components/payment/PaymentRenewalTableRow';
import styles from './PaymentRenewalTable.module.css';
import { useAutoExtend } from '@/lib/hooks/useAutoExtend';
import { Token, doSendOtpNewFlow } from '@/lib/api/payment';
// import Loading from '@/lib/components/common/Loading';
import ConfirmModal, {
  ModalContent,
} from '@/lib/components/modal/ModalConfirm';
import VerifyModalNew, {
  VerifyModalNewRef,
} from '@/lib/components/modal/ModalVerify';
import NoticeModal, {
  NoticeModalRef,
} from '@/lib/components/modal/ModalNotice';
import { useAppSelector } from '@/lib/store';
import { showToast } from '@/lib/utils/globalToast';
import {
  ERROR,
  OTP_NOT_VERIFY,
  SENT_OTP_MESSAGE,
  SUPPORT_CONTACT,
  TITLE_SEND_OTP_FAIL,
  TURNOFF_AUTOPAY,
  ERROR_CONNECTION,
  INFORM,
  OVER_LIMIT,
  TRY_AGAIN,
} from '@/lib/constant/texts';
import NoData from '@/lib/components/empty-data/NoData';
import ErrorData from '@/lib/components/error/ErrorData';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { useDispatch } from 'react-redux';
import Loading from '../common/Loading';

const PaymentRenewalTable: React.FC = () => {
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: 'Tắt tự động gia hạn',
    content: '',
    buttons: {
      accept: 'Xác nhận',
      cancel: 'Thoát',
    },
  });
  const { verify_token } = useAppSelector((state) => state.accountSlice);
  const [resendOtp, setResendOtp] = useState(false);
  const verifyModalRef = useRef<VerifyModalNewRef>(null);
  const noticeModalRef = useRef<NoticeModalRef>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { info } = useAppSelector((state) => state.user);

  // Lưu trữ giá trị verify_token mới nhất để sử dụng bên trong async/timeout
  const verifyTokenRef = useRef<string | null>(verify_token || null);
  useEffect(() => {
    verifyTokenRef.current = verify_token || null;
  }, [verify_token]);

  // TODO: Lấy số điện thoại thực tế của user từ redux hoặc props
  const userPhone = useMemo(() => info?.user_phone, [info?.user_phone]);

  const { fetchUserTokens, cancelExtend, state } = useAutoExtend();

  const dispatch = useDispatch();

  // Helper function để đảm bảo ref được truy cập an toàn
  const openVerifyModal = useCallback(
    (otpData: { mask_phone?: string; seconds?: number }, phone: string) => {
      const tryOpenModal = (attempt = 0) => {
        if (verifyModalRef.current) {
          verifyModalRef.current.verifyContent = {
            title: 'Xác thực mã OTP',
            content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">Nhập mã OTP được gửi qua tin nhắn SMS đến số điện thoại <span style="color: #f5f5f5"><b>${otpData?.mask_phone}</b></span></div></div>`,
            placeholder_input: 'Nhập mã OTP',
            button: [
              {
                action: 'do_confirm_otp_delete_auto_extend',
                content: 'Xác nhận',
              },
            ],
            link_resent: [
              {
                action: 'do_resend_otp_delete_auto_extend',
                content: 'Gửi lại',
              },
            ],
          };
          verifyModalRef.current.phone = phone;
          verifyModalRef.current.openModal?.();
          if (verifyModalRef.current?.handleCountDownResend) {
            verifyModalRef.current.handleCountDownResend({
              seconds: Number(otpData?.seconds),
            });
          }
        } else if (attempt < 10) {
          // Retry tối đa 10 lần với delay tăng dần
          setTimeout(() => tryOpenModal(attempt + 1), 50 * (attempt + 1));
        } else {
          console.error(
            'Unable to access verifyModalRef after multiple attempts',
          );
        }
      };

      tryOpenModal();
    },
    [],
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(
        setSideBarLeft({
          text: 'Quản lý thanh toán và gói',
          url: `${window?.location?.origin}/tai-khoan?tab=thanh-toan-va-goi`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserTokens();
  }, [fetchUserTokens]);

  const tokens = useMemo(
    () => state.fetchUserTokensData?.tokens || [],
    [state.fetchUserTokensData?.tokens],
  );

  // Xử lý khi click menu đóng (⋮)
  const handleCloseMenu = useCallback((token: Token) => {
    setSelectedToken(token);
    setModalContent({
      title: 'Hủy gia hạn tự động',
      content: `${token?.plan_name} sẽ ngưng tự động gia hạn sau khi thao tác thành công`,
      buttons: {
        accept: 'Hủy gia hạn',
        cancel: 'Đóng',
      },
    });
    setIsConfirmModalOpen(true);
  }, []);

  // Xử lý lỗi OTP với countdown
  const handleError22 = useCallback(
    (seconds: number) => {
      if (seconds) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          if (seconds > 0) {
            seconds--;
            if (noticeModalRef.current) {
              noticeModalRef.current.setIsCountdownRetry(true);
              noticeModalRef.current.setNoticeContent({
                title: 'Thông báo',
                content: `Quý khách đã gửi quá nhiều yêu cầu, vui lòng thử lại sau ${seconds} giây`,
                action: 'do_retry_otp',
                buttonContent: 'Thử lại',
              });
              noticeModalRef.current.openModal();
            }
            const modalElement = document.getElementById('notice-modal');
            if (modalElement?.parentNode) {
              (modalElement.parentNode as HTMLElement).style.zIndex = '1043';
            }
          } else {
            clearInterval(intervalRef.current!);
            if (noticeModalRef.current) {
              noticeModalRef.current.setIsCountdownRetry(false);
            }
          }
        }, 1000);
      } else {
        if (noticeModalRef.current) {
          noticeModalRef.current.setNoticeContent({
            title: INFORM,
            content: OVER_LIMIT,
            action: 'do_retry',
            buttonContent: TRY_AGAIN,
          });
          noticeModalRef.current.openModal();
        }
      }
    },
    [noticeModalRef],
  );

  // Xác nhận ở ConfirmModal: gửi OTP
  const handleConfirmModalSubmit = useCallback(async () => {
    if (!selectedToken) return;
    try {
      // Lấy số điện thoại thực tế của user
      const phone = userPhone;
      if (!phone) {
        setIsConfirmModalOpen(false);
        return;
      }

      // Gọi trực tiếp API mà không cập nhật state trong useAutoExtend
      const result = await doSendOtpNewFlow({ phone });

      const errorCode = result?.sendResponse?.data?.error_code;
      switch (errorCode) {
        case '0':
          openVerifyModal(result?.sendResponse?.data?.data || {}, phone);
          break;
        case '2':
          handleError22(Number(result?.sendResponse?.data?.data?.seconds));
          break;
        default:
          showToast({
            title: result?.validateResponse?.data?.title || TITLE_SEND_OTP_FAIL,
            desc: result?.validateResponse?.data?.msg || SENT_OTP_MESSAGE,
          });
          break;
      }
    } catch (error) {
      const errorResponse = error as {
        response?: {
          data?: {
            error_code?: string;
            msg?: string;
            data?: { seconds?: number };
          };
        };
      };
      const errorCode = errorResponse.response?.data?.error_code;
      const errorMsg = errorResponse.response?.data?.msg || SENT_OTP_MESSAGE;

      if (errorCode === '2') {
        handleError22(Number(errorResponse.response?.data?.data?.seconds));
      } else {
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: errorMsg,
        });
      }
    }
    setIsConfirmModalOpen(false);
  }, [selectedToken, userPhone, openVerifyModal, handleError22]);

  // Xác nhận OTP thành công ở VerifyModalNew
  const handleVerifyOtpSuccess = async () => {
    if (!selectedToken) return;

    // Chờ tối đa 1 giây để đợi verify_token được cập nhật (nếu đang về chậm)
    let token = verifyTokenRef.current;
    if (!token) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      token = verifyTokenRef.current;
    }

    if (!token) {
      showToast({
        title: ERROR,
        desc: OTP_NOT_VERIFY,
      });
      return;
    }

    try {
      const response = await cancelExtend({
        item: selectedToken,
        verify_token: token,
      });
      const { status, msg_data } = response.data;

      if (!status || msg_data?.status_code !== 1) {
        showToast({
          desc: msg_data?.content || SUPPORT_CONTACT,
          title: ERROR_CONNECTION,
        });
        return;
      }

      if (status) {
        showToast({
          desc:
            msg_data?.content ||
            `Quý khách đã tắt tự động gia hạn ${selectedToken?.plan_name} thành công.`,
          title: TURNOFF_AUTOPAY,
        });
      }
      verifyModalRef?.current?.closeModal?.();
      fetchUserTokens();
    } catch (error) {
      console.error('Error cancelling extension:', error);
      showToast({
        title: ERROR_CONNECTION,
        desc: state.error || SUPPORT_CONTACT,
      });
    }
  };

  useEffect(() => {
    handleVerifyOtpSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verify_token]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (state.loading) {
    return (
      <div className="text-white m-6 max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-4">Quản lý gia hạn dịch vụ</h2>
        <div className="relative min-h-[300px] rounded-t-[16px] rounded-b-[16px]">
          <Loading />
        </div>
      </div>
    );
  }

  if (tokens.length === 0 && !state.error) {
    return (
      <div className="text-white max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-4 xl:mb-6">
          Quản lý gia hạn dịch vụ
        </h2>
        <div className="rounded-t-[16px] rounded-b-[16px]">
          <NoData />
        </div>
      </div>
    );
  }

  if (state.error && !state.loading) {
    return (
      <div className="text-white max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-4 xl:mb-6">
          Quản lý gia hạn dịch vụ
        </h2>
        <div className="rounded-t-[16px] rounded-b-[16px]">
          <ErrorData
            onRetry={() => {
              fetchUserTokens();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-white max-w-[1136px]">
      <h2 className="text-2xl font-semibold mb-4 xl:mb-6">
        Quản lý gia hạn dịch vụ
      </h2>
      <div
        className={`bg-raisin-black rounded-t-[16px] rounded-b-[16px] overflow-x-auto 2xl:overflow-x-hidden ${styles.customScrollbar}`}
      >
        <table className="w-full border-collapse text-white px-4 md:min-w-0 min-w-[910px]">
          <PaymentRenewalTableHeader />
          <tbody className="rounded-b-[16px]">
            {(tokens as Token[])?.map((item, idx) => (
              <PaymentRenewalTableRow
                key={item?.subscription_id || idx}
                name={item.plan_name || ''}
                startDate={item.start_payment_date || ''}
                nextCycle={item.next_payment_date || ''}
                method={{
                  type: item.wallet_id_display || '',
                  value: item.wallet_id_display || '',
                  name: item.name || '',
                }}
                price={item.price_display || ''}
                isLast={idx === tokens.length - 1}
                showMenu={openMenuIdx === idx}
                onMenuToggle={() => {
                  setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                }}
                onCloseMenu={() => {
                  handleCloseMenu(item);
                  setOpenMenuIdx(null);
                }}
                iconUrl={item.image_v2}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={isConfirmModalOpen}
        modalContent={modalContent}
        onSubmit={handleConfirmModalSubmit}
        onCancel={() => setIsConfirmModalOpen(false)}
        onHidden={() => setIsConfirmModalOpen(false)}
      />
      <VerifyModalNew
        ref={verifyModalRef}
        resendOtp={resendOtp}
        onResend={() => setResendOtp(false)}
        onHandleCancelMethods={handleVerifyOtpSuccess}
      />
      <NoticeModal ref={noticeModalRef} />
    </div>
  );
};

export default PaymentRenewalTable;
