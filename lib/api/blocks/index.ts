import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { getCookie } from 'cookies-next';
import { BLOCK_PAGE_SIZE } from '@/lib/constant/texts';
import { getPageId } from '@/lib/utils/methods';

export interface PageDataResponseType {
  msg?: string;
  code?: number;
  data?: BlockListType;
  status?: string;
}

export interface BlockListType {
  meta?: PageMetaType;
  blocks?: BlockItemType[];
}

export interface LeagueData {
  id?: string;
  round_name?: string;
  position?: number;
  team?: string;
  logo?: string;
  played?: number;
  won?: number;
  draw?: number;
  lost?: number;
  goal_difference?: number;
  point?: number;
  matches?: Match[];
  ranking?: RankingItem[];
}

export interface RankingItem {
  draw?: string;
  point?: string;
  logo?: string;
  id?: string;
  lost?: string;
  round_name?: string;
  goal_difference?: string;
  played?: string;
  won?: string;
  team?: string;
  position?: string;
}

export interface Team {
  extra_score?: string;
  short_name?: string;
  penalty_score?: string;
  score?: string;
  full_name?: string;
  logo?: string;
  id?: string;
}

export interface Match {
  match_type?: string;
  league?: League;
  comment_type?: string;
  round_id?: string;
  begin_time?: string;
  home?: Team | Record<string, never>;
  id?: string;
  highlight_id?: string;
  round_name?: string;
  away?: Team | Record<string, never>;
  match_date?: string;
  channel_id?: string;
  end_time?: string;
  is_finished?: string;
  title?: string;
  type?: string;
  length?: number;
}

export interface NameLeague {
  is_stage?: string;
}

export interface MetaData {
  name?: string;
}

export type BlockTypeType =
  // theo field: block_type
  | 'ads'
  | 'highlight'
  | 'horizontal_highlight'
  | 'horizontal_slider'
  | 'horizontal_slider_small'
  | 'feature_horizontal_slider'
  | 'horizontal_slider_with_background'
  | 'horizontal_highlight_without_background'
  | 'horizontal_slider_hyperlink'
  | 'vertical_slider_small'
  | 'vertical_slider_medium'
  | 'vertical_slider'
  | 'vertical_slider_video'
  | 'watching'
  | 'recommend'
  | 'numeric_rank'
  | 'auto_expansion'
  | 'vod_detail'
  | 'category'
  | 'sport_sidebyside'
  | 'horizontal_banner_with_title'
  | 'new_vod_detail'
  | 'participant';

export interface PageMetaType {
  meta_description?: string;
  index?: number;
  meta_title?: string;
  meta_image?: string;
  background_gradient?: string;
  description?: string;
  page_style?: string;
  canonical?: string;
  background_image?: string;
  top_align?: string;
  background_header_image?: string;
  is_share?: string;
  max_video_preview?: string;
  follow?: number;
  name_en?: string;
  meta_keywword?: string;
  max_image_preview?: string;
  header_image?: string;
  name?: string;
  tracking_name?: string;
  title?: string;
  block_style?: BlockTypeType;
  type?: string;
}

export interface BlockItemType {
  redirect?: Redirect;
  ads_position?: string;
  background_image?: BackgroundImage;
  block_type?: BlockTypeType;
  name?: string;
  custom_data?: string;
  short_description?: string;
  type?: string;
  id?: string;
  original_position?: number;
  position?: number;
  need_recommend?: string;
  page_index?: number;
  page_size?: number;
  tracking_name?: string;
}

export interface Redirect {
  text?: string;
  app_id?: string;
  text_en?: string;
  object_id?: string;
  type?: string;
  id?: string;
  view_more_icon?: string;
  view_more_limit?: string;
}

export interface BackgroundImage {
  mobile?: string;
  smarttv?: string;
  web?: string;
}

const getPageData = async ({
  page_id,
}: {
  page_id?: string;
}): Promise<AxiosResponse<PageDataResponseType>> => {
  try {
    return axiosInstance.get(`/mainpage/page/${page_id}`);
  } catch (error) {
    console.error('Error fetching page data:', error);
    // Trả về response object với thông tin lỗi
    return {
      data: {
        msg: 'Lỗi khi tải dữ liệu trang',
        code: 500,
        status: 'error',
      },
      status: 500,
      statusText: 'Internal Server Error',
    } as AxiosResponse<PageDataResponseType>;
  }
};

export interface BlockItemResponseType {
  userid?: string;
  result?: string;
  time?: string;
  meta?: BlockMetaType;
  data?: BlockSlideItemType[];
  code?: number;
}

export interface BlockMetaType {
  short_description?: string;
  short_icon?: string;
  type?: string;
  name?: string;
  block_style?: BlockTypeType;
  btn_info?: ButtonInfo;
}

export interface ButtonInfo {
  title?: string;
  icon?: string;
  action?: string;
  popup_info?: PopupInfo;
  name?: string;
}

export interface PopupInfo {
  title?: string;
  description?: string;
  type?: string;
  data?: PopupAction[];
}

export interface PopupAction {
  id: string;
  title: string;
}

export interface League {
  ranking?: RankingItem[];
  name?: string;
  right_name?: string;
  matches?: Match[];
  image?: string;
  is_stage?: string;
  id?: string;
}

