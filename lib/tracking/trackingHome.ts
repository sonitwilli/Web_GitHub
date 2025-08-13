import tracking from '.';
import { trackingStoreKey } from '@/lib/constant/tracking';
import {
  TrackingAppId,
  TrackingAppName,
  TrackingParams,
} from './tracking-types';
export const trackingChangeModuleLog18 = () => {
  const appName = localStorage.getItem(trackingStoreKey.APP_NAME) || '';
  const appId = localStorage.getItem(trackingStoreKey.APP_ID) || '';
  const oldAppName = localStorage.getItem(trackingStoreKey.OLD_APP_NAME) || '';
  const oldAppId = localStorage.getItem(trackingStoreKey.OLD_APP_ID) || '';
  const params: TrackingParams = {
    Event: 'ChangeModule',
    ItemName: appName,
    ItemId: appId,
    AppName: oldAppName as TrackingAppName,
    AppId: oldAppId as TrackingAppId,
  };
  tracking(params);
};
