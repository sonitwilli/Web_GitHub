import { AxiosResponse } from 'axios';
import {axiosInstance} from '@/lib/api/axios'; // Giả định axiosInstance đã được cấu hình

// Định nghĩa interface cho Profile
interface Profile {
  msg_not_support?: string;
}

// Định nghĩa interface cho Comment
interface Comment {
  msg_err_limit_text?: string;
}

// Định nghĩa interface cho Account
interface Account {
  btn_logout_not_ok?: string;
  title_logout?: string;
  title_login?: string;
  btn_login_not_ok?: string;
  msg_require_login?: string;
  msg_require_logout?: string;
  btn_login_ok?: string;
  btn_logout_ok?: string;
}

// Định nghĩa interface cho Preview
interface Preview {
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

// Định nghĩa interface cho UnsupportFeature
interface UnsupportFeature {
  message?: string;
  title?: string;
}

// Định nghĩa interface cho Moment
interface Moment {
  msg_off_comment?: string;
  msg_title_notfound?: string;
  msg_disable_comment?: string;
  msg_desc_notfound?: string;
}

// Định nghĩa interface cho Common
interface Common {
  msg_agree_to_terms?: string;
  title_feature_no_support?: string;
  remind_battery_remote_low?: string;
  msg_feature_no_support?: string;
  msg_update?: string;
  msg_noti_no_internet?: string;
  msg_noti_have_internet?: string;
  msg_agree_to_terms_v2?: {
    prefix?: string;
    value?: string;
  };
  msg_noti_use_mobile_network?: string;
  msg_device_no_support?: string;
}

// Định nghĩa interface cho Chat
interface Chat {
  msg_err_limit_text?: string;
}

// Định nghĩa interface cho RatingContent
interface RatingContent {
  action_low_rating?: string;
  action_rating?: string;
  action_edit?: string;
  action_no_rating?: string;
  action_cancel?: string;
  hover_message?: {
    two_star?: string;
    five_star?: string;
    one_star?: string;
    four_star?: string;
    three_star?: string;
  };
}

// Định nghĩa interface cho Playzone
interface Playzone {
  msg_maintenance?: string;
  title_maintenance?: string;
}

// Định nghĩa interface cho Response
interface ConfigResponse {
  msg?: string;
  code?: number;
  data?: {
    profile?: Profile;
    comment?: Comment;
    account?: Account;
    preview?: Preview;
    items?: Record<string, unknown>;
    unsupport_feature?: UnsupportFeature;
    moment?: Moment;
    common?: Common;
    chat?: Chat;
    rating_content?: RatingContent;
    playzone?: Playzone;
  };
}

// Định nghĩa interface cho EventConfigResponse
interface EventConfigResponse {
  data?: Array<{
    index?: number;
    ads_url?: string;
    text?: string;
    object_id?: string;
    countdown?: number;
    portrait?: string;
    type?: string;
    landscape?: string;
  }>;
}

// Function gọi API lấy config
export const getConfig = async (): Promise<AxiosResponse<ConfigResponse>> => {
  try {
    return await axiosInstance.get('/playos/general_info/message');
  } catch (error) {
    console.error('Error fetching config:', error);
    return {} as Promise<AxiosResponse<ConfigResponse>>;
  }
};

// Function gọi API lấy event config
export const getEventConfig = async (): Promise<AxiosResponse<EventConfigResponse>> => {
  try {
    const response = await axiosInstance.get('/settings/landing_pages');
    
    if (response.data !== null) {
      return response;
    }
    
    return {} as AxiosResponse<EventConfigResponse>;
  } catch (error) {
    console.error('Error fetching event config:', error);
    return {} as AxiosResponse<EventConfigResponse>;
  }
};