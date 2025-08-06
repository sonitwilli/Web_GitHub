import { CLOSE_LOGIN_MODAL_NOW } from '@/lib/constant/texts';

export const handleClearStrorage = () => {
  // login

  if (sessionStorage) {
    if (sessionStorage.getItem(CLOSE_LOGIN_MODAL_NOW)) {
      sessionStorage.removeItem(CLOSE_LOGIN_MODAL_NOW);
    }
  }
};
