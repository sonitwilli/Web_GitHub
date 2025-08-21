import {
  TRACKING_LOG_ID,
  TRACKING_SCREEN,
  trackingStoreKey,
} from '@/lib/constant/tracking';
import { TrackingParams } from '@/lib/tracking/tracking-types';
import { RouteInfo } from '@/pages/_app';
export const generateId = () => {
  let id = '';
  const possible = 'ABCDEF0123456789';

  for (let i = 0; i < 16; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
};

export const generateIssueId = () => {
  // Ký tự đầu tiên cho web là 'W'
  const prefix = 'W';

  // 3 ký tự kế tiếp random từ 000-999, đảm bảo đủ 3 chữ số
  const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

  // Lấy timestamp hiện tại tính theo số giây kể từ đầu năm đến hiện tại
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const secondsSinceStartOfYear = Math.round(
    (now.getTime() - startOfYear.getTime()) / 1000,
  );
  const timePart = String(secondsSinceStartOfYear).padStart(8, '0');

  // Kết hợp các phần để tạo ra issueid
  return `${prefix}${randomPart}${timePart}`;
};

export const getAppLogId = (params: TrackingParams) => {
  return params.LogId || TRACKING_LOG_ID[params.Event!];
};

export const getScreen = (params: TrackingParams) => {
  return params.Screen || TRACKING_SCREEN[params.Event!];
};

export const fixedAppNames = [
  {
    path: '/xem-truyen-hinh',
    name: 'Truyền hình',
    id: 'truyen-hinh',
  },
  {
    path: '/xem-video',
    name: 'Xem Video',
    id: 'xem-video',
  },
  { path: '/su-kien', name: 'Sự kiện', id: 'su-kien' },
  {
    path: '/cong-chieu',
    name: 'Công chiếu',
    id: 'cong-chieu',
  },
  {
    path: '/gioi-thieu',
    name: 'Giới thiệu',
    id: 'gioi-thieu',
  },
  { path: '/dich-vu', name: 'Dịch vụ', id: 'dich-vu' },
  { path: '/mua-goi', name: 'Mua gói', id: 'mua-goi' },
  { path: '/bao-hanh', name: 'Bảo hành', id: 'bao-hanh' },
  {
    path: '/dieu-khoan-su-dung',
    name: 'Điều khoản sử dụng',
    id: 'dieu-khoan-su-dung',
  },
  {
    path: '/chinh-sach-va-quy-dinh',
    name: 'Chính sách và quy định',
    id: 'chinh-sach-va-quy-dinh',
  },
  {
    path: '/tai-khoan',
    name: 'Tài khoản',
    id: 'tai-khoan',
  },
  { path: '/tim-kiem', name: 'Tìm kiếm', id: 'tim-kiem' },
];

export const getAppInfo = (params: TrackingParams) => {
  const result = {
    AppName: '',
    AppId: '',
  };
  if (typeof window === 'undefined') {
    return result;
  }
  if (params.AppName && params.AppName !== 'dynamic') {
    result.AppName = params.AppName;
  }
  if (params.AppId && params.AppId !== 'dynamic') {
    result.AppId = params.AppId;
  }

  if (localStorage && localStorage.getItem('click-from') === 'btn-mua-goi') {
    result.AppName = 'Trang chủ';
    result.AppId = 'home';
  }

  if (sessionStorage.getItem('is_deep_link')) {
    result.AppName = 'DEEPLINK';
    result.AppId = 'DEEPLINK';
  }

  if (!result?.AppName) {
    result.AppName = localStorage.getItem(trackingStoreKey.APP_NAME) || '';
  }
  if (!result?.AppId) {
    result.AppId = localStorage.getItem(trackingStoreKey.APP_ID) || '';
  }

  return result || {};
};
export const setAppNameAppId = (routeTo: RouteInfo, routeFrom: RouteInfo) => {
  const appFound = checkAppNameAppId(routeTo);
  const oldAppFound = checkAppNameAppId(routeFrom);
  localStorage.setItem(
    trackingStoreKey.OLD_APP_NAME,
    oldAppFound?.appName || '',
  );
  localStorage.setItem(trackingStoreKey.OLD_APP_ID, oldAppFound?.appId || '');
  localStorage.setItem(trackingStoreKey.APP_NAME, appFound?.appName || '');
  localStorage.setItem(trackingStoreKey.APP_ID, appFound?.appId || '');
};

export const checkAppNameAppId = (route: RouteInfo) => {
  if (typeof localStorage !== 'undefined') {
    let appName = '';
    let appId = '';
    let found = null;
    const navs = localStorage.getItem(trackingStoreKey.NAVBAR_LIST);
    const currentAppName = localStorage.getItem(trackingStoreKey.APP_NAME);
    const currentAppId = localStorage.getItem(trackingStoreKey.APP_ID);
    if (navs) {
      const pathname = window.location.pathname;
      console.log('--- TRACKING pathname', pathname);
      const allNavs = fixedAppNames.concat(JSON.parse(navs));
      if (pathname === '/' || pathname === '/trang/home') {
        found = { name: 'Trang chủ', id: 'home' };
      } else if (
        route?.params?.id &&
        route?.path?.includes('/xem-truyen-hinh/')
      ) {
        found = {
          name: 'Truyền hình',
          id: 'channel',
        };
      } else if (
        route?.params?.id &&
        route?.path?.includes('/xem-truyen-hinh/')
      ) {
        found = {
          name: 'Truyền hình',
          id: 'channel',
        };
      } else if (route?.path?.includes('/tim-kiem')) {
        found = {
          name: 'SEARCH',
          id: 'SEARCH',
        };
      } else if (route?.params?.id && route?.path?.includes('/trang/')) {
        found = allNavs.find((item) => item?.id === route?.params?.id) || {
          name: currentAppName,
          id: currentAppId,
        };
      } else if (currentAppName && currentAppId) {
        found = {
          name: currentAppName,
          id: currentAppId,
        };
      } else {
        found = fixedAppNames.find((item) => pathname.includes(item?.id));
      }
      appName = found?.name || 'Xem Video';
      appId = found?.id || 'xem-video';
      return { appName, appId };
    }
  }
};
