import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';
import { ChannelDetailType, StreamDataResponseType } from '../channel';
import { BlockItemResponseType } from '../blocks';

export interface PackagePlanResponseType {
  msg_content?: string;
  msg_data_error?: string;
  msg_code?: 'error' | 'success';
  msg_data?: string;
}

export interface VodDetailResponseType {
  status?: string;
  data?: VodDetailType;
  message?: {
    content?: string;
    title?: string;
  };
  result?: VodDetailType;
}

export enum EpisodeTypeEnum {
  SINGLE = '0', // Phim single
  SERIES = '1', // Phim series
  SEASON = '2', // Phim season
}

export interface VodDetailType {
  app_id?: string;
  blocks?: Block[];
  countries?: string;
  description?: string;
  drm?: string | boolean | number;
  duration?: string;
  enable_ads?: number | string;
  enable_report?: string;
  episode_block_title?: string;
  episode_current?: string;
  episode_group_length?: string;
  episode_title_type?: string;
  episode_total?: string;
  episode_type?: EpisodeTypeEnum;
  episodes?: Episode[];
  highlighted_info?: HighlightedInfo[];
  id?: string;
  image?: Image;
  is_coming_soon?: string;
  is_kid?: string;
  is_tvod?: string;
  is_vip?: number | string;
  genres?: string[];
  maturity_rating?: MaturityRating;
  meta_data?: string[];
  overlay_logo?: string;
  payment?: Payment;
  ref_id?: string;
  seo?: {
    index?: number;
    follow?: number;
    description?: string;
    title?: string;
  };
  short_description?: string;
  source_provider?: string;
  structures?: string[];
  title?: string;
  tracking?: Tracking;
  trailer_info?: TrailerInfo;
  website_url?: string;
}

export interface HighlightedInfo {
  count?: string;
  bg_color?: string;
  type?: string;
  avg_rate?: string;
  icon?: string;
}

export interface Image {
  landscape?: string;
  landscape_title?: string;
  title?: string;
  portrait?: string;
  portrait_mobile?: string;
}

export interface Episode {
  id?: string;
  real_episode_id?: string;
  thumb?: string;
  title?: string;
  ref_episode_id?: string;
  ribbon_episode?: string;
  download_local?: string;
  auto_profile?: string;
  timeline_img?: string;
  description?: string;
  is_preview?: string;
  duration_s?: string;
  is_latest?: '0' | '1';
  is_vip?: string;
  duration?: string;
  _id?: string;
  // Added for playlist compatibility
  app_id?: string;
  downloadable?: string;
  landscape?: string;
  logo?: { url?: string; position?: string };
  maturity_rating?: {
    position?: string;
    prefix?: string;
    advisories?: string;
    value?: string;
  };
  meta_data?: string[];
  overlay_logo?: string;
  priority_tag?: string;
  resolution?: { max_height?: string; max_width?: string };
  stream_profiles?: Array<{
    manifest_id?: string;
    description?: string;
    require_payment?: string;
    name?: string;
  }>;
  time_watched?: string;
  tracking?: { content_type?: string };
  verimatrix?: string;
  episode_id?: string;
}

export interface MaturityRating {
  value?: string;
  prefix?: string;
  position?: string;
  advisories?: string;
}

export interface Tracking {
  content_type?: string;
}

export interface Block {
  id?: string;
  name?: string;
  short_description?: string;
  block_type?: string;
  type?: string;
  need_recommend?: string;
  background_image?: BackgroundImage;
  redirect?: Redirect;
  custom_data?: string;
  ads_position?: string;
}

export interface BackgroundImage {
  smarttv?: string;
  mobile?: string;
  web?: string;
}

export interface Redirect {
  text: string;
  type: string;
  id: string;
}

export interface Payment {
  require_vip_name: string;
  require_vip_price: string;
  require_vip_plan: string;
}

export interface TrailerInfo {
  url: string;
}

const getVodDetail = async ({
  vodId,
}: {
  vodId: string;
}): Promise<AxiosResponse<VodDetailResponseType>> => {
  return axiosInstance.get(`/content/vod/${vodId}`);
};

