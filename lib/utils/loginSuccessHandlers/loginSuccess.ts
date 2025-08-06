import { PATH_BEFORE_LOGIN_SSO, TYPE_LOGIN } from '@/lib/constant/texts';
import { reloadPreviousPath } from './reloadPreviousPath';

export const loginSuccess = () => {
  // checkCTapID(); // nếu bạn dùng, import ở trên

  setTimeout(() => {
    const typeLogin = localStorage.getItem(TYPE_LOGIN);
    const currentPath = window.location.pathname;

    const shouldRedirectToHome =
      currentPath.includes('xoa-tai-khoan') || currentPath === '/';
    const isSSOCallback = currentPath.includes('login/sso/callback');

    if (typeLogin === 'fid' && isSSOCallback) {
      reloadPreviousPath();
      return;
    }

    if (typeLogin === 'fid' && shouldRedirectToHome) {
      window.location.href = '/';
      return;
    }

    if (localStorage.getItem(PATH_BEFORE_LOGIN_SSO)) {
      localStorage.removeItem(PATH_BEFORE_LOGIN_SSO);
    }

    window.location.reload();
  });
};
