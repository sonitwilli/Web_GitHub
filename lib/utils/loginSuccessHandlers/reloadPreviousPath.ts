import { PATH_BEFORE_LOGIN_SSO } from '@/lib/constant/texts';

export const reloadPreviousPath = () => {
  const previousPath = localStorage.getItem(PATH_BEFORE_LOGIN_SSO);
  window.location.href = previousPath || '/';
};
