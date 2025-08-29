export interface LiveChatUser {
  id?: string;
  avatar?: string;
  userName?: string;
  phone?: string;
  phoneMask?: string;
  profileAvatar?: string;
  profileId?: string;
}
export interface LivechatMethods {
  getSupportedMethods(): string[];
  getKeycode(): Record<string, number>;
  openLink(url?: string): void;
  sendLog(data?: sendLogOptions): boolean;
  openPopup(type: string, args?: openPopupOptions): boolean;
  setDisplayMode(mode: string): boolean;
  getUserInfo(): Promise<LiveChatUser | ''>;
  requestLogin(): boolean;
  genApiToken(): Promise<string | undefined>;
  getPlatformInfo(): platformInfoResponse;
  getDisplayInfo(): displayInfoResponse;
  destroy(): boolean;
  getDeviceInfo(): deviceInfoResponse;
}
export interface platformInfoResponse {
  platform?: string;
  version?: string;
  deviceModel?: string;
  isEmulator?: boolean;
  deviceType?: string;
}
export interface displayInfoResponse {
  mode?: string;
  width?: number;
  height?: number;
}
export interface openPopupOptionsInfo {
  userId?: string;
  userName?: string;
  avatar?: string;
  msgUid?: string;
  msg?: string;
}
export interface openPopupOptionsData {
  id?: string;
  title?: string;
  desc?: string;
  action?: string;
  icon?: string;
  button?: string;
}
export interface openPopupOptions {
  title?: string;
  info?: openPopupOptionsInfo;
  data?: openPopupOptionsData[];
}
export interface sendLogOptionsMetadata {
  LogId?: string;
  Screen?: string;
  Event?: string;
  Url?: string;
}
export interface sendLogOptions {
  type: string;
  metadata: sendLogOptionsMetadata;
}
export interface deviceInfoResponse {
  deviceId?: string;
  version?: string;
}
export interface setDisplayModeOptions {
  [key: string]: string;
}
import { getLiveChatToken } from '@/lib/api/livechat';
import {
  getUserInfo as fetchUserInfo,
  UserInfoResponseType,
} from '@/lib/api/user';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { store } from '@/lib/store';
import {
  openConfirmDeleteModal,
  openWarningModal,
  setLiveChatHeight,
} from '@/lib/store/slices/liveChatSlice';
import { showToast } from '@/lib/utils/globalToast';
import { setIsOpenLiveChat } from '@/lib/store/slices/playerSlice';
import { SHOW_REAL_TIME_CHAT } from '@/lib/constant/texts';
import { showDownloadBarGlobally } from '@/lib/hooks/useDownloadBarControl';
import { trackingClickLinkLog190 } from '@/lib/hooks/useTrackingLivechat';
import { TrackingEvent, TrackingScreen } from '@/lib/tracking/tracking-types';
export const Commands: LivechatMethods = {
  getSupportedMethods() {
    return [
      'getUserInfo',
      'genApiToken',
      'requestLogin',
      'getPlatformInfo',
      'getDisplayInfo',
      'setDisplayMode',
      'destroy',
      'openPopup',
      'showKeyboard',
      'hideKeyboard',
      'openLink',
      'sendLog',
      'getDeviceInfo',
      'openDeepLink',
    ];
  },
  getKeycode() {
    return {};
  },
  openLink(url?: string) {
    if (url) {
      window.open(url, '_blank', 'noreferrer');
    }
  },
  sendLog(data?: sendLogOptions): boolean {
    console.log('sendLog', data);
    trackingClickLinkLog190({
      Url: data?.metadata.Url,
      Screen: data?.metadata.Screen as TrackingScreen,
      LogId: data?.metadata.LogId || '',
      Event: data?.metadata.Event as TrackingEvent,
    });
    return true;
  },
  openPopup(type: string, args?: openPopupOptions): boolean {
    console.log('openPopup', type, args);
    switch (type) {
      case 'toast':
        showToast({
          title: args?.data?.[0]?.title || '',
          desc: args?.data?.[0]?.desc || '',
          styleData: 'rounded-lg bg-black-olive-404040',
          icon: args?.data?.[0]?.icon || '/images/logo/logo-fptplay-mini.png',
        });
        break;
      case 'confirm-delete':
        store.dispatch(openConfirmDeleteModal({ metadata: args || {} }));
        break;
      case 'warning':
        store.dispatch(openWarningModal({ metadata: args || {} }));
        break;
      case 'report': {
        // open report modal
        store.dispatch({
          type: 'liveChat/setReportModal',
          payload: { metadata: args || {} },
        });
        break;
      }
    }
    return true;
  },
  setDisplayMode(mode: string, args?: setDisplayModeOptions): boolean {
    console.log('setDisplayMode', mode, args);
    const height = args?.height;
    if (height) {
      store.dispatch(setLiveChatHeight(Number(height)));
    }
    return true;
  },
  async getUserInfo(): Promise<LiveChatUser | ''> {
    try {
      const response = await fetchUserInfo();
      const userData: UserInfoResponseType | undefined = response?.data;
      if (!userData) return '';
      const user: LiveChatUser = {
        id: userData.user_id_str,
        avatar: userData.user_avatar,
        userName: userData.user_full_name,
        phone: userData.user_phone,
        phoneMask: userData.phone_mask,
        profileAvatar: userData.profile?.avatar_url,
        profileId: userData.profile?.profile_id,
      };
      return user;
    } catch {
      return '';
    }
  },
  requestLogin(): boolean {
    store.dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));

    return true;
  },
  async genApiToken(): Promise<string | undefined> {
    try {
      const response = await getLiveChatToken();
      const token = response?.data?.data?.token;
      return token;
    } catch (error) {
      console.error(
        'Error genApiToken:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  },
  getPlatformInfo(): platformInfoResponse {
    const platformInfo: platformInfoResponse = {
      platform: 'web',
    };
    return platformInfo;
  },
  getDisplayInfo(): displayInfoResponse {
    return {};
  },
  destroy(): boolean {
    localStorage.setItem(SHOW_REAL_TIME_CHAT, '0');
    store.dispatch(setIsOpenLiveChat(false));
    // Show download bar when chat is closed
    showDownloadBarGlobally();
    return true;
  },
  getDeviceInfo(): deviceInfoResponse {
    return {};
  },
};
