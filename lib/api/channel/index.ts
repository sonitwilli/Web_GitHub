import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';
import { StreamItemType } from '../stream';
import { axiosInstancePingDrm } from '../axios/pingDrm';
import { VodDetailType } from '../vod';
import {
  PositionType,
  PosterOverlayItem,
} from '@/lib/utils/posterOverlays/types';
import { axiosServer } from '../axios/server';
import { PlayListVideo } from '../playlist';

export interface ChannelResponseType {
  status?: string;
  data?: ChannelResponseDataType;
}

export interface ChannelResponseDataType {
  groups?: ChannelGroupType[];
  channels?: ChannelItemType[];
  schedule_days?: ScheduleDay[];
  default_channel?: string;
}

export interface ChannelGroupType {
  id?: string;
  name?: string;
  icon_states?: string;
  type?: 'highlight' | 'all' | 'normal' | 'schedule' | 'recommend';
  block_type?: string;
}

export interface ChannelItemType extends SuggestChannelItemType {
  id?: string;
  channel_number?: string;
  name?: string;
  timeshift?: '1' | '0';
  show_icon_timeshift?: '1' | '0';
  timeshift_limit?: string;
  verimatrix?: string;
  group_id?: string;
  tracking?: Tracking;
  original_logo?: string;
  status?: number;
  thumb?: string;
  slugName?: string;
  plusName?: string;
  nameNoWhiteSpace?: string;
  poster_overlays?: PosterOverlayItem[];
}

export interface Tracking {
  content_type?: string;
  ref_id?: string;
}

export interface ScheduleDay {
  label?: string;
  value?: string;
  start_time?: string;
  end_time?: string;
  selected?: string;
  text_on_top?: string;
  text_on_bottom?: string;
}

export interface Tracking {
  content_type?: string;
}

const getChannels = async (): Promise<AxiosResponse<ChannelResponseType>> => {
  return axiosInstance.get('/content/tv/channels?time_out=3000');
};

export interface ChannelDetailType extends VodDetailType {
  // Properties from PlayListResponse that do not conflict with VodDetailType should be added here manually
  // For example, if PlayListResponse has properties not present in VodDetailType, add them below:
  // playlist_specific_property?: Type;

  id?: string;
  _id?: string;
  alias_name?: string;
  app_id?: string;
  audio_config_name?: string[];
  audio_name_mode?: string;
  auto_profile?: string;
  bg_audio?: number;
  channel_number?: number;
  comment?: number;
  comment_type?: string;
  description?: string;
  dynamic_link?: string;
  enable_ads?: number | string;
  enable_p2p?: boolean;
  enable_report?: string;
  extras?: Extras;
  is_kid?: string;
  is_logged_in?: number;
  is_vip?: number | string;
  is_comment?: string;
  logo?: {
    position?: PositionType;
    url?: string;
  };
  low_latency?: number;
  multi_audio?: { audio_name?: string }[];
  name?: string;
  original_logo?: string;
  overlay_logo?: string;
  p2p_type?: string;
  pin_top?: boolean;
  quality?: number;
  ref_id?: string;
  resolution?: Resolution;
  seo?: Seo;
  show_icon_timeshift?: number;
  sme_id?: string[];
  source?: number;
  source_provider?: string;
  stream_profiles?: StreamProfile[];
  thumb?: string;
  timeshift?: number;
  timeshift_limit?: number;
  tracking?: Tracking;
  type?: string;
  type_show_logo?: number;
  user_added_favourite?: number;
  user_favourite_id?: string;
  verimatrix?: boolean | string | number;
  vip_plan_logo?: string;
  website_url?: string;
  wm?: string;
  videos?: PlayListVideo[];
  category?: { id?: string; title?: string; type?: string }[];
  related_videos?: [];
  actors_detail?: Array<{
    description?: string;
    vie_name?: string;
    avatar?: string;
    full_name?: string;
    _id?: string;
    alt_name?: string;
  }>;
  link_videos?: [];
  list_structure_id?: string[];
  title_origin?: string;
  title_vie?: string;
  is_tvod?: string;
  begin_time?: string;
  directors_detail?: Array<unknown>;
  nation?: string;
}

