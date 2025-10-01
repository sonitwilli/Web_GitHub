import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface UserInfoResponseType {
  user_id?: number;
  user_id_str?: string;
  apple_chos?: number;
  user_full_name?: string;
  user_email?: string;
  user_avatar?: string;
  user_phone?: string;
  user_fxu?: number;
  account_type?: string;
  dateleft?: number;
  vip_own?: string[];
  age_range?: string;
  sex_code?: string;
  birthdate?: string;
  location?: string;
  paid_level?: number;
  over_limit?: number;
  conv_required?: boolean;
  need_active?: boolean;
  token_external?: string;
  sub_contract?: string;
  sub_status?: string;
  session_type?: string;
  profile?: Profile;
  allow_pin?: string;
  panel_title_info?: string;
  phone_mask?: string;
  sale_mode_email?: string;
  msg?: string;
  contract_number?: string;
  chatbot?: string;
  current_profile?: profileDeleted;
  group_account?: string[];
}

export interface profileDeleted {
  is_deleted?: string;
  redirect_profile?: string;
}

export interface Profile {
  profile_id?: string;
  name?: string;
  avatar_id?: string;
  avatar_url?: string;
  profile_type?: string;
  is_root?: string;
  pin_type?: string;
  enable_d2g?: string;
  created_date?: string;
  allow_edit?: string;
  status_onboarding?: string;
  status_code?: number;
  msg_warning_switch?: string;
  display_name?: string;
  nickname?: string;
  pin?: string;
  allow_edit_nickname?: string;
  msg_warning_edit_nickname?: string;
}

interface dataResponseCheckPass {
  status_code?: number;
  verify_token?: string;
}

export interface CheckPasswordResponseData {
  status?: number;
  message?: string;
  data?: dataResponseCheckPass;
}

export interface CheckPasswordRequest {
  params?: {
    passcode?: string;
    password?: string;
    client_id?: string;
    type?: string;
  };
  query?: {
    fid: string;
  };
}

export interface CheckPasswordResponseData {
  status_code?: number;
  verify_token?: string;
}

export interface CheckPasswordResponse {
  status?: number;
  error_code?: string;
  msg?: string;
  data?: Profile;
}

interface LoginProfileRequest {
  profile_id?: string;
  pin?: string;
}

interface LoginProfileResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: Profile;
}

interface SwitchProfileResponse {
  status?: string;
  error_code?: string;
  message?: {
    title?: string;
    content?: string;
  };
  data?: Profile;
}

interface UpdateProfileRequest {
  params?: { pin?: string };
  name?: string;
  profile_id: string;
}

export const loginProfile = async (
  data: LoginProfileRequest = {
    profile_id: '',
  },
): Promise<AxiosResponse<LoginProfileResponse>> => {
  try {
    return await axiosInstance.post('/config/profile/login', data);
  } catch {
    return {} as Promise<AxiosResponse<LoginProfileResponse>>;
  }
};

export interface CheckProfilePinRequest {
  profile_id?: string;
  pin?: string;
}

const checkPassword = async (
  data: CheckPasswordRequest = {
    params: {
      passcode: '',
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
      type: 'profile',
    },
  },
): Promise<AxiosResponse<CheckPasswordResponse>> => {
  try {
    return await axiosInstance.post('/user/checkpass', data);
  } catch {
    return {} as Promise<AxiosResponse<CheckPasswordResponse>>;
  }
};

export const switchProfile = async (
  profile_id: string,
): Promise<AxiosResponse<SwitchProfileResponse>> => {
  try {
    return await axiosInstance.get(`/config/profile/${profile_id}`);
  } catch {
    return {} as Promise<AxiosResponse<SwitchProfileResponse>>;
  }
};

export const updateProfile = async (
  profile_id: string,
  data: UpdateProfileRequest = { params: { pin: '' }, profile_id: '' },
): Promise<AxiosResponse<SwitchProfileResponse>> => {
  try {
    return await axiosInstance.post(`/config/profile/${profile_id}`, data);
  } catch {
    return {} as Promise<AxiosResponse<SwitchProfileResponse>>;
  }
};

export const checkProfilePin = async (
  data: CheckProfilePinRequest = {
    profile_id: '',
    pin: '',
  },
): Promise<AxiosResponse<SwitchProfileResponse>> => {
  try {
    return await axiosInstance.post('/config/profile/verify_pin', { ...data });
  } catch {
    return {} as Promise<AxiosResponse<SwitchProfileResponse>>;
  }
};

const getUserInfo = async (): Promise<AxiosResponse<UserInfoResponseType>> => {
  return axiosInstance.get('/account/user/info');
};

export { getUserInfo, checkPassword };
