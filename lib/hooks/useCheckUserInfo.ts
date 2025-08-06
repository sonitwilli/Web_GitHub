import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/lib/store';
import { changeUserInfo } from '@/lib/store/slices/userSlice';
import { getUserInfo } from '@/lib/api/user';
import { fetchListProfiles } from '@/lib/utils/multiProfiles/fetchListProfiles';
import { setCookie, deleteCookie } from 'cookies-next';
import { NUMBER_PR, TOKEN, TYPE_PR, USER } from '@/lib/constant/texts';

export const useCheckUserInfo = () => {
  const [checkLoginComplete, setCheckLoginComplete] = useState(false);
  const dispatch = useAppDispatch();

  const checkUserInfo = useCallback(async () => {
    if (checkLoginComplete) return;
    try {
      if (localStorage.getItem(TOKEN)) {
        const res = await getUserInfo();
        dispatch(changeUserInfo(res?.data || {}));
        localStorage.setItem(NUMBER_PR, res?.data?.profile?.profile_id || '');
        localStorage.setItem(TYPE_PR, res?.data?.profile?.profile_type || '');
        localStorage.setItem(USER, JSON.stringify(res?.data));
        setCookie(NUMBER_PR, res?.data?.profile?.profile_id || '');
        setCookie(TYPE_PR, res?.data?.profile?.profile_type || '');
        await fetchListProfiles(dispatch);
      }
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 401) {
        localStorage.removeItem(USER);
        localStorage.removeItem(TOKEN);
        localStorage.removeItem(NUMBER_PR);
        localStorage.removeItem(TYPE_PR);
        deleteCookie(NUMBER_PR);
        deleteCookie(TYPE_PR);
        window.location.reload();
      }
    }
    setCheckLoginComplete(true);
  }, [checkLoginComplete, dispatch]);

  return {
    checkUserInfo,
    checkLoginComplete,
  };
};
