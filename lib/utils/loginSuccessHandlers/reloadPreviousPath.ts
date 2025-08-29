import { PATH_BEFORE_LOGIN_SSO } from '@/lib/constant/texts';

export const reloadPreviousPath = () => {
  // Clean up path and redirect
  const previousPath = localStorage.getItem(PATH_BEFORE_LOGIN_SSO);

  if (previousPath && !previousPath.includes('sso')) {
    window.location.href = previousPath;
  } else {
    window.location.href = '/';
  }
};
