import Hls from 'hls.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  interface Window {
    player?: any; // Change `any` to the specific type of `player`
    SigmaPacker?: any;
    sigmaPacker?: any;
    shaka?: any;
    videojs?: any;
    blockPlayer?: Hls;
    blockPlayerVideo?: HTMLVideoElement;
    ui?: any;
    eventManager?: any;
    shakaPlayer?: any;
    videojsPlayer?: any;
    hlsPlayer?: Hls;
    topSliderPlayer?: Hls;
    hoverPlayer?: Hls;
    newVodPlayer?: Hls;
    autoExpansionPlayer?: Hls;
    Ads?: any;
    waitForSdk?: () => Promise<void>;
    sdk?: {
      emit: (event: string, data: any) => void;
      getUserInfo: () => Promise<{ profile_id?: string; profileId?: string }>;
      requestLogin: () => void;
      destroy: () => void;
      openPopup: (type: string, data: any) => void;
    };
  }
}
