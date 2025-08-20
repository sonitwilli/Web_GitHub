/* eslint-disable @typescript-eslint/ban-ts-comment */
import { UAParser } from 'ua-parser-js';
import { TAB_ID, TYPE_PR } from '@/lib/constant/texts';
import { md5 } from './hash';
import {
  BlockItemType,
  BlockSlideItemType,
  PageMetaType,
} from '@/lib/api/blocks';
import moment from 'moment';

export const browserInfo = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  const tabId = sessionStorage.getItem(TAB_ID);
  const nAgt = navigator.userAgent;
  const majorVersion = parseInt(navigator.appVersion, 10);
  let browserName = navigator.appName;
  let fullVersion = '' + parseFloat(navigator.appVersion);
  let verOffset;

  if ((verOffset = nAgt.indexOf('OPR/')) !== -1) {
    browserName = 'Opera';
    fullVersion = nAgt.substring(verOffset + 4);
  } else if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
    browserName = 'Opera';
    fullVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf('Version')) !== -1) {
      fullVersion = nAgt.substring(verOffset + 8);
    }
  } else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
    browserName = 'Microsoft Internet Explorer';
    fullVersion = nAgt.substring(verOffset + 5);
  } else if ((verOffset = nAgt.indexOf('coc_coc_browser')) !== -1) {
    browserName = 'coc_coc_browser';
    fullVersion = nAgt.substring(verOffset + 16);
  } else if ((verOffset = nAgt.indexOf('Edg')) !== -1) {
    browserName = 'Edg';
    fullVersion = nAgt.substring(verOffset + 4);
  } else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
    browserName = 'Firefox';
    fullVersion = nAgt.substring(verOffset + 8);
  } else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
    browserName = 'Chrome';
    fullVersion = nAgt.substring(verOffset + 7);
  } else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
    browserName = 'Safari';
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf('Version')) !== -1) {
      fullVersion = nAgt.substring(verOffset + 8);
    }
  } else if ((verOffset = nAgt.indexOf('Netscape')) !== -1) {
    browserName = 'Netscape';
    fullVersion = nAgt.substring(verOffset + 9);
  }

  const str =
    'name=' +
    browserName +
    '&ver=' +
    fullVersion +
    '&majorVer=' +
    majorVersion +
    '&appName=' +
    navigator.appName +
    '&agent=' +
    nAgt +
    '&tabId=' +
    tabId;
  return md5(str);
};

export interface UserAgentType {
  ua?: string;
  browser?: {
    name?: string;
    version?: string;
  };
  engine?: { name?: string; version?: string };
  os?: {
    name?: string;
    version?: string;
  };
  device?: {
    model?: string;
    type?: string;
    vendor?: string;
  };
  cpu?: { architecture?: string };
}

export const getUserAgent = (): UserAgentType => {
  if (typeof window !== 'undefined') {
    try {
      const parser = new UAParser(window.navigator.userAgent);
      return parser.getResult();
    } catch {
      return {};
    }
  } else {
    return {};
  }
};

export const scaleImageUrl = ({
  imageUrl,
  width,
  height,
  notWebp,
}: {
  imageUrl?: string;
  width?: number;
  height?: number;
  notWebp?: boolean;
}) => {
  if (typeof window === 'undefined') return imageUrl;
  const queryParams = new URLSearchParams();
  if (height) queryParams.set('h', String(height));
  if (width) {
    queryParams.set('w', String(width));
  } else {
    let screenWidth =
      window?.innerWidth ||
      document?.documentElement?.clientWidth ||
      document?.body?.clientWidth ||
      1024;
    if (screenWidth > 768) screenWidth = Math.floor((screenWidth * 2) / 3);
    queryParams.set('w', String(screenWidth));
  }

  queryParams.set('c', '0');

  if (!notWebp) {
    const device = getUserAgent();
    if (window && window.navigator) {
      const browserName = device?.browser?.name;
      if (
        browserName?.toUpperCase().includes('CHROME') ||
        browserName?.toUpperCase().includes('FIREFOX') ||
        browserName?.toUpperCase().includes('OPERA')
      ) {
        queryParams.set('fmt', 'webp');
      }
    }
  }
  return `${imageUrl}?${queryParams}`;
};

