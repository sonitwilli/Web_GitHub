import tracking from '.';
import { TrackingParams } from './tracking-types';

export const trackingModifyProfileLog103 = ({
  Screen,
  Event,
  ItemId,
  ItemName,
  Status,
}: TrackingParams) => {
  const params: TrackingParams = {
    Event,
    Screen,
    ItemId,
    ItemName,
    Status,
  };
  tracking(params);
};

export const trackingEnterProfileLog101 = ({
  Status,
}: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'AccessProfile',
    Status,
  };
  tracking(params);
};

export const trackingRegisteredProfileLog102 = ({
  ItemId,
  ItemName,
}: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'RegisteredProfile',
    ItemId,
    ItemName,
  };
  tracking(params);
};

export const trackingLoginProfileLog104 = ({
  Status,
  ItemName,
  isLandingPage
}: TrackingParams) => {
  const params: TrackingParams = {
    Event: 'Login',
    Status,
    ItemName,
    isLandingPage
  };
  tracking(params);
};