import { axiosInstance } from '../axios';
import { TRACKING_URL } from '@/lib/constant/tracking';

export interface TrackingDataParams {
  status: string;
  msg?: string;
  error_code?: string;
  data?: {
    token?: string;
  };
}

const sendTracking = async (): Promise<void> => {
  try {
    await axiosInstance.post(TRACKING_URL);
  } catch (error) {
    console.error('Error get token livechat:', error);
    throw error;
  }
};

export { sendTracking };
