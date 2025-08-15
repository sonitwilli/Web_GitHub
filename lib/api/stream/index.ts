import { AxiosResponse } from 'axios';
import { BlockSlideItemType } from '../blocks';
import { axiosInstance } from '../axios';
import { StreamProfile } from '../channel';

export interface StreamItemType {
  audio?: string;
  audio_img?: string;
  enable_ads?: number;
  end_content?: number;
  intro_from?: number;
  is_logged_in?: number;
  is_trailer?: number;
  is_vip?: number;
  merchant?: string;
  name?: string;
  operator?: number;
  overlay_logo?: string;
  ping_enable?: boolean;
  ping_enc?: boolean;
  ping_mqtt?: boolean;
  ping_qnet?: number;
  ping_session?: string;
  require_active?: number;
  resolution?: Resolution;
  session?: string;
  start_content?: number;
  stream_profiles?: StreamProfile[];
  stream_session?: string;
  subs?: string[];
  timeline_img?: string;
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
  warning?: string[];
  require_vip_plan?: string;
  require_obj_msg?: {
    available?: string;
    subtitle?: string;
    title?: string;
  };
  ttl_preview?: string;
  trailer_url?: string;
  noads_buy_package_instream?: {
    btn?: string;
    text?: string;
    image?: string;
    deep_link?: string;
    background_color?: string;
  };
  noads_instream_freq?: string;
}

export interface Resolution {
  max_width?: string;
  max_height?: string;
}

export interface TrailerStreamResponseType {
  error_code?: number;
  msg?: string;
  status?: number;
  data?: StreamItemType;
}

const getTrailerData = async ({
  slide,
}: {
  slide: BlockSlideItemType;
}): Promise<AxiosResponse<TrailerStreamResponseType>> => {
  return axiosInstance.get(
    `/stream/vod/${slide?.id}/${slide?.id_trailer}/${
      slide?.profile_trailer ? slide?.profile_trailer[0] : ''
    }`,
  );
};

export { getTrailerData };
