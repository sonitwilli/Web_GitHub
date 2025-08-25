/* eslint-disable @typescript-eslint/ban-ts-comment */
import tracking from '../tracking';
import { getPlayerParams } from '../utils/playerTracking';
import { TrackingParams } from '../tracking/tracking-types';

export const trackingClickLinkLog190 = ({
  Url,
  Screen,
  LogId,
  Event,
}: TrackingParams) => {
  // Log190 : ClickLinkLivechat
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    /*@ts-ignore*/
    return tracking({
      LogId,
      Event,
      Screen,
      Url,
      ...playerParams,
    });
  } catch {}
};
