import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MessageConfigRes {
  msg?: string;
  code?: number;
  data?: MessageConfigDataType;
}

export interface MessageConfigDataType {
  profile?: Profile;
  comment?: Comment;
  account?: Account;
  preview?: Preview;
  items?: any;
  unsupport_feature?: UnsupportFeature;
  moment?: Moment;
  common?: Common;
  chat?: Chat;
  rating_content?: RatingContent;
  playzone?: Playzone;
}

export interface Profile {
  msg_not_support?: string;
  action_delete?: DeleteProfile;
}

export interface DeleteProfile {
  msg_delete?: string;
  msg_deleted?: string;
  title_delete?: string;
  title_deleted?: string;
}

export interface Comment {
  msg_err_limit_text?: string;
}

export interface Account {
  btn_logout_not_ok?: string;
  title_logout?: string;
  title_login?: string;
  btn_login_not_ok?: string;
  msg_require_login?: string;
  msg_require_logout?: string;
  btn_login_ok?: string;
  btn_logout_ok?: string;
}

export interface Preview {
  btn_rent_movie?: string;
  btn_buy_package?: string;
  title_end_preview_by_package?: string;
  msg_end_preview_rent_movie?: string;
  msg_buy_package_for_channel?: string;
  msg_rent_movie?: string;
  msg_not_preview_rent_movie?: string;
  msg_end_preview_by_package?: string;
  title_end_preview_rent_movie?: string;
  msg_request_login?: string;
  msg_buy_package?: string;
  msg_not_preview_buy_package?: string;
}

export interface UnsupportFeature {
  message?: string;
  title?: string;
}

export interface Moment {
  msg_off_comment?: string;
  msg_title_notfound?: string;
  msg_disable_comment?: string;
  msg_desc_notfound?: string;
}

export interface Common {
  msg_agree_to_terms?: string;
  title_feature_no_support?: string;
  remind_battery_remote_low?: string;
  msg_feature_no_support?: string;
  msg_update?: string;
  msg_noti_no_internet?: string;
  msg_noti_have_internet?: string;
  msg_agree_to_terms_v2?: MsgAgreeToTermsV2;
  msg_noti_use_mobile_network?: string;
  msg_device_no_support?: string;
}

export interface MsgAgreeToTermsV2 {
  prefix?: string;
  value?: string;
}

export interface Chat {
  msg_err_limit_text?: string;
}

export interface RatingContent {
  action_low_rating?: string;
  action_rating?: string;
  action_edit?: string;
  action_no_rating?: string;
  action_cancel?: string;
  hover_message?: HoverMessage;
}

export interface HoverMessage {
  two_star?: string;
  five_star?: string;
  one_star?: string;
  four_star?: string;
  three_star?: string;
}

export interface Playzone {
  msg_maintenance?: string;
  title_maintenance?: string;
}

const getMessageConfigs = async (): Promise<
  AxiosResponse<MessageConfigRes>
> => {
  return axiosInstance.get('/playos/general_info/message');
};

export { getMessageConfigs };
