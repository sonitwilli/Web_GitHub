import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import { PATH_BEFORE_LOGIN_SSO } from '@/lib/constant/texts';
import { checkCTapID } from '@/lib/utils/ctap';
import { wait } from '@/lib/utils/promise';
import { useAuthTokens } from '@/lib/hooks/useAuthTokens';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { AxiosResponse } from 'axios';
import { PageDataResponseType } from '@/lib/hooks/useLibraryDelete'; // Import type từ hook

export interface NoticeContent {
  title: string;
  content: string;
  icon?: string;
  action?: string;
  buttonContent?: string;
  button?: { action: string; buttonContent: string }[];
  intervalResend?: number | boolean;
  params?: string[];
}

export interface NoticeModalProps {
  modalId?: string;
  contentClass?: string;
  variant?: string;
  disableIcon?: boolean;
  hideHeaderClose?: boolean;
  noCloseOnBackdrop?: boolean;
  data?: Partial<NoticeContent>;
  isCustom?: boolean;
  deleteData?: (type?: string) => Promise<AxiosResponse<PageDataResponseType>>; // Thêm prop deleteData
  reloadData?: () => void; // Thêm prop reloadData
  ModalContentClass?: string;
}

export interface NoticeModalRef {
  openModal: (options?: Partial<NoticeContent>) => void;
  closeModal: () => void;
  noticeContent: NoticeContent;
  setNoticeContent: (content: NoticeContent) => void;
  isCountdownRetry: boolean;
  setIsCountdownRetry: (value: boolean) => void;
}

// Các interface khác giữ nguyên
interface AuthForm {
  phone: string;
  password: string;
}

interface AuthPhoneLogin {
  form?: AuthForm;
}

interface AuthRefs {
  phoneLogin?: AuthPhoneLogin;
}

interface AuthParent {
  phone?: string;
  social_email?: string;
  $refs?: AuthRefs;
}

interface SsoForm {
  phone: string;
  password: string;
}

interface SsoPhoneLogin {
  form?: SsoForm;
}

interface SsoRefs {
  phoneLogin?: SsoPhoneLogin;
}

interface SsoParent {
  phone?: string;
  social_email?: string;
  $refs?: SsoRefs;
}

interface SsoWindow extends Window {
  $parent?: SsoParent;
}

interface SubmitModalParent {
  isPhoneLogin?: boolean;
  sendOtp?: () => void;
  submitLoginNew?: () => void;
  getDeviceLimits?: () => void;
}

interface SubmitModalWindow extends Window {
  $parent?: SubmitModalParent;
}

interface AuthWindow extends Window {
  $parent?: AuthParent;
}