export const scalePosterOverlayUrl = ({
  imageUrl,
  width,
  height,
  notWebp,
}: {
  imageUrl?: string;
  width?: number;
  height?: number;
  notWebp?: boolean;
}) => {
  if (typeof window === 'undefined') return imageUrl;
  const queryParams = new URLSearchParams();
  if (height) queryParams.set('h', String(height));
  if (width) {
    queryParams.set('w', String(width));
  }

  if (!notWebp) {
    const device = getUserAgent();
    if (window && window.navigator) {
      const browserName = device?.browser?.name;
      if (
        browserName?.toUpperCase().includes('CHROME') ||
        browserName?.toUpperCase().includes('FIREFOX') ||
        browserName?.toUpperCase().includes('OPERA')
      ) {
        queryParams.set('fmt', 'webp');
      }
    }
  }
  return `${imageUrl}?${queryParams}`;
};

export const thumbnailUrl = ({
  // NOTE: hàm này ưu tiên metaBlock
  block,
  blockData,
  metaBlock,
}: {
  block: BlockItemType;
  blockData: BlockSlideItemType;
  metaBlock?: PageMetaType;
}) => {
  const blockType = metaBlock?.block_style
    ? metaBlock?.block_style
    : block?.block_type || block?.type;
  switch (blockType) {
    case 'highlight':
    case 'category':
    case 'horizontal_highlight':
      return scaleImageUrl({
        imageUrl:
          blockData?.image?.landscape || blockData?.image?.landscape_title,
      });
    case 'horizontal_banner_with_title':
      return scaleImageUrl({
        imageUrl:
          blockData?.image?.landscape_title || blockData?.image?.landscape,
      });
    case 'vertical_slider_small':
    case 'vertical_slider_medium':
      return scaleImageUrl({
        imageUrl:
          blockData?.image?.portrait || blockData?.image?.portrait_mobile,
        width: 300,
      });
    case 'feature_horizontal_slider':
    case 'horizontal_slider_hyperlink':
      return scaleImageUrl({
        imageUrl:
          blockData?.image?.landscape_title || blockData?.image?.landscape,
        width: 450,
      });
    case 'horizontal_slider':
    case 'horizontal_slider_small':
    case 'horizontal_slider_with_background':
      return scaleImageUrl({
        imageUrl:
          blockData?.image?.landscape_title ||
          blockData?.image?.landscape ||
          blockData?.thumb ||
          blockData?.small_image,
        width: 300,
      });
    case 'horizontal_highlight_without_background':
      if (
        typeof window !== 'undefined' &&
        window.location.href.includes('/xem-truyen-hinh/')
      ) {
        return scaleImageUrl({
          imageUrl:
            blockData?.image?.landscape_title ||
            blockData?.image?.landscape ||
            blockData?.thumb ||
            blockData?.small_image,
          width: 300,
        });
      } else {
        return scaleImageUrl({
          imageUrl:
            blockData?.image?.landscape || blockData?.image?.landscape_title,
        });
      }
    default:
      return scaleImageUrl({
        imageUrl:
          blockData?.image?.portrait || blockData?.image?.portrait_mobile,
      });
  }
};

export const viToEn = (string: string): string => {
  if (typeof string === 'undefined' || !string || !string.toLowerCase) {
    return '';
  }
  return string
    .trim()
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
    .replace(/\u02C6|\u0306|\u031B/g, '')
    .replace(
      /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'|"|&|#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      '',
    )
    .replace(/ + /g, ' ')

    .replace(new RegExp(' ', 'g'), '-')
    .trim();
};

