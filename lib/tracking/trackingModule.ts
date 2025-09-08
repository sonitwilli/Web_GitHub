import tracking from '.';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { TrackingParams } from './tracking-types';
import { getPlayerParams } from '../utils/playerTracking';
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

export const trackingLog57 = ({ ItemId, ItemName }: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'EnterMainMenu',
    ItemId: ItemId || '',
    ItemName: ItemName || '',
  };
  tracking(params);
};

export const trackingLog59 = ({
  Event,
  ItemId,
  ItemName,
  Genre,
  is_recommend,
  SubMenuId,
  RefItemId,
}: TrackingParams) => {
  const params: TrackingParams = {
    Event: Event || 'Subscribed',
    ItemId: ItemId || '',
    ItemName: ItemName || '',
    Genre: Genre || '',
    is_recommend: is_recommend || '',
    SubMenuId: SubMenuId || '',
    RefItemId: RefItemId || '',
  };
  tracking(params);
};

export const trackingLog512 = ({ Event }: TrackingParams) => {
  // Log512 : EnterDetail
  const playerParams = getPlayerParams();
  console.log('playerParams 512', playerParams);

  const params: TrackingParams = {
    ...playerParams,
    Event: Event || 'EnterDetail',
  };
  tracking(params);
};
