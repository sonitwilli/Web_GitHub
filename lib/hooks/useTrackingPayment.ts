import { trackingStoreKey } from '../constant/tracking';
import tracking from '../tracking';
import { TrackingParams } from '../tracking/tracking-types';

const getPlayerParams = () => {
  const dataTrackingPlayerForPayment = localStorage.getItem(
    trackingStoreKey.DATA_TRACKING_PLAYER_FOR_PAYMENT,
  );
  const playerParams = JSON.parse(dataTrackingPlayerForPayment || '{}');
  return playerParams;
};
const getPaymentTrackingData = () => {
  const playerParams = getPlayerParams();
  const paymentData = JSON.parse(
    localStorage.getItem('payment_tracking') || '{}',
  );
  const functionSession = localStorage.getItem(
    trackingStoreKey.FUNCTION_SESSION,
  );
  return {
    Method: paymentData?.payment?.payment_method || '',
    PromoCode: paymentData?.payment?.data?.coupon?.code || '',
    MonthPrepaid: paymentData?.payment?.month_prepaid || '',
    Price: paymentData?.payment?.data?.coupon?.price || '',
    function_session: functionSession || '',
    ItemId: playerParams?.ItemId || '',
    RefItemId: playerParams?.ItemId || '',
    ItemName: paymentData?.payment?.data?.plan_id || '',
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
    console.log('---PAYMENT trackingRegisterPaymentLog417', playerParams);

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
    const paymentParams = getPaymentTrackingData();
    tracking({
      LogId: '418',
      Event: 'CancelExtraRegister',
      ErrCode,
      ErrMessage,
      ...paymentParams,
    });
  } catch {}
};

export const trackingAccessPageLog420 = ({ Event }: TrackingParams) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const paymentParams = getPaymentTrackingData();
    tracking({
      LogId: '420',
      Event,
      ...paymentParams,
    });
  } catch {}
};
