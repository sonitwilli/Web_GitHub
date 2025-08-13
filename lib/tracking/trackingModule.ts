import tracking from '.';
import { TrackingParams } from './tracking-types';
export const trackingAccessLog50 = () => {
  const params: TrackingParams = {
    Event: 'Access',
  };
  tracking(params);
};
