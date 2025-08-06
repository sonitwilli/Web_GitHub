import { axiosInstance } from '@/lib/api/axios'; // Import axiosInstance
import { AxiosResponse } from 'axios';

// Define interfaces for service items and API response
interface ServiceItem {
  plan_name?: string;
  from_date?: string;
  next_date?: string;
  is_sub?: number;
}

interface ApiResponse {
  msg_data?: {
    packages?: ServiceItem[];
    extras?: ServiceItem[];
  };
}

// Interface for fetch params (optional, if needed)
interface FetchServicesParams {
  client_id?: string;
}

// doFetchServices function
export const doFetchServices = async (): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const params: FetchServicesParams = {
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID, // Assuming you have this in your env
    };

    const response = await axiosInstance.get('/payment/get_v3_user_vips', {
      params,
    });
    return response;
  } catch (error) {
    console.error(
      'Error fetching services data:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};