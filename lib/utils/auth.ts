import { AppDispatch } from '@/lib/store';
import { changeIsLogged, changeUserInfo } from '@/lib/store/slices/userSlice';
import { resetProfiles } from '@/lib/store/slices/multiProfiles';
import { TOKEN } from '@/lib/constant/texts';
import Router from 'next/router';

export const logout = (dispatch: AppDispatch, redirectUrl: string = '/') => {
  // 1. Xoá token
  localStorage.removeItem(TOKEN);

  // 2. Reset Redux state
  dispatch(changeIsLogged(false));
  dispatch(changeUserInfo({}));
  dispatch(resetProfiles());

  // 3. Điều hướng (tuỳ chọn)
  Router.push(redirectUrl);
};
