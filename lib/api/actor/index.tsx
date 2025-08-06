import { axiosInstance } from '../axios';

export const fetchDataActorBlock = async (id: string) => {
  try {
    const res = await axiosInstance.get(`content/people/${id}`);
    return res;
  } catch {
    return null;
  }
};

export const fetchDataActorVideo = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/people/${id}`);
    return res;
  } catch {
    return null;
  }
};
