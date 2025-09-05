export const TOKEN = 'token';
export const USER = 'user';
export const DEFAULT_API_SUFFIX = '/api/v7.1_w/';

export const BLOCKS_VERTICAL: Array<string> = [
  'vertical_slider_small',
  'vertical_slider_medium',
];
export const BLOCKS_HORIZONTAL: Array<string> = [
  'vod_detail',
  'horizontal_slider',
  'horizontal_slider_small',
  'horizontal_highlight_without_background',
  'feature_horizontal_slider',
];

export const COUNT_DOWN_MESSAGE =
  'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau';
export const MASK_PHONE = 'MASK_PHONE';
export const SEND_OTP_TYPES = {
  LOGIN: 'login_fpl', // Đăng nhập/ đăng ký
  CREATE_MANAGEMENT_CODE: 'login_set_pass_1st', // Thiết lập mã quản lý
  CHANGE_MANAGEMENT_CODE: 'login_change_pass', // Đổi mã quản lý
  FORGET_MANAGEMENT_CODE: 'login_forgot_pass', // Quên mã quản lý
  DELETE_ACCOUNT: 'disable_account', // Xoá tài khoản
  DELETE_PAYMENT_METHOD: 'remove_wallet', // Xóa phương thức thanh toán
  DELETE_AUTO_EXTEND: 'remove_auto_pay', // Tắt tự động gia hạn
};

export const SENT_OTP_MESSAGE =
  'Đã có lỗi xảy ra trong quá trình gửi mã OTP, bạn có thể thử lại để tiếp tục';

export const TRANSACTION_HISTORY = 'lich-su-giao-dich';

export const MANAGE_AUTO_EXTEND = 'quan-ly-gia-han-dich-vu';
export const MANAGE_DEVICES = 'quan-ly-thiet-bi';
export const ACCOUNT_INFO = 'tai-khoan';
export const ACCOUNT_OVERVIEW = 'tong-quan';
export const ACTIVATION_CODE = 'ma-kich-hoat';
export const SERVICES = 'dich-vu-da-mua';
export const LIBRARY = 'thu-vien';
export const LIBRARY_TITLE = 'Thư viện';
export const ACTIVE_PACKAGES_TITLE = 'Gói đang sử dụng';
export const PACKAGE_AND_PAYMENT_MANAGEMENT = 'Quản lý thanh toán và gói';
export const MANAGE_PAYMENT_AND_PACKAGE = 'thanh-toan-va-goi';
export const FOLLOWING = 'Đang theo dõi';
export const USING_PACKAGE = 'goi-dang-su-dung';
export const FILES = 'ho-so';
export const ACCOUNT = 'tai-khoan';
export const PACKAGE = 'mua-goi';
export const DETAIL_PR = 'DETAIL_PR';
export const LANDING_PAGE_TYPE_POLICY = 'chinh-sach';
export const OPTIONALS = 'quan-ly-va-tuy-chon';
export const HISTORYWATCH = 'lich-su-xem';

export const TITLE_SEND_OTP_FAIL = 'Gửi mã OTP không thành công';

export const BLOCK_NUMERIC_RANK: string = 'numeric_rank';
export const BLOCK_NEW_VOD_DETAIL: string = 'new_vod_detail';

export const CATEGORY_BLOCKS: Array<string> = [
  'category',
  'horizontal_slider_hyperlink',
];
export const SPORT_SIDEBYSIDE: Array<string> = ['sport_sidebyside'];
export const SPORT_SIDEBYSIDE_REAL: string = 'SPORT_SIDEBYSIDE';
export const HIGHLIGHT: string = 'HIGHLIGHT';
export const MATCH_DATE: string = 'match_date';
export const MATCH_RANKING: string = 'match_ranking';
export const NONE_SPORT: string = 'none_sport';
export const SPORT: string = 'sport';
export const TABLE_LEAGUE_DETAIL: string = 'table_league_detail';
export const HORIZONTAL_BACKGROUND: string =
  'horizontal_slider_with_background';

export const CATEGORY_BLOCKS_VERTICAL: Array<string> = ['category'];