export const createLink = ({
  data,
  type,
}: {
  data: BlockSlideItemType;
  type: string;
}) => {
  if (!data) return '/';
  // const previousPageId = getPageId()

  if (data?.type?.toUpperCase() === 'EVENTTV') {
    // Sự kiện Dẫn kênh
    if (data?.highlight_id) {
      let url = `/su-kien/${viToEn(data.title_vie || data.title || '')}-${
        data?.highlight_id
      }`;
      if (type) {
        url = `${url}?event=${data.type}&type=${type}`;
      }
      return url;
    } else {
      let url = `/su-kien/${viToEn(data.title_vie || data.title || '')}-${
        data?._id
      }`;
      if (type) {
        url = `${url}?event=${data.type}&type=${type}`;
      }
      return url;
    }
  } else if (data?.type?.toUpperCase() === 'EVENT') {
    if (data?.is_premier === '1') {
      // Cong chieu
      if (data?.highlight_id) {
        let url = `/cong-chieu/${viToEn(data.title_vie || data.title || '')}-${
          data?.highlight_id
        }`;
        if (type) {
          url = `${url}?type=${type}`;
        }
        return url;
      } else {
        let url = `/cong-chieu/${viToEn(data.title_vie || data.title || '')}-${
          data?._id
        }`;
        if (type) {
          url = `${url}?type=${type}`;
        }
        return url;
      }
    } else if (data?.is_premier === '0') {
      // FPT Live
      if (data?.highlight_id) {
        let url = `/su-kien/${viToEn(data.title_vie || data.title || '')}-${
          data?.highlight_id
        }`;
        if (type) {
          url = `${url}?event=${data.type}&type=${type}`;
        }
        return url;
      } else {
        let url = `/su-kien/${viToEn(data.title_vie || data.title || '')}-${
          data?._id
        }`;
        if (type) {
          url = `${url}?event=${data.type}&type=${type}`;
        }
        return url;
      }
    }
  } else if (data?.type?.toUpperCase() === 'LIVETV') {
    if (data?._id) {
      // let url = `/su-kien/${viToEn(data.title_vie || data.title || '')}-${
      //   data?._id
      // }`;
      // if (type) {
      //   url = `${url}?type=${type}`;
      // }
      return `/xem-truyen-hinh/${data?._id}`;
      // return url;
    } else {
      return `/xem-truyen-hinh/${data?.id}`;
    }
  } else if (data?.is_trailer && data?.slug_id) {
    // create link for VOD
    return `/xem-video/${data?.slug_id}/tap-${data?._id || 0 + 1}`;
  } else if (data?.type?.toUpperCase() === 'TVCHANNEL') {
    // create link for tv channel
    return `/xem-truyen-hinh/${
      data?.referred_object_id || data?._id || data?.id
    }`;
  } else if (data?.type === 'page') {
    return `/trang/${data?.id}`;
  } else if (data.website_url && data.website_url.includes('/livetv/')) {
    return `/xem-truyen-hinh/${data._id || data.id}`;
  } else if (data?.type === 'vod_playlist') {
    return `/playlist/${viToEn(data.title_vie || data.title || '')}-${
      data?._id || data?.id
    }`;
  } else if (data?.type === 'category_vod') {
    return `/block/category_vod/${viToEn(data.title_vie || data.title || '')}-${
      data?._id || data?.id
    }`;
  } else if (data?.type === 'people') {
    return `/dien-vien/${viToEn(data.title_vie || data.title || '')}-${
      data?.referred_object_id || data?._id || data?.id
    }`;
  } else {
    return `/xem-video/${viToEn(data.title_vie || data.title || '')}-${
      data?.referred_object_id || data?._id || data?.id
    }`;
  }
};

function replaceWeekdays({ text }: { text: string }) {
  const weekdays: {
    [index: string]: string;
  } = {
    Monday: 'Thứ Hai',
    Tuesday: 'Thứ Ba',
    Wednesday: 'Thứ Tư',
    Thursday: 'Thứ Năm',
    Friday: 'Thứ Sáu',
    Saturday: 'Thứ Bảy',
    Sunday: 'Chủ Nhật',
  };

  return text.replace(
    /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g,
    (match) => weekdays[match],
  );
}

