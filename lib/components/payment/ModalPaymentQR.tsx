import React, { useEffect, useRef, useState, useCallback } from 'react';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import { useRouter } from 'next/router';
import { checkTransactionStatusApi } from '@/lib/api/payment';
import { IoCloseCircle } from 'react-icons/io5';

// Stub tracking functions (replace with real ones if available)
const trackingCancelExtraRegister = () => {};
const trackingTimeOut = () => {};
const trackingGameTimeOut = () => {};
const trackingGameCancelExtraRegister = () => {};

interface Step {
  title: string;
  description: string;
  icon: string;
}

interface ModalPaymentQRProps {
  open: boolean;
  onClose: () => void;
  data: {
    text: {
      title?: string;
      steps?: Step[];
      backgroundPayment?: string;
      note?: string;
      checkUrl: string;
      returnUrl: string;
    };
    data: {
      qr_code?: string;
      qr_url?: string;
      value_display?: string;
      expire_time?: string;
      order_id?: string;
      trans_id?: string;
      payment_gateway_code?: string;
    };
  } | null;
  gateway?: string;
  isGamePayment?: boolean;
}

const ModalPaymentQR: React.FC<ModalPaymentQRProps> = ({
  open,
  onClose,
  data,
  gateway = '',
  isGamePayment = false,
}) => {
  const router = useRouter();
  const [countDown, setCountDown] = useState('10:00');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get QR code image
  const qrCodeImage =
    data?.data?.qr_code ?? data?.data?.qr_url ?? data?.data?.value_display;

  // Countdown and polling logic
  useEffect(() => {
    if (!open || !data) return;
    let expired = false;
    const expireTime =
      data.data?.expire_time && data.data?.expire_time !== '0'
        ? parseInt(data.data?.expire_time) * 1000
        : Date.now() + 600000; // 10 minutes default
    const { order_id, trans_id, payment_gateway_code } = data.data;
    const { checkUrl, returnUrl } = data.text;

    const updateCountdown = () => {
      const now = Date.now();
      const distance = expireTime - now;
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountDown(
        `${minutes < 10 ? '0' + minutes : minutes}` +
          ':' +
          `${seconds < 10 ? '0' + seconds : seconds}`,
      );
      if (minutes === 0 && seconds === 0 && !expired) {
        expired = true;
        if (isGamePayment) {
          trackingGameTimeOut();
        } else {
          trackingTimeOut();
        }
        handleClose();
      }
      if (distance < 1000) {
        handleClose();
      }
    };

    const pollStatus = async () => {
      const now = Date.now();
      const distance = expireTime - now;
      if (distance % 2 === 0) {
        const transactionId = order_id || trans_id;
        try {
          const res = await checkTransactionStatusApi(checkUrl, {
            trans_id: transactionId || '',
            payment_gateway_code: payment_gateway_code || '',
          });
          const msg_data = res.data?.msg_data;
          if (
            gateway === 'airpay' &&
            msg_data?.status_code &&
            msg_data?.status_code.toString() === '0'
          ) {
            handleClose();
            router.push({
              pathname: returnUrl,
              query: { status_code: 1, transId: transactionId },
            });
            return;
          }
          if (
            msg_data?.status_code &&
            (msg_data?.status_code.toString() === '1' ||
              msg_data?.status_code === 'SUCCESS')
          ) {
            handleClose();
            router.push({
              pathname: returnUrl,
              query: { status_code: 1, transId: transactionId },
            });
          } else if (
            (msg_data?.status_code &&
              parseInt(msg_data?.status_code.toString()) === 0) ||
            (res.data?.status && parseInt(res.data?.status.toString()) === 0) ||
            msg_data?.status_code === 'ERROR'
          ) {
            handleClose();
            router.push({
              pathname: returnUrl,
              query: {
                status_code: 0,
                transId: transactionId,
                error: msg_data?.message || res.data?.msg,
              },
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    intervalRef.current = setInterval(() => {
      updateCountdown();
      pollStatus();
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data]);

  const handleClose = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
    if (isGamePayment) {
      trackingGameCancelExtraRegister();
    } else {
      trackingCancelExtraRegister();
    }
  }, [onClose, isGamePayment]);

  if (!data) {
    return null;
  }

  return (
    <ModalWrapper
      open={open}
      onHidden={handleClose}
      isCustom={false}
      contentClassName="rounded-2xl bg-neutral-900 max-w-[860px] w-full m-2"
      overlayClassName="fixed inset-0 bg-black/60 flex justify-center md:items-center items-start z-[9999] p-4 overflow-y-auto"
      htmlOpenClassName="overflow-hidden mr-3"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <div className="flex items-stretch h-full flex-col md:flex-row flex-col p-4 sm:p-0">
        {/* Mobile close icon */}
        <button
          className="text-gray-500 float-right block md:hidden absolute right-2 top-2 z-10"
          onClick={handleClose}
          aria-label="Đóng"
        >
          <IoCloseCircle className="w-6 h-6 text-dim-gray" />
        </button>
        <div className="relative flex max-w-[100%] w-[377px] min-w-[275px] overflow-hidden md:max-w-[45%] md:min-w-[325px] md:w-full md:w-auto flex-shrink-0 mx-auto md:mx-0 mt-5 md:mt-0">
          {data.text.backgroundPayment && (
            <img
              src={data.text.backgroundPayment}
              alt=""
              className="w-full h-full object-cover rounded-l-2xl md:rounded-l-2xl md:rounded-none aspect-[377/380] rounded-2xl"
            />
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full">
            {qrCodeImage && (
              <img
                src={qrCodeImage}
                alt="QR Code"
                className="max-w-[160px] max-h-[160px] sm:max-w-[200px] sm:max-h-[200px] mx-auto"
              />
            )}
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center w-full text-sm">
            Thời gian còn: <b className="font-bold">{countDown}</b>
          </p>
        </div>
        <div className="flex-1 text-left relative">
          {/* Desktop close icon */}
          <button
            className="text-gray-500 float-right mt-0 hidden md:block absolute right-3 top-3 z-10 cursor-pointer"
            onClick={handleClose}
            aria-label="Đóng"
          >
            <IoCloseCircle className="w-6 h-6 text-dim-gray" />
          </button>
          <div className="text-2xl font-semibold text-white text-center mt-8 mb-4">
            {data.text.title}
          </div>
          <div className="pl-3">
            {data.text.steps?.map((step, idx) => (
              <div
                className="flex items-start mb-4 pl-6 mt-6:first"
                key={`payment-qr-${gateway}-step-${idx}`}
              >
                <img src={step.icon} alt="" className="w-12 h-12" />
                <div className="ml-4">
                  <h5 className="text-lg font-semibold text-white mb-1">
                    {step.title}
                  </h5>
                  <p className="text-white text-base">{step.description}</p>
                </div>
              </div>
            ))}
            {data.text.note && (
              <div className="italic text-sm text-white/60 pl-6 mb-2 font-light">
                {data.text.note}
              </div>
            )}
          </div>
          {/* VNPAY info (show if gateway is empty string) */}
          <div
            id="vn-pay-banks"
            className={gateway !== '' ? 'hidden' : 'mt-10'}
          >
            <div>
              Xem các ngân hàng hiện tại đang hỗ trợ thanh toán qua VNPAY
              <span className="text-orange-500 inline cursor-pointer ml-1 relative group">
                tại đây.
                <span className="absolute right-0 z-50 top-[-20%] opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-300 invisible">
                  <img
                    src="/images/payments/vn_pay/policy.png"
                    alt="VNPAY Banks"
                  />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* No data fallback */}
      {!data && <p className="text-gray-300">Không có dữ liệu</p>}
    </ModalWrapper>
  );
};

export default ModalPaymentQR;