const NoticeModal = forwardRef<NoticeModalRef, NoticeModalProps>(
  (
    {
      modalId = 'notice-modal',
      contentClass = 'w-full max-w-md bg-raisin-black rounded-[16px] p-[32px] text-white shadow-lg',
      variant = 'white',
      disableIcon = true,
      hideHeaderClose = false,
      noCloseOnBackdrop = false,
      data = {},
      isCustom = false,
      deleteData, // Nhận prop deleteData
      reloadData, // Nhận prop reloadData
      ModalContentClass = '',
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [noticeContent, setNoticeContent] = useState<NoticeContent>({
      title: 'Thông báo',
      content: '',
      icon: '',
      action: '',
      buttonContent: 'Đóng',
      params: [],
      intervalResend: false,
    });
    const [isCountdownRetry, setIsCountdownRetry] = useState(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const intervalRetryRef = useRef<NodeJS.Timeout | null>(null);

    const {
      deleteWebToken,
      deleteWebTokenSso,
      deleteNativeToken,
      deleteNativeTokenSso,
      state,
    } = useAuthTokens();

    const standardNoticeContent = { ...noticeContent, ...data };

    useImperativeHandle(ref, () => ({
      openModal: (options = {}) => {
        setNoticeContent((prev) => ({ ...prev, ...options }));
        setIsOpen(true);
      },
      closeModal: () => {
        setIsOpen(false);
      },
      noticeContent,
      setNoticeContent,
      isCountdownRetry,
      setIsCountdownRetry,
    }));

    useEffect(() => {
      return () => {
        if (intervalRetryRef.current) {
          clearInterval(intervalRetryRef.current);
        }
      };
    }, []);

    const setToken = useCallback(
      (token: string) => {
        dispatch({ type: 'user/SET_TOKEN', payload: token });
      },
      [dispatch],
    );

    const setTokenCookie = useCallback(
      (token: string) => {
        dispatch({ type: 'user/setTokenCookie', payload: token });
      },
      [dispatch],
    );

    const getUser = useCallback(async () => {
      await dispatch({ type: 'user/getUser' });
    }, [dispatch]);

    const reloadPreviousPathSso = useCallback(() => {
      const prePath = localStorage.getItem(PATH_BEFORE_LOGIN_SSO);
      window.location.href = prePath || '/';
    }, []);

    const handleUserInfo = useCallback(
      async (token: string) => {
        if (token) {
          setToken(token);
          setTokenCookie(token);
          await getUser();
        }
        return '';
      },
      [setToken, setTokenCookie, getUser],
    );

    const loginSuccess = useCallback(() => {
      checkCTapID();
      onSubmit('reload');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleError = useCallback((result: { msg?: string }) => {
      setNoticeContent({
        title: 'Thông báo',
        content:
          result?.msg || 'Đã có lỗi xảy ra. Vui lòng thử lại sau. Xin cảm ơn.',
        action: 'do_retry',
        buttonContent: 'Đã hiểu',
      });
      setIsOpen(true);
    }, []);

    const doDeleteWebTokenFn = useCallback(
      async (socialLogin = false) => {
        const authWindow = window as unknown as AuthWindow;
        const parent = authWindow.$parent;
        const phone = socialLogin
          ? parent?.phone || ''
          : parent?.$refs?.phoneLogin?.form?.phone || '';
        const password = socialLogin
          ? ''
          : parent?.$refs?.phoneLogin?.form?.password || '';
        const social_email = parent?.social_email || '';

        try {
          const response = await deleteWebToken({
            socialLogin,
            phone,
            password,
            social_email,
          });

          const result = response.data;
          if (result && result.error_code === 0 && result.data?.access_token) {
            localStorage.setItem('token', result.data.access_token);
            await wait();
            await handleUserInfo(result.data.access_token);
            loginSuccess();
          } else {
            await deleteNativeToken({ phone });
          }
        } catch (error) {
          handleError({
            msg: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      [
        deleteWebToken,
        deleteNativeToken,
        handleUserInfo,
        loginSuccess,
        handleError,
      ],
    );

    const doDeleteWebTokenSsoFn = useCallback(
      async (socialLogin = false) => {
        const ssoWindow = window as unknown as SsoWindow;
        const parent = ssoWindow.$parent;
        const phone = socialLogin
          ? parent?.phone || ''
          : parent?.$refs?.phoneLogin?.form?.phone || '';
        const password = socialLogin
          ? ''
          : parent?.$refs?.phoneLogin?.form?.password || '';
        const social_email = parent?.social_email || '';

        try {
          const response = await deleteWebTokenSso({
            phone,
            password,
            social_email,
          });

          const result = response.data;
          if (result && result.error_code === 0 && result.data?.access_token) {
            setToken(result.data.access_token);
            setTokenCookie(result.data.access_token);
            await getUser();
            checkCTapID();
            onSubmit('reload');
          } else {
            await deleteNativeTokenSso({ phone });
          }
        } catch (error) {
          handleError({
            msg: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        deleteWebTokenSso,
        deleteNativeTokenSso,
        setToken,
        setTokenCookie,
        getUser,
        handleError,
      ],
    );

    const onSubmit = useCallback(
      async (action: string) => {
        setIsSubmitLoading(true);
        try {
          switch (action) {
            case 'acceptLibrary': {
              if (deleteData && noticeContent.params?.[0]) {
                const response = await deleteData(noticeContent.params[0]);
                if (response?.data?.status === 'success') {
                  if (reloadData) reloadData(); // Gọi reloadData nếu có
                } else {
                  throw new Error(response?.data?.message || 'Xóa thất bại');
                }
              }
              break;
            }
            case 'cancelLibrary': {
              setIsOpen(false);
              break;
            }
            case 'do_retry_otp': {
              if (intervalRetryRef.current) {
                clearInterval(intervalRetryRef.current);
                intervalRetryRef.current = null;
              } else {
                const intervalId = window.setInterval(() => {},
                Number.MAX_SAFE_INTEGER);
                setNoticeContent((prev: NoticeContent) => ({
                  ...prev,
                  intervalResend: intervalId,
                }));
              }
              setIsOpen(false);
              break;
            }
            case 'do_retry': {
              if (intervalRetryRef.current) {
                clearInterval(intervalRetryRef.current);
                intervalRetryRef.current = null;
              }
              setIsOpen(false);
              break;
            }
            case 'do_delete_web_token': {
              await doDeleteWebTokenFn();
              break;
            }
            case 'login': {
              setIsOpen(false);
              router.push('/');
              break;
            }
            case 'login_current_page': {
              setIsOpen(false);
              dispatch(openLoginModal());
              break;
            }
            case 'do_delete_web_token_from_social_login': {
              await doDeleteWebTokenFn(true);
              break;
            }
            case 'do_delete_web_token_from_sso_login': {
              await doDeleteWebTokenSsoFn(true);
              break;
            }
            case 'login_fast': {
              router.push('/tai-khoan/quan-li-thiet-bi');
              break;
            }
            case 'home': {
              setIsOpen(false);
              router.push('/');
              break;
            }
            case 'reload': {
              const modalWindow = window as unknown as SubmitModalWindow;
              if (
                router.asPath.includes('xoa-tai-khoan') &&
                !modalWindow.$parent?.isPhoneLogin
              ) {
                router.push('/');
              } else if (router.asPath.includes('login/sso/callback')) {
                reloadPreviousPathSso();
              } else {
                window.location.reload();
              }
              break;
            }
            case 'home_reload': {
              window.location.href = '/';
              break;
            }
            case 'reload_previous_path_sso': {
              reloadPreviousPathSso();
              break;
            }
            case 'chaobanmoi': {
              window.location.href = '/dang-ky-chao-ban-moi';
              break;
            }
            case 'send_otp_new_device': {
              const modalWindow = window as unknown as SubmitModalWindow;
              const parent = modalWindow.$parent;
              if (parent?.sendOtp) parent.sendOtp();
              break;
            }
            case 'reaload_current_page': {
              window.location.reload();
              break;
            }
            case 'do_retry_remove_device': {
              const modalWindow = window as unknown as SubmitModalWindow;
              const parent = modalWindow.$parent;
              if (parent?.submitLoginNew) parent.submitLoginNew();
              setIsOpen(false);
              break;
            }
            case 'do_retry_get_device_list': {
              const modalWindow = window as unknown as SubmitModalWindow;
              const parent = modalWindow.$parent;
              if (parent?.getDeviceLimits) parent.getDeviceLimits();
              setIsOpen(false);
              break;
            }
            default: {
              setIsOpen(false);
            }
          }
        } catch (error) {
          handleError({
            msg: error instanceof Error ? error.message : 'Unknown error',
          });
        } finally {
          setIsSubmitLoading(false);
        }
      },
      [
        deleteData,
        reloadData,
        noticeContent.params,
        router,
        reloadPreviousPathSso,
        doDeleteWebTokenFn,
        doDeleteWebTokenSsoFn,
        setNoticeContent,
        setIsOpen,
        intervalRetryRef,
        handleError,
        dispatch,
      ],
    );

    return (
      <ModalWrapper
        id={modalId}
        open={isOpen}
        onHidden={() => setIsOpen(false)}
        contentClassName={contentClass}
        overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]"
        shouldCloseOnEsc={!hideHeaderClose}
        shouldCloseOnOverlayClick={!noCloseOnBackdrop}
        isCustom={isCustom}
      >
        <div className="flex flex-col items-center justify-center">
          {!disableIcon && (
            <img
              src={standardNoticeContent.icon || 'bi:x-circle'}
              className={`w-10 h-10 text-${variant}`}
              alt="Icon"
            />
          )}
          <h4 className="text-center font-[600] text-[24px] text-white-smoke leading-[130%] tracking-[0.48px] mb-[16px]">
            {standardNoticeContent.title}
          </h4>
          <div
            className={`text-center mb-[32px] modal-content-tracking ${ModalContentClass}`}
            dangerouslySetInnerHTML={{ __html: standardNoticeContent.content }}
          />
          {state.error && (
            <div className="text-red-500 text-sm mt-2">{state.error}</div>
          )}
          {standardNoticeContent.button ? (
            <div
              className={`flex w-full justify-center gap-2 ${
                isSubmitLoading || state.loading ? 'cursor-wait' : ''
              }`}
            >
              {standardNoticeContent.button.map((item, index) => (
                <button
                  key={index}
                  className={`flex-1 py-3 px-5 rounded-lg text-base font-medium ${
                    item.action.includes('do_retry') ||
                    (standardNoticeContent.button!.length > 1 && index === 0)
                      ? 'bg-charleston-green text-spanish-gray'
                      : 'bg-gradient-to-r from-portland-orange to-lust text-white'
                  } ${
                    isSubmitLoading || state.loading
                      ? 'pointer-events-none'
                      : ''
                  }`}
                  onClick={() => onSubmit(item.action)}
                >
                  {item.buttonContent}
                </button>
              ))}
            </div>
          ) : (
            <button
              className={`w-full py-[13.5px] rounded-[40px] text-white-smoke font-[600] leading-[130%] tracking-[0.32px] hover:cursor-pointer ${
                isCountdownRetry || isSubmitLoading || state.loading
                  ? 'bg-charleston-green text-dim-gray pointer-events-none'
                  : 'bg-gradient-to-r from-portland-orange to-lust '
              }`}
              onClick={() => onSubmit(standardNoticeContent.action || '')}
            >
              {standardNoticeContent.buttonContent}
            </button>
          )}
        </div>
      </ModalWrapper>
    );
  },
);

NoticeModal.displayName = 'NoticeModal';

export default NoticeModal;