export interface BlockSlideItemType {
  leagues?: object;
  league?: League;
  is_play?: string;
  block_type?: string;
  url_trailer?: string;
  extra?: object;
  timeshift?: string;
  image?: BlockSlideItemImageType;
  custom_data?: string;
  labels?: {
    url?: string;
    position?: string;
  }[];
  app_id?: string;
  pin?: string;
  is_multicam?: string;
  show_icon_timeshift?: string;
  id?: string | number;
  label_event?: string;
  comment_type?: string;
  title?: string;
  detail?: BlockSlideItemDetailType;
  poster_overlays?: string[];
  is_dynamic?: string;
  type?: string;
  is_subscribed?: string;
  is_premier?: string;
  profile_trailer?: string[];
  is_new?: string;
  timeshift_limit?: string;
  content_type?: string;
  begin_time?: string;
  is_trailer?: string;
  txt_new?: string;
  id_trailer?: string;
  playlist_total?: string;
  highlight_id?: string;
  time_watched?: string;
  channel_name?: string;
  end_time?: string;
  small_image?: string;
  thumb?: string;
  title_vie?: string;
  _id?: string;
  slug_id?: string;
  referred_object_id?: string;
  website_url?: string;
  start_time?: string;
  match_type?: string;
  round_id?: string;
  home?: Team | Record<string, never>;
  round_name?: string;
  away?: Team | Record<string, never>;
  match_date?: string;
  channel_id?: string;
  is_finished?: string;
  length?: number;
  highlighted_info?: SlideHightlightInfoType[];
  trailer_info?: {
    url?: string;
  };
  bg_color?: string;
  need_recommend?: string;
  description?: string;
}

export interface SlideHightlightInfoType {
  content?: string;
  type?: 'image' | 'rating';
  avg_rate?: string;
  count?: string;
  bg_color?: string;
  icon?: string;
  count_origin?: number;
}

export interface BlockSlideItemImageType {
  square?: string;
  landscape_title?: string;
  title?: string;
  portrait_mobile?: string;
  portrait?: string;
  landscape?: string;
}

export interface BlockSlideItemDetailType {
  category?: string;
  description?: string;
  people?: string[];
  country?: string;
  price?: string;
  app_force_update?: string;
  duration_i?: string;
  release?: string;
  meta_data?: string[];
  duration_s?: string;
  age_rating?: string;
  short_description?: string;
  app_upgrade_file?: string;
  priority_tag?: string;
  app_latest_version?: string;
}

const getBlockItemData = async ({
  block,
  page_index,
  page_id,
  page_size,
  keywordSearch,
}: {
  block: BlockItemType;
  page_index?: number;
  page_id?: string;
  page_size?: number;
  keywordSearch?: string;
}): Promise<AxiosResponse<BlockItemResponseType>> => {
  const pageSize = page_size || getCookie(BLOCK_PAGE_SIZE);

  const baseQueries = {
    block_type: block.block_type,
    custom_data: block.custom_data ? decodeURIComponent(block.custom_data) : '',
    watching_version: 'v1',
    handle_event: 1,
    page_index: page_index || 1,
    page_size:
      block.block_type === 'numeric_rank'
        ? 11
        : pageSize
        ? parseInt(pageSize as string) + 1
        : 31,
    page_id: page_id || getPageId() || '',
  };

  const queries =
    block.type === 'search'
      ? {
          ...baseQueries,
          search_version: 'v2',
          type_search: 'manual_search',
          ...(keywordSearch?.trim() ? { query_str: keywordSearch } : {}),
        }
      : baseQueries;

  return axiosInstance.get(`/playos/block/${block.type}/${block.id}`, {
    params: queries,
  });
};

const getBlockSortData = async ({
  block,
  page_index,
  page_id,
}: {
  block: BlockSlideItemType;
  page_index?: number;
  page_id?: string;
}): Promise<AxiosResponse<BlockItemResponseType>> => {
  const queries = {
    block_type: block.type,
    custom_data: block.custom_data ? decodeURIComponent(block.custom_data) : '',
    watching_version: 'v1',
    handle_event: 1,
    page_index: page_index || 1,
    drm: 1,
    page_id: page_id || '',
  };

  return axiosInstance.get(`/athena/block/${block.type}/${block?.id}`, {
    params: queries,
    timeout: 1000,
  });
};

export interface RecommendResponseType {
  msg?: string;
  code?: number;
  data?: {
    blocks?: RecommendBlockItemType[];
  };
  profile_id?: string;
  profile_type?: string | number;
}

export interface RecommendBlockItemType {
  fixed_position?: number;
  id?: string;
  name?: string;
  position?: number;
  tracking_name?: string;
}

const getRecommendData = async ({
  page_id,
}: {
  page_id?: string;
}): Promise<AxiosResponse<RecommendResponseType>> => {
  try {
    return axiosInstance.get(`/bigdata/recommendation/page/ott/v1/${page_id}`);
  } catch {
    return {} as Promise<AxiosResponse<RecommendResponseType>>;
  }
};
export { getPageData, getBlockItemData, getRecommendData, getBlockSortData };
