import { AxiosError, AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

// Types for rating API response
export interface RatingContentItem {
  avg_rate?: string;
  bg?: string;
  count?: string;
  count_description?: string;
  count_origin?: number;
  icon?: string;
  type?: string;
  bg_color?: string;
}

export interface RatingUserData {
  rate?: string;
}

export interface RatingData {
  content?: RatingContentItem[];
  user?: RatingUserData;
}

export interface RatingResponse {
  status?: string;
  error_code?: string;
  data?: RatingData;
  msg?: string;
}

export const fetchDataInforVideo = async (id?: string) => {
  try {
    const res = await axiosInstance.get(`content/vod/${id}`);
    return res?.data;
  } catch {
    return {} as Promise<AxiosResponse>;
  }
};

export const fetchRatingData = async (
  itemId?: string,
  refId?: string,
): Promise<RatingData | null> => {
  try {
    const res = await axiosInstance.get<RatingResponse>('/config/rating', {
      params: {
        item_id: itemId,
        ref_id: refId,
      },
    });
    return res?.data?.data || null;
  } catch {
    return null;
  }
};

export const postRatingData = async ({
  itemId,
  refId,
  appId,
  rating,
}: {
  itemId?: string;
  refId?: string;
  appId?: string;
  rating?: number;
}) => {
  try {
    const res = await axiosInstance.post('/config/rating', {
      item_id: itemId,
      ref_id: refId,
      app_id: appId,
      rating,
    });
    return res?.data || null;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || null;
    }
    return null;
  }
};
