import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface ConfigResponse {
  msg?: string;
  code?: number;
  data?: ConfigDataType;
}

export interface ConfigDataType {
  x_agent?: string;
  comment?: string;
  status?: string;
  is_vn?: string;
  is_setup_channel?: string;
  require_minimum_resolution_h265?: string;
  fptplayshop?: string;
  image?: Image;
  number_item_of_moment?: string;
  chat?: string;
  side_menu?: SideMenu;
  logo?: string;
  message?: Message;
  life_time_cache_prevent_vp9?: string;
  enable_ads_savescreen?: string;
  expire_welcome?: string;
  email_support?: string;
  require_minimum_resolution_vp9?: string;
  update_firmware?: UpdateFirmware;
  notification?: string;
  redirect_text_en?: string;
  text_login?: string;
  number_item_of_page?: string;
  buffer_audio?: string;
  watching_manual_handle?: string;
  life_time_cache_prevent_h265?: string;
  enable_drm_offline?: string;
  timeout_api?: string;
  d2g?: D2g;
  revision?: string;
  config_message?: ConfigMessage;
  redirect_text_vn?: string;
  updated?: string;
  icon_app?: string;
  number_item_of_page_tv?: string;
  life_time_cache_prevent_dolby_vision?: string;
  maturity_rating?: MaturityRating;
  review_google_macs?: string[];
  stream_blacklist?: string;
  skipplus?: string;
  is_show_age?: string;
  profile?: Profile;
  life_time_cache_prevent_av1?: string;
  require_minimum_resolution_h265_hdr?: string;
  timeforreboot?: string;
  life_time_cache_prevent_h265_hdr?: string;
  enable_remote_macs?: string;
  config_domain?: ConfigDomain;
  search?: string;
  gov?: string;
  limit_dir_fw_version?: string;
  name_OS?: string;
  settings?: Settings;
  enable_remote_log?: string;
  native_login_fb?: string;
  require_minimum_resolution_dolby_vision?: string;
  prevent_home_press_reload?: string;
  cast?: string;
  number_item_of_menu_web?: string;
  interactive_sports?: InteractiveSports;
  require_minimum_resolution_av1?: string;
  user_modify?: string;
  standby_config?: StandbyConfig;
  download_config?: {
    description?: string;
    qr_url?: string;
    title?: string;
  };
  recommend_ttl?: string;
  chat_bot_search?: {
    enable?: '0' | '1';
    icon?: string;
    title?: string;
    url?: string;
  };
  preview?: Preview;
  mqtt?: MQTTConfigType;
}

export interface MQTTConfigType {
  automatic_retry?: AutomaticRetry;
  emergency_enable_random_delay?: string;
  enable?: string;
  options?: Option[];
  emergency_rooms?: EmergencyRoom[];
}

export interface AutomaticRetry {
  enable?: string;
  random?: string;
  min_retry_interval?: string;
  max_retry_interval?: string;
}

export interface Option {
  mqtt_mode?: string;
  enable_backup_api?: string;
  max_retry_backup_api?: string;
  preview_waiting_approval?: string;
  waiting_approval?: string;
}

export interface EmergencyRoom {
  room_id?: string;
  room_type?: string;
}

export interface Image {
  redirect?: Redirect;
  icon_new?: string;
  bg_signin_signup_mb?: string;
  bg_signin_signup_tablet?: string;
  icon_live?: string;
  bg_label_premier?: string;
  bg_signin_signup_tv?: string;
  bg_end_event?: string;
  label_show_time?: LabelShowTime;
  logo?: Logo;
  label_age?: LabelAge;
}

export interface Redirect {
  vertical?: string;
  square?: string;
  vertical_text?: string;
  vertical_medium_text?: string;
  horizontal_medium_text?: string;
  horizontal_text?: string;
  square_text?: string;
  horizontal?: string;
}

export interface LabelShowTime {
  type1?: string;
  type3?: string;
  type2?: string;
}

export interface Logo {
  tv?: string;
  mb?: string;
}

export interface LabelAge {
  age_18?: string;
  age_13?: string;
  age_16?: string;
}

export interface SideMenu {
  color_focus?: string;
  bg_focus_item?: string;
  bg_theme?: string;
  color_selected?: string;
  color_normal?: string;
}

export interface Message {
  msg_pin_chat?: string;
  msg_player_error?: string;
  remind_battery_remote_low?: string;
  msg_limit_ccu_international?: string;
  msg_limit_ccu_hbo?: string;
  msg_end_event?: string;
}

export interface UpdateFirmware {
  title_install_fw_mac_infor?: string;
  title_install_fw_app_infor?: string;
  title_install_fw_infor?: string;
  title_install_fw_model_infor?: string;
}

export interface D2g {
  profile?: string[];
  time?: string;
}

export interface ConfigMessage {
  version?: string;
  link?: string;
}

export interface MaturityRating {
  duration?: string;
  start_time?: string;
}

export interface Profile {
  msg_restrict_content_en?: string;
  max_profile?: string;
  msg_restrict_content_vi?: string;
}

export interface ConfigDomain {
  version?: string;
  link?: string;
}

export interface Settings {
  FORCE_RELOAD_HIGHLIGHT?: string;
  FPTPLAY_3G?: string;
  OMNISHOP?: string;
  UPLAY?: string;
  GMAIL_REG?: string;
  APP_FPTPLAY_SHOP?: string;
  VNA?: string;
  STAR_30S?: string;
  MUA_DAY_BAN_DINH?: string;
  TOPUP_PHONE_FOXPAY?: string;
  CHOI_HAY_CHIA?: string;
  APP_LOYALTY?: string;
  TOPUP_PHONE_FOXPAY_V2?: string;
  LAC_XAM_2021?: string;
  FSHARE_VIDEO?: string;
  SSO_FTEL_REG?: string;
  APPLE_REG?: string;
  ISPORT?: string;
  AVATAR_PROFILE?: string;
  BAMBOO?: string;
  FACEBOOK_REG?: string;
  HIP_FEST?: string;
  APP_FOXPAY?: string;
  GROUP_CHAT?: string;
  FPTPLAY_IQ?: string;
  TRI_AN_2020?: string;
  FPTPLAY_REWARDS?: string;
  VIETJET?: string;
}

export interface InteractiveSports {
  time_show_snackbar?: string;
  is_new?: string;
}

export interface StandbyConfig {
  frequency?: string;
  result?: string;
  interval?: string;
  time?: Time[];
}

export interface Time {
  end_time?: string;
  begin_time?: string;
}

// Định nghĩa interface cho Preview
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

const getConfigs = async (): Promise<AxiosResponse<ConfigResponse>> => {
  return axiosInstance.get('/playos/config');
};

const handleGetConfigs = async (): Promise<AxiosResponse<ConfigResponse>> => {
  try {
    return getConfigs();
  } catch {
    return {} as AxiosResponse<ConfigResponse>;
  }
};

interface DynamicLinksResponse {
  status?: number;
  msg?: string;
  error_code?: number;
  data?: string;
}

const getDynamicLinks = async (): Promise<
  AxiosResponse<DynamicLinksResponse>
> => {
  return axiosInstance.post('/get_dynamic_links', {
    link: typeof window !== 'undefined' ? window.location.href : '',
  });
};

export { getConfigs, handleGetConfigs, getDynamicLinks };
