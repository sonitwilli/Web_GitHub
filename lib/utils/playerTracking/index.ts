/* eslint-disable @typescript-eslint/ban-ts-comment */
import { trackingStoreKey } from '@/lib/constant/tracking';
import { removeSessionStorage, saveSessionStorage } from '../storage';
import {
  KEY_LANGUAGES_AUDIO_CODECS,
  PLAYER_BOOKMARK_SECOND,
  PLAYER_IS_RETRYING,
  SELECTED_AUDIO_LABEL,
  SELECTED_AUDIO_LABEL_LIVE,
  SELECTED_SUBTITLE,
  SELECTED_SUBTITLE_LABEL,
  SELECTED_VIDEO_QUALITY,
  SOURCE_PROVIDER,
  VIDEO_CURRENT_TIME,
  VIDEO_ID,
  VIDEO_TIME_BEFORE_ERROR,
} from '@/lib/constant/texts';
import { ChannelDetailType, StreamErrorType } from '@/lib/api/channel';
import { Episode, VodHistoryResponseType } from '@/lib/api/vod';
import { SubtitleItemType } from '@/lib/hooks/useSubtitle';
import { AudioItemType } from '@/lib/components/player/core/AudioButton';
import { StreamType } from '@/lib/components/player/context/PlayerPageContext';
import tracking from '@/lib/tracking';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getPlayerSub = () => {
  if (typeof sessionStorage === 'undefined') {
    return {};
  }
  let label = '';
  try {
    if (window?.shakaPlayer) {
      const activeTrack = window.shakaPlayer
        .getTextTracks()
        .find((track: any) => track.active);
      label = activeTrack?.label || activeTrack?.language;
      return activeTrack || null;
    } else if (window?.hlsPlayer) {
      const currentIndex = window.hlsPlayer.subtitleTrack;
      if (currentIndex < 0) return null;
      const track = window.hlsPlayer.subtitleTracks[currentIndex];
      label = track?.name || track?.lang || '';
      return track || null;
    }
  } catch {
    return label;
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_ACTIVE_SUB_LABEL,
          value: String(label),
        },
      ],
    });
  }
};
export const getVideoInfo = () => {
  if (typeof sessionStorage === 'undefined') {
    return {};
  }
  try {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!video) {
      return {};
    }
    return {
      Duration: video.duration,
      CurrentTime: video.currentTime,
    };
  } catch {
    return {};
  }
};

export const getChapterId = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  const url = window.location.href;
  const match = url.match(/\/tap-(\d+)/);
  if (match) {
    return String(Number(match[1]) - 1);
  }
  return '0';
};

export const getContentData = () => {
  if (typeof sessionStorage === 'undefined') {
    return {};
  }
  try {
    const c = sessionStorage.getItem(trackingStoreKey.DATA_CHANNEL);
    const s = sessionStorage.getItem(trackingStoreKey.DATA_STREAM);
    const p = sessionStorage.getItem(trackingStoreKey.REQUIRE_PURCHASE_DATA);
    const w = sessionStorage.getItem(trackingStoreKey.PLAYER_DATA_WATCHING);
    const e = sessionStorage.getItem(trackingStoreKey.CURRENT_EPISODE);
    const dataChannel = (c ? JSON.parse(c) : {}) as ChannelDetailType;
    const dataStream = (s ? JSON.parse(s) : {}) as StreamErrorType;
    const requirePurchaseData = (p ? JSON.parse(p) : {}) as StreamErrorType;
    const dataWatching = (w ? JSON.parse(w) : {}) as VodHistoryResponseType;
    const currentEpisode = (e ? JSON.parse(e) : {}) as Episode;
    return {
      dataChannel,
      dataStream,
      requirePurchaseData,
      dataWatching,
      currentEpisode,
    };
  } catch {
    return {};
  }
};
export const getStreamProfiles = () => {
  if (typeof window === 'undefined') {
    return;
  }
  let StreamProfile = '';
  try {
    if (window?.shakaPlayer?.getVariantTracks) {
      const tracks = window?.shakaPlayer?.getVariantTracks();
      tracks?.map((item: any) => {
        const profile = {
          n: item.height,
          b: item.bandwidth,
          h: item.height,
          w: item.width,
          m: item.mimeType,
          c: item.codecs,
          f: item.frameRate,
        };
        if (StreamProfile.length) {
          StreamProfile += `;(${JSON.stringify(profile)?.replace(
            /[{}"]/g,
            '',
          )})`;
        } else {
          StreamProfile += `(${JSON.stringify(profile)?.replace(
            /[{}"]/g,
            '',
          )})`;
        }
      });
    } else if (window?.hlsPlayer?.levels) {
      const levels = window.hlsPlayer.levels;
      levels.forEach((level: any) => {
        const profile = {
          n: level.height,
          b: level.bitrate,
          h: level.height,
          w: level.width,
          m: 'video/mp4',
          c: level.codecSet || level.codecs || '',
          f: level.frameRate || '',
        };

        if (StreamProfile.length) {
          StreamProfile += `;(${JSON.stringify(profile).replace(
            /[{}"]/g,
            '',
          )})`;
        } else {
          StreamProfile += `(${JSON.stringify(profile).replace(/[{}"]/g, '')})`;
        }
      });
    }
  } catch {
    //
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.STREAM_PROFILES,
          value: StreamProfile,
        },
      ],
    });
    return StreamProfile;
  }
};

