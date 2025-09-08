import { EventDetailExtended } from '@/lib/components/event/EventContainer';
import { VIDEO_CODEC_ERROR, VIDEO_CODEC_NAMES } from '@/lib/hooks/useCodec';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  isFullscreen: boolean;
  isShakaUiLoaded?: boolean;
  dataEvent?: EventDetailExtended;
  playingVideoCodec?: VIDEO_CODEC_NAMES;
  codecError?: VIDEO_CODEC_ERROR;
  isEndedLiveCountdown?: boolean; // New state property
  isOpenLiveChat?: boolean;
  isAutoNextDisabled?: boolean; // New state to disable autoNext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shakaErrorDetail?: any;
}

const initialState: PlayerState = {
  isFullscreen: false,
  isShakaUiLoaded: false,
  dataEvent: undefined,
  playingVideoCodec: VIDEO_CODEC_NAMES.H264_CODEC,
  codecError: {
    DOLBY_VISION_CODEC: false,
    HDR_10_PLUS_CODEC: false,
    HDR_10_CODEC: false,
    HLG_CODEC: false,
    AV1_CODEC: false,
    VP9_CODEC: false,
    H265_CODEC: false,
    H264_CODEC: false,
  },
  isEndedLiveCountdown: false,
  isOpenLiveChat: false,
  isAutoNextDisabled: false, // Default to false (autoNext enabled)
  shakaErrorDetail: undefined,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    setIsShakaUiLoaded: (state, action: PayloadAction<boolean>) => {
      state.isShakaUiLoaded = action.payload;
    },
    setDataEvent: (state, action: PayloadAction<EventDetailExtended>) => {
      state.dataEvent = action.payload;
    },
    clearDataEvent: (state) => {
      state.dataEvent = undefined;
    },
    setPlayingVideoCodec: (state, action: PayloadAction<VIDEO_CODEC_NAMES>) => {
      state.playingVideoCodec = action.payload;
    },
    setCodecError: (
      state,
      action: PayloadAction<{
        codec: VIDEO_CODEC_NAMES;
        value: boolean;
      }>,
    ) => {
      if (state.codecError)
        state.codecError[action.payload.codec] = action.payload.value;
    },
    setIsEndedLiveCountdown: (state, action: PayloadAction<boolean>) => {
      state.isEndedLiveCountdown = action.payload;
    },
    setIsOpenLiveChat: (state, action: PayloadAction<boolean>) => {
      state.isOpenLiveChat = action.payload;
    },
    setIsAutoNextDisabled: (state, action: PayloadAction<boolean>) => {
      state.isAutoNextDisabled = action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setShakaErrorDetail: (state, action: PayloadAction<any>) => {
      state.shakaErrorDetail = action.payload;
    },
  },
});

export const {
  setFullscreen,
  setIsShakaUiLoaded,
  setDataEvent,
  clearDataEvent,
  setPlayingVideoCodec,
  setCodecError,
  setIsEndedLiveCountdown,
  setIsOpenLiveChat,
  setIsAutoNextDisabled,
  setShakaErrorDetail,
} = playerSlice.actions;
export default playerSlice.reducer;