export const SSO_RESPONSE_CODE = 'sso_response_code';
export const SSO_ACCESS_TOKEN = 'sso_access_token';
export const SSO_ID_TOKEN = 'sso_id_token';
export const SSO_REFRESH_TOKEN = 'sspo_refresh_token';
export const SSO_CODE_VERIFIER = 'sspo_code_verifier';
export const SSO_STATE = 'sso_state';
export const CATEGORY_BLOCKS_ADS: string = 'ads';

export const SELECTED_VIDEO_QUALITY = 'selected_video_quality';
export const SELECTED_LIVE_QUALITY = 'selected_live_quality';
export const SELECTED_SUBTITLE = 'selected_subtitle';
export const SELECTED_SUBTITLE_LABEL = 'selected_subtitle_label';
export const SELECTED_AUDIO = 'selected_audio';
export const SELECTED_AUDIO_SHAKA = 'selected_audio';
export const SELECTED_SUBTITLE_SHAKA = 'selected_subtitle_shaka';
export const SELECTED_AUDIO_VIDEOJS = 'selected_audio_videojs';
export const SELECTED_AUDIO_LABEL = 'selected_audio_label';
export const SELECTED_AUDIO_LABEL_LIVE = 'selected_audio_label_live';

export const TEXT_TRACK_LANGUAGE = {
  vi: 'Tiếng Việt',
  vie: 'Tiếng Việt',
  en: 'Tiếng Anh',
  eng: 'Tiếng Anh',
  zh: 'Tiếng Trung',
  zho: 'Tiếng Trung',
};
export const APP_VERSION = '8.0.38';
export const PATH_BEFORE_LOGIN_SSO = 'path_before_login_sso';
export const RUNNING_PLAYER = 'running_player'; // VIDEOJS || SHAKA
export const RUNNING_MERCHANT = 'running_merchant';
export const DRM_SUPPORTS = 'drm_supports';
export const MACOS_VERSION = {
  // https://apple.fandom.com/wiki/List_of_Mac_OS_versions
  '10.0': 'Mac OS X Cheetah',
  '10.1': 'Mac OS X Puma',
  '10.2': 'Mac OS X Jaguar',
  '10.3': 'Mac OS X Panther',
  '10.4': 'Mac OS X Tiger',
  '10.5': 'Mac OS X Leopard',
  '10.6': 'Mac OS X Snow Leopard',
  '10.7': 'Mac OS X Lion',
  '10.8': 'Mac OS X Mountain Lion',
  '10.9': 'Mac OS X Mavericks',
  '10.10': 'Mac OS X Yosemite',
  '10.11': 'Mac OS X El Capitan',
  '10.12': 'Mac OS Sierra',
  '10.13': 'Mac OS High Sierra',
  '10.14': 'Mac OS Mojave',
  '10.15': 'Mac OS Catalina',
};

export const PREVIOUS_USER_ID = 'previous_user_id';
export const SSO_PROVIDER_ID = 'sso_provider_id';
export const DRM_FAIRPLAY_START_SUCCESS = 'drm_fairplay_start_success';
export const DRM_HLS_REQUEST_AMOUNT = 'drm_hls_request_amount';
export const PREVIOUS_CHANNEL_MONITOR = 'previous_channel_monitor';
export const PREVIOUS_CHANNELS_MONITOR = 'previous_channels_monitor';
export const ERROR_GET_CHANNEL_DETAIL = 'ERROR_GET_CHANNEL_DETAIL';
export const ERROR_GET_STREAM_DETAIL = 'ERROR_GET_STREAM_DETAIL';
export const ERROR_PLAYER_MONITOR = 'ERROR_PLAYER_MONITOR';
export const PREVIOUS_MONITOR_PLAYER_QUANTITY =
  'previous_monitor_player_quantity';
export const LUCK_DRAW_ACCESS_TOKEN = 'luckyDrawAccessToken';
export const IP_ADDRESS = 'ip_address';
export const DEFAULT_IP_ADDRESS = '0.0.0.0';
export const PING_DRM_DATA = 'PING_DRM_DATA';
export const SHOW_REAL_TIME_CHAT = 'SHOW_REAL_TIME_CHAT';
export const PROFILE_TYPES = {
  MASTER_PROFILE: '1', // người lớn
  KID_PROFILE: '2', // trẻ em
};

export const PROFILE_DEFAULT_AVATAR = '/images/profiles/placeholder.png';

