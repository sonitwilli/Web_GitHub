import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { BLOCK_PAGE_SIZE } from '@/lib/constant/texts';
import { getCookie } from 'cookies-next';

// Các interface giữ nguyên
export interface PageDataResponseType {
  msg?: string;
  code?: number;
  data?: BlockSlideItemType[];
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
  url_trailer?: string;
  extra?: object;
  timeshift?: string;
  image?: BlockSlideItemImageType;
  labels?: { url?: string; position?: string }[];
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

export interface HighlightBlock {
  id?: string | number;
  name?: string;
  type?: string;
  block_type?: string;
  custom_data?: string;
  list_items?: BlockSlideItemType[] | BlockSlideItemType[][];
  date?: string;
}

export const getTableDetailData = async ({
  data,
}: {
  data: HighlightBlock;
}): Promise<AxiosResponse<PageDataResponseType>> => {
  try {
    if (!data?.id) {
      throw new Error('Invalid or missing data.id');
    }
    const pageSize = getCookie(BLOCK_PAGE_SIZE);
    const queries = {
      block_type: data.block_type,
      custom_data: data.custom_data ? decodeURIComponent(data.custom_data) : '',
      watching_version: 'v1',
      handle_event: 1,
      page_index: 1,
      page_size:
        data.block_type === 'numeric_rank'
          ? 11
          : pageSize
          ? parseInt(pageSize as string) + 1
          : 31,
    };
    const response = await axiosInstance.get(
      `/playos/block/table_league_detail/${data.id}`,
      { params: queries },
    );
    return response;
  } catch (error) {
    console.error(
      'Error fetching table league detail:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error; // Ném lỗi để hook xử lý
  }
};
