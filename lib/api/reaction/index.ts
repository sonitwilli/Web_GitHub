import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface ReactionParamsType {
  id?: string;
  type?: string;
  value?: 'like' | 'dislike';
}

export interface ReactionResponseType {
  status?: string;
  data?: boolean;
  msg?: string;
}

const reaction = async (
  params: ReactionParamsType,
): Promise<AxiosResponse<ReactionResponseType>> => {
  const data = {
    id: params.id,
    type: params.type,
  };
  if (params.value === 'like') {
    return axiosInstance.post(
      `/notification/subscribe_room?type=${params.type}&id=${params.id}`,
      data,
    );
  }

  return axiosInstance.delete(
    `/notification/unsubscribe_room?type=${params.type}&id=${params.id}`,
    {
      data,
    },
  );
};

export { reaction };