export const PIN_TYPES = {
  NO_PIN: '0',
  REQUIRED_PIN: '1',
  REQUIRED_PASSWORD: '2',
  CONFIRM_KID_TO_MASTER: '2',
};
export const DETAILS_PR = 'DETAILS_PR';
export const NUMBER_PR = 'NUMBER_PR';
export const TYPE_PR = 'TYPE_PR';
export const ALREADY_SHOWN_MODAL_MANAGEMENT_CODE =
  'ALREADY_SHOWN_MODAL_MANAGEMENT_CODE';
export const DEFAULT_ERROR_MSG = 'Đã có lỗi xảy ra, vui lòng thử lại sau';
export const PROFILE_CHANGE_ROUTE = 'PROFILE_CHANGE_ROUTE'; // session
export const CHANGE_PIN_SUCCESS_MSG = 'CHANGE_PIN_SUCCESS_MSG';
export const PROFILE_LOGOUT = 'PROFILE_LOGOUT';
export const IS_CHANGE_PIN_SUCCESS = 'IS_CHANGE_PIN_SUCCESS';
export const CONTENT_NOT_KID =
  'Hồ sơ trẻ em không hỗ trợ tính năng này. Bạn có thể chọn hồ sơ khác để tiếp tục';
export const VN_TEXT =
  'ÀÁÂÃÈÉÊẾÌĨÍÒÓÔÕÙÚĂĐŨƠàáâãèéêếìĩíòóôõùúăđũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ';
export const MESSAGE_NO_CONNECTION =
  'Đường truyền internet của bạn đang mất kết nối, vui lòng thử lại.';
export const LEAK_INFO = 'Thiếu thông tin người dùng hoặc mã xác thực OTP.';
export const SCHEDULE_INTERACT_TIME = 'SCHEDULE_INTERACT_TIME';
export const VIDEO_TIME_BEFORE_ERROR = 'VIDEO_TIME_BEFORE_ERROR';
export const VIDEOJS_LAST_PING = 'VIDEOJS_LAST_PING';
export const VIDEOJS_LAST_PING_SEEKED = 'VIDEOJS_LAST_PING_SEEKED';
export const SHAKA_LAST_PING = 'SHAKA_LAST_PING';
export const SHAKA_LAST_PING_SEEKED = 'SHAKA_LAST_PING_SEEKED';
export const PREVIOUS_PLAYER = 'PREVIOUS_PLAYER';
export const VIDEO_TS_TIME_BEFORE_ERROR = 'VIDEO_TS_TIME_BEFORE_ERROR';
export const IS_USER_SEEKING = 'IS_USER_SEEKING';
export const SEEK_VIDEO_STARTTIME = 'SEEK_VIDEO_STARTTIME';
export const DEVICE_ID = 'device_id';
export const DEVICE_ID_PING_DRM = 'device_id_ping_drm';
export const TAB_ID = 'tabId';
export const PLAYER_WRAPPER_ID = 'player_wrapper';
export interface DatasetErrors {
  eac: string; // error
  eca: string; // category - ["player, drm, app, api, finger-print"]
  dtms: string; // detail message http code
  ela: string; // error des show user
  epr?: string | number; // Http code
  cttp: string; // vod/livetv
  ctid: string; // channel id
  ctn: string; // channel name
  ctes?: string; // play episode
  pl_st?: number; // play start time
  pn: string; // player name
  sbt?: string; // subtitle
  aud?: string; // audio
  prf?: string; // profile
  brt?: string; // broadcast type
  drt?: string; // drm type
  nwbr?: number; // network bitrate
  dsdlg?: number; // display dialog (0=not display/1=display)
  fecd?: number; // FPLAY ERROR CODE - Api code - [999,998,997]
  fems?: string; // FPLAY ERROR MESS - Api message - [API Timeout, Same Response]
  mdlk: string; // media link play(cdn)
  t1?: string; // finger print: 0 - interrupt from server/1-from client
}

export const COOKIE_EXPIRATION_TIME = 3600 * 24 * 365;
export const RESEND_OTP_SECONDS = 60;
export const CONFIG = 'config';
export const PLAYER_ERROR = 'PLAYER_ERROR';
export const DEFAULT_TITLE =
  'FPT Play: Xem Không Giới Hạn Phim, Show, Anime, TV, Thể Thao';