export interface Seo {
  index?: number;
  description?: string;
  title?: string;
  max_video_preview?: string;
  follow?: number;
  max_image_preview?: string;
  canonical?: string;
}

export interface Resolution {
  max_width?: string;
  max_height?: string;
}

export interface Extras {
  [index: string]: string;
}

export interface StreamProfile {
  manifest_id?: string;
  description?: string;
  name?: string;
  require_payment?: string;
}

export interface ChannelDetailResponseType {
  Channel?: ChannelDetailType;
}

const getChannelDetail = async ({
  channelId,
}: {
  channelId?: string;
}): Promise<AxiosResponse<ChannelDetailResponseType>> => {
  return axiosInstance.get(`/tv/detail/${channelId}`);
};

export interface StreamDataResponseType {
  enable_preview?: '0' | '1';
  error_code?: number;
  msg?: string;
  status?: number;
  data?: StreamErrorType;
}

export interface StreamErrorType extends StreamItemType {
  logged_in_fplay?: number;
  require_vip_plan?: string;
  qnet?: number;
  resolution?: Resolution;
  enable_preview?: string;
  auto_profile?: string;
  stream_profiles?: StreamProfile[];
  trailer_url?: string;
  require_vip_price?: string;
  require_vip_image?: string;
  btn_skip?: string;
  preview_url?: string;
  is_tvod?: boolean;
  require_vip_description?: string;
  exp?: string;
  msg?: string;
  business_model?: number;
  require_vip_title?: string;
  require_vip_name?: string;
  btn_active?: string;
  data?: StreamErrorType;
}

const getStreamData = async ({
  channelId,
  autoProfile,
  dataChannelType,
}: {
  channelId?: string;
  autoProfile?: string;
  dataChannelType?: string;
}): Promise<AxiosResponse<StreamDataResponseType>> => {
  const isEventPremier = dataChannelType && ['event'].includes(dataChannelType);

  const enablePreview = isEventPremier ? 0 : 1;

  return axiosInstance.get(
    `/stream/tv/${channelId}/${autoProfile}?enable_preview=${enablePreview}`,
  );
};

// Extended response data for preview streams
export interface PreviewResponseData {
  // Common fields
  url?: string;
  url_clean?: string;
  url_dash_av1?: string;
  url_dash_h264?: string;
  url_dash_dolby_vision?: string;
  url_dash_drm?: string;
  url_dash_drm_av1?: string;
  url_dash_drm_dolby_vision?: string;
  url_dash_drm_h265?: string;
  url_dash_drm_h265_hdr_10?: string;
  url_dash_drm_h265_hdr_10_plus?: string;
  url_dash_drm_h265_hlg?: string;
  url_dash_drm_vp9?: string;
  url_dash_h265?: string;
  url_dash_h265_hdr_10?: string;
  url_dash_h265_hdr_10_plus?: string;
  url_dash_h265_hlg?: string;
  url_dash_no_drm?: string;
  url_dash_vp9?: string;
  url_hls_av1?: string;
  url_hls_h264?: string;
  url_hls_dolby_vision?: string;
  url_hls_drm?: string;
  url_hls_drm_av1?: string;
  url_hls_drm_dolby_vision?: string;
  url_hls_drm_h265?: string;
  url_hls_drm_h265_hdr_10?: string;
  url_hls_drm_h265_hdr_10_plus?: string;
  url_hls_drm_h265_hlg?: string;
  url_hls_drm_vp9?: string;
  url_hls_h265?: string;
  url_hls_h265_hdr_10?: string;
  url_hls_h265_hdr_10_plus?: string;
  url_hls_h265_hlg?: string;
  url_hls_vp9?: string;
  url_hls_h264_hdr_10?: string;
  url_hls_h264_hdr_10_plus?: string;
  url_hls_h264_hlg?: string;
  url_hls_h264_vp9?: string;
  url_dash?: string;
  url_hls?: string;
  url_sub?: string;