const getEpisodeDetail = async ({
  vodId,
  episode,
}: {
  vodId: string;
  episode: Episode;
}): Promise<AxiosResponse<StreamDataResponseType>> => {
  return axiosInstance.get(
    `/stream/vod/${vodId}/${
      episode?.tracking?.content_type === 'vod_playlist'
        ? episode?.episode_id || episode?.ref_episode_id || episode?._id
        : episode?.id || episode?._id
    }/${episode?.auto_profile}`,
  );
};

export interface SubscribeParamsType {
  id?: string | number;
  type?: string;
  value?: 'sub' | 'unsub';
}

export interface ReactionResponseType {
  status?: string;
  data?: boolean;
  msg?: string;
}

const subscribeVod = async ({
  id,
  value,
  type,
}: SubscribeParamsType): Promise<AxiosResponse<ReactionResponseType>> => {
  if (value === 'sub') {
    return axiosInstance.post(
      `/notification/subscribe_room?type=${type}&id=${id}`,
      {
        type,
        id,
      },
    );
  }

  return axiosInstance.delete(
    `/notification/unsubscribe_room?type=${type}&id=${id}`,
    {
      data: {
        type,
        id,
      },
    },
  );
};

export interface WatchingChapterResponseType {
  msg?: string;
  chapter?: ChapterList;
  result?: string;
}

export interface ChapterList {
  items?: ChapterItem[];
  lastchapter_id?: string;
}

export interface ChapterItem {
  duration?: number;
  timeplayed?: number;
  chapter_id?: string;
  credit?: number;
  time?: number;
}

const getWatchingChapter = async ({
  vodId,
}: {
  vodId: string;
}): Promise<AxiosResponse<WatchingChapterResponseType>> => {
  return axiosInstance.get(`/watching/chapter?movie_id=${vodId}`);
};

const getTop10 = async ({
  vodDetail,
  pageSize,
}: {
  vodDetail?: ChannelDetailType;
  pageSize?: number;
}): Promise<AxiosResponse<BlockItemResponseType>> => {
  return axiosInstance.get(
    `/athena/block/top10/${vodDetail?.app_id}?page_size=${pageSize || 10}`,
  );
};

export interface NextVideosResponseType {
  status?: string;
  data?: NextRecommendData[];
  message?: {
    content?: string;
    title?: string;
  };
}

export interface NextRecommendData {
  id?: string;
  _id?: string;
  title?: string;
  title_vie?: string;
  description?: string;
  short_description?: string;
  image?: Image;
  is_trailer?: string;
  duration?: string;
  meta_data?: string[];
  type?: string;
  id_trailer?: string;
  detail?: {
    priority_tag?: string;
    description?: string;
    meta_data?: string[];
  };
}

const getNextVideos = async ({
  vodId,
  structureId,
  pageSize = 1,
  drm = 1,
  isPlaylist = 0,
}: {
  vodId: string;
  structureId?: string;
  pageSize?: number;
  drm?: number;
  isPlaylist?: number;
}): Promise<AxiosResponse<NextVideosResponseType>> => {
  const params = new URLSearchParams({
    drm: drm.toString(),
    page_size: pageSize.toString(),
    is_playlist: isPlaylist.toString(),
  });

  if (structureId) {
    params.append('structure_id', structureId);
  }

  return axiosInstance.get(`/vod/next_videos/${vodId}?${params.toString()}`);
};

export interface VodHistoryResponseType {
  timeplayed?: string;
  msg?: string;
  movie_id?: string;
  result?: string;
  duration?: number;
  chapter_id?: string;
}

const getVodHistory = async ({
  vodId,
  chapterId,
}: {
  vodId?: string;
  chapterId?: string;
}): Promise<AxiosResponse<VodHistoryResponseType>> => {
  return axiosInstance.get(
    `/watching/play?movie_id=${vodId}&chapter_id=${
      typeof chapterId !== 'undefined' ? chapterId : '-1'
    }`,
  );
};

const getPackagePlan = async ({
  plan_id,
  agent,
  source,
}: {
  plan_id?: string;
  agent?: string;
  source?: string;
}): Promise<AxiosResponse<PackagePlanResponseType>> => {
  return axiosInstance.get(
    `payment/get_package_plans?package_type=${plan_id}&from_source=${
      source || 'play'
    }&X-Agent=${agent || 'web-playfpt'}`,
  );
};

export {
  getVodDetail,
  getEpisodeDetail,
  subscribeVod,
  getWatchingChapter,
  getTop10,
  getNextVideos,
  getVodHistory,
  getPackagePlan,
};
