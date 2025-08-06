import { DRM_PLAYREADY, DRM_WIDEVINE, PLAYER_CONTROL_BAR } from './texts';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const SHAKA_CDN: Array<string> = [
  '/js/shaka/shaka-player.4.6.3.compiled.min.js',
  '/js/shaka/shaka-player.4.6.3.ui.min.js',
];

const drmDomains = () => {
  if (typeof window !== 'undefined') {
    return {
      PLAYREADY: sessionStorage.getItem(DRM_PLAYREADY) || '',
      WIDEVINE: sessionStorage.getItem(DRM_WIDEVINE) || '',
    };
  }
};
export const DRM_CONFIG_VOD: object = {
  streaming: {
    bufferingGoal: 30,
    bufferBehind: 60,
    lowLatencyMode: false,
    // inaccurateManifestTolerance: 0,
    // rebufferingGoal: 0.01,
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  abr: {
    enabled: true,
  },
  drm: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
    servers: {
      'com.microsoft.playready':
        'https://lic.drmtoday.com/license-proxy-headerauth/drmtoday/RightsManager.asmx',
      'com.widevine.alpha':
        'https://lic.drmtoday.com/license-proxy-widevine/cenc/?specConform=true',
      'com.apple.fps.1_0': 'https://lic.drmtoday.com/license-server-fairplay',
    },
  },
};

export const DRM_CONFIG: object = {
  streaming: {
    bufferingGoal: 30,
    bufferBehind: 60,
    lowLatencyMode: false,
    // inaccurateManifestTolerance: 0,
    // rebufferingGoal: 0.01,
    retryParameters: {
      timeout: 0,
      maxAttempts: 1,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 1,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  abr: {
    enabled: true,
  },
  drm: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
    servers: {
      'com.microsoft.playready':
        'https://lic.drmtoday.com/license-proxy-headerauth/drmtoday/RightsManager.asmx',
      'com.widevine.alpha':
        'https://lic.drmtoday.com/license-proxy-widevine/cenc/?specConform=true',
      'com.apple.fps.1_0': 'https://lic.drmtoday.com/license-server-fairplay',
    },
  },
};

export const LIVE_NON_DRM_CONFIG: object = {
  streaming: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 1,
      baseDelay: 3000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 1,
      baseDelay: 200,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  abr: {
    enabled: true,
  },
};

export const NON_DRM_CONFIG_VOD: object = {
  streaming: {
    bufferingGoal: 30,
    bufferBehind: 60,
    lowLatencyMode: false,
    // inaccurateManifestTolerance: 0,
    // rebufferingGoal: 0.01,
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  abr: {
    enabled: true,
  },
};

export const DRM_CONFIG_MONITOR: object = {
  streaming: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 2,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 2,
    },
  },
  abr: {
    enabled: true,
  },
  drm: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 2,
    },
    servers: {
      'com.microsoft.playready':
        'https://lic.drmtoday.com/license-proxy-headerauth/drmtoday/RightsManager.asmx',
      'com.widevine.alpha':
        'https://lic.drmtoday.com/license-proxy-widevine/cenc/?specConform=true',
      'com.apple.fps.1_0': 'https://lic.drmtoday.com/license-server-fairplay',
    },
  },
};

export const DRM_CONFIG_SIGMA_MONITOR: object = {
  streaming: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 2,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 2,
    },
  },
  abr: {
    enabled: true,
  },
  drm: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 2,
    },
    servers: {
      'com.microsoft.playready': process.env.NEXT_PUBLIC_SIGMA_PLAYREADY_URL,
      'com.widevine.alpha': process.env.NEXT_PUBLIC_SIGMA_WIDEVINE_URL,
      'com.apple.fps.1_0': process.env.NEXT_PUBLIC_SIGMA_FAIRPLAY_LICENSE_URL,
    },
  },
};