export const parseTimeEvent = (timestamp: number) => {
  moment.locale('vi');
  let output = '';
  const current = moment();
  const currentDay = moment().startOf('day');
  const timestampDay = moment(timestamp * 1000);
  /*@ts-ignore*/
  const timeStartOfDay = moment.unix(timestamp, 'YYYY-MM-DD')?.startOf('day');
  const dayDiff = moment.duration(timeStartOfDay.diff(currentDay))?.asDays();

  if (timestampDay.isSame(current, 'day')) {
    output = timestampDay.format('[Hôm nay lúc] HH:mm');
  } else if (dayDiff == 1) {
    output = timestampDay.format('[Ngày mai lúc] HH:mm');
  } else if (dayDiff <= 6) {
    output = replaceWeekdays({
      text: capitalizeFirstTwoWords(timestampDay.format('dddd [lúc] HH:mm')),
    });
  } else {
    output = timestampDay.format('DD/MM [lúc] HH:mm');
  }

  return output;
};

function capitalizeFirstTwoWords(inputString: string) {
  const words = inputString.split(' ');
  if (words.length >= 2) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    words[1] = words[1].charAt(0).toUpperCase() + words[1].slice(1);
  }
  return words.join(' ');
}

export const loadJsScript = ({
  src,
  id,
  cb,
}: {
  src?: string;
  id?: string;
  cb?: () => void;
}) => {
  if (!src) {
    return;
  }
  if (!id) {
    return;
  }
  const isExisted = document.getElementById(id);
  if (isExisted) {
    if (cb) cb();
    return;
  }
  const scriptElm = document.createElement('script');
  scriptElm.src = src;
  scriptElm.id = id || `script_${new Date().getTime().toString()}`;
  scriptElm.type = 'text/javascript';
  if (document) {
    document.head.appendChild(scriptElm);
  }
  scriptElm.onload = () => {
    if (cb) cb();
  };
};

export const loadCssFile = ({ src, id }: { src?: string; id?: string }) => {
  if (!src) {
    return;
  }
  if (!id) {
    return;
  }
  const isExisted = document.getElementById(id);
  if (isExisted) {
    return;
  }
  const link = document.createElement('link');
  link.href = src;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.id = id;

  if (document) {
    document.head.appendChild(link);
  }
};

export const generateId = () => {
  let id = '';
  const possible = 'ABCDEF0123456789';

  for (let i = 0; i < 16; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
};

export const checkActive = (path: string) => {
  if (typeof window === 'undefined') return false;
  if (
    window.location.pathname === '/' ||
    window.location.pathname.includes('trang/home') ||
    window.location.pathname.includes('trang/home-kids')
  ) {
    return (
      new RegExp(path, 'i').test('trang/home') ||
      new RegExp(path, 'i').test('trang/home-kids')
    );
  } else if (window.location.pathname.includes('xem-truyen-hinh')) {
    return new RegExp(path, 'i').test('trang/channel');
  } else {
    return '';
  }
};

export const loadJsManual = ({
  src,
  id,
  cb,
}: {
  src: string;
  id: string;
  cb?: () => void;
}) => {
  if (!src) {
    return;
  }
  const isExisted = document.getElementById(id);
  if (isExisted) {
    return;
  }
  const scriptElm = document.createElement('script');
  scriptElm.src = src;
  scriptElm.id = id;
  scriptElm.type = 'text/javascript';
  if (document) {
    document.head.appendChild(scriptElm);
  }
  scriptElm.onload = () => {
    if (cb) cb();
  };
};

export function getPageId() {
  try {
    if (typeof window === 'undefined') {
      return '';
    }
    const profileType = localStorage.getItem(TYPE_PR) || '';
    const path = window.location.pathname;

    if (
      path === '/' ||
      path.includes('/trang/home') ||
      path.includes('/trang/home-kids')
    ) {
      return profileType === '2' ? 'home-kids' : 'home';
    }

    if (path.includes('/trang/')) {
      const categoryId = path.split('/trang/')[1]?.split('/')[0];
      return categoryId || '';
    }

    if (path.includes('/xem-truyen-hinh/')) {
      return 'channel';
    }

    if (path.includes('/tai-khoan')) {
      return 'library';
    }

    return '';
  } catch {}
}
