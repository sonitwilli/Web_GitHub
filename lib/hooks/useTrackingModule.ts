import tracking from '../tracking';
import { TrackingParams } from '../tracking/tracking-types';

export const trackingAccessItemLog108 = ({
  Event,
  Url,
  Screen,
  ItemId,
}: TrackingParams) => {
  // Log108 : AccessItem | AccessApp | DeactivateAccount
  try {
    if (typeof window === 'undefined') {
      return;
    }
    return tracking({
      LogId: '108',
      Event: Event || 'AccessItem',
      Url: Url || '',
      Screen: Screen || '',
      ItemId: ItemId || '',
    });
  } catch {}
};

export const trackingLog198 = ({
  Event,
  ItemId,
  ItemName,
  Status,
  SubMenuId,
}: TrackingParams) => {
  // Log198 : - ModifiedInformation | DeactivateSuccess
  try {
    if (typeof window === 'undefined') {
      return;
    }
    return tracking({
      LogId: '198',
      Event: Event || 'ModifiedInformation',
      ItemId: ItemId || '',
      ItemName: ItemName || '',
      Status: Status || '',
      SubMenuId: SubMenuId || '',
    });
  } catch {}
};

export const trackingLog180 = () => {
  // Log180 : Logout
  try {
    if (typeof window === 'undefined') {
      return;
    }
    return tracking({
      LogId: '180',
      Event: 'Logout',
    });
  } catch {}
};

export const trackingLog186 = ({
  Screen,
  ItemId,
  ItemName,
}: TrackingParams) => {
  // Log186 : AccessPage
  try {
    if (typeof window === 'undefined') {
      return;
    }
    return tracking({
      LogId: '186',
      Event: 'AccessPage',
      AppId: 'SUBSCRIPTION',
      AppName: 'SUBSCRIPTION',
      Screen: Screen || '',
      ItemId: ItemId || '',
      ItemName: ItemName || '',
    });
  } catch {}
};

export const trackingLog187 = ({
  ItemId,
  ItemName,
  Screen,
}: TrackingParams) => {
  // Log186 : OnClick
  try {
    if (typeof window === 'undefined') {
      return;
    }
    return tracking({
      LogId: '187',
      Event: 'OnClick',
      AppId: 'SUBSCRIPTION',
      AppName: 'SUBSCRIPTION',
      ItemId: ItemId || '',
      ItemName: ItemName || '',
      Screen: Screen || '',
    });
  } catch {}
};

export const trackingLog188 = ({
  ItemId,
  ItemName,
  Screen,
  ErrCode,
  ErrMessage,
}: TrackingParams) => {
  // Log186 : OnClick
  try {
    if (typeof window === 'undefined') {
      return;
    }
    return tracking({
      LogId: '187',
      Event: 'UnsubcribePackage',
      AppId: 'SUBSCRIPTION',
      AppName: 'SUBSCRIPTION',
      ItemId: ItemId || '',
      ItemName: ItemName || '',
      Screen: Screen || '',
      ErrCode: ErrCode || '',
      ErrMessage: ErrMessage || '',
    });
  } catch {}
};