  src?: string;
  src_h265?: {
    dash: string;
    hls: string;
  };
  enable_preview?: '0' | '1';

  // VOD preview fields (direct in responseData)
  session?: string;
  merchant?: string;
  is_logged_in?: number;
  is_vip?: number;
  audio?: string;
  trailer_url?: string;
  stream_session?: string;
  require_vip_plan?: string;
  ping_enable?: boolean;
  ping_enc?: boolean;
  ping_mqtt?: string;
  ping_qnet?: number;
  ping_session?: string;
  require_active?: number;
  operator?: number;
  overlay_logo?: string;
  require_obj_msg?: {
    available?: string;
    subtitle?: string;
    title?: string;
  };
  ttl_preview?: string;

  // Live preview specific fields
  status?: number;
  msg?: string;
  error_code?: number;
  data?: {
    // Basic stream URLs
    url?: string;
    url_clean?: string;
    url_dash?: string;
    url_hls?: string;
    url_sub?: string;

    // DASH URLs with different codecs
    url_dash_av1?: string;
    url_dash_h264?: string;
    url_dash_h265?: string;
    url_dash_dolby_vision?: string;
    url_dash_vp9?: string;
    url_dash_h265_hdr_10?: string;
    url_dash_h265_hdr_10_plus?: string;
    url_dash_h265_hlg?: string;
    url_dash_no_drm?: string;

    // DASH DRM URLs
    url_dash_drm?: string;
    url_dash_drm_av1?: string;
    url_dash_drm_h265?: string;
    url_dash_drm_dolby_vision?: string;
    url_dash_drm_vp9?: string;
    url_dash_drm_h265_hdr_10?: string;
    url_dash_drm_h265_hdr_10_plus?: string;
    url_dash_drm_h265_hlg?: string;

    // HLS URLs with different codecs
    url_hls_av1?: string;
    url_hls_h264?: string;
    url_hls_h265?: string;
    url_hls_dolby_vision?: string;
    url_hls_vp9?: string;
    url_hls_h265_hdr_10?: string;
    url_hls_h265_hdr_10_plus?: string;
    url_hls_h265_hlg?: string;
    url_hls_h264_hdr_10?: string;
    url_hls_h264_hdr_10_plus?: string;
    url_hls_h264_hlg?: string;
    url_hls_h264_vp9?: string;

    // HLS DRM URLs
    url_hls_drm?: string;
    url_hls_drm_av1?: string;
    url_hls_drm_h265?: string;
    url_hls_drm_dolby_vision?: string;
    url_hls_drm_vp9?: string;
    url_hls_drm_h265_hdr_10?: string;
    url_hls_drm_h265_hdr_10_plus?: string;
    url_hls_drm_h265_hlg?: string;

    // Stream configuration
    session?: string;
    stream_session?: string;
    merchant?: string;
    is_logged_in?: number;
    is_vip?: number;
    audio?: string;
    require_vip_plan?: string;
    require_active?: number;
    ping_enable?: boolean;
    ping_enc?: boolean;
    ping_multicast?: string;
    ping_mqtt?: string;
    ping_qnet?: number;
    ping_session?: string;

    // Content metadata
    trailer_url?: string;
    timeshift_url?: string;
    tip_img?: string;
    audio_img?: string;
    overlay_logo?: string;
    ttl_preview?: string;

    // P2P and technical settings
    enable_p2p_quanteec?: string;
    content_id_p2p_quanteec?: string;
    mqtt_mode?: string;
    operator?: number;
    revalidate_span?: number;
    must_revalidate?: number;
    wmt?: string;

    // Required object message
    require_obj_msg?: {
      available?: string;
      subtitle?: string;
      title?: string;
    };
  };
}

