import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';

export interface ChangePasswordRequest {
  phone: string;
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ChangePasswordResponse {
  error_code: number;
  msg?: string;
}

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<AxiosResponse<ChangePasswordResponse>> => {
  try {
    if (!data.phone || !data.current_password || !data.new_password || !data.new_password_confirm) {
      throw new Error('Missing required parameters');
    }

    const response = await axiosInstance.post('/user/otp/change_password', {
      params: {
        phone: data.phone,
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      },
    });

    return response;
  } catch (error) {
    console.error(
      'Error changing password:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};