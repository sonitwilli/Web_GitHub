import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showToast } from '@/lib/utils/globalToast';
import moment from 'moment';
import _ from 'lodash';
import ConfirmModal from '@/lib/components/modal/ModalConfirm';
import VerifyModalNew from '@/lib/components/modal/ModalVerify';
import NoticeModal from '@/lib/components/modal/ModalNotice';
import { RootState } from '@/lib/store';
import { BsCaretDownFill } from 'react-icons/bs';
import {
  ERROR,
  OTP_NOT_VERIFY,
  SEND_OTP_TYPES,
  SENT_OTP_MESSAGE,
  SUPPORT_CONTACT,
  TITLE_SEND_OTP_FAIL,
  TURNOFF_AUTOPAY,
  LEAK_INFO,
  ERROR_CONNECTION,
  INFORM,
  OVER_LIMIT,
  TRY_AGAIN,
} from '@/lib/constant/texts';
import { useAutoExtend } from '@/lib/hooks/useAutoExtend';
import { useAppSelector } from '@/lib/store';
import { NoticeModalRef } from '@/lib/components/modal/ModalNotice';
import { VerifyContent } from '@/lib/components/modal/ModalVerify';

interface Token {
  plan_id?: string;
  plan_name?: string;
  last_update?: string;
  image_v2?: string;
  name?: string;
  wallet_id?: string;
  user_id?: string;
  subscription_id?: string;
  profile_id?: string;
  slug?: string;
}

interface UserTokens {
  tokens?: Token[];
}

interface ModalContent {
  title?: string;
  content?: string;
  buttons?: {
    accept?: string;
    cancel?: string;
  };
}

interface VerifyModalRef {
  openModal: () => Promise<void>;
  closeModal: () => void;
  verifyContent: VerifyContent;
  phone: string;
  handleCountDownResend: (options?: { seconds?: number }) => void;
}