export interface ScheduleItem {
  id?: string; // id chương trình
  title?: string; // tiêu đề
  start_time?: string; // thời gian bắt đầu (UNIXTIME dưới dạng chuỗi)
  end_time?: string; // thời gian kết thúc (UNIXTIME dưới dạng chuỗi)
}

export interface ScheduleData {
  schedule_list?: ScheduleItem[];
  channel_id?: string; // id kênh ott
  ref_id?: string; // id kênh iptv
  enable_report?: string; // "1"
  app_id?: string; // "20"
  tracking?: Tracking;
}

export interface BroadcastScheduleResponse {
  status?: string; // "0" = Thất bại, "1" = Thành công
  message?: {
    title?: string;
    content?: string;
  };
  data?: ScheduleData;
}

const getBroadcastSchedule = async ({
  channelId,
  daily,
}: {
  channelId?: string;
  daily?: string;
}): Promise<AxiosResponse<BroadcastScheduleResponse>> => {
  return axiosInstance.get(`/content/tv/schedules/${channelId}?day=${daily}`);
};

// suggest channel
export interface SuggestChannelResponseType {
  status?: string;
  code?: number;
  success?: boolean;
  data?: ChannelItemType[];
}

export interface SuggestChannelItemType {
  id?: string;
  image: {
    portrait?: string;
    title?: string;
    portrait_mobile?: string;
    landscape?: string;
    landscape_title?: string;
  };
  show_icon_timeshift?: '1' | '0';
  title?: string;
  timeshift?: '1' | '0';
  timeshift_limit?: string;
}

export interface CookiesType {
  [index: string]: string;
}

const getSuggestChannels = async ({
  isServerSide,
  cookies,
}: {
  cookies?: CookiesType;
  isServerSide?: boolean;
}): Promise<AxiosResponse<SuggestChannelResponseType>> => {
  if (isServerSide) {
    const instance = axiosServer({ cookies });
    return instance.get(`/playos/block/recommend/channel`);
  }
  return axiosInstance.get(`/playos/block/recommend/channel`);
};

const getTimeShiftChannel = async ({
  scheduleId,
  bitrateId,
  channelId,
}: {
  scheduleId?: string;
  bitrateId?: string;
  channelId?: string;
}): Promise<AxiosResponse> => {
  // ------------ Note  ------------
  // Truyền thêm tham số channel_id và bỏ bitrateId
  // --> vd: /stream/tvtimeshift/12345?channel_id=vtv3-hd
  if (channelId) {
    return axiosInstance.get(
      `/stream/tvtimeshift/${scheduleId}?channel_id=${channelId}`,
    );
  } else {
    return axiosInstance.get(
      `/stream/tvtimeshift/${scheduleId}${bitrateId ? '/' + bitrateId : ''}`,
    );
  }
};

interface PingParamsType {
  session?: string;
  dataChannel?: ChannelDetailType;
  isNonDrm?: boolean;
  type?: string;
  event_id?: string;
}

const pingChannel = async ({
  dataChannel,
  session,
  isNonDrm,
  type,
  event_id,
}: PingParamsType): Promise<AxiosResponse<number[]>> => {
  let url = `user_stream_ping/ping/${dataChannel?._id || dataChannel?.id}`;
  if (isNonDrm) {
    url = `user_stream_ping/ping/${
      dataChannel?._id || dataChannel?.id
    }?type=${type}&event_id=${event_id}`;
  }
  return axiosInstancePingDrm.post(url, {
    session,
  });
};

const deletePingChannel = async ({
  dataChannel,
}: PingParamsType): Promise<AxiosResponse<number[]>> => {
  return axiosInstancePingDrm.delete(
    `user_stream_ping/ping/${dataChannel?._id || dataChannel?.id}`,
  );
};

export {
  getChannels,
  getChannelDetail,
  getStreamData,
  getSuggestChannels,
  getBroadcastSchedule,
  getTimeShiftChannel,
  pingChannel,
  deletePingChannel,
};
