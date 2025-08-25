import { useCallback, useMemo } from 'react';
import { ChannelDetailType } from '../api/channel';
import { StreamItemType } from '../api/stream';
import { UAParser } from 'ua-parser-js';
import { supportedVideoCodecs } from '../utils/player';
import { store, useAppDispatch } from '../store';
import { setPlayingVideoCodec } from '../store/slices/playerSlice';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';

export enum VIDEO_CODEC_NAMES {
  DOLBY_VISION_CODEC = 'DOLBY_VISION_CODEC',
  HDR_10_PLUS_CODEC = 'HDR_10_PLUS_CODEC',
  HDR_10_CODEC = 'HDR_10_CODEC',
  HLG_CODEC = 'HLG_CODEC',
  AV1_CODEC = 'AV1_CODEC',
  VP9_CODEC = 'VP9_CODEC',
  H265_CODEC = 'H265_CODEC',
  H264_CODEC = 'H264_CODEC',
}

export type VIDEO_CODEC_ERROR = {
  [index in VIDEO_CODEC_NAMES]: boolean;
};

interface Props {
  dataChannel?: ChannelDetailType;
  dataStream?: StreamItemType;
  queryEpisodeNotExist?: boolean;
}

export default function useCodec({
  dataChannel,
  dataStream,
  queryEpisodeNotExist,
}: Props) {
  // const { codecError } = useAppSelector((s) => s.player);
  const dispatch = useAppDispatch();
    const { previewHandled } = usePlayerPageContext(); 
    const getCodecUrls = useCallback(
    ({ dataChannel: channelParam, dataStream: streamParam }: Props = {}) => {
      const channelInfo = channelParam || dataChannel || {};
      const streamInfo = streamParam || dataStream || {};
      const {
        // dolby_vision
        url_dash_dolby_vision,
        url_dash_drm_dolby_vision,
        url_hls_dolby_vision,
        url_hls_drm_dolby_vision,
        // HDR10Plus(H265)
        url_dash_h265_hdr_10_plus,
        url_dash_drm_h265_hdr_10_plus,
        url_hls_h265_hdr_10_plus,
        url_hls_drm_h265_hdr_10_plus,
        // HDR/HDR10(H265)
        url_dash_h265_hdr_10,
        url_dash_drm_h265_hdr_10,
        url_hls_h265_hdr_10,
        url_hls_drm_h265_hdr_10,
        // HLG(H265)
        url_dash_h265_hlg,
        url_dash_drm_h265_hlg,
        url_hls_h265_hlg,
        url_hls_drm_h265_hlg,
        // av1
        url_dash_av1,
        url_dash_drm_av1,
        url_hls_av1,
        url_hls_drm_av1,
        // vp9
        url_dash_vp9,
        url_dash_drm_vp9,
        url_hls_vp9,
        url_hls_drm_vp9,
        // h265
        url_dash_h265,
        url_dash_drm_h265,
        url_hls_h265,
        url_hls_drm_h265,
        // 264
        url_dash,
        url_hls,
        url_dash_drm,
        url_hls_drm,
        url_dash_no_drm,
        url_sub,
        url_clean,
        url,
      } = streamInfo || {};
      const href = window.location.href;
      const isLive =
        href.includes('/xem-truyen-hinh/') ||
        href.includes('/su-kien/') ||
        href.includes('/cong-chieu/');
      const isDrm =
        channelInfo.verimatrix === true ||
        channelInfo.verimatrix == '1' ||
        channelInfo.drm === true ||
        channelInfo.drm == '1';

      let dolby;
      let hdr10Plus;
      let hdr10;
      let hlg;
      let av1;
      let vp9;
      let h265;
      let h264;
      const parser = new UAParser(navigator.userAgent);
      const browser = parser.getBrowser().name;

      if (browser?.toUpperCase()?.includes('SAFARI') || (isLive && !isDrm)) {
        // safari chỉ chạy HLS
        // live non-DRM chỉ chạy HLS vì videojs không bắn lỗi nếu chạy dash
        dolby = isDrm ? url_hls_drm_dolby_vision : url_hls_dolby_vision;
        hdr10Plus = isDrm
          ? url_hls_drm_h265_hdr_10_plus
          : url_hls_h265_hdr_10_plus;
        hdr10 = isDrm ? url_hls_drm_h265_hdr_10 : url_hls_h265_hdr_10;
        hlg = isDrm ? url_hls_drm_h265_hlg : url_hls_h265_hlg;
        av1 = isDrm ? url_hls_drm_av1 : url_hls_av1;
        vp9 = isDrm ? url_hls_drm_vp9 : url_hls_vp9;
        h265 = isDrm ? url_hls_drm_h265 : url_hls_h265;
        h264 = isDrm
          ? url_hls_drm || (previewHandled && url_hls)
          : url_hls || url;
      } else {
        dolby = isDrm
          ? url_dash_drm_dolby_vision || url_hls_drm_dolby_vision
          : url_dash_dolby_vision || url_hls_dolby_vision;
        hdr10Plus = isDrm
          ? url_dash_drm_h265_hdr_10_plus || url_hls_drm_h265_hdr_10_plus
          : url_dash_h265_hdr_10_plus || url_hls_h265_hdr_10_plus;
        hdr10 = isDrm
          ? url_dash_drm_h265_hdr_10 || url_hls_drm_h265_hdr_10
          : url_dash_h265_hdr_10 || url_hls_h265_hdr_10;
        hlg = isDrm
          ? url_dash_drm_h265_hlg || url_hls_drm_h265_hlg
          : url_dash_h265_hlg || url_hls_h265_hlg;
        av1 = isDrm
          ? url_dash_drm_av1 || url_hls_drm_av1
          : url_dash_av1 || url_hls_av1;
        vp9 = isDrm
          ? url_dash_drm_vp9 || url_hls_drm_vp9
          : url_dash_vp9 || url_hls_vp9;
        h265 = isDrm
          ? url_dash_drm_h265 || url_hls_drm_h265
          : url_dash_h265 || url_hls_h265;
        h264 = isDrm
          ? url_dash_drm || url_hls_drm || url_dash || url_hls
          : url_dash_no_drm || url_hls || url_sub || url_clean || url;
      }
      return {
        DOLBY_VISION_CODEC: dolby,
        HDR_10_PLUS_CODEC: hdr10Plus,
        HDR_10_CODEC: hdr10,
        HLG_CODEC: hlg,
        AV1_CODEC: av1,
        VP9_CODEC: vp9,
        H265_CODEC: h265,
        H264_CODEC: h264 || url,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataChannel, dataStream],
  );

  const getUrlToPlay = useCallback(
    ({ dataChannel: channelParam, dataStream: streamParam }: Props = {}) => {
      // https://fptplay.vn/xem-video/multicodecs-revision-nondrm-6733306f5b1076410fee34ed
      if (typeof window === 'undefined') {
        return;
      }
      const channelInfo = channelParam || dataChannel || {};

      if (queryEpisodeNotExist && channelInfo?.trailer_info?.url) {
        return channelInfo?.trailer_info?.url;
      }

      const streamInfo = streamParam || dataStream || {};
      const href = window.location.href;
      const isLive =
        href.includes('/xem-truyen-hinh/') ||
        href.includes('/su-kien/') ||
        href.includes('/cong-chieu/');
      const isDrm =
        channelInfo?.verimatrix === true ||
        channelInfo?.verimatrix == '1' ||
        channelInfo?.drm === true ||
        channelInfo?.drm == '1';
      let result;

      const codecUrls =
        getCodecUrls({ dataChannel: channelInfo, dataStream: streamInfo }) ||
        {};
      const parser = new UAParser(navigator.userAgent);
      const browser = parser.getBrowser().name;
      const supportedCodecs = supportedVideoCodecs();
      const { codecError } = store.getState().player || {};
      try {
        // nếu là DRM, safari chỉ support h264/ h265 / hdr / hlg
        // nếu là live chỉ support h264/ h265 / hdr / hlg
        // DRM chỉ chạy được H264
        // if (isDrm) {
        //   result = codecUrls?.H264_CODEC;
        // } else

        if ((isDrm && browser?.toUpperCase()?.includes('SAFARI')) || isLive) {
          if (
            supportedCodecs.H265_CODEC &&
            !codecError?.DOLBY_VISION_CODEC &&
            codecUrls?.DOLBY_VISION_CODEC
          ) {
            result = codecUrls?.DOLBY_VISION_CODEC;
            dispatch(
              setPlayingVideoCodec(VIDEO_CODEC_NAMES.DOLBY_VISION_CODEC),
            );
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.HDR_10_PLUS_CODEC &&
            codecUrls?.HDR_10_PLUS_CODEC
          ) {
            result = codecUrls?.HDR_10_PLUS_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.HDR_10_PLUS_CODEC));
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.HDR_10_CODEC &&
            codecUrls?.HDR_10_CODEC
          ) {
            result = codecUrls?.HDR_10_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.HDR_10_CODEC));
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.HLG_CODEC &&
            codecUrls?.HLG_CODEC
          ) {
            result = codecUrls?.HLG_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.HLG_CODEC));
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.H265_CODEC &&
            codecUrls?.H265_CODEC
          ) {
            result = codecUrls?.H265_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.H265_CODEC));
          } else {
            result = codecUrls?.H264_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.H264_CODEC));
          }
        } else {
          if (
            supportedCodecs.H265_CODEC &&
            !codecError?.DOLBY_VISION_CODEC &&
            codecUrls?.DOLBY_VISION_CODEC
          ) {
            result = codecUrls?.DOLBY_VISION_CODEC;
            dispatch(
              setPlayingVideoCodec(VIDEO_CODEC_NAMES.DOLBY_VISION_CODEC),
            );
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.HDR_10_PLUS_CODEC &&
            codecUrls?.HDR_10_PLUS_CODEC
          ) {
            result = codecUrls?.HDR_10_PLUS_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.HDR_10_PLUS_CODEC));
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.HDR_10_CODEC &&
            codecUrls?.HDR_10_CODEC
          ) {
            result = codecUrls?.HDR_10_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.HDR_10_CODEC));
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.HLG_CODEC &&
            codecUrls?.HLG_CODEC
          ) {
            result = codecUrls?.HLG_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.HLG_CODEC));
          } else if (
            supportedCodecs.AV1_CODEC &&
            !codecError?.AV1_CODEC &&
            codecUrls?.AV1_CODEC
          ) {
            result = codecUrls?.AV1_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.AV1_CODEC));
          } else if (
            supportedCodecs.VP9_CODEC &&
            !codecError?.VP9_CODEC &&
            codecUrls?.VP9_CODEC
          ) {
            result = codecUrls?.VP9_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.VP9_CODEC));
          } else if (
            supportedCodecs.H265_CODEC &&
            !codecError?.H265_CODEC &&
            codecUrls?.H265_CODEC
          ) {
            result = codecUrls?.H265_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.H265_CODEC));
          } else {
            result = codecUrls?.H264_CODEC;
            dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.H264_CODEC));
          }
        }

        return result;
      } catch {
        // lỗi thì lấy h264
        dispatch(setPlayingVideoCodec(VIDEO_CODEC_NAMES.H264_CODEC));
        return codecUrls?.H264_CODEC;
      }
    },
    [dataChannel, dataStream, getCodecUrls, dispatch, queryEpisodeNotExist],
  );

  const urlToPlay = useMemo(() => {
    return getUrlToPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream]);

  return {
    getUrlToPlay,
    urlToPlay,
  };
}