export const getBandwidth = () => {
  if (typeof window === 'undefined') {
    return;
  }
  let bandwidth = '';
  try {
    if (window?.shakaPlayer) {
      const bandwidthBps = window.shakaPlayer.getStats().estimatedBandwidth;
      const bandwidthMbps = bandwidthBps.toFixed(2);
      bandwidth = bandwidthMbps;
    } else if (window?.hlsPlayer) {
      bandwidth = window.hlsPlayer.bandwidthEstimate.toFixed(2); // bit per second
    }
  } catch {
    //
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_BANDWIDTH,
          value: String(bandwidth),
        },
      ],
    });
    return bandwidth;
  }
};

export const getDimension = () => {
  if (typeof window === 'undefined') {
    return;
  }
  let d = '';
  try {
    if (window?.shakaPlayer) {
      const variantTracks = window.shakaPlayer.getVariantTracks();
      const highestTrack = [...variantTracks]
        .filter((t) => t.type === 'variant' && t.width && t.height)
        .sort((a, b) => b.height - a.height || b.width - a.width)[0];
      const activeTrack = variantTracks.find((t: any) => t.active);
      d = `${highestTrack?.width || activeTrack?.width}x${
        highestTrack?.height || activeTrack?.height
      }`;
    } else if (window?.hlsPlayer) {
      const levels = window.hlsPlayer.levels;
      const highestLevel = [...levels]
        .filter((l) => l.width && l.height)
        .sort((a, b) => b.height - a.height || b.width - a.width)[0];
      d = `${highestLevel?.width}x${highestLevel?.height}`;
    }
  } catch {
    //
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_DIMENSION,
          value: d,
        },
      ],
    });
    return d;
  }
};

