/* eslint-disable @typescript-eslint/ban-ts-comment */
import { trackingStoreKey } from '@/lib/constant/tracking';
import { removeSessionStorage, saveSessionStorage } from '../storage';
import {
  KEY_LANGUAGES_AUDIO_CODECS,
  PLAYER_BOOKMARK_SECOND,
  SELECTED_AUDIO_LABEL,
  SELECTED_AUDIO_LABEL_LIVE,
  SELECTED_SUBTITLE,
  SELECTED_SUBTITLE_LABEL,
  SELECTED_VIDEO_QUALITY,
  VIDEO_CURRENT_TIME,
  VIDEO_ID,
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
    const { dataChannel } = getContentData();
    let ItemId = dataChannel?.id || dataChannel?._id || '';
    const ItemName =
      dataChannel?.title ||
      dataChannel?.title_vie ||
      dataChannel?.title_origin ||
      dataChannel?.name ||
      dataChannel?.alias_name ||
      '';
    if (streamType === 'event') {
      ItemId = eventId;
    }
    return { ItemId, ItemName };
  } catch {
    return {};
  }
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
    /*@ts-ignore*/
    sub = KEY_LANGUAGES_AUDIO_CODECS[s] || sub;
  }
  const realDuration =
    Duration || sessionStorage.getItem(trackingStoreKey.PLAYER_DURATION) || 0;

  const { ItemId, ItemName } = getItemInfo();
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
  return {
    StreamProfile:
      sessionStorage.getItem(trackingStoreKey.STREAM_PROFILES) || '',
    Bandwidth: String(Math.round(bwMbps)) || '',
    StreamBandwidthAudio: String(Math.round(audioBwMbps)) || '',
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
    PlaylistID:
      sessionStorage.getItem(trackingStoreKey.PLAYER_VOD_ID) || '' || '',
    ChapterID: getChapterId() || '',
    isLastEpisode:
      sessionStorage.getItem(trackingStoreKey.IS_FINAL_EPISODE) || '',
    TotalEpisode: dataChannel?.episodes?.length
      ? String(dataChannel?.episodes?.length)
      : '',
    EpisodeID: currentEpisode?.real_episode_id || '',

    DRMPartner: sessionStorage.getItem(trackingStoreKey.DRM_PARTNER) || '',
    CDNName: sessionStorage.getItem(trackingStoreKey.PLAYING_URL) || '',
    Bitrate: sessionStorage.getItem(trackingStoreKey.PLAYER_BITRATE) || '',
    Resolution:
      sessionStorage.getItem(trackingStoreKey.PLAYER_RESOLUTION) || '',
    Dimension: sessionStorage.getItem(trackingStoreKey.PLAYER_DIMENSION) || '',
    VideoQuality:
      sessionStorage.getItem(SELECTED_VIDEO_QUALITY) ||
      String(getPlayerActiveTrack()?.resolutionObject?.height) ||
      '',
    Audio:
      selectedAudioParsed?.X_LABEL ||
      sessionStorage.getItem(SELECTED_AUDIO_LABEL) ||
      sessionStorage.getItem(SELECTED_AUDIO_LABEL_LIVE) ||
      sessionStorage.getItem(trackingStoreKey.PLAYER_ACTIVE_AUDIO_LABEL) ||
      '',
    Subtitle: selectedSubParsed?.label || sub || getPlayerSub() || '',
    Url: sessionStorage.getItem(trackingStoreKey.PLAYING_URL) || '',
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
    PlayerName: sessionStorage.getItem(trackingStoreKey.PLAYER_NAME) || '',
    BusinessPlan: requirePurchaseData?.require_vip_plan || '',
    playing_session:
      sessionStorage.getItem(trackingStoreKey.PLAYER_PLAYING_SESSION || '') ||
      '',
    Screen: sessionStorage.getItem(trackingStoreKey.PLAYER_SCREEN) || '',
    AppSource: dataChannel?.app_id || '',
    FrameRate:
      String(
        Math.round(
          Number(sessionStorage.getItem(trackingStoreKey.PLAYER_FRAME_RATE)),
        ),
      ) || '',
    BlockPosition: sessionStorage.getItem(trackingStoreKey.BLOCK_INDEX) || '',
  };
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
