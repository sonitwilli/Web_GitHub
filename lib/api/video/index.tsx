import { axiosInstance } from '../axios';

export const fetchDataInforVideo = async (id: string) => {
  try {
    const res = await axiosInstance.get(`content/vod/${id}`);
    return res?.data;
  } catch {
    return null;
  }
};

export const fetchRatingData = async (itemId: string, refId: string) => {
  try {
    const res = await axiosInstance.get('/config/rating', {
      params: {
        item_id: itemId,
        ref_id: refId,
      },
    });
    return res?.data?.data?.user?.rate ?? 0;
  } catch {
    return 0;
  }
};

export const postRatingData = async ({
  itemId,
  refId,
  appId,
  rating,
}: {
  itemId: string;
  refId: string;
  appId: string;
  rating: number;
}) => {
  try {
    const res = await axiosInstance.post('/config/rating', {
      item_id: itemId,
      ref_id: refId,
      app_id: appId,
      rating,
    });
    return res?.data;
  } catch {
    return null;
  }
};
