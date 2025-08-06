import { axiosInstance } from '@/lib/api/axios'; // Import axiosInstance
import {
  SINGOUT_DEVICE_ERROR,
  SINGOUT_DEVICE_ERROR_MSG,
  SINGOUT_DEVICE_SUCCESS,
  SINGOUT_DEVICE_SUCCESS_TITLE,
} from '@/lib/constant/texts';
import { showToast } from '@/lib/utils/globalToast';
import { AxiosResponse } from 'axios';

// Define interfaces for the response structure
interface DeviceDetail {
  title?: string;
  msg?: string;
  icon?: string;
  type?: string;
}

interface Device {
  device_id?: string;
  device_name?: string;
  device_icon?: string;
  last_access?: string;
  is_whitelist?: string;
  is_current?: string;
  device_detail?: DeviceDetail[];
}

interface DeviceData {
  title?: string;
  sub_title_current_group?: string;
  sub_title_other_group?: string;
  title_remove?: string;
  sub_title_remove?: string;
  devices?: Device[];
}

export interface ApiResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: DeviceData;
}

// Interface for fetch params (optional, if needed)
export interface FetchDevicesParams {
  client_id?: string;
}

// doFetchDevices function
export const doFetchDevices = async (): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const params: FetchDevicesParams = {
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID, // Assuming you have this in your env
    };

    const response = await axiosInstance.get('/account/device/list', {
      params,
    });

    return response;
  } catch (error) {
    console.error(
      'Error fetching devices data:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// Remove device function
export const removeDevice = async (
  device_id: string,
): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const params = {
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      device_id,
    };
    const response = await axiosInstance.post('/account/device/delete', params);
    if (response.data.status === '0') {
      showToast({
        title: response?.data?.data?.title || SINGOUT_DEVICE_ERROR,
        desc: response?.data?.msg || SINGOUT_DEVICE_ERROR_MSG,
      });
      return response;
    }
    if (response.data.status === '1') {
      showToast({
        title: response?.data?.data?.title || SINGOUT_DEVICE_SUCCESS,
        desc: response?.data?.msg || SINGOUT_DEVICE_SUCCESS_TITLE,
      });
      return response;
    }
    return response;
  } catch (error) {
    showToast({
      title: SINGOUT_DEVICE_ERROR,
      desc: SINGOUT_DEVICE_ERROR_MSG,
    });
    console.error(
      'Error removing device:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};
