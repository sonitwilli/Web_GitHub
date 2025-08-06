import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DefaultLayout from '@/lib/layouts/Default';
import {
  PaymentResultCard,
  PaymentResultDetail,
} from '@/lib/components/payment/PaymentResultCard';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { trackingPaymentObj } from './thanh-cong';

function numberWithCommas(x: string | number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
    plan_name: null,
    promotion: null,
    coupon: {
      code: null,
      value: null,
      discount_amount: null,
      coupon_type: null,
    },
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
      text.plan_name = obj?.payment?.plan_name || null;
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
      text.coupon = obj?.payment?.data?.coupon || null;
    }
  }
  return text;
};

const PaymentFailPage: React.FC = () => {
  const router = useRouter();
  const [details, setDetails] = useState<PaymentResultDetail[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { msg, error, error_message, message } = router.query;
    const errorMessage =
      msg ||
      error ||
      error_message ||
      message ||
      'Quý khách vui vòng thử lại hoặc gọi Tổng đài 19006600 để được hỗ trợ';
    setErrorMessage(errorMessage as string);
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
            ? `${numberWithCommas(text.packagePrice)}đ`
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
    ]);
  }, [router.isReady, router.query]);

  const handleRetry = useCallback(() => {
    const backLinkBuy = localStorage.getItem(trackingStoreKey.BACK_LINK_BUY);
    if (backLinkBuy) {
      router.push(backLinkBuy);
    } else {
      router.push('/mua-goi');
    }
  }, [router]);

  return (
    <DefaultLayout>
      <div className="min-h-[100vh] flex items-center justify-center">
        <PaymentResultCard
          status="error"
          title="Thanh toán thất bại"
          message={errorMessage as string}
          details={details}
          buttonText="Thử lại"
          onButtonClick={handleRetry}
        />
      </div>
    </DefaultLayout>
  );
};

export default PaymentFailPage;