export const getPlayerActiveTrack = () => {
  if (typeof window === 'undefined') {
    return;
  }
  let videoBandwidth = '';
  let audioBandwidth = '';
  let resolution = '';
  let framerate = '';
  let resolutionObject = {
    width: 0,
    height: 0,
  };
  let activeTrack: any = {};
  let activeAudioLabel = '';
  let audioMimeType = 'audio/mp4';
  let audioCodec = 'mp4a.40.2';
  let videoCodec = 'avc1.64002A';
  const s = sessionStorage.getItem(trackingStoreKey.PLAYER_ACTIVE_SUB_OBJECT);
  const a = sessionStorage.getItem(trackingStoreKey.PLAYER_ACTIVE_AUDIO_OBJECT);
  const selectedSubParsed = (s ? JSON.parse(s) : {}) as SubtitleItemType;
  const selectedAudioParsed = (a ? JSON.parse(a) : {}) as AudioItemType;

  try {
    if (window?.shakaPlayer) {
      activeTrack = window.shakaPlayer
        .getVariantTracks()
        .find((track: any) => track.active);
      const stats = window.shakaPlayer.getStats();
      videoBandwidth =
        activeTrack?.videoBandwidth ||
        stats?.streamBandwidth ||
        activeTrack?.bandwidth;
      audioBandwidth =
        activeTrack?.audioBandwidth ||
        stats?.streamBandwidth ||
        activeTrack?.bandwidth;
      resolution = `${activeTrack.width}x${activeTrack.height}`;
      framerate = String(activeTrack.frameRate);
      resolutionObject = {
        height: activeTrack.height,
        width: activeTrack.width,
      };
      activeAudioLabel = activeTrack?.label || activeTrack?.language;
      audioMimeType = activeTrack?.audioMimeType;
      audioCodec = activeTrack?.audioCodec || 'mp4a.40.2';
      videoCodec = activeTrack?.videoCodec || 'avc1.64002A';
    } else if (window?.hlsPlayer) {
      const levelIndex = window.hlsPlayer.currentLevel; // index in hls.levels array
      const activeTrack = window.hlsPlayer.levels[levelIndex];
      videoBandwidth = String(activeTrack?.bitrate);
      resolution = `${activeTrack.width}x${activeTrack.height}`;
      framerate = String(activeTrack.frameRate);
      resolutionObject = {
        height: activeTrack.height,
        width: activeTrack.width,
      };
      const currentTrackId = window.hlsPlayer.audioTrack;
      // Get the track info from hls.js
      const track = window.hlsPlayer.audioTracks[currentTrackId];
      activeAudioLabel = track?.name || track?.lang || '';
      audioCodec = track?.audioCodec || 'mp4a.40.2';
      videoCodec = track?.videoCodec || 'avc1.64002A';
    }
  } catch {
    //
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.STREAM_BANDWIDTH,
          value: String(videoBandwidth),
        },
        {
          key: trackingStoreKey.PLAYER_BITRATE,
          value: String(videoBandwidth),
        },
        {
          key: trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
          value: String(audioBandwidth),
        },
        {
          key: trackingStoreKey.PLAYER_RESOLUTION,
          value: resolution,
        },
        {
          key: trackingStoreKey.PLAYER_FRAME_RATE,
          value: framerate,
        },
        {
          key: trackingStoreKey.PLAYER_ACTIVE_AUDIO_LABEL,
          value: activeAudioLabel,
        },
        {
          key: trackingStoreKey.PLAYER_AUDIO_CODEC,
          value: audioCodec,
        },
        {
          key: trackingStoreKey.PLAYER_AUDIO_MIME_TYPE,
          value: audioMimeType,
        },
        {
          key: trackingStoreKey.PLAYER_VIDEO_CODEC,
          value: videoCodec,
        },
      ],
    });
    return {
      videoBandwidth,
      resolutionObject,
      activeTrack,
      selectedSubParsed,
      selectedAudioParsed,
    };
  }
};

export const trackPlayerChange = () => {
  if (typeof window === 'undefined') {
    return;
  }
  getPlayerActiveTrack();
  getStreamProfiles();
  getBandwidth();
  getDimension();
  getPlayerSub();
};

export const removePlayerSessionStorageWhenRender = () => {
  if (typeof window === 'undefined') {
    return;
  }
  removeSessionStorage({
    data: [
      trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
      trackingStoreKey.PLAYER_FIRST_PLAY_SUCCESS,
      trackingStoreKey.PLAYER_REAL_TIME_PLAYING,
      trackingStoreKey.PLAYER_DURATION,
      trackingStoreKey.PLAYER_START_BUFFER_TIME,
      trackingStoreKey.PLAYER_FIRST_LOAD,
      VIDEO_TIME_BEFORE_ERROR,
      PLAYER_IS_RETRYING,
      trackingStoreKey.PLAYER_PARSED_DATA,
      trackingStoreKey.PLAYER_IS_REQUIRED_LOGIN,
      trackingStoreKey.PLAYER_PING_DATA,
    ],
  });
};

