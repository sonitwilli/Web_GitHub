import tracking from '../tracking';
import { TrackingParams } from '../tracking/tracking-types';
import { getPlayerParams } from '../utils/playerTracking';

const getPaymentTrackingData = () => {
  return {
    Method: '',
    PromoCode: '',
    MonthPrepaid: '',
    Price: '',
    function_session: '',
  };
};

export const trackingRegisterPaymentLog417 = ({
  Status,
  ErrCode,
  ErrMessage,
  Event,
}: TrackingParams) => {
  // Log417: RegisteredSuccess | RegisteredFailed
  // Log141: EnrollSuccess | EnrollFailed
  try {
    if (typeof window === 'undefined') {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerParams: any = getPlayerParams();
    const paymentParams = getPaymentTrackingData();
    const isTvod = playerParams.FType === '2';
    let LogId = '417';
    Event = Status === 'Success' ? 'RegisteredSuccess' : 'RegisteredFailed';
    if (isTvod) {
      LogId = '141';
      Event = Status === 'Success' ? 'EnrolledSuccess' : 'EnrolledFailed';
    }
    tracking({
      LogId,
      Event,
      ErrCode,
      ErrMessage,
      ...playerParams,
      ...paymentParams,
    });
  } catch {}
};

export const trackingCancelExtraRegisterLog418 = ({
  ErrCode,
  ErrMessage,
}: TrackingParams) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const paymentParams = getPaymentTrackingData();
    tracking({
      LogId: '418',
      Event: 'CancelExtraRegister',
      ErrCode,
      ErrMessage,
      ...playerParams,
      ...paymentParams,
    });
  } catch {}
};

export const trackingAccessPageLog420 = ({ Event }: TrackingParams) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const playerParams = getPlayerParams();
    const paymentParams = getPaymentTrackingData();
    tracking({
      LogId: '420',
      Event,
      ...playerParams,
      ...paymentParams,
    });
  } catch {}
};