export const DRM_CONFIG_SIGMA: object = {
  streaming: {
    bufferingGoal: 30,
    bufferBehind: 60,
    lowLatencyMode: false,
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  abr: {
    enabled: true,
  },
  drm: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
    servers: {
      'com.microsoft.playready':
        drmDomains()?.PLAYREADY || process.env.NEXT_PUBLIC_SIGMA_PLAYREADY_URL,
      'com.widevine.alpha':
        drmDomains()?.WIDEVINE || process.env.NEXT_PUBLIC_SIGMA_WIDEVINE_URL,
      'com.apple.fps.1_0': process.env.NEXT_PUBLIC_SIGMA_FAIRPLAY_LICENSE_URL,
    },
  },
};

export const DRM_CONFIG_SIGMA_VOD: object = {
  streaming: {
    bufferingGoal: 30,
    bufferBehind: 60,
    lowLatencyMode: false,
    // inaccurateManifestTolerance: 0,
    // rebufferingGoal: 0.01,
    stallEnabled: false,
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  manifest: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
  },
  abr: {
    enabled: true,
  },
  drm: {
    retryParameters: {
      timeout: 0,
      maxAttempts: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
    },
    servers: {
      'com.microsoft.playready':
        'https://license.sigmadrm.com/license/verify/playready',
      'com.widevine.alpha':
        'https://license.sigmadrm.com/license/verify/widevine',
      'com.apple.fps.1_0': process.env.NEXT_PUBLIC_SIGMA_FAIRPLAY_LICENSE_URL,
    },
  },
};

