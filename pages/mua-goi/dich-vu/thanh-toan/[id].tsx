import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  PaymentResultCard,
  PaymentResultDetail,
} from '@/lib/components/payment/PaymentResultCard';
import DefaultLayout from '@/lib/layouts/Default';
import {
  PAYMENT_HUB_CONFIG,
  PAYMENT_METHODS,
} from '@/lib/constant/paymentMethods';
import { checkTransactionStatusApi } from '@/lib/api/payment';
import { trackingPaymentObj } from './thanh-cong';
import { trackingRegisterPaymentLog417 } from '@/lib/hooks/useTrackingPayment';

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
      text.packageName = obj?.payment?.name || null;
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
        (query?.transaction_id as string) ||
        (query?.orderId as string) ||
        (query?.order_id as string) ||
        obj?.payment?.trans_id ||
        null;
      text.plan_name = obj?.payment?.plan_name || null;
    }
  }
  return text;
};

const PendingPaymentPage: React.FC = () => {
  const router = useRouter();
  const [warningText, setWarningText] = useState(
    'Quá trình thanh toán đang được thực hiện. Vui lòng không thoát khỏi màn hình này cho đến khi giao dịch hoàn tất.',
  );
  const [timeout, setTimeoutState] = useState(false);
  const [details, setDetails] = useState<PaymentResultDetail[]>([]);
  const [transId, setTransId] = useState<string | null>(null);

  const redirectUrl = useCallback(() => {
    let path = 'that-bai';
    const {
      id,
      status_code,
      result_code,
      status,
      errorCode,
      resultCode,
      payment_status,
      error_code,
    } = router.query;
    if (status_code === '-2') {
      return;
    }

    switch (id) {
      case 'airpay':
        if (parseInt(result_code as string) === 100) {
          path = 'thanh-cong';
        }

        if (parseInt(status_code as string) === 1) {
          path = 'thanh-cong';
        }
        break;

      case 'credit_napas':
        if ((status_code && status_code === '1') || status === 'success') {
          path = 'thanh-cong';
        }
        break;

      case 'momo_walle':
        if (
          parseInt(errorCode as string) === 0 ||
          parseInt(resultCode as string) === 0 ||
          parseInt(resultCode as string) === 9000
        ) {
          path = 'thanh-cong';
        }
        break;

      case 'viettel_pay':
        if (error_code === '00' && payment_status === '1') {
          path = 'thanh-cong';
        }
        break;

      case 'zalo_pay':
      case 'zalo_pay_mobile':
        if (status_code === '1') {
          path = 'thanh-cong';
        }
        break;

      default:
        if (status_code === '1') {
          path = 'thanh-cong';
        }
    }
    router.push({
      pathname: `/mua-goi/dich-vu/thanh-toan/${path}`,
      query: {
        id,
        ...router.query,
      },
    });
  }, [router]);
  // Extract details from localStorage and query
  useEffect(() => {
    if (!router.isReady) return;
    redirectUrl();
    const text = getPaymentDetails(router.query);
    setTransId(text.transId as string | null);
    setDetails([
      { label: 'Tài khoản', value: text.account as string | null },
      { label: 'Dịch vụ', value: text.serviceName as string | null },
      { label: 'Gói dịch vụ', value: text.packageName as string | null },
      {
        label: 'Giá gói',
        value:
          typeof text.packagePrice === 'string' ||
          typeof text.packagePrice === 'number'
            ? `${numberWithCommas(text.packagePrice)} VNĐ`
            : null,
      },
      { label: 'Thời hạn gói', value: text.duration as string | null },
      { label: 'Mã giao dịch', value: text.transId as string | null },
      {
        label: 'Mã giảm giá',
        value:
          text.coupon?.coupon_type === 'percentMoney' ||
          text.coupon?.coupon_type === 'money'
            ? `${numberWithCommas(text.coupon?.discount_amount || 0)} đ`
            : null,
      },
    ]);
  }, [router.isReady, router.query, redirectUrl]);

  // Polling logic (simulate startChecking)
  useEffect(() => {
    if (!router.isReady || !transId) return;
    const countDownDate = Date.now() + 300000; // 5 minutes
    let timeoutReached = false;
    const methodConfig = PAYMENT_METHODS.find(
      (item) => item.key === router.query.id,
    );
    const paymentGatewayCode =
      router.query.payment_gateway_code?.toString() || '';
    const checkUrl = paymentGatewayCode
      ? PAYMENT_HUB_CONFIG.apiCheck
      : methodConfig?.checkTransactionUrl;
    const poll = async () => {
      const now = Date.now();
      const distance = countDownDate - now;
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (minutes === 0 && seconds === 0 && !timeoutReached) {
        setWarningText(
          'Giao dịch đang được xử lý, vui lòng thử lại sau ít phút hoặc liên hệ 19006600 để được hỗ trợ.',
        );
        setTimeoutState(true);
        timeoutReached = true;
        return;
      }
      if (distance > 0 && checkUrl) {
        try {
          const res = await checkTransactionStatusApi(checkUrl, {
            trans_id: transId || '',
            payment_gateway_code: paymentGatewayCode,
          });
          if (res.data.msg_data) {
            if (
              res.data.msg_data?.status_code?.toString() === '1' ||
              res.data.msg_data?.status_code?.toString() === 'SUCCESS'
            ) {
              router.push({
                pathname: '/mua-goi/dich-vu/thanh-toan/thanh-cong',
                query: {
                  method: router.query.method,
                  transId: transId,
                  status_code: 1,
                },
              });
            } else if (
              res.data.msg_data?.status_code?.toString() === '0' ||
              res.data.status === 0 ||
              res.data.msg_data?.status_code?.toString() === 'ERROR'
            ) {
              router.push({
                pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
                query: {
                  method: router.query.method,
                  status_code: 0,
                  transId: transId,
                },
              });
            }
          } else if (
            res?.data?.status === 0 &&
            res?.data?.msg_code === 'error'
          ) {
            router.push({
              pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
              query: {
                method: router.query.method,
                status_code: 0,
                transId: transId,
              },
            });
          }
          trackingRegisterPaymentLog417({ Event: 'Pending' });
        } catch (error) {
          console.log('checkTransactionStatusApi error', error);
          router.push({
            pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
            query: {
              method: router.query.method,
              status_code: 0,
              transId: transId,
            },
          });
        }
      }

      if (distance < 1000 && !timeoutReached) {
        setWarningText(
          'Giao dịch đang được xử lý, vui lòng thử lại sau ít phút hoặc liên hệ 19006600 để được hỗ trợ.',
        );
        setTimeoutState(true);
        timeoutReached = true;
      }
    };

    const id = setInterval(poll, 5000);
    return () => {
      clearInterval(id);
    };
  }, [router.isReady, transId, router]);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <DefaultLayout>
      <div className="min-h-[100vh] flex items-center justify-center">
        <PaymentResultCard
          status="pending"
          title="Đang thực hiện..."
          message={warningText}
          details={details}
          buttonText={timeout ? 'Về trang chủ' : undefined}
          onButtonClick={timeout ? handleGoHome : undefined}
        />
      </div>
    </DefaultLayout>
  );
};

export default PendingPaymentPage;
