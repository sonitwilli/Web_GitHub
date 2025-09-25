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
    blockPlayer?: any;
    blockPlayerVideo?: HTMLVideoElement;
    ui?: any;
    eventManager?: any;
    shakaPlayer?: any;
    videojsPlayer?: any;
    hlsPlayer?: Hls;
    topSliderPlayer?: any;
    hoverPlayer?: any;
    newVodPlayer?: any;
    autoExpansionPlayer?: any;
    Ads?: any;
    waitForSdk?: () => Promise<void>;
    sdk?: {
      emit: (event: string, data: any) => void;
      getUserInfo: () => Promise<{ profile_id?: string; profileId?: string }>;
      requestLogin: () => void;
      destroy: () => void;
      openPopup: (type: string, data: any) => void;
    };
    checkErrorInterRef: NodeJS.Timeout | null;
    safariCheckErrorInterRef: NodeJS.Timeout | null;
    _inited?: boolean;
    _currentPathname?: string;
  }
}
