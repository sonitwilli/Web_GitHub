import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

// ------------------------------------------ START INTERFACE ------------------------------------------

// --- Input ---
export interface LoginParamsType {
  phone?: string;
  client_id?: string;
  type?: string;
  type_otp?: string;
  verify_token?: string;
  otp_code?: string;
}

// --- Output ---
export interface verifyUserWithPhoneNumberResponse {
  data?: {
    verify_token?: string;
    login_type?: string;
    mask_phone?: string;
    description?: string;
    text_format?: string[];
    text_button?: string;
    seconds?: string;
  };
  error_code?: string;
  msg?: string;
  status?: string;
}

export interface onSendOTPResponse {
  data?: {
    text_format?: string[];
    email?: string;
    mask_phone?: string;
    otp_length?: number | string;
    seconds?: number | string;
    title?: string;
  };
  error_code?: string;
  msg?: string;
  status?: string;
}

export interface onSubmitVerifyOTPResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    title?: string;
    verify_token?: string;
    seconds?: string;
  };
}

export interface onLoginResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    access_token?: string;
    access_token_type?: string;
    title?: string;
    verify_token?: string;
  };
}

export interface onDevicesLimitResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    title?: string;
    description?: string;
    sub_description?: string;
    need_remove?: string;
    verify_token?: string;
    devices?: Array<{
      id?: string;
      client_id?: string;
      device_id?: string;
      device_type?: string;
      device_name?: string;
      device_icon?: string;
      is_whitelist?: boolean;
      last_login?: string;
      is_current?: boolean;
    }>;
  };
}

export interface onRemoveDevicesResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    title?: string;
    access_token?: string;
    access_token_type?: string;
  };
}

export interface OidcTokenResponse {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
}

export interface onLogin3rdResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    title?: string;
    access_token?: string;
    access_token_type?: string;
    verify_token?: string;
  };
}

export interface onQuickLoginResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    title?: string;
    verify_token?: string;
  };
}

// ------------------------------------------ END INTERFACE ------------------------------------------

const verifyUserWithPhoneNumber = async (data?: {
  phone?: string;
  client_id?: string;
  type?: string;
  mode?: string;
}): Promise<AxiosResponse<verifyUserWithPhoneNumberResponse>> => {
  try {
    return axiosInstance.post('/account/otp/validate_user', data);
  } catch {
    return {} as Promise<AxiosResponse<verifyUserWithPhoneNumberResponse>>;
  }
};

const verifyUserChangeCodeManagement = async (data?: {
  phone?: string;
  client_id?: string;
  type?: string;
}): Promise<AxiosResponse<verifyUserWithPhoneNumberResponse>> => {
  try {
    return axiosInstance.post('/account/otp/validate_user_pin', data);
  } catch {
    return {} as Promise<AxiosResponse<verifyUserWithPhoneNumberResponse>>;
  }
};

const onSendOTP = async (data?: {
  phone?: string;
  client_id?: string;
  type_otp?: string;
  verify_token?: string;
}): Promise<AxiosResponse<onSendOTPResponse>> => {
  try {
    return axiosInstance.post('/account/otp/send', data);
  } catch {
    return {} as Promise<AxiosResponse<onSendOTPResponse>>;
  }
};

const onResendOTP = async (data?: {
  phone?: string;
  client_id?: string;
  type_otp?: string;
}): Promise<AxiosResponse<onSendOTPResponse>> => {
  try {
    return axiosInstance.post('/account/otp/resend_otp', data);
  } catch {
    return {} as Promise<AxiosResponse<onSendOTPResponse>>;
  }
};

const onResetPin = async (data?: {
  client_id?: string;
  type?: string;
  verify_token?: string;
  confirm_pin?: string;
  pin?: string;
}): Promise<AxiosResponse<onSendOTPResponse>> => {
  try {
    return axiosInstance.post('/account/user/reset_pin', data);
  } catch {
    return {} as Promise<AxiosResponse<onSendOTPResponse>>;
  }
};

const onSubmitVerifyOTP = async (data?: {
  phone?: string;
  client_id?: string;
  type_otp?: string;
  otp_code?: string;
}): Promise<AxiosResponse<onSubmitVerifyOTPResponse>> => {
  try {
    return axiosInstance.post('/account/otp/verify', data);
  } catch {
    return {} as Promise<AxiosResponse<onSubmitVerifyOTPResponse>>;
  }
};

const onLogin = async (data?: {
  phone?: string;
  client_id?: string;
  push_reg_id?: string;
  verify_token?: string;
}): Promise<AxiosResponse<onLoginResponse>> => {
  try {
    return axiosInstance.post('/account/user/login', data);
  } catch {
    return {} as Promise<AxiosResponse<onLoginResponse>>;
  }
};

const getDevicesLimit = async (data?: {
  verify_token?: string;
}): Promise<AxiosResponse<onDevicesLimitResponse>> => {
  try {
    return axiosInstance.post('/account/device/limit_list', data);
  } catch {
    return {} as Promise<AxiosResponse<onDevicesLimitResponse>>;
  }
};

const removeDevicesLimit = async (data?: {
  list_ids?: Array<string>;
  verify_token?: string;
  ignore_token?: string;
  required_login?: string;
  login_type?: string;
}): Promise<AxiosResponse<onRemoveDevicesResponse>> => {
  try {
    return axiosInstance.post('/account/device/remove', data);
  } catch {
    return {} as Promise<AxiosResponse<onRemoveDevicesResponse>>;
  }
};

const pushRegIdAPI = async (data?: {
  app?: string;
  user_id?: string;
  pushRegId?: string | null;
  platForm?: string;
  vp?: number | string;
}) => {
  try {
    return axiosInstance.post('/push_reg_id', data);
  } catch {
    return {};
  }
};

const onLogin3RD = async (data?: {
  provider_token?: string;
  client_id?: string;
  push_reg_id?: string;
  provider_id?: string;
}): Promise<AxiosResponse<onLogin3rdResponse>> => {
  try {
    return axiosInstance.post('/account/user/login_3rd', data);
  } catch {
    return {} as Promise<AxiosResponse<onLogin3rdResponse>>;
  }
};

const onQuickLogin = async (data?: {
  login_key?: string;
  push_reg_id?: string;
  client_id?: string;
}): Promise<AxiosResponse<onQuickLoginResponse>> => {
  try {
    return axiosInstance.post('/account/quick_login/scan', data);
  } catch {
    return {} as Promise<AxiosResponse<onQuickLoginResponse>>;
  }
};

export {
  verifyUserWithPhoneNumber,
  onSendOTP,
  onResendOTP,
  onSubmitVerifyOTP,
  onLogin,
  getDevicesLimit,
  removeDevicesLimit,
  pushRegIdAPI,
  onLogin3RD,
  onResetPin,
  verifyUserChangeCodeManagement,
  onQuickLogin,
};
