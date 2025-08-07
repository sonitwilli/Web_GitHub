import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import DefaultLayout from '@/lib/layouts/Default';
import { LuLoaderCircle } from 'react-icons/lu';

const PaymentPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    // Get all current URL parameters
    const currentQuery = router.query;

    // Check for error conditions or failure indicators
    const hasError =
      currentQuery.error ||
      currentQuery.error_code ||
      currentQuery.error_message ||
      currentQuery.msg ||
      currentQuery.status_code === '0' ||
      currentQuery.status_code === '-1' ||
      currentQuery.result_code === '0' ||
      currentQuery.result_code === '-1';

    // If there's an error, redirect to failure page with all current parameters
    if (hasError) {
      router.push({
        pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
        query: currentQuery,
      });
      return;
    }

    // If no specific error but we're on the main payment page,
    // we might want to redirect to failure as a fallback
    // or handle other logic here
    if (Object.keys(currentQuery).length > 0) {
      // Check if this is a payment callback that should be processed
      const isPaymentCallback =
        currentQuery.id ||
        currentQuery.method ||
        currentQuery.transId ||
        currentQuery.trans_id;

      if (isPaymentCallback) {
        // Redirect to the dynamic payment processing page
        router.push({
          pathname: `/mua-goi/dich-vu/thanh-toan/${
            currentQuery.id || currentQuery.method || 'default'
          }`,
          query: currentQuery,
        });
      } else {
        // If no clear payment method, redirect to failure
        router.push({
          pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
          query: currentQuery,
        });
      }
    } else {
      // If no parameters at all, redirect to failure with default message
      router.push({
        pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
        query: {
          status_code: '0',
          msg: 'Quý khách vui vòng thử lại hoặc gọi Tổng đài 19006600 để được hỗ trợ',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  // Show loading while redirecting
  return (
    <DefaultLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LuLoaderCircle
            className="animate-spin text-fpl mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PaymentPage;
