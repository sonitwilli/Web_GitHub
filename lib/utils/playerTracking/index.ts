import { trackingStoreKey } from '@/lib/constant/tracking';
import { removeSessionStorage, saveSessionStorage } from '../storage';
import {
  PLAYER_BOOKMARK_SECOND,
  VIDEO_CURRENT_TIME,
} from '@/lib/constant/texts';

/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const getStreamBandwidthAudio = () => {
  if (typeof window === 'undefined') {
    return;
  }
  let bandwidth = '';
  try {
    if (window?.shakaPlayer) {
      const activeTrack = window.shakaPlayer
        .getVariantTracks()
        .find((track: any) => track.active);
      const stats = window.shakaPlayer.getStats();
      bandwidth =
        activeTrack?.audioBandwidth ||
        stats?.streamBandwidth ||
        activeTrack?.bandwidth;
    } else if (window?.hlsPlayer) {
      // hls không lấy được bandwidth audio
    }
  } catch {
    //
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
          value: String(bandwidth),
        },
      ],
    });
    return bandwidth;
  }
};

export const getStreamBandwidth = () => {
  if (typeof window === 'undefined') {
    return;
  }
  let bandwidth = '';
  try {
    if (window?.shakaPlayer) {
      const activeTrack = window.shakaPlayer
        .getVariantTracks()
        .find((track: any) => track.active);
      const stats = window.shakaPlayer.getStats();
      bandwidth =
        activeTrack?.videoBandwidth ||
        stats?.streamBandwidth ||
        activeTrack?.bandwidth;
    } else if (window?.hlsPlayer) {
      const levelIndex = window.hlsPlayer.currentLevel; // index in hls.levels array
      const activeLevel = window.hlsPlayer.levels[levelIndex];
      bandwidth = String(activeLevel?.bitrate);
    }
  } catch {
    //
  } finally {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.STREAM_BANDWIDTH,
          value: String(bandwidth),
        },
      ],
    });
    return bandwidth;
  }
};

export const trackPlayerChange = () => {
  if (typeof window === 'undefined') {
    return;
  }
  getStreamProfiles();
  getBandwidth();
  getStreamBandwidthAudio();
  getStreamBandwidth();
};

export const removePlayerSessionStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  removeSessionStorage({
    data: [
      trackingStoreKey.STREAM_BANDWIDTH,
      trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
      trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
      trackingStoreKey.PLAYER_BANDWIDTH,
      trackingStoreKey.STREAM_PROFILES,
      VIDEO_CURRENT_TIME,
      PLAYER_BOOKMARK_SECOND,
    ],
  });
};
