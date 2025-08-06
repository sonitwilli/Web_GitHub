import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';
import { VodDetailResponseType } from '../vod';

export interface HighlightedInfo {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  image?: string;
  position?: string;
}

export interface PlayListVideo {
  id: string;
  title: string;
  landscape?: string;
  duration?: string;
  duration_s?: string;
  time_watched?: string;
  meta_data?: string[];
  episode_id?: string;
  real_episode_id?: string;
  ref_episode_id?: string;
  added_episode_total?: string;
  app_id?: string;
  ref_id?: string;
  auto_profile?: string;
  logo?: {
    url?: string;
    position?: string;
  };
  priority_tag?: string;
  downloadable?: string;
  ribbon_episode?: string;
  overlay_logo?: string;
  maturity_rating?: {
    position?: string;
    prefix?: string;
    advisories?: string;
    value?: string;
  };
  verimatrix?: string;
  is_latest?: string;
  enable_report?: string;
  timeline_img?: string;
  tracking?: {
    content_type?: string;
  };
  stream_profiles?: Array<{
    manifest_id?: string;
    description?: string;
    require_payment?: string;
    name?: string;
  }>;
  resolution?: {
    max_height?: string;
    max_width?: string;
  };
}

export interface PlayListMain {
  id: string;
  title: string;
  image?: {
    portrait?: string;
    landscape_title?: string;
    portrait_mobile?: string;
    landscape?: string;
    title?: string;
  };
  background?: string;
  ref_id?: string;
  tracking?: {
    content_type?: string;
  };
  release?: string;
  meta_data?: string[];
  total?: string;
  priority_tag?: string;
  is_subscribed?: string;
  is_kid?: string;
  enable_report?: string;
  highlighted_info?: HighlightedInfo[];
}

export interface PlayListResponse {
  id?: string;
  title: string;
  image?: {
    portrait?: string;
    landscape_title?: string;
    portrait_mobile?: string;
    landscape?: string;
    title?: string;
  };
  background?: string;
  ref_id?: string;
  tracking?: {
    content_type?: string;
  };
  release?: string;
  meta_data?: string[];
  total?: string;
  priority_tag?: string;
  is_subscribed?: string;
  is_kid?: string;
  enable_report?: string;
  highlighted_info?: HighlightedInfo[];
  videos?: PlayListVideo[];
}

export interface PlayListDetailResponseType {
  status?: string;
  data?: PlayListResponse;
  message?: {
    content?: string;
    title?: string;
  };
  videos?: PlayListVideo[];
  tracking?: {
    content_type?: string;
  };
}

export const getPlaylistDetail = async (
  playlistId: string,
): Promise<AxiosResponse<PlayListDetailResponseType>> => {
  return axiosInstance.get(`/vod/playlist/detail/${playlistId}`);
};

export const getPlaylistRealDetail = async (
  playlistId: string,
): Promise<AxiosResponse<VodDetailResponseType>> => {
  return axiosInstance.get(`/vod/detail/${playlistId}`);
};

export const getNextVideos = async (
  playlistId: string,
  structureId?: string,
): Promise<AxiosResponse<{ data: PlayListVideo[] }>> => {
  const params: Record<string, string | number> = {
    drm: 1,
    page_size: 1,
    is_playlist: 1,
    structure_id: structureId || '',
  };

  return axiosInstance.get(`/vod/next_videos/${playlistId}`, {
    params,
  });
};
