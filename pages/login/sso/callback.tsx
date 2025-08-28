import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Oidc } from '@/lib/oidc';
import {
  PATH_BEFORE_LOGIN_SSO,
  SSO_ACCESS_TOKEN,
  SSO_ID_TOKEN,
  SSO_REFRESH_TOKEN,
  SSO_PROVIDER_ID,
  TOKEN,
  NO_ACCESS_TOKEN_OIDC,
  NO_API_RESPONSE_LOGIN_3RD,
  LOGIN_PHONE_NUMBER,
  TYPE_LOGIN,
} from '@/lib/constant/texts';
import { showToast } from '@/lib/utils/globalToast';
import {
  OidcTokenResponse,
  onLogin3RD,
  onLogin3rdResponse,
} from '@/lib/api/login';
import { handleUserInfo } from '@/lib/utils/loginSuccessHandlers/handleUserInfo';
import DefaultLayout from '@/lib/layouts/Default';
import Spinner from '@/lib/components/svg/Spinner';
import { useDispatch } from 'react-redux';
import { handleErrorCode } from '@/lib/store/slices/loginFlowSlice';
import { useAppSelector } from '@/lib/store';
import axios, { AxiosResponse } from 'axios';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { DEFAULT_ERROR_MSG } from '@/lib/constant/errors';
import {
  trackingFIDRespondLog147,
  trackingThirdPartyRespondLog149,
} from '@/lib/tracking/trackingLogin';
import { trackingErrorLog17 } from '@/lib/tracking/trackingCommon';

export default function SSOCallbackPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const dispatch = useDispatch();
  const { isLogged } = useAppSelector((state) => state.user);

  const redirectToPreviousPath = useCallback(() => {
    if (hasRedirected) return; // Prevent multiple redirects

    setHasRedirected(true);
    const prePath = localStorage.getItem(PATH_BEFORE_LOGIN_SSO);

    if (prePath && !prePath.includes('sso')) {
      localStorage.removeItem(PATH_BEFORE_LOGIN_SSO);
      window.location.href = prePath;
    } else {
      localStorage.removeItem(PATH_BEFORE_LOGIN_SSO);
      window.location.href = '/';
    }
  }, [hasRedirected]);

  const handleLoginSuccess = useCallback((result: onLogin3rdResponse) => {
    const token = result?.data?.access_token;
    if (token) {
      // Set login type for loginSuccess function to handle redirect properly
      localStorage.setItem(TYPE_LOGIN, 'fid');
      localStorage.setItem(TOKEN, token);

      showToast({
        title: 'Đăng nhập thành công',
        desc: 'Bạn đã đăng nhập thành công. Chúc bạn có trải nghiệm tuyệt vời trên FPT Play.',
      });

      // This prevents double redirect issues
      handleUserInfo(token);
    }
  }, []);

  const handleLoginError = useCallback(
    (result: onLogin3rdResponse) => {
      dispatch(handleErrorCode(result));
      dispatch(openLoginModal());
    },
    [dispatch],
  );

  const loginSSO = useCallback(
    async (ssoResponse: OidcTokenResponse) => {
      try {
        setLoading(true);
        const response: AxiosResponse<onLogin3rdResponse> = await onLogin3RD({
          provider_token: `Bearer ${ssoResponse.access_token}`,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          push_reg_id: '',
          provider_id: 'sso_ftel',
        });

        const result = response.data;
        if (!response) {
          trackingThirdPartyRespondLog149({
            ErrMessage: NO_API_RESPONSE_LOGIN_3RD,
            Screen: 'Fail',
          });
        }
        if (result?.error_code?.toString() === '0') {
          handleLoginSuccess(result);
        } else {
          // Luôn gửi log 149 success khi gọi API thành công không quan tâm error code
          // Case error_code = 0 cần đợi handleUserInfo gọi API thành công
          trackingThirdPartyRespondLog149({
            Url: result?.data?.access_token,
            Screen: 'Success',
          });
          handleLoginError(result);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        showToast({
          title: 'Thông báo',
          desc: 'Xảy ra lỗi trong quá trình đăng nhập',
        });
        trackingThirdPartyRespondLog149({
          ErrMessage: err?.message || '',
          Screen: 'Fail',
        });
      } finally {
        setLoading(false);
      }
    },
    [handleLoginSuccess, handleLoginError],
  );

  const getSsoResponse = useCallback(async () => {
    try {
      setLoading(true);
      const oidc = new Oidc({ phoneNumber: '' });
      const response = await oidc.handleSigninCallback();

      if (response?.access_token) {
        localStorage.setItem(SSO_ID_TOKEN, response.id_token || '');
        localStorage.setItem(SSO_REFRESH_TOKEN, response.refresh_token || '');
        localStorage.setItem(SSO_ACCESS_TOKEN, response.access_token);
        localStorage.setItem(SSO_PROVIDER_ID, 'sso_ftel');
        trackingFIDRespondLog147({
          Url: response.access_token,
          Screen: 'Success',
        });
        await loginSSO(response);
      } else {
        trackingFIDRespondLog147({
          ErrMessage: NO_ACCESS_TOKEN_OIDC,
          Screen: 'Fail',
        });
        showToast({
          title: 'Thông báo',
          desc: DEFAULT_ERROR_MSG,
        });
        router.replace('/');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      trackingErrorLog17({
        ErrMessage: err?.message,
        ItemName: 'Đã có lỗi xảy ra, vui lòng thử lại sau. Xin cảm ơn.',
        ItemId: localStorage.getItem(LOGIN_PHONE_NUMBER) || '',
        Event: 'LimitDevice',
        ErrCode: err?.code,
      });
      trackingFIDRespondLog147({
        ErrMessage: err?.message || '',
        Screen: 'Fail',
      });
      let fallback = '';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        fallback =
          data?.data?.errors || data?.msg || data?.message || data?.detail;

        showToast({
          title: 'Thông báo',
          desc: fallback || DEFAULT_ERROR_MSG,
        });
      }

      redirectToPreviousPath();
    } finally {
      setLoading(false);
    }
  }, [loginSSO, redirectToPreviousPath, router]);

  useEffect(() => {
    if (!router.isReady) return;

    const code = router.query.code as string | undefined;

    if (!code) {
      router.replace('/');
      return;
    }

    if (!isLogged) {
      getSsoResponse();
    } else {
      trackingFIDRespondLog147({
        Screen: 'Success',
      });
      redirectToPreviousPath();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    router.isReady,
    router.query.code,
    isLogged,
    getSsoResponse,
    redirectToPreviousPath,
  ]);

  return (
    <DefaultLayout>
      {isLoading && (
        <div className="fixed inset-0 z-5 flex items-center justify-center">
          <div className="icon-spin">
            <Spinner />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
