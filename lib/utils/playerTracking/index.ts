import { trackingStoreKey } from '@/lib/constant/tracking';
import { removeSessionStorage, saveSessionStorage } from '../storage';
import {
  PLAYER_BOOKMARK_SECOND,
  SELECTED_AUDIO_LABEL,
  SELECTED_AUDIO_LABEL_LIVE,
  SELECTED_SUBTITLE,
  SELECTED_VIDEO_QUALITY,
  VIDEO_CURRENT_TIME,
  VIDEO_ID,
} from '@/lib/constant/texts';
import { ChannelDetailType, StreamErrorType } from '@/lib/api/channel';
import { Episode, VodHistoryResponseType } from '@/lib/api/vod';

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    const s = sessionStorage.getItem(trackingStoreKey.DATA_CHANNEL);
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
      bandwidth = window.hlsPlayer.bandwidthEstimate.toFixed(2);
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
  try {
    if (window?.shakaPlayer) {
      const activeTrack = window.shakaPlayer
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
    } else if (window?.hlsPlayer) {
      const levelIndex = window.hlsPlayer.currentLevel; // index in hls.levels array
      const activeLevel = window.hlsPlayer.levels[levelIndex];
      videoBandwidth = String(activeLevel?.bitrate);
      resolution = `${activeLevel.width}x${activeLevel.height}`;
      framerate = String(activeLevel.frameRate);
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
      ],
    });
    return videoBandwidth;
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
};

export const removePlayerSessionStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  removeSessionStorage({
    data: [
      VIDEO_CURRENT_TIME,
      PLAYER_BOOKMARK_SECOND,
      trackingStoreKey.STREAM_BANDWIDTH,
      trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
      trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
      trackingStoreKey.PLAYER_BANDWIDTH,
      trackingStoreKey.STREAM_PROFILES,
      trackingStoreKey.PLAYER_BITRATE,
      trackingStoreKey.PLAYER_RESOLUTION,
      trackingStoreKey.PLAYER_DIMENSION,
      trackingStoreKey.PLAYER_DATA_WATCHING,
      trackingStoreKey.PLAYER_FIRST_PLAY_SUCCESS,
      trackingStoreKey.PLAYER_REAL_TIME_PLAYING,
      trackingStoreKey.PLAYER_IS_LANDING_PAGE,
      trackingStoreKey.PLAYER_NAME,
    ],
  });
};

export const getPlayerParams = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  const {
    dataChannel,
    dataStream,
    dataWatching,
    requirePurchaseData,
    currentEpisode,
  } = getContentData();
  const { Duration, CurrentTime } = getVideoInfo();
  return {
    StreamProfile: sessionStorage.getItem(trackingStoreKey.STREAM_PROFILES),
    Bandwidth: sessionStorage.getItem(trackingStoreKey.PLAYER_BANDWIDTH),
    StreamBandwidthAudio: sessionStorage.getItem(
      trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
    ),
    StreamBandwidth: sessionStorage.getItem(trackingStoreKey.STREAM_BANDWIDTH),
    BufferLength: sessionStorage.getItem(trackingStoreKey.BUFFER_LENGTH),
    TotalByteLoaded: sessionStorage.getItem(
      trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
    ),
    ItemId: dataChannel?.id || dataChannel?._id,
    ItemName:
      dataChannel?.title ||
      dataChannel?.title_origin ||
      dataChannel?.name ||
      dataChannel?.alias_name,
    RefEpisodeID: currentEpisode?.ref_episode_id,
    RefItemId: dataChannel?.id || dataChannel?._id,
    ChapterID: getChapterId(),
    // PlaylistID: currentEpisode?.id || dataChannel?.id || dataChannel?._id,
    isLastEpisode: sessionStorage.getItem(trackingStoreKey.IS_FINAL_EPISODE),
    TotalEpisode: String(dataChannel?.episodes?.length),
    EpisodeID: currentEpisode?.real_episode_id,

    DRMPartner: sessionStorage.getItem(trackingStoreKey.DRM_PARTNER),
    CDNName: sessionStorage.getItem(trackingStoreKey.PLAYING_URL),
    Bitrate: sessionStorage.getItem(trackingStoreKey.PLAYER_BITRATE),
    Resolution: sessionStorage.getItem(trackingStoreKey.PLAYER_RESOLUTION),
    Dimension: sessionStorage.getItem(trackingStoreKey.PLAYER_DIMENSION),
    VideoQuality: sessionStorage.getItem(SELECTED_VIDEO_QUALITY),
    Audio:
      sessionStorage.getItem(SELECTED_AUDIO_LABEL) ||
      sessionStorage.getItem(SELECTED_AUDIO_LABEL_LIVE),
    Subtitle: sessionStorage.getItem(SELECTED_SUBTITLE),
    Url: sessionStorage.getItem(trackingStoreKey.PLAYING_URL),
    Credit: (dataStream?.end_content || 0)?.toString(),
    StartTime: dataWatching?.timeplayed || dataChannel?.begin_time,
    Duration: Math.round(Duration || 0).toString(),
    ElapsedTimePlaying: Math.round(CurrentTime || 0).toString(),
    RealTimePlaying: sessionStorage.getItem(
      trackingStoreKey.PLAYER_REAL_TIME_PLAYING,
    ),
    isLandingPage: sessionStorage.getItem(
      trackingStoreKey.PLAYER_IS_LANDING_PAGE,
    ),
    PlayerName: sessionStorage.getItem(trackingStoreKey.PLAYER_NAME),
    BusinessPlan: requirePurchaseData?.require_vip_plan,
    playing_session: sessionStorage.getItem(trackingStoreKey.PLAYING_SESSION),
  };
};