export const removePlayerSessionStorageWhenUnMount = () => {
  if (typeof window === 'undefined') {
    return;
  }
  removeSessionStorage({
    data: [trackingStoreKey.BLOCK_INDEX],
  });
};
export const removePlayerSessionStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  removeSessionStorage({
    data: [
      VIDEO_CURRENT_TIME,
      PLAYER_BOOKMARK_SECOND,
      SELECTED_SUBTITLE,
      SELECTED_SUBTITLE_LABEL,
      trackingStoreKey.DATA_CHANNEL,
      trackingStoreKey.DATA_STREAM,
      trackingStoreKey.STREAM_PROFILES,
      trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
      trackingStoreKey.STREAM_BANDWIDTH,
      trackingStoreKey.BUFFER_LENGTH,
      trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
      trackingStoreKey.DRM_PARTNER,
      trackingStoreKey.PLAYING_URL,
      trackingStoreKey.PLAYER_BITRATE,
      trackingStoreKey.PLAYER_RESOLUTION,
      trackingStoreKey.PLAYER_DIMENSION,
      trackingStoreKey.PLAYER_DATA_WATCHING,
      trackingStoreKey.PLAYER_FIRST_PLAY_SUCCESS,
      trackingStoreKey.PLAYER_REAL_TIME_PLAYING,
      trackingStoreKey.PLAYER_IS_LANDING_PAGE,
      trackingStoreKey.PLAYER_NAME,
      trackingStoreKey.PLAYER_FRAME_RATE,
      trackingStoreKey.REQUIRE_PURCHASE_DATA,
      trackingStoreKey.CURRENT_EPISODE,
      trackingStoreKey.IS_FINAL_EPISODE,
      trackingStoreKey.PLAYER_ROUTER_QUERY,
      trackingStoreKey.PLAYER_SCREEN,
      trackingStoreKey.PLAYER_AUDIO_LIST,
      trackingStoreKey.PLAYER_SUBS_LIST,
      trackingStoreKey.PLAYER_ACTIVE_SUB_LABEL,
      trackingStoreKey.PLAYER_ACTIVE_AUDIO_LABEL,
      trackingStoreKey.PLAYER_VOD_ID,
      trackingStoreKey.PLAYER_TRACKING_STATE,
      trackingStoreKey.BLOCK_INDEX,
      trackingStoreKey.POSITION_INDEX,
      trackingStoreKey.SCREEN_ITEM,
      trackingStoreKey.PLAYER_VOD_ID_RELATED,
      VIDEO_TIME_BEFORE_ERROR,
      PLAYER_IS_RETRYING,
      trackingStoreKey.PLAYER_AUDIO_CODEC,
      trackingStoreKey.PLAYER_AUDIO_MIME_TYPE,
      trackingStoreKey.PLAYER_PARSED_DATA,
      trackingStoreKey.PLAYER_IS_REQUIRED_LOGIN,
      trackingStoreKey.PLAYER_PING_DATA,
    ],
  });
};

