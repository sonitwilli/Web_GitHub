import { pushRegIdAPI } from '@/lib/api/login';
import { loginSuccess } from './loginSuccess';
import {
  NUMBER_PR,
  TOKEN,
  TYPE_LOGIN,
  TYPE_PR,
  USER,
} from '@/lib/constant/texts';
import { store } from '@/lib/store';
import { getUserInfo } from '@/lib/api/user';
import { fetchListProfiles } from '../multiProfiles/fetchListProfiles';
import { setCookie } from 'cookies-next';
import {
  trackingCheckAPIGetUserInfoLog150,
  trackingLoginSuccessLog14,
  trackingThirdPartyRespondLog149,
} from '@/lib/tracking/trackingLogin';

export const getUserState = () => {
  const state = store.getState();
  const userState = state.user;
  return userState;
};

const userInfo = getUserState();

const handlePushRegId = async () => {
  const params = {
    app: 'fplay',
    user_id: userInfo?.info?.user_id?.toString() || '',
    pushRegId: localStorage.getItem(TOKEN) || '',
    platForm: 'web',
    vp: 2,
  };

  try {
    await pushRegIdAPI(params);
  } catch {}
};

export const handleUserInfo = async (token?: string) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN, token);
    }

    // Step 1: Lấy thông tin user
    const res = await getUserInfo();
    const loginMethod = localStorage.getItem(TYPE_LOGIN);
    if (loginMethod === 'sso') {
      trackingThirdPartyRespondLog149({
        Url: token,
        Screen: 'Success',
      });
    }
    trackingLoginSuccessLog14(res?.data);
    localStorage.setItem(NUMBER_PR, res?.data?.profile?.profile_id || '');
    localStorage.setItem(TYPE_PR, res?.data?.profile?.profile_type || '');
    localStorage.setItem(USER, JSON.stringify(res?.data));
    setCookie(NUMBER_PR, res?.data?.profile?.profile_id || '');
    setCookie(TYPE_PR, res?.data?.profile?.profile_type || '');
    // Step 2: Lấy danh sách profiles từ API và lưu vào store
    await fetchListProfiles(store.dispatch);

    // Step 3: Push regId lên hệ thống
    await handlePushRegId();

    // Step 4: Gọi các handler khác (ví dụ CleverTap)
    loginSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    trackingCheckAPIGetUserInfoLog150(error?.message || '');
  }
};
