import tracking from '../tracking';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { TrackingParams } from '@/lib/tracking/tracking-types';
import { getPlayerParams } from '../utils/playerTracking';
import { getPlaybackParams } from './useTrackingPlayback';
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
  const playerParams = getPlayerParams();
  const playbackParams = getPlaybackParams();
  const params: TrackingParams = {
    Event: Event || 'Subscribed',
    ItemId: ItemId || '',
    ItemName: ItemName || '',
    Genre: Genre || '',
    is_recommend: is_recommend || '',
    SubMenuId: SubMenuId || '',
    RefItemId: RefItemId || '',
    ...playerParams,
    ...playbackParams,
  };
  tracking(params);
};

export const trackingLog512 = ({
  Event,
  ItemId,
  ItemName,
  Screen,
}: TrackingParams) => {
  // Log512 : EnterDetail
  const playerParams = getPlayerParams();
  const playbackParams = getPlaybackParams();
  const params: TrackingParams = {
    ...playerParams,
    Event: Event || 'EnterDetail',
    ItemId: ItemId || '',
    ItemName: ItemName || '',
    Screen: Screen || '',
    ...playbackParams,
  };
  tracking(params);
};
