import tracking from '.';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { TrackingEvent, TrackingParams } from './tracking-types';
import { getDataInfoTrackingCommon } from './getDataInfo';
export const trackingStartApplication = () => {
  // Log13 : StartApplication
  // Log15 : RefreshPage
  if (typeof window === 'undefined') {
    return;
  }
  const sessionName = sessionStorage.getItem(trackingStoreKey.SESSION_NAME);
  const dataInfoTrackingCommon = getDataInfoTrackingCommon();

  if (!sessionName) {
    sessionStorage.setItem(
      trackingStoreKey.SESSION_NAME,
      new Date().getTime().toString(),
    );
    const params: TrackingParams = {
      ItemName: dataInfoTrackingCommon.ItemName,
      Event: 'StartApplication',
    };
    tracking(params);
  } else {
    const params: TrackingParams = {
      ItemName: dataInfoTrackingCommon.ItemName,
      Event: 'RefreshPage',
    };
    tracking(params);
  }
};

export const trackingEnterFuncLog16 = (event: TrackingEvent) => {
  // Log16 : Enter Func
  // create function_session
  let functionSession = sessionStorage.getItem(
    trackingStoreKey.FUNCTION_SESSION,
  );
  if (!functionSession) {
    functionSession = new Date().toISOString();
    sessionStorage.setItem(trackingStoreKey.FUNCTION_SESSION, functionSession);
  }
  const params: TrackingParams = {
    Event: event,
    function_session: functionSession,
  };
  tracking(params);
};

export const trackingErrorLog17 = ({
  Event,
  ItemName,
  ItemId,
  ErrCode,
  ErrMessage,
  Url,
}: TrackingParams) => {
  // Log17 : Error, LimitDevice
  const params: TrackingParams = {
    Event: Event,
    ItemName: ItemName,
    ItemId: ItemId,
    ErrCode: ErrCode,
    ErrMessage: ErrMessage,
    Url: Url,
  };
  tracking(params);
};

export const trackingLoadPageErrorLog176 = ({
  Screen,
  Url,
  ErrCode,
  ErrMessage,
}: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'LoadPageError',
    Screen: Screen || 'ImageError',
    Url: Url,
    ErrCode: ErrCode,
    ErrMessage: ErrMessage,
  };
  tracking(params);
};

export const trackingShowPopupLog191 = ({ ItemName }: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'ShowPopup',
    ItemName: ItemName,
  };
  tracking(params);
};

export const trackingAnnouncementLog25 = ({ ItemName }: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'Announcement',
    ItemName: ItemName,
  };
  tracking(params);
};

export const trackingShowContentLog29 = ({
  Event,
  ItemName,
  ItemId,
}: TrackingParams) => {
  const params: TrackingParams = {
    Event: Event || 'ShowSuccessfully',
    ItemName: ItemName,
    ItemId: ItemId,
  };
  tracking(params);
};

export const trackingCodecDeviceInformationLog30 = () => {
  getCodecDeviceInformation();
  const videoCodec = localStorage[trackingStoreKey.VIDEO_CODECS_SUPPORT] || '';
  const audioCodec = localStorage[trackingStoreKey.AUDIO_CODECS_SUPPORT] || '';
  const params: TrackingParams = {
    Event: 'CodecDeviceInformation',
    AudioCodec: audioCodec,
    VideoCodec: videoCodec,
    AppId: 'HOME',
    AppName: 'HOME',
  };
  tracking(params);
};

export const getCodecDeviceInformation = () => {
  if (typeof window === 'undefined') {
    return;
  }
  if (typeof MediaSource === 'undefined') {
    return;
  }
  const filterAudioCodecsSupport = () => {
    if (typeof localStorage !== 'undefined') {
      const supportCodecs = {
        aac: 0,
        aache: 0,
        aachev2: 0,
        ac3: 0,
        eac3: 0,
        flac: 0,
        alac: 0,
      };
      const mimeTypes = [
        'audio/mp4; codecs="mp4a.40.2"', // AAC
        'audio/mp4; codecs="mp4a.40.5"', // AACHE
        'audio/mp4; codecs="mp4a.40.29"', // AACHEv2
        'audio/mp4; codecs="ac-3"', // AC-3
        'audio/mp4; codecs="ec-3"', // E-AC-3
        'audio/mp4; codecs="flac"', // FLAC
        'audio/mp4; codecs="alac"', // ALAC
      ];
      mimeTypes.forEach((mimeType) => {
        if (MediaSource.isTypeSupported(mimeType)) {
          if (mimeType === 'audio/mp4; codecs="mp4a.40.2')
            supportCodecs.aac = 1; // AAC
          if (mimeType === 'audio/mp4; codecs="mp4a.40.5')
            supportCodecs.aache = 1; // AACHE
          if (mimeType === 'audio/mp4; codecs="mp4a.40.29"')
            supportCodecs.aachev2 = 1; // AACHEv2
          if (mimeType.includes('ac-3')) supportCodecs.ac3 = 1; // AC-3
          if (mimeType.includes('ec-3')) supportCodecs.eac3 = 1; // E-AC-3
          if (mimeType.includes('flac')) supportCodecs.flac = 1; // FLAC
          if (mimeType.includes('alac')) supportCodecs.alac = 1; // ALAC
        }
      });
      let result = '';
      Object.entries(supportCodecs).forEach(([key, value], index) => {
        result += `${key}[${value}]${
          index < Object.entries(supportCodecs).length - 1 ? ';' : ''
        }`;
      });
      return result;
    }
  };
  const filterVideoCodecsSupport = () => {
    const supportCodecs = {
      av1: 0,
      vp9: 0,
      h265: 0,
      h264: 0,
    };
    const mimeTypes = [
      'video/mp4; codecs="avc1.42E01E"', // H.264
      'video/mp4; codecs="avc3.42E01E"', // H.264
      'video/mp4; codecs="hev1.1.6.L93.90"', // H.265
      'video/mp4; codecs="hvc1.1.6.L93.90"', // H.265
      'video/mp4; codecs="vp09.00.10.08"', // VP9
      'video/mp4; codecs="av01.0.01M.08"', // AV1
    ];
    mimeTypes.forEach((mimeType) => {
      if (MediaSource.isTypeSupported(mimeType)) {
        if (mimeType.includes('av01')) supportCodecs.av1 = 1;
        if (mimeType.includes('vp09')) supportCodecs.vp9 = 1;
        if (mimeType.includes('hev1') || mimeType.includes('hvc1'))
          supportCodecs.h265 = 1;
        if (mimeType.includes('avc1') || mimeType.includes('avc3'))
          supportCodecs.h264 = 1;
      }
    });
    const result = `av1[${supportCodecs.av1 || 0}];vp9[${
      supportCodecs.vp9 || 0
    }];h265[${supportCodecs.h265 || 0}];h264[${supportCodecs.h264 || 0}]`;
    return result;
  };
  localStorage[trackingStoreKey.VIDEO_CODECS_SUPPORT] =
    filterVideoCodecsSupport();
  localStorage[trackingStoreKey.AUDIO_CODECS_SUPPORT] =
    filterAudioCodecsSupport();
};
