import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { SSO_ACCESS_TOKEN, SSO_PROVIDER_ID } from '@/lib/constant/texts';

// Interface for API response
export interface ClearWebTokensResponse {
  error_code?: number;
  msg?: string;
  data?: { access_token?: string };
  seconds?: number;
}

// Interface for delete web token params
export interface ClearWebTokensParams {
  phone: string;
  password: string;
  email?: string;
  client_id?: string;
  provider_version?: string;
  provider_id?: string | null;
  provider_token?: string | null;
}

// Interface for reset token OTP params
export interface ResetTokenOtpParams {
  phone: string;
  client_id?: string;
}

// doDeleteWebToken
export const doDeleteWebToken = async ({
  socialLogin = false,
  phone,
  password,
  social_email,
}: {
  socialLogin?: boolean;
  phone?: string;
  password?: string;
  social_email?: string;
}): Promise<AxiosResponse<ClearWebTokensResponse>> => {
  try {
    const deleteInfo: ClearWebTokensParams = {
      phone: phone || '',
      password: password || '',
      email: social_email || '',
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      provider_version: 'V1',
    };

    if (socialLogin) {
      const provider = localStorage.getItem(SSO_PROVIDER_ID);
      deleteInfo.provider_id = provider;
      deleteInfo.provider_token = localStorage.getItem(SSO_ACCESS_TOKEN);
    }

    const response = await axiosInstance.post('/user/otp/clear_web_tokens', deleteInfo);
    return response;
  } catch (error) {
    console.error(
      'Error deleting web token:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// doDeleteWebTokenSso
export const doDeleteWebTokenSso = async ({
  phone,
  password,
  social_email,
}: {
  phone?: string;
  password?: string;
  social_email?: string;
}): Promise<AxiosResponse<ClearWebTokensResponse>> => {
  try {
    const deleteInfo: ClearWebTokensParams = {
      phone: phone || '',
      password: password || '',
      email: social_email || '',
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      provider_id: localStorage.getItem(SSO_PROVIDER_ID),
      provider_token: `Bearer ${localStorage.getItem(SSO_ACCESS_TOKEN)}`,
    };

    const response = await axiosInstance.post('/user/otp/clear_web_tokens', deleteInfo);
    return response;
  } catch (error) {
    console.error(
      'Error deleting web token SSO:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// doDeleteNativeToken
export const doDeleteNativeToken = async ({
  phone,
}: {
  phone: string;
}): Promise<AxiosResponse<ClearWebTokensResponse>> => {
  try {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    const params: ResetTokenOtpParams = {
      phone,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    };

    const response = await axiosInstance.post('/user/otp/reset_token_otp', params);
    return response;
  } catch (error) {
    console.error(
      'Error resetting native token:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// doDeleteNativeTokenSso
export const doDeleteNativeTokenSso = async ({
  phone,
}: {
  phone: string;
}): Promise<AxiosResponse<ClearWebTokensResponse>> => {
  try {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    const params: ResetTokenOtpParams = {
      phone,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    };

    const response = await axiosInstance.post('/user/otp/reset_token_otp', params);
    return response;
  } catch (error) {
    console.error(
      'Error resetting native token SSO:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};