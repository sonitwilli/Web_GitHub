import { axiosInstance } from '../axios';

export interface ShortVideoContent {
  title?: string;
  caption?: string;
  thumb?: string;
  video_url?: string;
}

export interface ShortVideoDetail {
  content?: ShortVideoContent;
  id?: string;
}

export interface ShortVideoResponse {
  data?: ShortVideoDetail[];
  status?: number;
  message?: string;
}

/**
 * Get short video detail by moment ID and chapter ID
 * If 404 error occurs, fallback to getMomentDetail with chapterId
 */
export const getShortVideoDetail = async (
  momentId: string,
  chapterId: string,
): Promise<ShortVideoResponse> => {
    const response = await axiosInstance.get(`short_vod/${momentId}/${chapterId}`);
    return response.data;
};

/**
 * Get moment detail by chapter ID only
 */
export const getMomentDetail = async (
  chapterId: string,
): Promise<ShortVideoResponse> => {
  const response = await axiosInstance.get(`moment/${chapterId}`);
  return response.data;
};
