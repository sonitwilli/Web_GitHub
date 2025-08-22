import tracking from '.';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { TrackingParams } from './tracking-types';
export const trackingAccessLog50 = () => {
  const appName = localStorage.getItem(trackingStoreKey.APP_NAME) || '';
  const appId = localStorage.getItem(trackingStoreKey.APP_ID) || '';
  const oldAppName = localStorage.getItem(trackingStoreKey.OLD_APP_NAME) || '';
  const oldAppId = localStorage.getItem(trackingStoreKey.OLD_APP_ID) || '';
  if (appName !== oldAppName || appId !== oldAppId) {
    const params: TrackingParams = {
      Event: 'Access',
    };
    tracking(params);
  }
};
