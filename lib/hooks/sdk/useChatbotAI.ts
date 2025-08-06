import { store, useAppDispatch } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useChatbotAiSdk = () => {
  const dispatch = useAppDispatch();
  const Commands = {
    getSupportedMethods() {
      return [
        'getUserInfo',
        'genApiToken',
        'requestLogin',
        'renderEffect',
        'getPlatformInfo',
        'getDisplayInfo',
        'setDisplayMode',
        'destroy',
        'openPopup',
        'sendLog',
        'sessionInit',
      ];
    },
    sendLog(type: any, args: any) {
      console.log('sendLog', type, args);
    },
    getKeycode() {
      return {};
    },
    openPopup(type: any, args: any) {
      console.log('openPopup', type, args);
    },
    setDisplayMode() {
      return true;
    },
    getUserInfo() {
      const currentUserData = localStorage.getItem('user');
      const userData = currentUserData ? JSON.parse(currentUserData) : {};
      const user = {
        id: userData?.user_id_str,
        profileId: userData?.profile?.profile_id,
        phone: userData?.user_phone,
        phoneMask: userData?.phone_mask,
        avatar: userData?.user_avatar,
        userName: userData?.user_full_name,
        profileAvatar: userData?.profile?.avatar_url,
        profileType: userData?.profile?.profile_type,
      };

      return user || '';
    },
    requestLogin() {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      return true;
    },
    renderEffect(data: any, args: any) {
      console.log('render received', data, args);
      return true;
    },
    async genApiToken() {
      try {
        const tk = store?.getState().chatbot?.partnerToken;
        return tk || '';
        // const res = await getPartnerToken();
        // return res?.data?.data?.token || '';
        // return 'gAAAAABoa4DOKDTVw39rJIJvDlzxJtguWV0KLdZr9R5VMpTX9BFW19h8QZ4uIEtO-hnOMuk2OUw78hItdfD7DwnSE7p25YfhenXAB1EeMRBQxnEvtfwYZYdPbtwYEsKEzte8HFTYle8Hla4FzzSDuwCvRGKfN-3IO-U7ZJLs7hQT-m0_nDAzMwMiUEkui3x8lw_OIPmVTrMdSbBvYkMbBGXhsBcrKmjRuelW_raTXRDpaef2gMu4dIs7m4QdLvAebZj-aK8K-nD3FV0-rRps6dZS0Jvn7jNI2De4ydeoIiQO1c1BZUOysWha_SfHQp8f-zSV3FNQ0X1KtuQm4BPZCqTrg5o4w8aqMO6cMV-5rH-BLI5qhaEaHZs=';
      } catch {
        return '';
      }
    },
    getPlatformInfo() {
      return {
        platform: 'web',
        deviceType: 'browser',
      };
    },
    getDisplayInfo() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    destroy() {},
  };

  return { Commands };
};