const ManageAutoExtend: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.info);
  const { verify_token } = useAppSelector((state) => state.accountSlice);
  const { fetchUserTokens, doSendOtpNewFlow, cancelExtend, state, resetState } =
    useAutoExtend();
  const [userTokens, setUserTokens] = useState<UserTokens>({ tokens: [] });
  const [isLoadData, setIsLoadData] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: 'Tắt tự động gia hạn',
    content: '',
    buttons: {
      accept: 'Xác nhận',
      cancel: 'Thoát',
    },
  });
  const [resendOtp, setResendOtp] = useState(false);
  const [methodCancel, setMethodCancel] = useState<Token | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const verifyModalRef = useRef<VerifyModalRef>(null);
  const noticeModalRef = useRef<NoticeModalRef>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevVerifyTokenRef = useRef<string | undefined>(undefined);

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

  const visibilityNameCard = useCallback((str?: string) => {
    if (!str) return '';
    const showItem = str.slice(-6);
    const hiddenItem = '*************';
    return hiddenItem + showItem;
  }, []);

  const handleFetchUserTokens = useCallback(async () => {
    try {
      setIsLoadData(true);
      const response = await fetchUserTokens();
      setUserTokens({ tokens: response.data.tokens || [] });
      setIsLoadData(false);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      setUserTokens({ tokens: [] });
      setIsLoadData(false);
    }
  }, [fetchUserTokens]);

  const handleRemoveAutoExtend = useCallback(
    async (item: Token) => {
      dispatch({
        type: 'otp/SET_OTP_TYPE',
        payload: SEND_OTP_TYPES.DELETE_AUTO_EXTEND,
      });
      setModalContent({
        ...modalContent,
        content: `${item?.plan_name} sẽ ngưng tự động gia hạn sau khi thao tác thành công`,
      });
      setMethodCancel(item);

      setIsConfirmModalOpen(true);
    },
    [dispatch, modalContent],
  );

  const handleDoSendOtpNewFlow = useCallback(async () => {
    const phone = currentUser?.user_phone;
    if (!phone) return;
    try {
      const result = await doSendOtpNewFlow({ phone });
      const errorCode = result?.sendResponse?.data?.error_code;
      switch (errorCode) {
        case '0':
          if (verifyModalRef.current) {
            verifyModalRef.current.verifyContent = {
              title: 'Xác thực mã OTP',
              content: `<div style="text-align:center;"><div style="color: rgba(255,255,255,0.6)">Nhập mã OTP được gửi qua tin nhắn SMS đến số điện thoại</div><b>${formatPhone()}</b></div>`,
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
            await verifyModalRef.current.openModal();
            if (verifyModalRef.current.handleCountDownResend) {
              verifyModalRef.current.handleCountDownResend({
                seconds: Number(result?.sendResponse?.data?.seconds),
              });
            }
          }
          break;
        case '2':
          handleError22(Number(result?.sendResponse?.data?.seconds));
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
      const errorCode =
        state.sendOtpData?.error_code ||
        errorResponse.response?.data?.error_code;
      const errorMsg =
        state.sendOtpData?.msg ||
        errorResponse.response?.data?.msg ||
        SENT_OTP_MESSAGE;
      if (errorCode === '2') {
        handleError22(Number(errorResponse.response?.data?.data?.seconds));
      } else {
        showToast({
          title: TITLE_SEND_OTP_FAIL,
          desc: errorMsg,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUser?.user_phone,
    doSendOtpNewFlow,
    formatPhone,
    state.sendOtpData,
    verifyModalRef,
  ]);

  const handleCancelExtend = useCallback(
    async (item: Token) => {
      try {
        if (!item?.user_id || !verify_token) {
          showToast({
            title: 'Lỗi',
            desc: LEAK_INFO,
          });
          return;
        }

        const response = await cancelExtend({
          item,
          verify_token: verify_token,
        });
        const { status, msg_data } = response.data;

        if (!status || msg_data?.status_code !== 1) {
          setIsLoadData(false);
          showToast({
            desc: msg_data?.content || SUPPORT_CONTACT,
            title: ERROR_CONNECTION,
          });
          return;
        }

        const tokens = _.cloneDeep(userTokens.tokens);
        const idx = tokens?.findIndex(
          (token) => token.plan_id === item.plan_id,
        );
        tokens?.splice(idx as number, 1);
        setUserTokens({ ...userTokens, tokens });

        if (status) {
          showToast({
            desc:
              msg_data?.content ||
              `Quý khách đã tắt tự động gia hạn ${
                item?.plan_name
              } vào lúc ${moment().format('HH:mm')} ngày ${moment().format(
                'DD/MM/YYYY',
              )}.`,
            title: TURNOFF_AUTOPAY,
          });
          setIsLoadData(false);
        }
      } catch (error) {
        console.error('Error cancelling extension:', error);
        showToast({
          title: ERROR_CONNECTION,
          desc: state.error || SUPPORT_CONTACT,
        });
      }
    },
    [cancelExtend, state.error, userTokens, verify_token],
  );

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

  const modalAction = useCallback(async () => {
    if (!verify_token) {
      showToast({
        title: ERROR,
        desc: OTP_NOT_VERIFY,
      });
      return;
    }

    if (methodCancel) {
      await handleCancelExtend(methodCancel);
    }
    verifyModalRef.current?.closeModal();
  }, [verify_token, methodCancel, handleCancelExtend, verifyModalRef]);

  useEffect(() => {
    // Only run modalAction if verify_token changes to a truthy value
    // and it’s different from the previous value
    if (
      verify_token &&
      verify_token !== prevVerifyTokenRef.current &&
      methodCancel
    ) {
      modalAction();
    }
    // Update prevVerifyTokenRef for the next render
    prevVerifyTokenRef.current = verify_token || undefined;
  }, [verify_token, methodCancel, modalAction]);

  useEffect(() => {
    handleFetchUserTokens();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      resetState();
    };
  }, [handleFetchUserTokens, resetState]);

  return (
    <div className="extend-service-container text-white">
      <h3 className="mb-6 pb-6 border-b border-charleston-green text-2xl font-semibold">
        Quản lý gia hạn dịch vụ
      </h3>
      {Array.isArray(userTokens.tokens) && userTokens.tokens.length > 0 ? (
        <div className="accordion" role="tablist">
          {userTokens.tokens.map((item) => (
            <div key={item?.plan_id} className="mb-3 bg-white-024 rounded-lg">
              <div
                className="flex items-center justify-between w-full px-5 py-4"
                role="tab"
              >
                <h3 className="package text-lg font-semibold whitespace-nowrap pr-7">
                  {item?.plan_name}
                </h3>
                <div className="re-group flex items-center gap-5 text-sm text-white/60">
                  <div className="re-date whitespace-nowrap">
                    Ngày đăng ký: {item?.last_update}
                  </div>
                  <BsCaretDownFill
                    className="cursor-pointer"
                    onClick={() =>
                      item.plan_id !== expandedId
                        ? setExpandedId(item?.plan_id || '')
                        : setExpandedId(null)
                    }
                  />
                </div>
              </div>
              {expandedId === item?.plan_id && (
                <div className="experimental-label border-t border-white/24">
                  <div className="p-5">
                    <div className="manage-group flex justify-between items-center flex-wrap gap-4">
                      <div className="wallet flex items-center gap-4">
                        <img
                          src={item?.image_v2}
                          alt="wallet"
                          className="w-12 h-12 rounded-md"
                        />
                        <div className="wallet-group">
                          <p className="text-lg font-medium mb-1">
                            {item?.name}
                          </p>
                          <span className="text-sm text-white/60">
                            {visibilityNameCard(item?.wallet_id)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="extension bg-charleston-green text-white text-sm font-medium rounded-lg h-10 px-4 hover:bg-black-olive transition-colors cursor-pointer"
                        onClick={() => handleRemoveAutoExtend(item)}
                      >
                        Tắt tự động gia hạn
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !isLoadData ? (
        <p className="empty-data text-xl text-spanish-gray-969696 text-center pt-14">
          Không có gói đăng ký gia hạn tự động
        </p>
      ) : null}
      <VerifyModalNew
        ref={verifyModalRef}
        resendOtp={resendOtp}
        onResend={() => setResendOtp(false)}
        onHandleCancelMethods={modalAction}
      />
      <NoticeModal ref={noticeModalRef} />
      <ConfirmModal
        modalContent={modalContent}
        onHidden={() => {
          setIsConfirmModalOpen(false);
          setMethodCancel(null);
        }}
        onSubmit={() => setIsConfirmModalOpen(false)}
        onCancel={handleDoSendOtpNewFlow}
        open={isConfirmModalOpen}
      />
    </div>
  );
};

export default ManageAutoExtend;