export const APP_CONFIG = 'APP_CONFIG';
export const BLOCK_PAGE_SIZE = 'BLOCK_PAGE_SIZE';
export const SHAKA_UI_PATH = '/js/shaka/shaka-player.4.10.6.ui.min.js';
export const SIGMA_PACKER_PATH = '/js/sigma/sigma_packer_1.0.4.js';
export const MUTE_VOLUME_TRAILER = 'mute_volume_trailer';
export const MUTE_VOLUME_PLAYER = 'mute_volume_player';
export const VOLUME_PLAYER = 'volume_player';
export const SUPPORT_H265 = 'SUPPORT_H265';
export const SUPPORT_AV1 = 'SUPPORT_AV1';
export const SUPPORT_VP9 = 'SUPPORT_VP9';
export const SUPPORT_DOLBY_VISION = 'SUPPORT_DOLBY_VISION';
export const CHECK_CODEC_COMPLETED = 'CHECK_CODEC_COMPLETED';
export const ERROR_CONNECTION = 'Lỗi kết nối dịch vụ';
export const ERROR_DELETE_PROFILE = 'Xóa hồ sơ không thành công';
export const SINGOUT_DEVICE_SUCCESS = 'Đăng xuất thiết bị thành công';
export const SINGOUT_DEVICE_ERROR = 'Đăng xuất thiết bị thất bại';
export const SINGOUT_DEVICE_ERROR_MSG =
  'Bạn đã đăng xuất thiết bị thất bại. Vui lòng thử lại.';
export const SINGOUT_DEVICE_SUCCESS_TITLE =
  'Bạn đã đăng xuất thiết bị thành công.';
export const SUPPORT_CONTACT =
  'Đã có lỗi xảy ra, vui lòng thử lại sau hoặc gọi tổng đài 19006600 để được hỗ trợ.';
export const TURNOFF_AUTOPAY = 'Tắt tự động gia hạn thành công';
export const ERROR = 'Lỗi';
export const OTP_NOT_VERIFY =
  'Mã xác thực OTP chưa được nhận. Vui lòng thử lại.';
export const INFORM = 'Thông báo';
export const OVER_LIMIT =
  'Bạn đã vượt quá số lần quy định. Vui lòng thử lại sau';
export const TRY_AGAIN = 'Thử lại';
export const HAVING_ERROR = 'Đã xảy ra lỗi, vui lòng thử lại';
export const ACCOUNT_UPDATED = 'Tài khoản đã được cập nhật';
export const READ = 'Đã đánh dấu tất cả đã đọc.';
export const ERROR_UNKNOW = 'Lỗi không xác định';
export const WRONG_OTP = 'Mã OTP không chính xác, vui lòng thử lại.';
export const QUICK_LOGIN_SCAN_VERIFY_TOKEN = 'QUICK_LOGIN_SCAN_VERIFY_TOKEN';
export const ERROR_PLAYER_FPT_PLAY =
  'Đã xảy ra sự cố khi kết nối FPT Play! Vui lòng thử lại sau hoặc chọn một nội dung khác.';
// login
export const LOGIN_PHONE_NUMBER = 'LOGIN_PHONE_NUMBER';
export const TYPE_LOGIN = 'TYPE_LOGIN';
export const QUICK_LOGIN_OTP_CODE = 'QUICK_LOGIN_OTP_CODE';
export const LOGOUT_CONFIRM_MESSAGE =
  'FPT Play sẽ đăng xuất tài khoản của bạn trên thiết bị đã chọn.';
export const LOGIN_ERROR_MESSAGE =
  'Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại';
export const NO_ACCESS_TOKEN_OIDC = 'No response access_token from Oidc';
export const NO_API_RESPONSE_LOGIN_3RD = 'No response from API login_3rd';
// button
export const RETRY_BUTTON_TEXT = 'Thử lại';
export const UNDERSTOOD_BUTTON_TEXT = 'Đã hiểu';
export const CONTINUE_BUTTON_TEXT = 'Tiếp tục';
export const EXIT_BUTTON_TEXT = 'Thoát';
export const CONFIRM_BUTTON_TEXT = 'Xác nhận';
export const BACK_TO_HOME_TEXT = 'Đi đến trang chủ';
export const SHORT_BACK_TO_HOME_TEXT = 'Về trang chủ';
export const ACCEPT_BUTTON_TEXT = 'Đồng ý';
export const SKIP_INTRO_BUTTON_TEXT = 'Bỏ qua giới thiệu';

