import tracking from '.';
import { trackingStoreKey } from '../constant/tracking';
import { TYPE_LOGIN } from '../constant/texts';
import {
  TrackingAppId,
  TrackingAppName,
  TrackingParams,
  TrackingScreen,
} from './tracking-types';
import { UserInfoResponseType } from '../api/user';

type trackingLoginParams = {
  res?: UserInfoResponseType;
  ErrMessage?: string;
  Screen?: TrackingScreen;
  Url?: string;
};
const getLoginTrackingParams = (res?: UserInfoResponseType) => {
  const loginMethod =
    localStorage.getItem(TYPE_LOGIN) === 'otp' ? 'OTP' : 'F-ID';
  const token = localStorage.getItem('token') || '';
  const loginSession =
    sessionStorage.getItem(trackingStoreKey.LOGIN_SESSION) || '';
  const userPhone =
    res?.user_phone ||
    localStorage.getItem(trackingStoreKey.LOGIN_PHONE_NUMBER) ||
    '';
  return {
    Url: token,
    login_session: loginSession,
    AppId: 'Login' as TrackingAppId,
    AppName: 'Login' as TrackingAppName,
    Method: loginMethod,
    ItemName: userPhone,
  };
};
export const trackingLoginSuccessLog14 = (res: UserInfoResponseType) => {
  const { Url, login_session, AppId, AppName, Method, ItemName } =
    getLoginTrackingParams(res);
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    ItemName: ItemName,
    Event: 'LoginSuccess',
    Method: Method,
    Url: Url,
    user_id: res?.user_id_str,
    user_phone: res?.user_phone,
    login_session: login_session,
  };
  tracking(params);
};

export const trackingLoginMethodLog144 = () => {
  const { AppId, AppName, Method, ItemName, login_session } =
    getLoginTrackingParams();
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    Event: 'LoginMethod',
    Screen: Method as TrackingScreen,
    ItemName: ItemName,
    login_session: login_session,
  };
  tracking(params);
};

export const trackingCancelLoginLog145 = ({
  Screen,
}: {
  Screen?: TrackingScreen;
}) => {
  const { AppId, AppName, Method, ItemName, login_session } =
    getLoginTrackingParams();
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    Event: 'CancelLogin',
    Method: Method,
    ItemName: ItemName,
    login_session: login_session,
    Screen: Screen || 'PageLogin',
  };
  tracking(params);
};

export const trackingGetStatusConfigLog146 = ({
  ErrMessage,
  Screen,
}: trackingLoginParams) => {
  const { AppId, AppName, Method, ItemName, login_session } =
    getLoginTrackingParams();
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    Event: 'GetStatusConfig',
    Method: Method,
    ItemName: ItemName,
    ErrMessage: ErrMessage,
    Screen: Screen || 'Success',
    login_session: login_session,
  };
  tracking(params);
};

export const trackingFIDRespondLog147 = ({
  ErrMessage,
  Screen,
  Url,
}: trackingLoginParams) => {
  const { AppId, AppName, Method, ItemName, login_session } =
    getLoginTrackingParams();
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    Event: 'FIDRespond',
    Method: Method,
    ItemName: ItemName,
    ErrMessage: ErrMessage,
    Screen: Screen || 'Success',
    login_session: login_session,
    Url: Url,
  };
  tracking(params);
};

export const trackingThirdPartyRespondLog149 = ({
  ErrMessage,
  Screen,
}: trackingLoginParams) => {
  const { AppId, AppName, Method, ItemName, login_session } =
    getLoginTrackingParams();
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    Event: 'ThirdPartyRespond',
    Method: Method,
    ItemName: ItemName,
    ErrMessage: ErrMessage,
    Screen: Screen || 'Success',
    login_session: login_session,
  };
  tracking(params);
};

export const trackingCheckAPIGetUserInfoLog150 = (ErrMessage: string) => {
  const { AppId, AppName, Method, ItemName, login_session } =
    getLoginTrackingParams();
  const params: TrackingParams = {
    AppId: AppId,
    AppName: AppName,
    ItemName: ItemName,
    Event: 'CheckAPIGetUserInfo',
    Method: Method,
    Screen: 'Fail',
    ErrMessage: ErrMessage,
    login_session: login_session,
  };
  tracking(params);
};
