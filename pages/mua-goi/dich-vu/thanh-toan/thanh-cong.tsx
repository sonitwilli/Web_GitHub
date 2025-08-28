import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import DefaultLayout from '@/lib/layouts/Default';
import {
  PaymentResultCard,
  PaymentResultDetail,
} from '@/lib/components/payment/PaymentResultCard';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { trackingRegisterPaymentLog417 } from '@/lib/hooks/useTrackingPayment';

function numberWithCommas(x: string | number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
export interface trackingPaymentObj {
  account: string | null;
  serviceName: string | null;
  package: string | null;
  packagePrice: string | null;
  duration: string | null;
  transId: string | null;
  packageType: string | null;
  packageName: string | null;
  promotion: string | null;
  coupon: {
    code: string | null;
    value: number | null;
    discount_amount: number | null;
    coupon_type: string | null;
  } | null;
  plan_name: string | null;
}
const getPaymentDetails = (query: Record<string, unknown>) => {
  const text: trackingPaymentObj = {
    account: null,
    serviceName: 'Gói dịch vụ FPT Play',
    package: null,
    packagePrice: null,
    duration: null,
    transId: null,
    packageType: null,
    packageName: null,
    promotion: null,
    coupon: {
      code: null,
      value: null,
      discount_amount: null,
      coupon_type: null,
    },
    plan_name: null,
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    const obj = JSON.parse(localStorage.getItem('payment_tracking') || '{}');
    if (obj && Object.keys(obj).length) {
      text.account = obj?.payment?.data?.phone || null;
      text.package = obj?.payment?.package_name || null;
      text.packagePrice = obj?.payment?.data?.amount || null;
      text.duration = obj?.payment?.duration || null;
      text.packageType = obj?.payment?.package_type || null;
      text.packageName = obj?.payment?.package_name || null;
      text.coupon = obj?.payment?.data?.coupon || null;
      text.promotion =
        typeof obj?.payment?.promotion === 'string' ||
        typeof obj?.payment?.promotion === 'number'
          ? numberWithCommas(obj.payment.promotion) + ' VNĐ'
          : null;
      text.transId =
        (query?.transId as string) ||
        (query?.trans_id as string) ||
        (query?.reference_id as string) ||
        obj?.payment?.trans_id ||
        null;
    }
  }
  return text;
};

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const [details, setDetails] = useState<PaymentResultDetail[]>([]);

  useEffect(() => {
    if (!router.isReady) return;
    const text = getPaymentDetails(router.query);
    setDetails([
      { label: 'Tài khoản', value: text.account as string | null },
      { label: 'Dịch vụ', value: text.serviceName as string | null },
      { label: 'Gói dịch vụ', value: text.packageName as string | null },
      {
        label: 'Giá gói',
        value:
          typeof text.packagePrice === 'string' ||
          typeof text.packagePrice === 'number'
            ? `${numberWithCommas(text.packagePrice)} đ`
            : null,
      },
      {
        label: 'Mã giảm giá',
        value:
          text.coupon?.coupon_type === 'percentMoney' ||
          text.coupon?.coupon_type === 'money'
            ? `${numberWithCommas(text.coupon?.discount_amount || 0)} đ`
            : null,
      },
      {
        label: 'Thời hạn gói',
        value: text.duration as string | null,
      },
      { label: 'Mã giao dịch', value: text.transId as string | null },
    ]);
    trackingRegisterPaymentLog417({ Status: 'Success' });
  }, [router.isReady, router.query]);

  const linkBackDetail = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(trackingStoreKey.BACK_LINK_PLAY);
    }
    return null;
  }, []);

  const backToDetail = useCallback(() => {
    if (typeof window !== 'undefined') {
      const backLinkDetail = localStorage.getItem(
        trackingStoreKey.BACK_LINK_PLAY,
      );
      if (backLinkDetail) {
        router.push(backLinkDetail);
        localStorage.removeItem(trackingStoreKey.BACK_LINK_PLAY);
      }
    }
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <DefaultLayout>
      <div className="min-h-[100vh] flex items-center justify-center">
        <PaymentResultCard
          status="success"
          title="Thanh toán thành công!"
          message=""
          details={details}
          buttonText={linkBackDetail ? 'Xem ngay' : 'Về trang chủ'}
          onButtonClick={linkBackDetail ? backToDetail : handleGoHome}
        />
      </div>
    </DefaultLayout>
  );
};

export default PaymentSuccessPage;
