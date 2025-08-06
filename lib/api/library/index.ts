import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';

export interface PageDataResponseType {
  message?: string;
  status?: string;
}

const deleteDataBlock = async ({
  type,
}: {
  type?: string;
}): Promise<AxiosResponse<PageDataResponseType>> => {
  try {
    return axiosInstance.delete(`/bigdata/personal_content/remove/${type}`);
  } catch {
    return {} as Promise<AxiosResponse<PageDataResponseType>>;
  }
};

export { deleteDataBlock };
