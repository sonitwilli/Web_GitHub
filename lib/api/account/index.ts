import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { SEND_OTP_TYPES } from '@/lib/constant/texts';

export interface DeleteAccountStatusResponse {
  status?: number;
  message?: string;
  data?: {
    packages?: unknown[];
    extras?: unknown[];
    content?: string;
  };
}

export interface ValidateDisableUserResponse {
  error_code: string;
  msg?: string;
  data?: {
    verify_token?: string;
    mask_phone?: string;
  };
}

export interface SendOtpNewFlowResponse {
  error_code: string;
  msg?: string;
  data?: {
    seconds?: number | string;
    text_format?: { text: string }[];
    title?: string;
  };
}

export interface DisableAccountResponse {
  status?: string | number;
  msg?: string;
  data?: {
    title?: string;
  };
}

export const getDeleteAccountStatus = async (): Promise<
  AxiosResponse<DeleteAccountStatusResponse>
> => {
  return axiosInstance.get('/user/delete_account');
};

export const validateDisableUser = async (): Promise<
  AxiosResponse<ValidateDisableUserResponse>
> => {
  return axiosInstance.get('/account/otp/validate_disable_user', {
    params: {
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    },
  });
};

export const sendOtpDeleteAccountNewFlow = async (
  phone: string,
  verify_token: string,
  method_otp?: string,
): Promise<AxiosResponse<SendOtpNewFlowResponse>> => {
  return axiosInstance.post('/account/otp/send', {
    phone,
    type_otp: SEND_OTP_TYPES.DELETE_ACCOUNT,
    method_otp,
    verify_token,
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  });
};

export const disableAccount = async (
  verify_token: string,
): Promise<AxiosResponse<DisableAccountResponse>> => {
  return axiosInstance.post('account/user/disable_account', {
    verify_token,
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  });
};
