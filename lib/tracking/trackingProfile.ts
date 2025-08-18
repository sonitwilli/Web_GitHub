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