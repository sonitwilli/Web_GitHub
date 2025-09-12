import axios from 'axios';
import {
  TrackingAppId,
  TrackingAppName,
  TrackingParams,
} from './tracking-types';
import { TRACKING_URL, trackingStoreKey } from '../constant/tracking';
import getDefaultParams from './getDefaultParams';
import {
  generateIssueId,
  getAppLogId,
  getScreen,
  getAppInfo,
} from '@/lib/utils/trackingDefaultMethods';

const tracking = async (params: TrackingParams) => {
  if (typeof window === 'undefined') {
    return;
  }
  const defaultParams = await getDefaultParams();
  const newDate = new Date().toISOString();

  if (
    params.Event === 'LoginSuccess' ||
    (params.user_phone &&
      localStorage &&
      !localStorage.getItem(trackingStoreKey.SESSIONLOGIN)) ||
    (localStorage && !localStorage.getItem(trackingStoreKey.SESSIONLOGIN))
  ) {
    localStorage.setItem(trackingStoreKey.SESSIONLOGIN, newDate);
  }

  // Start app
  if (params.Event === 'ChangeModule' && !params.ItemId) {
    localStorage.setItem(trackingStoreKey.APP_SESSION, newDate);
  }

  const appInfo = getAppInfo(params);

  const newParams: TrackingParams = {
    ...defaultParams,
    ...params,
    LogId: getAppLogId(params).toString(),
    AppId: appInfo?.AppId as TrackingAppId,
    AppName: appInfo?.AppName as TrackingAppName,
    Screen: getScreen(params),
    BoxTime: newDate,
    DateStamp: newDate,
    user_session:
      params.Event === 'LoginSuccess'
        ? newDate
        : params.user_session
        ? params.user_session
        : localStorage.getItem(trackingStoreKey.SESSIONLOGIN) || '',
    AppSession: params.AppSession
      ? params.AppSession
      : localStorage.getItem(trackingStoreKey.APP_SESSION) || '',
    HotkeySession: params.HotkeySession
      ? params.HotkeySession
      : localStorage.getItem(trackingStoreKey.APP_SESSION) || '',
    playing_session: params.playing_session
      ? params.playing_session
      : localStorage.getItem(trackingStoreKey.PLAYING_SESSION) || '',
    tabId: sessionStorage.getItem('tabId') || '',
  };

  const isChatbot = false; // TODO: get from store

  // Chatbot tracking
  // Screen: 'ChatBot'
  const idArrayScreen = [
    '41',
    '42',
    '413',
    '414',
    '512',
    '51',
    '52',
    '520',
    '521',
    '170',
    '171',
    '172',
    '178',
    '179',
    '53',
    '54',
    '514',
  ];
  if (idArrayScreen.includes(newParams.LogId || '')) {
    if (isChatbot) {
      newParams.Screen = 'ChatBot';
      newParams.is_recommend = '2';
    }
  }

  // SubmenuId Chatbot
  const idArraySubmenuId = [
    '41',
    '42',
    '413',
    '414',
    '512',
    '51',
    '52',
    '520',
    '521',
    '170',
    '171',
    '172',
    '178',
    '179',
    '53',
    '54',
    '514',
    '111',
  ];
  if (idArraySubmenuId.includes(newParams.LogId || '')) {
    if (isChatbot) {
      newParams.SubMenuId = 'ChatBot';
      newParams.is_recommend = '2';
    }
  }

  if (params?.user_id) {
    newParams.user_id = params.user_id;
  }
  if (params?.user_phone) {
    newParams.user_phone = params.user_phone;
  }
  if (newParams.LogId && ['11', '17', '176', '515'].includes(newParams.LogId)) {
    const issueId = generateIssueId();
    newParams.IssueId = issueId;
  }
  // if (params.Event === 'Error') {
  //   console.log(`tracking ${params.Event}`, newParams)
  // }

  try {
    await axios({
      method: 'POST',
      url: TRACKING_URL,
      data: JSON.stringify(newParams),
      timeout: 10000,
    });

    setTimeout(() => {
      if (
        sessionStorage &&
        sessionStorage.getItem(trackingStoreKey.SEEK_VIDEO_EVENT)
      ) {
        sessionStorage.removeItem(trackingStoreKey.SEEK_VIDEO_EVENT);
      }
    }, 500);
  } catch (error) {
    console.error('Error send tracking:', error);
    //
  }

  if (params.Event === 'ChangeModule' && params.ItemId) {
    localStorage.setItem(trackingStoreKey.APP_SESSION, newDate);
  }

  return newParams;
};

export default tracking;
