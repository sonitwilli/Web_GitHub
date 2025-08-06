import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface PartnerTokenResponse {
  status?: string;
  msg?: string;
  error_code?: string;
  data?: {
    token?: string;
  };
}

const getPartnerToken = async (): Promise<
  AxiosResponse<PartnerTokenResponse>
> => {
  return axiosInstance.get('/user/token/partner/chat_bot_ai');
};

export { getPartnerToken };