export const UI_CONFIG_NORMAL: object = {
  addSeekBar: false,
  controlPanelElements: [
    PLAYER_CONTROL_BAR.CustomLiveDisplay,
    'play_pause',
    'time_and_duration',
    'mute',
    'volume',
    'spacer',
    PLAYER_CONTROL_BAR.ReportButton,
    PLAYER_CONTROL_BAR.CommentButton,
    PLAYER_CONTROL_BAR.AudioButton,
    PLAYER_CONTROL_BAR.ResolutionButton,
    PLAYER_CONTROL_BAR.ScheduleButton,
    'fullscreen',
  ],
  // seekBarColors: {
  //   buffered: 'rgba(255, 101, 0, 0.596)',
  //   played: 'rgba(255, 101, 0)',
  // },
  // volumeBarColors: {
  //   level: 'rgba(255, 101, 0)',
  // },
};
export const UI_CONFIG_NORMAL_TRAILER: object = {
  controlPanelElements: ['mute', 'volume'],
  doubleClickForFullscreen: false,
};
export const UI_CONFIG_NORMAL_MONITOR: object = {
  controlPanelElements: ['mute', 'volume', 'spacer', 'fullscreen'],
  seekBarColors: {
    buffered: 'rgba(255, 101, 0, 0.596)',
    played: 'rgba(255, 101, 0)',
  },
  volumeBarColors: {
    level: 'rgba(255, 101, 0)',
  },
};
export const UI_CONFIG_HBO: object = {
  controlPanelElements: [
    'play_pause',
    'mute',
    'volume',
    'live',
    'time_and_duration',
    'spacer',
    'fullscreen',
  ],
  seekBarColors: {
    buffered: 'rgba(255, 101, 0, 0.596)',
    played: 'rgba(255, 101, 0)',
  },
  volumeBarColors: {
    level: 'rgba(255, 101, 0)',
  },
  keyboardSeekDistance: 10,
  enableKeyboardPlaybackControls: false,
};
export const UI_LOCALIZATION: object = {
  AD_DURATION: 'Thời lượng quảng cáo',
  AD_PROGRESS: 'Quảng cáo [AD_ON]/[NUM_ADS]',
  AD_TIME: 'Quảng cáo: [AD_TIME]',
  AUTO_QUALITY: 'Tự động',
  BACK: 'Quay lại',
  CAPTIONS: 'Phụ đề',
  CAST: 'Truyền...',
  ENTER_LOOP_MODE: 'Phát lại liên tục video hiện tại',
  ENTER_PICTURE_IN_PICTURE: 'Chuyển sang chế độ Hình trong hình',
  EXIT_FULL_SCREEN: 'Thoát toàn màn hình',
  EXIT_LOOP_MODE: 'Dừng phát lại liên tục video hiện tại',
  EXIT_PICTURE_IN_PICTURE: 'Thoát chế độ hình trong hình',
  FAST_FORWARD: 'Tua nhanh',
  FULL_SCREEN: 'Toàn màn hình',
  LANGUAGE: 'Ngôn ngữ',
  LIVE: 'LIVE',
  LOOP: 'Phát lại liên tục',
  MORE_SETTINGS: 'Cài đặt khác',
  MULTIPLE_LANGUAGES: 'Nhiều ngôn ngữ',
  MUTE: 'Tắt tiếng',
  NOT_APPLICABLE: 'Không áp dụng',
  OFF: 'Tắt',
  ON: 'Bật',
  PAUSE: 'Tạm dừng',
  PICTURE_IN_PICTURE: 'Chế độ hình trong hình',
  PLAY: 'Phát',
  PLAYBACK_RATE: 'Tốc độ phát',
  REPLAY: 'Phát lại',
  RESOLUTION: 'Độ phân giải',
  REWIND: 'Tua lại',
  SEEK: 'Tìm kiếm',
  SKIP_AD: 'Bỏ qua quảng cáo',
  SKIP_TO_LIVE: 'Tua tới chương trình phát trực tiếp',
  UNDETERMINED_LANGUAGE: 'Chưa xác định',
  UNMUTE: 'Bật tiếng',
  UNRECOGNIZED_LANGUAGE: 'Không xác định',
  VOLUME: 'Âm lượng',
};
export const SHAKA_ERRORS: object = {
  1: {
    title: 'ERRORS NETWORK',
    content: 'Errors from the network stack.',
  },
  2: {
    title: 'ERRORS TEXT',
    content: 'Errors parsing text streams.',
  },
  3: {
    title: 'ERRORS MEDIA',
    content: 'Errors parsing or processing audio or video streams.',
  },
  4: {
    title: 'ERRORS MANIFEST',
    content: 'Errors parsing the Manifest.',
  },
  5: {
    title: 'ERRORS STREAMING',
    content: 'Errors related to streaming.',
  },
  6: {
    title: 'ERRORS DRM',
    content: 'Errors related to DRM.',
  },
  7: {
    title: 'ERRORS PLAYER',
    content: 'Miscellaneous errors from the player.',
  },
  8: {
    title: 'ERRORS CAST',
    content: 'Errors related to cast.',
  },
  9: {
    title: 'ERRORS STORAGE',
    content: 'Errors in the database storage (offline).',
  },
  10: {
    title: 'ERRORS ADS',
    content: 'Errors related to ad insertion.',
  },
  undefined: {
    title: `ERRORS CHANNEL`,
    content: `Errors channel. Please click the refresh button or all details sent to support email.`,
  },
};
export const KEY_LANGUAGES: any = {
  ach: {
    u: 'Lwo',
    A: 'Acholi',
  },
  ady: {
    u: 'Адыгэбзэ',
    A: 'Adyghe',
  },
  af: {
    u: 'Afrikaans',
    A: 'Afrikaans',
  },
  'af-NA': {
    u: 'Afrikaans (Namibia)',
    A: 'Afrikaans (Namibia)',
  },
  'af-ZA': {
    u: 'Afrikaans (South Africa)',
    A: 'Afrikaans (South Africa)',
  },
  ak: {
    u: 'Tɕɥi',
    A: 'Akan',
  },
  ar: {
    u: 'العربية',
    A: 'Arabic',
  },
  'ar-AR': {
    u: 'العربية',
    A: 'Arabic',
  },
  'ar-MA': {
    u: 'العربية',
    A: 'Arabic (Morocco)',
  },
  'ar-SA': {
    u: 'العربية (السعودية)',
    A: 'Arabic (Saudi Arabia)',
  },
  'ay-BO': {
    u: 'Aymar aru',
    A: 'Aymara',
  },
  az: {
    u: 'Azərbaycan dili',
    A: 'Azerbaijani',
  },
  'az-AZ': {
    u: 'Azərbaycan dili',
    A: 'Azerbaijani',
  },
  'be-BY': {
    u: 'Беларуская',
    A: 'Belarusian',
  },
  bg: {
    u: 'Български',
    A: 'Bulgarian',
  },
  'bg-BG': {
    u: 'Български',
    A: 'Bulgarian',
  },
  bn: {
    u: 'বাংলা',
    A: 'Bengali',
  },
  'bn-IN': {
    u: 'বাংলা (ভারত)',
    A: 'Bengali (India)',
  },
  'bn-BD': {
    u: 'বাংলা(বাংলাদেশ)',
    A: 'Bengali (Bangladesh)',
  },
  'bs-BA': {
    u: 'Bosanski',
    A: 'Bosnian',
  },
  ca: {
    u: 'Català',
    A: 'Catalan',
  },
  'ca-ES': {
    u: 'Català',
    A: 'Catalan',
  },
  cak: {
    u: 'Maya Kaqchikel',
    A: 'Kaqchikel',
  },
  'ck-US': {
    u: 'ᏣᎳᎩ (tsalagi)',
    A: 'Cherokee',
  },
  cs: {
    u: 'Čeština',
    A: 'Czech',
  },
  'cs-CZ': {
    u: 'Čeština',
    A: 'Czech',
  },
  cy: {
    u: 'Cymraeg',
    A: 'Welsh',
  },
  'cy-GB': {
    u: 'Cymraeg',
    A: 'Welsh',
  },
  da: {
    u: 'Dansk',
    A: 'Danish',
  },
  'da-DK': {
    u: 'Dansk',
    A: 'Danish',
  },
  de: {
    u: 'Deutsch',
    A: 'German',
  },
  'de-AT': {
    u: 'Deutsch (Österreich)',
    A: 'German (Austria)',
  },
  'de-DE': {
    u: 'Deutsch (Deutschland)',
    A: 'German (Germany)',
  },
  'de-CH': {
    u: 'Deutsch (Schweiz)',
    A: 'German (Switzerland)',
  },
  dsb: {
    u: 'Dolnoserbšćina',
    A: 'Lower Sorbian',
  },
  el: {
    u: 'Ελληνικά',
    A: 'Greek',
  },
  'el-GR': {
    u: 'Ελληνικά',
    A: 'Greek (Greece)',
  },
  en: {
    u: 'Tiếng Anh',
    A: 'Tiếng Anh',
  },
  eng: {
    u: 'Tiếng Anh',
    A: 'Tiếng Anh',
  },
  'en-GB': {
    u: 'English (UK)',
    A: 'English (UK)',
  },
  'en-AU': {
    u: 'English (Australia)',
    A: 'English (Australia)',
  },
  'en-CA': {
    u: 'English (Canada)',
    A: 'English (Canada)',
  },
  'en-IE': {
    u: 'English (Ireland)',
    A: 'English (Ireland)',
  },
  'en-IN': {
    u: 'English (India)',
    A: 'English (India)',
  },
  'en-PI': {
    u: 'English (Pirate)',
    A: 'English (Pirate)',
  },
  'en-UD': {
    u: 'English (Upside Down)',
    A: 'English (Upside Down)',
  },
  'en-US': {
    u: 'English (US)',
    A: 'English (US)',
  },
  'en-ZA': {
    u: 'English (South Africa)',
    A: 'English (South Africa)',
  },
  'en@pirate': {
    u: 'English (Pirate)',
    A: 'English (Pirate)',
  },
  eo: {
    u: 'Esperanto',
    A: 'Esperanto',
  },
  'eo-EO': {
    u: 'Esperanto',
    A: 'Esperanto',
  },
  es: {
    u: 'Español',
    A: 'Spanish',
  },
  'es-AR': {
    u: 'Español (Argentine)',
    A: 'Spanish (Argentina)',
  },
  'es-419': {
    u: 'Español (Latinoamérica)',
    A: 'Spanish (Latin America)',
  },
  'es-CL': {
    u: 'Español (Chile)',
    A: 'Spanish (Chile)',
  },
  'es-CO': {
    u: 'Español (Colombia)',
    A: 'Spanish (Colombia)',
  },
  'es-EC': {
    u: 'Español (Ecuador)',
    A: 'Spanish (Ecuador)',
  },
  'es-ES': {
    u: 'Español (España)',
    A: 'Spanish (Spain)',
  },
  'es-LA': {
    u: 'Español (Latinoamérica)',
    A: 'Spanish (Latin America)',
  },
  'es-NI': {
    u: 'Español (Nicaragua)',
    A: 'Spanish (Nicaragua)',
  },
  'es-MX': {
    u: 'Español (México)',
    A: 'Spanish (Mexico)',
  },
  'es-US': {
    u: 'Español (Estados Unidos)',
    A: 'Spanish (United States)',
  },
  'es-VE': {
    u: 'Español (Venezuela)',
    A: 'Spanish (Venezuela)',
  },
  et: {
    u: 'eesti keel',
    A: 'Estonian',
  },
  'et-EE': {
    u: 'Eesti (Estonia)',
    A: 'Estonian (Estonia)',
  },
  eu: {
    u: 'Euskara',
    A: 'Basque',
  },
  'eu-ES': {
    u: 'Euskara',
    A: 'Basque',
  },
  fa: {
    u: 'فارسی',
    A: 'Persian',
  },
  'fa-IR': {
    u: 'فارسی',
    A: 'Persian',
  },
  'fb-LT': {
    u: 'Leet Speak',
    A: 'Leet',
  },
  ff: {
    u: 'Fulah',
    A: 'Fulah',
  },
  fi: {
    u: 'Suomi',
    A: 'Finnish',
  },
  'fi-FI': {
    u: 'Suomi',
    A: 'Finnish',
  },
  'fo-FO': {
    u: 'Føroyskt',
    A: 'Faroese',
  },
  fr: {
    u: 'Français',
    A: 'French',
  },
  'fr-CA': {
    u: 'Français (Canada)',
    A: 'French (Canada)',
  },
  'fr-FR': {
    u: 'Français (France)',
    A: 'French (France)',
  },
  'fr-BE': {
    u: 'Français (Belgique)',
    A: 'French (Belgium)',
  },
  'fr-CH': {
    u: 'Français (Suisse)',
    A: 'French (Switzerland)',
  },
  'fy-NL': {
    u: 'Frysk',
    A: 'Frisian (West)',
  },
  ga: {
    u: 'Gaeilge',
    A: 'Irish',
  },
  'ga-IE': {
    u: 'Gaeilge (Gaelic)',
    A: 'Irish (Gaelic)',
  },
  gl: {
    u: 'Galego',
    A: 'Galician',
  },
  'gl-ES': {
    u: 'Galego',
    A: 'Galician',
  },
  'gn-PY': {
    u: "Avañe'ẽ",
    A: 'Guarani',
  },
  'gu-IN': {
    u: 'ગુજરાતી',
    A: 'Gujarati',
  },
  'gx-GR': {
    u: 'Ἑλληνική ἀρχαία',
    A: 'Classical Greek',
  },
  he: {
    u: 'עברית‏',
    A: 'Hebrew',
  },
  'he-IL': {
    u: 'עברית‏',
    A: 'Hebrew',
  },
  hi: {
    u: 'हिन्दी',
    A: 'Hindi',
  },
  'hi-IN': {
    u: 'हिन्दी',
    A: 'Hindi',
  },
  hr: {
    u: 'Hrvatski',
    A: 'Croatian',
  },
  'hr-HR': {
    u: 'Hrvatski',
    A: 'Croatian',
  },
  hsb: {
    u: 'Hornjoserbšćina',
    A: 'Upper Sorbian',
  },
  ht: {
    u: 'Kreyòl',
    A: 'Haitian Creole',
  },
  hu: {
    u: 'Magyar',
    A: 'Hungarian',
  },
  'hu-HU': {
    u: 'Magyar',
    A: 'Hungarian',
  },
  'hy-AM': {
    u: 'Հայերեն',
    A: 'Armenian',
  },
  id: {
    u: 'Bahasa Indonesia',
    A: 'Indonesian',
  },
  'id-ID': {
    u: 'Bahasa Indonesia',
    A: 'Indonesian',
  },
  is: {
    u: 'Íslenska',
    A: 'Icelandic',
  },
  'is-IS': {
    u: 'Íslenska (Iceland)',
    A: 'Icelandic (Iceland)',
  },
  it: {
    u: 'Italiano',
    A: 'Italian',
  },
  'it-IT': {
    u: 'Italiano',
    A: 'Italian',
  },
  ja: {
    u: '日本語',
    A: 'Japanese',
  },
  'ja-JP': {
    u: '日本語',
    A: 'Japanese',
  },
  'jv-ID': {
    u: 'Basa Jawa',
    A: 'Javanese',
  },
  'ka-GE': {
    u: 'ქართული',
    A: 'Georgian',
  },
  'kk-KZ': {
    u: 'Қазақша',
    A: 'Kazakh',
  },
  km: {
    u: 'ភាសាខ្មែរ',
    A: 'Khmer',
  },
  'km-KH': {
    u: 'ភាសាខ្មែរ',
    A: 'Khmer',
  },
  kab: {
    u: 'Taqbaylit',
    A: 'Kabyle',
  },
  kn: {
    u: 'ಕನ್ನಡ',
    A: 'Kannada',
  },
  'kn-IN': {
    u: 'ಕನ್ನಡ (India)',
    A: 'Kannada (India)',
  },
  ko: {
    u: '한국어',
    A: 'Korean',
  },
  'ko-KR': {
    u: '한국어 (韩国)',
    A: 'Korean (Korea)',
  },
  ku: {
    u: 'Kurdî',
    A: 'Kurdish',
  },
  'ku-TR': {
    u: 'Kurdî',
    A: 'Kurdish',
  },
  la: {
    u: 'Latin',
    A: 'Latin',
  },
  'la-VA': {
    u: 'Latin',
    A: 'Latin',
  },
  lb: {
    u: 'Lëtzebuergesch',
    A: 'Luxembourgish',
  },
  'li-NL': {
    u: 'Lèmbörgs',
    A: 'Limburgish',
  },
  lt: {
    u: 'Lietuvių',
    A: 'Lithuanian',
  },
  'lt-LT': {
    u: 'Lietuvių',
    A: 'Lithuanian',
  },
  lv: {
    u: 'Latviešu',
    A: 'Latvian',
  },
  'lv-LV': {
    u: 'Latviešu',
    A: 'Latvian',
  },
  mai: {
    u: 'मैथिली, মৈথিলী',
    A: 'Maithili',
  },
  'mg-MG': {
    u: 'Malagasy',
    A: 'Malagasy',
  },
  mk: {
    u: 'Македонски',
    A: 'Macedonian',
  },
  'mk-MK': {
    u: 'Македонски (Македонски)',
    A: 'Macedonian (Macedonian)',
  },
  ml: {
    u: 'മലയാളം',
    A: 'Malayalam',
  },
  'ml-IN': {
    u: 'മലയാളം',
    A: 'Malayalam',
  },
  'mn-MN': {
    u: 'Монгол',
    A: 'Mongolian',
  },
  mr: {
    u: 'मराठी',
    A: 'Marathi',
  },
  'mr-IN': {
    u: 'मराठी',
    A: 'Marathi',
  },
  ms: {
    u: 'Bahasa Melayu',
    A: 'Malay',
  },
  'ms-MY': {
    u: 'Bahasa Melayu',
    A: 'Malay',
  },
  mt: {
    u: 'Malti',
    A: 'Maltese',
  },
  'mt-MT': {
    u: 'Malti',
    A: 'Maltese',
  },
  my: {
    u: 'ဗမာစကာ',
    A: 'Burmese',
  },
  nb: {
    u: 'Norsk (bokmål)',
    A: 'Norwegian (bokmal)',
  },
  'nb-NO': {
    u: 'Norsk (bokmål)',
    A: 'Norwegian (bokmal)',
  },
  ne: {
    u: 'नेपाली',
    A: 'Nepali',
  },
  'ne-NP': {
    u: 'नेपाली',
    A: 'Nepali',
  },
  nl: {
    u: 'Nederlands',
    A: 'Dutch',
  },
  'nl-BE': {
    u: 'Nederlands (België)',
    A: 'Dutch (Belgium)',
  },
  'nl-NL': {
    u: 'Nederlands (Nederland)',
    A: 'Dutch (Netherlands)',
  },
  'nn-NO': {
    u: 'Norsk (nynorsk)',
    A: 'Norwegian (nynorsk)',
  },
  no: {
    u: 'Norsk',
    A: 'Norwegian',
  },
  oc: {
    u: 'Occitan',
    A: 'Occitan',
  },
  'or-IN': {
    u: 'ଓଡ଼ିଆ',
    A: 'Oriya',
  },
  pa: {
    u: 'ਪੰਜਾਬੀ',
    A: 'Punjabi',
  },
  'pa-IN': {
    u: 'ਪੰਜਾਬੀ (ਭਾਰਤ ਨੂੰ)',
    A: 'Punjabi (India)',
  },
  pl: {
    u: 'Polski',
    A: 'Polish',
  },
  'pl-PL': {
    u: 'Polski',
    A: 'Polish',
  },
  'ps-AF': {
    u: 'پښتو',
    A: 'Pashto',
  },
  pt: {
    u: 'Português',
    A: 'Portuguese',
  },
  'pt-BR': {
    u: 'Português (Brasil)',
    A: 'Portuguese (Brazil)',
  },
  'pt-PT': {
    u: 'Português (Portugal)',
    A: 'Portuguese (Portugal)',
  },
  'qu-PE': {
    u: 'Qhichwa',
    A: 'Quechua',
  },
  'rm-CH': {
    u: 'Rumantsch',
    A: 'Romansh',
  },
  ro: {
    u: 'Română',
    A: 'Romanian',
  },
  'ro-RO': {
    u: 'Română',
    A: 'Romanian',
  },
  ru: {
    u: 'Русский',
    A: 'Russian',
  },
  'ru-RU': {
    u: 'Русский',
    A: 'Russian',
  },
  'sa-IN': {
    u: 'संस्कृतम्',
    A: 'Sanskrit',
  },
  'se-NO': {
    u: 'Davvisámegiella',
    A: 'Northern Sámi',
  },
  'si-LK': {
    u: 'පළාත',
    A: 'Sinhala (Sri Lanka)',
  },
  sk: {
    u: 'Slovenčina',
    A: 'Slovak',
  },
  'sk-SK': {
    u: 'Slovenčina (Slovakia)',
    A: 'Slovak (Slovakia)',
  },
  sl: {
    u: 'Slovenščina',
    A: 'Slovenian',
  },
  'sl-SI': {
    u: 'Slovenščina',
    A: 'Slovenian',
  },
  'so-SO': {
    u: 'Soomaaliga',
    A: 'Somali',
  },
  sq: {
    u: 'Shqip',
    A: 'Albanian',
  },
  'sq-AL': {
    u: 'Shqip',
    A: 'Albanian',
  },
  sr: {
    u: 'Српски',
    A: 'Serbian',
  },
  'sr-RS': {
    u: 'Српски (Serbia)',
    A: 'Serbian (Serbia)',
  },
  su: {
    u: 'Basa Sunda',
    A: 'Sundanese',
  },
  sv: {
    u: 'Svenska',
    A: 'Swedish',
  },
  'sv-SE': {
    u: 'Svenska',
    A: 'Swedish',
  },
  sw: {
    u: 'Kiswahili',
    A: 'Swahili',
  },
  'sw-KE': {
    u: 'Kiswahili',
    A: 'Swahili (Kenya)',
  },
  ta: {
    u: 'தமிழ்',
    A: 'Tamil',
  },
  'ta-IN': {
    u: 'தமிழ்',
    A: 'Tamil',
  },
  te: {
    u: 'తెలుగు',
    A: 'Telugu',
  },
  'te-IN': {
    u: 'తెలుగు',
    A: 'Telugu',
  },
  tg: {
    u: 'забо́ни тоҷикӣ́',
    A: 'Tajik',
  },
  'tg-TJ': {
    u: 'тоҷикӣ',
    A: 'Tajik',
  },
  th: {
    u: 'ภาษาไทย',
    A: 'Thai',
  },
  'th-TH': {
    u: 'ภาษาไทย (ประเทศไทย)',
    A: 'Thai (Thailand)',
  },
  tl: {
    u: 'Filipino',
    A: 'Filipino',
  },
  'tl-PH': {
    u: 'Filipino',
    A: 'Filipino',
  },
  tlh: {
    u: 'tlhIngan-Hol',
    A: 'Klingon',
  },
  tr: {
    u: 'Türkçe',
    A: 'Turkish',
  },
  'tr-TR': {
    u: 'Türkçe',
    A: 'Turkish',
  },
  'tt-RU': {
    u: 'татарча',
    A: 'Tatar',
  },
  uk: {
    u: 'Українська',
    A: 'Ukrainian',
  },
  'uk-UA': {
    u: 'Українська',
    A: 'Ukrainian',
  },
  ur: {
    u: 'اردو',
    A: 'Urdu',
  },
  'ur-PK': {
    u: 'اردو',
    A: 'Urdu',
  },
  uz: {
    u: "O'zbek",
    A: 'Uzbek',
  },
  'uz-UZ': {
    u: "O'zbek",
    A: 'Uzbek',
  },
  vi: {
    u: 'Tiếng Việt',
    A: 'Vietnamese',
  },
  vie: {
    u: 'Tiếng Việt',
    A: 'Vietnamese',
  },
  'vi-VN': {
    u: 'Tiếng Việt',
    A: 'Vietnamese',
  },
  'xh-ZA': {
    u: 'isiXhosa',
    A: 'Xhosa',
  },
  yi: {
    u: 'ייִדיש',
    A: 'Yiddish',
  },
  'yi-DE': {
    u: 'ייִדיש (German)',
    A: 'Yiddish (German)',
  },
  zh: {
    u: 'Tiếng Trung',
    A: 'Chinese',
  },
  zho: {
    u: 'Tiếng Trung',
    A: 'Chinese',
  },
  'zh-HANS': {
    u: '中文简体',
    A: 'Chinese Simplified',
  },
  'zh-HANT': {
    u: '中文繁體',
    A: 'Chinese Traditional',
  },
  'zh-CN': {
    u: '中文（中国）',
    A: 'Chinese Simplified (China)',
  },
  'zh-HK': {
    u: '中文（香港）',
    A: 'Chinese Traditional (Hong Kong)',
  },
  'zh-SG': {
    u: '中文（新加坡）',
    A: 'Chinese Simplified (Singapore)',
  },
  'zh-TW': {
    u: '中文（台灣）',
    A: 'Chinese Traditional (Taiwan)',
  },
  'zu-ZA': {
    u: 'isiZulu',
    A: 'Zulu',
  },
};

export const KEY_LANGUAGES_AUDIO_CODECS: any = {
  vi: 'Tiếng Việt',
  vie: 'Tiếng Việt',
  en: 'Tiếng Anh',
  eng: 'Tiếng Anh',
  zh: 'Tiếng Trung',
  zho: 'Tiếng Trung',
  ko: 'Tiếng Hàn',
  kor: 'Tiếng Hàn',
  th: 'Tiếng Thái',
  tha: 'Tiếng Thái',
  ja: 'Tiếng Nhật',
  jpn: 'Tiếng Nhật',
  es: 'Tiếng Tây Ban Nha',
  spa: 'Tiếng Tây Ban Nha',
  fr: 'Tiếng Pháp',
  fra: 'Tiếng Pháp',
  fre: 'Tiếng Pháp',
};
export const P2P_SHAKA_DNA_WRAPPER = '/js/p2p/shaka/shakaplayer-dna-wrapper.js';
export const SHAKA_UI_PATH = '/js/shaka/shaka-player.4.10.6.ui.min.js';
export const SIGMA_PACKER_PATH = '/js/sigma/sigma_packer_1.0.4.js';