//activate code
export const INPUT_ACTIVATED_CODE =
  'Quý khách vui lòng nhập mã kích hoạt vào ô bên dưới';
export const NOTIFY_TEXT = 'Thông báo';
export const ACTIVATED_CODE_TEXT = 'Nhập mã kích hoạt';
export const SUCCESS_UPDATE_WIDEVINE = 'Cập nhật Widevine thành công';
export const SUCCESS_UPDATE_REVISION = 'Cập nhật Revision thành công';
export const UNDEFINED = 'undefined';
export const CODE = 'code';
export const WEB = 'web';
export const TRUE = 'true';
export const WIDEVINE = 'widevine';
export const REVISION = 'revision';
export const REVISION_UPPER = 'REVISION';
export const LOCK_USER = 'lock_user';
export const BASE64_PATTERN =
  /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

export const URL_DEVISION = '/playos/get_revision';
export const URL_PROMOTION_CODE = '/payment/send_promotion_code';

export const MOUSE_CLIENT_X = 'MOUSE_CLIENT_X';
export const MOUSE_CLIENT_Y = 'MOUSE_CLIENT_Y';

// searching
export const FPTPLAY_SEARCH_HISTORY = 'FptPlay_search_history';
export const NO_RESULT_FOUNDED = 'Không có kết quả tìm kiếm';
export const TRY_OTHER_CONTENT = 'Hãy thử nội dung khác';
export const SEARCH_PLACEHOLDER = 'Tìm kiếm nội dung giải trí';
export const FIND_TEXT = 'Tìm kiếm';
export const DELETE_TEXT = 'Xóa';
export const DELETE_HISTORY_TEXT = 'Xóa lịch sử tìm kiếm';

// control bar
export const PLAYER_CONTROL_BAR = {
  CustomFullscreenButton: 'CustomFullscreenButton',
  CustomLiveDisplay: 'CustomLiveDisplay',
  ResolutionButton: 'ResolutionButton',
  AudioButton: 'AudioButton',
  ReportButton: 'ReportButton',
  RewindButton: 'RewindButton',
  FastForwardButton: 'FastForwardButton',
  TimeStatus: 'TimeStatus',
  ScheduleButton: 'ScheduleButton',
  CommentButton: 'CommentButton',
};

export const PLAYER_NAME = {
  VIDEOJS: 'videojs',
  SHAKA: 'shaka',
  HLS: 'hls',
};

export type PLAYER_NAME_TYPE = 'videojs' | 'shaka' | 'hls';

export const DRM_MERCHANT_NAMES = {
  FPTPLAY: 'fptplay',
};

export const PLAYER_WRAPPER = 'player_wrapper';
export const VIDEO_ID = 'video_id';

export const ROUTE_PATH_NAMES = {
  CHANNEL: '/xem-truyen-hinh/',
  VOD: '/xem-video/',
  EVENT: '/su-kien/',
  PLAYLIST: '/playlist/',
  PREMIERE: '/cong-chieu/',
};

export const AUDIO_CODEC_URI_NAMES_DASH = {
  AAC: 'mp4a.40.2',
  AACHE: 'mp4a.40.5',
  AACHEV2: 'mp4a.40.29',
  AC3: 'ac-3',
  EC3: 'ec-3',
  FLAC: 'flac',
  ALAC: 'alac',
};