export const getItemInfo = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const streamType = sessionStorage.getItem(
      trackingStoreKey.PLAYER_STREAM_TYPE,
    ) as StreamType;
    const eventId =
      (sessionStorage.getItem(trackingStoreKey.PLAYER_EVENT_ID) as string) ||
      '';
    const { dataChannel, currentEpisode } = getContentData();
    const ItemId = dataChannel?.id || dataChannel?._id || '';
    const ItemName =
      dataChannel?.title ||
      dataChannel?.title_vie ||
      dataChannel?.title_origin ||
      dataChannel?.name ||
      dataChannel?.alias_name ||
      '';
    let EpisodeId = currentEpisode?.real_episode_id || '';
    if (streamType === 'event' || streamType === 'premiere') {
      EpisodeId = eventId;
    }
    return { ItemId, ItemName, EpisodeId };
  } catch {
    return {};
  }
};
export const getTrackingParamIsLive = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  // 0: VOD => pathname
  // 1: Kênh truyền hình  => pathname
  // 2: Sự kiện  => pathname + event
  // 3: Sự kiện dẫn kênh  => pathname + event
  // 4: Công chiếu  => pathname
  // 5: Preview Channel => pathname + field previewHandled
  // 6: Preview Liveshow => pathname + field previewHandled
  // 7: Trailer => data stream
  // 8: Pladio
  // 9: PreviewVOD => pathname + field previewHandled
  // 10: Timeshift => pathname
  const url = window.location.pathname;
  const { dataStream, dataChannel } = getContentData();
  const isVod = url.includes('/xem-video/');
  const isChannel = url.includes('/xem-truyen-hinh/');
  const isEvent = url.includes('/su-kien/');
  const isPremiere = url.includes('/cong-chieu/');
  const isPreview =
    sessionStorage.getItem(trackingStoreKey.IS_PREVIEW_CONTENT) === '1';
  if (isVod) {
    if (isPreview) {
      return 9;
    }
    if (dataChannel?.source_provider === SOURCE_PROVIDER.PLADIO) {
      return 8;
    }
    if (dataStream) {
      const isTrailer = dataStream?.is_trailer;
      if (isTrailer) {
        return 7;
      } else {
        return 0;
      }
    }
    return 0;
  }
  if (isChannel) {
    if (isPreview) {
      return 5;
    }
    // check query time_shift_id has value
    const urlParams = new URLSearchParams(window.location.search);
    const timeshiftId = urlParams.get('time_shift_id');
    if (timeshiftId) {
      return 10;
    }
    return 1;
  }
  if (isEvent) {
    if (isPreview) {
      return 6;
    }
    // check query type = eventtv => 3
    const urlParams = new URLSearchParams(window.location.search);
    const event = urlParams.get('event');
    if (event === 'eventtv') {
      return 3;
    }
    return 2;
  }
  if (isPremiere) {
    return 4;
  }
  return 0;
};
export const getPlayerParams = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  trackPlayerChange();
  const { selectedAudioParsed, selectedSubParsed } =
    getPlayerActiveTrack() || {};
  const { Duration } = getVideoInfo();
  const {
    dataChannel,
    dataStream,
    dataWatching,
    requirePurchaseData,
    currentEpisode,
  } = getContentData();
  let sub = sessionStorage.getItem(SELECTED_SUBTITLE_LABEL);
  if (sub) {
    sub =
      KEY_LANGUAGES_AUDIO_CODECS[
        sub as keyof typeof KEY_LANGUAGES_AUDIO_CODECS
      ] || sub;
  }
  const isDurationNaN = isNaN(Number(Duration)) || Duration === Infinity;
  const playerDuration = sessionStorage.getItem(
    trackingStoreKey.PLAYER_DURATION,
  );
  const isPlayerDurationNaN =
    isNaN(Number(playerDuration)) || playerDuration === 'Infinity';
  const realDuration = !isDurationNaN
    ? Duration
    : !isPlayerDurationNaN
    ? playerDuration
    : dataWatching?.duration || currentEpisode?.duration || 0;
  const { ItemId, ItemName, EpisodeId } = getItemInfo();
  const bwBitPerS = Number(
    sessionStorage.getItem(trackingStoreKey.PLAYER_BANDWIDTH),
  );
  const bwMbps = bwBitPerS / 1024 / 1024;
  const audioBwBitPerS = Number(
    sessionStorage.getItem(trackingStoreKey.STREAM_AUDIO_BANDWIDTH),
  );
  const audioBwMbps = audioBwBitPerS / 1024 / 1024;
  const streamBwBitPerS = Number(
    sessionStorage.getItem(trackingStoreKey.STREAM_BANDWIDTH),
  );
  const streamBwMbps = streamBwBitPerS / 1024 / 1024;
  const isLinkDRM =
    dataChannel?.drm === 1 ||
    dataChannel?.drm === '1' ||
    dataChannel?.drm === true ||
    dataChannel?.verimatrix === 1 ||
    dataChannel?.verimatrix === '1' ||
    dataChannel?.verimatrix === true;
  const isLive = getTrackingParamIsLive();
  const isLandingPage =
    sessionStorage.getItem(trackingStoreKey.PLAYER_IS_LANDING_PAGE) || '1';
  const streamType = sessionStorage.getItem(
    trackingStoreKey.PLAYER_STREAM_TYPE,
  ) as StreamType;
  const Position =
    !isLandingPage && (streamType === 'timeshift' || streamType === 'channel')
      ? ''
      : sessionStorage.getItem(trackingStoreKey.POSITION_INDEX) !== 'undefined'
      ? sessionStorage.getItem(trackingStoreKey.POSITION_INDEX)
      : '';
  const Audio =
    selectedAudioParsed?.X_LABEL ||
    sessionStorage.getItem(SELECTED_AUDIO_LABEL) ||
    sessionStorage.getItem(SELECTED_AUDIO_LABEL_LIVE) ||
    sessionStorage.getItem(trackingStoreKey.PLAYER_ACTIVE_AUDIO_LABEL) ||
    '';

  const data = {
    StreamProfile:
      sessionStorage.getItem(trackingStoreKey.STREAM_PROFILES) || '',
    Bandwidth: String(Math.round(bwMbps)) || '',
    StreamBandwidthAudio: audioBwMbps ? String(audioBwMbps.toFixed(2)) : '',
    StreamBandwidth: String(Math.round(streamBwMbps)) || '',
    BufferLength:
      String(
        Math.round(
          Number(sessionStorage.getItem(trackingStoreKey.BUFFER_LENGTH)),
        ),
      ) || '',
    TotalByteLoaded:
      sessionStorage.getItem(trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED || '') ||
      '',
    ItemId: ItemId || '',
    ItemName: ItemName || '',
    RefEpisodeID: currentEpisode?.ref_episode_id || '',
    RefItemId: dataChannel?.id || dataChannel?._id || '',
    RefPlaylistID:
      sessionStorage.getItem(trackingStoreKey.PLAYER_VOD_ID) || '' || '',
    PlaylistID:
      sessionStorage.getItem(trackingStoreKey.PLAYER_VOD_ID) || '' || '',
    ChapterID: getChapterId() || '',
    isLastEpisode:
      sessionStorage.getItem(trackingStoreKey.IS_FINAL_EPISODE) || '',
    TotalEpisode: dataChannel?.episodes?.length
      ? String(dataChannel?.episodes?.length)
      : '',
    EpisodeID: EpisodeId || '',

    DRMPartner: sessionStorage.getItem(trackingStoreKey.DRM_PARTNER) || '',
    CDNName: sessionStorage.getItem(trackingStoreKey.PLAYING_URL) || '',
    Bitrate: sessionStorage.getItem(trackingStoreKey.PLAYER_BITRATE) || '',
    Resolution:
      sessionStorage.getItem(trackingStoreKey.PLAYER_RESOLUTION) || '',
    Dimension: sessionStorage.getItem(trackingStoreKey.PLAYER_DIMENSION) || '',
    VideoQuality:
      sessionStorage.getItem(SELECTED_VIDEO_QUALITY) ||
      getPlayerActiveTrack()?.resolutionObject?.height
        ? String(getPlayerActiveTrack()?.resolutionObject?.height)
        : '',
    Audio: Audio !== 'und' && Audio !== 'Unknown' ? Audio : '',
    Subtitle: selectedSubParsed?.label || sub || getPlayerSub() || '',
    Url:
      sessionStorage.getItem(trackingStoreKey.PLAYING_URL) ||
      dataStream?.url ||
      '',
    Credit: (dataStream?.end_content || 0)?.toString() || '',
    StartTime: dataWatching?.timeplayed || dataChannel?.begin_time || '',
    Duration: Math.round(Number(realDuration)).toString() || '',
    ElapsedTimePlaying:
      Math.round(
        Number(sessionStorage.getItem(VIDEO_CURRENT_TIME || 0)),
      ).toString() || '',
    RealTimePlaying:
      sessionStorage.getItem(trackingStoreKey.PLAYER_REAL_TIME_PLAYING || '') ||
      '',
    isLandingPage:
      sessionStorage.getItem(trackingStoreKey.PLAYER_IS_LANDING_PAGE) || '1',
    PlayerName: sessionStorage.getItem(trackingStoreKey.PLAYER_NAME) || 'Shaka',
    BusinessPlan:
      requirePurchaseData?.require_vip_plan ||
      dataStream?.require_vip_plan ||
      '',
    playing_session:
      sessionStorage.getItem(trackingStoreKey.PLAYER_PLAYING_SESSION || '') ||
      '',
    content_session:
      sessionStorage.getItem(trackingStoreKey.PLAYER_CONTENT_SESSION) || '',
    AppSource: dataChannel?.app_id || '',
    FrameRate:
      String(
        Math.round(
          Number(sessionStorage.getItem(trackingStoreKey.PLAYER_FRAME_RATE)),
        ),
      ) || '',
    BlockPosition: sessionStorage.getItem(trackingStoreKey.BLOCK_INDEX) || '',
    Position: Position || '',
    isTrailer: dataStream?.is_trailer || '',
    IsLive: isLive?.toString() || '',
    isLinkDRM: isLinkDRM ? '1' : '0',
    Directors:
      dataChannel?.directors_detail
        ?.map((item: any) => item.full_name)
        .join(',') || '',
    Country: dataChannel?.nation || dataChannel?.countries || '',
    FType: dataChannel?.is_tvod ? '2' : '1',
    isPreAdv: '0',
    is_recommend:
      sessionStorage.getItem(trackingStoreKey.IS_RECOMMEND_ITEM) || '0',
    Multicast: dataStream?.url || '',
    SubMenuId:
      sessionStorage.getItem(trackingStoreKey.APP_MODULE_SUBMENU_ID) ||
      sessionStorage.getItem(trackingStoreKey.CHANNEL_SELECTED_GROUP) ||
      '',
    Key: sessionStorage.getItem(trackingStoreKey.CHANNEL_KEY) || '',
    Status: dataStream?.enable_preview === '1' ? 'Preview' : 'None',
    AudioMimeType: sessionStorage.getItem(
      trackingStoreKey.PLAYER_AUDIO_MIME_TYPE,
    ),
    CodecAudio: sessionStorage.getItem(trackingStoreKey.PLAYER_AUDIO_CODEC),
    CodecVideo: sessionStorage.getItem(trackingStoreKey.PLAYER_VIDEO_CODEC),
    PublishCountry: dataChannel?.nation || dataChannel?.countries || '',
    isRepeat: 0,
    Price: '0',
    IDRelated:
      sessionStorage.getItem(trackingStoreKey.PLAYER_VOD_ID_RELATED) || '',
    PlayerState:
      sessionStorage.getItem(trackingStoreKey.PLAYER_STATE) || 'Minimize',
  };
  const href = window.location.href;
  if (
    typeof href === 'string' &&
    !href.includes('/playlist/') &&
    data &&
    'PlaylistID' in data
  ) {
    delete (data as Record<string, unknown>).PlaylistID;
    delete (data as Record<string, unknown>).RefPlaylistID;
  }
  return data;
};

