import moment from 'moment';
import { trackingStoreKey } from '../constant/tracking';
import { TrackingParams } from './tracking-types';
import generateId from '@/lib/utils/generateId';
import {
  browserRealVersion,
  type getBrowserType,
} from '@/lib/utils/getBrowser';
import getOs from '@/lib/utils/getOs';
import {
  APP_VERSION,
  IP_ADDRESS,
  DEFAULT_IP_ADDRESS,
  NUMBER_PR,
  TOTAL_CHUNK_SIZE_LOADED,
  URL_MODE,
  STREAM_AUDIO_PROFILE,
  WCHATBOT_CHAT_SESSION,
} from '@/lib/constant/texts';
import { UserInfoResponseType } from '@/lib/api/user';
const getDefaultParams = async (): Promise<TrackingParams> => {
  if (typeof window === 'undefined') {
    return {};
  }
  const ua = navigator.userAgent || '';

  const browser = await browserRealVersion();
  const os = getOs(ua);
  let deviceId = localStorage.getItem('device_id');
  let Session = sessionStorage.getItem('tabId');
  let user: UserInfoResponseType | null = null;
  let RefPlaylistID = '';
  let RefEpisodeID = '';
  let RefItemId = '';
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('user')) {
      user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!sessionStorage.getItem(trackingStoreKey.PROFILE_SESSION)) {
        const profileSession = new Date().toISOString();
        sessionStorage.setItem(
          trackingStoreKey.PROFILE_SESSION,
          profileSession,
        );
      }
    }
    let browserInfo: getBrowserType | null = null;
    if (localStorage.getItem(trackingStoreKey.BROWSER_INFO)) {
      browserInfo = JSON.parse(
        localStorage.getItem(trackingStoreKey.BROWSER_INFO) as string,
      );
    }
    if (
      browser &&
      (!browserInfo || browserInfo?.version !== browser?.version)
    ) {
      localStorage.setItem(
        trackingStoreKey.BROWSER_INFO,
        JSON.stringify(browser),
      );
    }
  }

  if (!deviceId) {
    deviceId = generateId();
    localStorage.setItem('device_id', deviceId);
  }

  if (Session) {
    Session = moment(parseInt(Session)).toISOString();
  } else {
    //Nếu chưa lưu thì tạo mới 1 chuỗi bằng random và lưu xuống
    const tabId = new Date().getTime().toString();
    sessionStorage.setItem('tabId', tabId);
    Session = moment(parseInt(tabId)).toISOString();
  }

  if (sessionStorage && sessionStorage[trackingStoreKey.PLAYER_DATA_PLAYING]) {
    const data = JSON.parse(
      sessionStorage[trackingStoreKey.PLAYER_DATA_PLAYING],
    );

    RefPlaylistID = String(data?.refPlaylistID) || '';
    RefEpisodeID = String(data?.currentEpiData?.ref_episode_id) || '';
    RefItemId = String(data?.dataChannel?.ref_id) || '';
  }

  const isVideoPage = [
    '/xem-video',
    '/playlist',
    '/xem-truyen-hinh',
    'su-kien',
    'cong-chieu',
  ].some((path) => window.location.href.includes(path));
  const vodData = isVideoPage
    ? localStorage.getItem(trackingStoreKey.VOD_CURRENT_VIDEO_DATA)
    : null;

  const currentData = sessionStorage[trackingStoreKey.PLAYER_DATA_PLAYING]
    ? JSON.parse(sessionStorage[trackingStoreKey.PLAYER_DATA_PLAYING])
    : {};

  const AppSource = vodData
    ? JSON.parse(vodData)?.app_id
    : currentData?.dataChannel?.app_id || '';

  return {
    platform: 'web-playfpt',
    device: os?.name || '',
    device_id: deviceId,
    device_name: browser?.name || '',
    model_name: '',
    deviceManufacture: '',
    timestamp: moment().unix().toString(),
    FPTPlay_version: APP_VERSION,
    Firmware_version: '',
    environment:
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev' ? 'dev' : 'production',
    os_version: browser?.version || '',
    Netmode: '',
    Session: Session || '',
    RefPlaylistID,
    RefEpisodeID,
    RefItemId,
    profile_id: localStorage.getItem(NUMBER_PR) || '',
    profile_session:
      sessionStorage.getItem(trackingStoreKey.PROFILE_SESSION) || '',
    user_id: user?.user_id_str || '',
    user_phone: user?.user_phone || '',
    AppId: localStorage[trackingStoreKey.APP_ID] || '',
    AppName: localStorage[trackingStoreKey.APP_NAME] || '',
    AppSession:
      sessionStorage?.app_session || localStorage.getItem('_appSession') || '',
    AppSource: AppSource || '',
    utm: localStorage[trackingStoreKey.UTM_LINK] || '',
    utm_session: localStorage.getItem(trackingStoreKey.UTM_SESSION) || '',
    is_utm_inApp: localStorage.getItem(trackingStoreKey.UTM_IN_APP) || '',
    contract: user?.sub_contract || '',
    ip: localStorage.getItem(IP_ADDRESS) || DEFAULT_IP_ADDRESS,
    TotalByteLoaded: sessionStorage.getItem(TOTAL_CHUNK_SIZE_LOADED) || '',
    hdrType: 'Unknown',
    UrlMode: sessionStorage.getItem(URL_MODE) || '',
    StreamAudioProfile: sessionStorage.getItem(STREAM_AUDIO_PROFILE) || '',
    BrowserUrl: typeof window !== 'undefined' ? window.location.href : '', // để debug F-ID
    chat_session: sessionStorage.getItem(WCHATBOT_CHAT_SESSION) || '',
  };

  // 1. platform thì mình lấy  win, mac, android, ios
  // 2. device thì ghi WebOS
  // 3. device_name là tên browser như chrome, firefox, edge
  // 4. model_name
  // 5. deviceManufacture ko cần ghi 4 và 5 nha
};

export default getDefaultParams;
