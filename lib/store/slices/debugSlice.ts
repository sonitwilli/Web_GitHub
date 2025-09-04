import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DebugTrack {
  BANDWIDTH?: number | null;
  CODECS?: string | null;
}

export interface DebugPlayerInfo {
  ipAddress?: string;
  networkSpeed?: string | null; // Mbps text
  res?: string | null;
  fps?: number | null;
  mimeType?: string | null;
  latency?: string | null;
  OTT?: number | null;
  audio?: DebugTrack | null;
  video?: DebugTrack | null;
  bandwidth?: number | null;
  streamBandwidth?: number | null;
  streamAudioBandwidth?: number | null;
  resolution?: string | null;
  frameRate?: number | null;
  profiles?: string | null;
  duration?: number | null;
  currentTime?: number | null;
  lastUpdated?: number;
}

interface DebugState {
  playerInfo: DebugPlayerInfo;
  isEnabled: boolean;
  lastSyncTime: number;
}

const initialState: DebugState = {
  playerInfo: {},
  isEnabled: false,
  lastSyncTime: 0,
};

const debugSlice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    updatePlayerInfo: (
      state,
      action: PayloadAction<Partial<DebugPlayerInfo>>,
    ) => {
      state.playerInfo = {
        ...state.playerInfo,
        ...action.payload,
        lastUpdated: Date.now(),
      };
      state.lastSyncTime = Date.now();
    },
    setDebugEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    resetPlayerInfo: (state) => {
      state.playerInfo = {};
      state.lastSyncTime = 0;
    },

    syncFromPlayerParams: (
      state,
      action: PayloadAction<
        Record<string, string | number | boolean | undefined>
      >,
    ) => {
      const params = action.payload;

      // Extract and parse relevant data from player params - prioritize computed values
      const bandwidth = params.Bandwidth
        ? Number(params.Bandwidth) * 1024 * 1024
        : null;
      const streamBandwidth = params.StreamBandwidth
        ? Number(params.StreamBandwidth) * 1024 * 1024
        : null;
      const streamAudioBandwidth = params.StreamBandwidthAudio
        ? Number(params.StreamBandwidthAudio) * 1024 * 1024
        : null;
      const frameRate = params.FrameRate ? Number(params.FrameRate) : null;

      // Priority: Use computed values from getPlayerParams first, then keep existing
      state.playerInfo = {
        // Keep existing values as base
        ...state.playerInfo,

        // Override with new computed values
        bandwidth,
        streamBandwidth,
        streamAudioBandwidth,
        networkSpeed: bandwidth
          ? `${(bandwidth / 1_000_000).toFixed(2)}Mbps`
          : state.playerInfo.networkSpeed,

        // Video specs - prioritize computed values
        resolution:
          typeof params.Resolution === 'string'
            ? params.Resolution
            : state.playerInfo.resolution,
        res:
          typeof params.Resolution === 'string'
            ? (() => {
                const parts = params.Resolution.split('x');
                const h = Number(parts[1]);
                return Number.isFinite(h) ? `${h}p` : null;
              })()
            : state.playerInfo.res,
        frameRate,
        fps: frameRate,

        // Audio info - prioritize computed values
        audio:
          streamAudioBandwidth || params.CodecAudio || params.AudioMimeType
            ? {
                BANDWIDTH: streamAudioBandwidth || null,
                CODECS:
                  typeof params.CodecAudio === 'string'
                    ? params.CodecAudio
                    : state.playerInfo.audio?.CODECS || null,
              }
            : state.playerInfo.audio,

        // Video track info - prioritize computed values
        video: streamBandwidth
          ? {
              BANDWIDTH: streamBandwidth,
              CODECS: null,
            }
          : state.playerInfo.video,

        // Media type - prioritize computed values
        mimeType:
          typeof params.AudioMimeType === 'string'
            ? params.AudioMimeType
            : state.playerInfo.mimeType,

        // Update timestamp
        lastUpdated: Date.now(),
      };
    },
  },
});

export const {
  updatePlayerInfo,
  setDebugEnabled,
  resetPlayerInfo,
  syncFromPlayerParams,
} = debugSlice.actions;

export default debugSlice.reducer;