export const trackingStartBuffering = async () => {
  // Log112: Buffering
  if (typeof window === 'undefined') {
    return {};
  }
  // start
  try {
    const startTime = sessionStorage.getItem(
      trackingStoreKey.PLAYER_START_BUFFER_TIME,
    );
    if (startTime) {
      return;
    }
    const pParams = getPlayerParams();
    console.log('--- TRACKING StartBuffering', new Date().toISOString(), {
      pParams,
    });
    /*@ts-ignore*/
    return await tracking({
      LogId: '112',
      /*@ts-ignore*/
      Screen: 'Buffering',
      Event: 'StartBuffering',
      ...pParams,
      BufferLength: '0',
    });
  } catch {}
};

export const trackingEndBuffering = async () => {
  // Log112: Buffering
  if (typeof window === 'undefined') {
    return {};
  }
  // start
  try {
    const startTime = sessionStorage.getItem(
      trackingStoreKey.PLAYER_START_BUFFER_TIME,
    );
    if (!startTime) {
      return;
    }
    const current = new Date().getTime();
    const e = current - Number(startTime);
    const pParams = getPlayerParams();
    console.log('--- TRACKING EndBuffering', new Date().toISOString(), {
      pParams,
    });
    /*@ts-ignore*/
    await tracking({
      LogId: '112',
      /*@ts-ignore*/
      Screen: 'Buffering',
      Event: 'EndBuffering',
      ...pParams,
      BufferLength: String(Math.round(e / 1000)),
    });
    removeSessionStorage({
      data: [trackingStoreKey.PLAYER_START_BUFFER_TIME],
    });
    return;
  } catch {}
};