export const CODECS_FULL_RULES = [
  {
    dash_codec: 'mp4a.40.2',
    hls_codec: '/mp4a.40.2/',
    name: 'Low Complexity AAC',
  },
  {
    dash_codec: 'mp4a.40.5',
    hls_codec: '/mp4a.40.5/',
    name: 'High-Efficiency AAC v1',
  },
  {
    dash_codec: 'mp4a.40.29',
    hls_codec: '/mp4a.40.29/',
    name: 'High-Efficiency AAC v2',
  },
  {
    dash_codec: 'ac-3',
    hls_codec: '/ac-3/',
    name: 'Dolby Digital',
  },
  {
    dash_codec: 'ec-3',
    hls_codec: '/ec-3/',
    name: 'Dolby Digital Plus',
  },
  {
    dash_codec: 'ac-4',
    hls_codec: '/ac-4/',
    name: 'Dolby AC-4',
  },
  {
    dash_codec: 'fLaC',
    hls_codec: '/fLaC/',
    name: 'Free Lossless Audio Codec',
  },
  {
    dash_codec: 'alac',
    hls_codec: '/alac/',
    name: 'Apple Lossless Audio Codec',
  },
  {
    dash_codec: 'vorbis',
    hls_codec: '/vorbis/',
    name: 'Vorbis',
  },
  {
    dash_codec: 'opus',
    hls_codec: '/opus/',
    name: 'Opus',
  },
  {
    dash_codec: 'mp3',
    hls_codec: '/mp3/',
    name: 'MPEG-1/2 Audio Layer III',
  },
];
export const MANIFEST_TYPE = {
  DASH: 'DASH',
  HLS: 'HLS',
};
export const MANUAL_PARSED_MANIFEST = 'MANUAL_PARSED_MANIFEST';
export const AUDIO_CODEC_NAMES = {
  AAC: 'AAC',
  AACHE: 'AACHE',
  AACHEV2: 'AACHEV2',
  AC3: 'AC3',
  EC3: 'EC3',
  FLAC: 'FLAC',
  ALAC: 'ALAC',
};
export const AUDIO_CODEC_URI_NAMES = {
  AAC: '/mp4a.40.2/',
  AACHE: '/mp4a.40.5/',
  AACHEV2: '/mp4a.40.29/',
  AC3: '/ac-3/',
  EC3: '/ec-3/',
  FLAC: '/flac/',
  ALAC: '/alac/',
};
export const KEY_LANGUAGES_AUDIO_CODECS = {
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

export const RUNNING_MANIFEST_TYPE = 'RUNNING_MANIFEST_TYPE';

export const AUDIO_NAME_MODE_LIVE = {
  FROM_API: '0',
  FROM_MANIFEST: '1',
  CLIENT_BUILD: '2',
};

export const CHANNEL_NAME_RULES = {
  // '2': 'Stereo',
  '6': '5.1',
  '7': '5.1',
  '8': '7.1',
  '16': '9.1',
};

export const EVENT_COLLECTION_NAME = 'fteluv-events';
export const NotFoundErrors = {
  pageNotFound: 'Trang này không tồn tại',
  contentNotFound: 'Có thể liên kết bị hỏng hoặc trang đã bị gỡ.',
};
export const TOTAL_CHUNK_SIZE_LOADED = 'TOTAL_CHUNK_SIZE_LOADED';
export const CREATE_PROFILE = 'Tạo hồ sơ';
export const EDIT_PROFILE = 'Chỉnh sửa hồ sơ';
export const URL_MODE = 'URL_MODE';
export const STREAM_AUDIO_PROFILE = 'STREAM_AUDIO_PROFILE';
export const CHATBOT_OPEN_STATUS_BEFORE_CHANGE_ROUTE =
  'CHATBOT_OPEN_STATUS_BEFORE_CHANGE_ROUTE';
export const WCHATBOT_CHAT_SESSION = 'WCHATBOT_CHAT_SESSION';
export const SELECTED_PLAYBACK_SPEED = 'SELECTED_PLAYBACK_SPEED';
export const CHATBOT_SDK_ERRORS = {
  AUTH_FAILED: 'AUTH_FAILED',
};

// Auto next video constants
export const IS_NEXT_MOVIE = 'IS_NEXT_MOVIE';
export const IS_NEXT_TRAILER = 'IS_NEXT_TRAILER';
export const IS_NEXT_FROM_PLAYER = 'IS_NEXT_FROM_PLAYER';

// Auto next video timing constants
export const AUTO_NEXT_COUNTDOWN_SECONDS = 6;
export const AUTO_NEXT_PROGRESS_INTERVAL = 100; // milliseconds
export const AUTO_NEXT_PROGRESS_STEPS = 60; // 60 steps for 6 seconds

// Next recommend constants
export const NEXT_RECOMMEND_COUNTDOWN_SECONDS = 5;
export const NEXT_RECOMMEND_SESSION_KEYS = {
  IS_NEXT_FROM_PLAYER: 'IS_NEXT_FROM_PLAYER',
  IS_NEXT_MOVIE: 'IS_NEXT_MOVIE',
} as const;

// Preview constants
export const IS_PREVIEW_LIVE = 'IS_PREVIEW_LIVE';
export const PREVIEW_DURATION_SECONDS = 300; // 5 minutes
export const PREVIEW_MESSAGES = {
  VOD: {
    POPUP: {
      TVOD: 'Bạn đang xem thử 5 phút. Thuê phim để xem nội dung đầy đủ.',
      SVOD: 'Bạn đang xem thử 5 phút. Đăng ký gói để xem nội dung đầy đủ.',
    },
    BUTTON: {
      TVOD: 'Thuê phim',
      SVOD: 'Đăng ký',
    },
    BACKGROUND: {
      TITLE: {
        TVOD: 'Thuê phim để thưởng thức nội dung',
        SVOD: 'Đăng ký gói để thưởng thức nội dung',
      },
      DESCRIPTION: {
        TVOD: 'Hết 5 phút xem thử, thuê phim để xem nội dung đầy đủ.',
        SVOD: 'Hết 5 phút xem thử, đăng ký gói để xem nội dung đầy đủ.',
      },
      BUTTON: {
        TVOD: 'Thuê phim',
        SVOD: 'Đăng ký',
      },
    },
  },
  LIVE: {
    POPUP: {
      DEFAULT:
        'Bạn có 2 lượt xem trước kênh, mỗi lượt tối đa 5 phút. Vui lòng đăng ký để tiếp tục xem.',
    },
    BUTTON: {
      DEFAULT: 'Đăng ký',
    },
    BACKGROUND: {
      TITLE: 'Đăng ký để tiếp tục xem',
      DESCRIPTION: 'Hết thời gian xem thử, đăng ký để tiếp tục.',
    },
  },
};
export enum SOURCE_PROVIDER {
  GALAXY_PLAY = 'galaxy-play',
}

export const HISTORY_TEXT = {
  BOOK_MARK: 'bookmark',
  HISTORY: 'history',
  LANDING_PAGE: 'landing_page',
};

export const BOOLEAN_TEXTS = {
  TRUE: 'true',
  FALSE: 'false',
};

export const CLOSE_LOGIN_MODAL_NOW = 'CLOSE_LOGIN_MODAL_NOW';
export const IS_NOT_RESET_PLAYING_SESSION = 'is_not_reset_playing_session';
export const VIDEO_CURRENT_TIME = 'VIDEO_CURRENT_TIME';
export const PLAYER_IS_RETRYING = 'PLAYER_IS_RETRYING';
export const DRM_PLAYREADY = 'DRM_PLAYREADY';
export const DRM_WIDEVINE = 'DRM_WIDEVINE';
export const MQTT_CONFIG = 'MQTT_CONFIG';
export const MQTT_CONTENT_TYPE = 'MQTT_CONTENT_TYPE';
export const MQTT_CONTENT_ID = 'MQTT_CONTENT_ID';
export const MQTT_ACTION = 'MQTT_ACTION';
export const MQTT_PING_START_PAYLOAD = 'MQTT_PING_START_PAYLOAD';
export const MQTT_TOPIC_LINK = 'MQTT_TOPIC_LINK';
export const MQTT_PUBLISH_FAILED_LIST = 'MQTT_PUBLISH_FAILED_LIST';
export const MQTT_PUBLISH_STREAM_DATA = 'MQTT_PUBLISH_STREAM_DATA';
export const PLAYER_BOOKMARK_SECOND = 'PLAYER_BOOKMARK_SECOND';
export const TEXT_OS_NOT_SUPPORT =
  'Hiện tại FPT Play chỉ hỗ trợ trình phát trên ứng dụng FPT Play. Vui lòng mở ứng dụng để tiếp tục xem.';
export const LINK_TEXT = {
  HLS: 'https://vodcdn.fptplay.net/POVOD/encoded/2024/03/31/loveatnight-2021-cn-20m-as-001-1711868593/master.m3u8',
  DASH: 'https://vodcdn.fptplay.net/POVOD/encoded/2025/06/02/tm-cordialcompanions-2023-cn-001-272422cb29d08d32/H264/stream.mpd',
};
export const PAUSE_PLAYER_MANUAL = 'PAUSE_PLAYER_MANUAL';
