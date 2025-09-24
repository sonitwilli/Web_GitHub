import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import PaymentPlans from './PaymentPlans';
import PaymentMethods from './PaymentMethods';
import PaymentTotal from './PaymentTotal';
import {
  getPackagePlans,
  GetPackagePlansResponse,
  AllowPaymentGatewayInfo,
  Plan,
  CheckoutResponse,
  ConfigPaymentHub,
} from '@/lib/api/payment';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch, useAppSelector } from '@/lib/store';
import { CouponData } from './PaymentTotal';
import { useCheckout } from '@/lib/hooks/useCheckout';
import { isQRMethod } from '@/lib/utils/paymentService';
import ModalPaymentQR from './ModalPaymentQR';
import { LuLoaderCircle } from 'react-icons/lu';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import ModalCreditCard, { CreditCardData } from './ModalCreditCard';
import { trackingStoreKey } from '@/lib/constant/tracking';
import ModalConfirm from '@/lib/components/modal/ModalConfirm';
import { getPlayerParams } from '@/lib/utils/playerTracking';
import { TOKEN } from '@/lib/constant/texts';
const PaymentPackageDetail = () => {
  const currentUser = useSelector((state: RootState) => state.user.info);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [upsellPlans, setUpsellPlans] = useState<Plan[]>([]);
  const [upsellDescription, setUpsellDescription] = useState<string>('');
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [paymentHubConfig, setPaymentHubConfig] = useState<
    ConfigPaymentHub[] | null
  >(null);
  const [selectedPlan, setSelectedPlan] = useState<
    | (Plan & {
        allow_payment_gateways_info?: AllowPaymentGatewayInfo[];
      })
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [qrData, setQRData] = useState<{
    text: {
      checkUrl: string;
      returnUrl: string;
    };
    data: CheckoutResponse;
  } | null>(null);
  const [isSubmitCreditCard, setIsSubmitCreditCard] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLogged } = useAppSelector((state) => state.user);

  // Lấy danh sách phương thức thanh toán từ selectedPlan
  const paymentMethods = useMemo(() => {
    if (!selectedPlan) return [];
    return selectedPlan.allow_payment_gateways_info || [];
  }, [selectedPlan]);
  const [currentGateway, setCurrentGateway] = useState(
    paymentMethods[0]?.slug || '',
  );
  const [isOpenModalCreditCard, setIsOpenModalCreditCard] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: 'Thông báo',
    content: '',
    buttons: {
      accept: 'Đã hiểu',
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { checkout } = useCheckout({
    user: currentUser
      ? {
          user_id: String(currentUser.user_id ?? ''),
          user_email: currentUser.user_email,
          user_phone: currentUser.user_phone,
        }
      : { user_id: '' },
    plan: selectedPlan ?? ({} as Plan),
    currentPackage: (selectedPlan ?? {}) as Record<string, unknown>,
    currentGateway,
    formData,
    paymentHubConfig: paymentHubConfig || [],
  });
  useLayoutEffect(() => {
    const functionSession = new Date().getTime();
    localStorage.setItem(
      trackingStoreKey.FUNCTION_SESSION,
      functionSession.toString(),
    );
  }, []);
  useEffect(() => {
    const fetchPlans = async (packageId?: string) => {
      setLoading(true);
      try {
        const packageType = packageId || router.query.id;
        const res = await getPackagePlans({
          from_source: (router.query.from_source as string) || 'main',
          package_type: packageType as string,
        });
        const packageData = res.data as GetPackagePlansResponse;
        if (packageData.msg_code && packageData.msg_code === 'error') {
          let noticeContent = packageData.msg_content;
          if (
            packageData.msg_data_error &&
            packageData.msg_data_error.from_date &&
            packageData.msg_data_error.next_date
          ) {
            noticeContent += `<br><br>Ngày bắt đầu tính cước: ${packageData.msg_data_error.from_date}`;
            noticeContent += `<br>Chu kỳ cước tiếp theo: ${packageData.msg_data_error.next_date}`;
          }
          // show modal notice
          setModalContent({
            title: 'Thông báo',
            content: noticeContent || '',
            buttons: {
              accept: 'Đã hiểu',
            },
          });
          setIsModalOpen(true);
        }
        const data: Plan[] =
          (res.data as GetPackagePlansResponse)?.msg_data?.plans || [];
        setPlans(data);
        const upsellPlans =
          (res.data as GetPackagePlansResponse)?.msg_data?.upsell_plans || [];
        setUpsellPlans(upsellPlans as Plan[]);
        setUpsellDescription(
          (res.data as GetPackagePlansResponse)?.msg_data?.upsell_description ||
            '',
        );
        setSelectedPlan(data[0] || null);
        setCurrentGateway(
          data[0]?.allow_payment_gateways_info?.[0]?.slug || '',
        );
        setPaymentHubConfig(
          (res.data as GetPackagePlansResponse)?.msg_data?.config_payment_hub ||
            [],
        );
        setLoading(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log('fetchPlans error', err);
        if (err.status === 401) {
          dispatch(openLoginModal());
          setIsLoggedOut(true);
        }
        setLoading(false);
      }
    };
    if (router.isReady) {
      if (!isLogged && !localStorage.getItem(TOKEN)) {
        dispatch(openLoginModal());
        return;
      }
      fetchPlans();
      if (router.query.id) {
        let backLinkBuy = `/mua-goi/dich-vu/${router.query.id}`;
        if (router.query.showList) {
          backLinkBuy += '?showList=true';
          if (router.query.from_source) {
            backLinkBuy += '&from_source=' + router.query.from_source;
          }
          if (router.query.is_preview) {
            backLinkBuy += '&is_preview=' + router.query.is_preview;
          }
        } else if (router.query.from_source) {
          backLinkBuy += '?from_source=' + router.query.from_source;
          if (router.query.is_preview) {
            backLinkBuy += '&is_preview=' + router.query.is_preview;
          }
        }
        localStorage.setItem(trackingStoreKey.BACK_LINK_BUY, backLinkBuy);
      }
      if (!router.query.from_source || router.query.from_source !== 'play') {
        localStorage.removeItem(trackingStoreKey.BACK_LINK_PLAY);
      }
    }
    const playerParams = getPlayerParams();
    localStorage.setItem(
      trackingStoreKey.DATA_TRACKING_PLAYER_FOR_PAYMENT,
      JSON.stringify(playerParams || {}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, isLogged]);

  const handleSetPlan = (planId: string) => {
    const found = plans.find((p) => String(p.plan_id) === String(planId));
    const upsellFound = upsellPlans.find(
      (p) => String(p.plan_id) === String(planId),
    );
    if (found) {
      setSelectedPlan(found);
    } else if (upsellFound) {
      setSelectedPlan(upsellFound);
    }
    setCurrentGateway(
      found?.allow_payment_gateways_info?.[0]?.slug ||
        upsellFound?.allow_payment_gateways_info?.[0]?.slug ||
        '',
    );
  };

  // const findPaymentHubConfig = () => {
  //   if (!selectedPlan?.config_payment_hub) return null;
  //   if (!currentGateway) return null;
  //   const result =
  //     selectedPlan.config_payment_hub.find(
  //       (config) => config.slug === currentGateway,
  //     ) || null;

  //   // Return a parsed to avoid observer object
  //   return result ? JSON.parse(JSON.stringify(result)) : null;
  // };
  const handleCouponChange = (couponData: CouponData | null) => {
    setCoupon(couponData);
  };
  type QRModalData = {
    text: { checkUrl: string; returnUrl: string };
    data: CheckoutResponse;
    display_mode?: string;
  };
  const setDataQRModal = (res: QRModalData) => {
    // QR
    const { data, text } = res;
    if (!data?.expire_time) {
      data.expire_time = '0';
    }
    setQRData({ text, data });
  };
  const handleCloseModalCreditCard = () => {
    setIsOpenModalCreditCard(false);
    setIsSubmitCreditCard(false);
    setFormData({});
  };
  const handleSubmitCreditCard = (data: CreditCardData) => {
    // update formData with credit card information
    setFormData({
      card_number: data.card_number,
      card_cvv: data.card_cvv,
      card_expiration_month: data.card_expiration_month,
      card_expiration_year: data.card_expiration_year,
    });
    setIsOpenModalCreditCard(false);
    setIsSubmitCreditCard(true);
  };

  // Watch for isSubmitCreditCard changes and call handleCheckout
  useEffect(() => {
    if (isSubmitCreditCard) {
      handleCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitCreditCard]);
  const handleCheckout = async () => {
    if (!selectedPlan || !currentUser) return;
    try {
      setLoading(true);
      if (currentGateway === 'foxpay_credit' && !isSubmitCreditCard) {
        // open modal credit card
        setIsOpenModalCreditCard(true);
        setLoading(false);
        return;
      }
      const res = await checkout({ coupon: coupon ?? undefined });
      if (
        (isQRMethod(currentGateway) && typeof res === 'object') ||
        (typeof res === 'object' &&
          'display_mode' in res &&
          res.display_mode === 'QR_IMAGE')
      ) {
        setDataQRModal(res as QRModalData);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('checkout error', err);
      const obj = {
        label: 'payment_result',
        payment: {
          package_type: selectedPlan?.package_type,
          package_name: selectedPlan?.name,
          plan_name: selectedPlan?.plan_name,
          duration:
            selectedPlan?.display_value || selectedPlan?.value_date + ' Ngày',
          payment_method: currentGateway,
          promotion: selectedPlan?.discount_display,
          result: 'Failed',
          data: {
            coupon,
          },
        },
      };
      localStorage.setItem('payment_tracking', JSON.stringify(obj));
    }
  };

  // Policy HTML (if needed, can be fetched or static)
  const policyHtml = undefined; // Replace with real policyHtml if available

  return isLogged && !isLoggedOut ? (
    <div className="w-full max-w-[1230px] mx-auto h-auto flex flex-col mt-25 sm:mt-35 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24">
      <h3 className="text-[32px] font-semibold leading-[1.3] text-white-smoke mb-[32px] text-left">
        Thanh toán
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_40%] gap-4 sm:gap-6 lg:gap-8">
        {/* Cột trái: Payment Plans + Hình thức thanh toán */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
          <div className="flex flex-col gap-4">
            {
              <PaymentPlans
                plan={selectedPlan as Plan}
                list={plans}
                upsellPlans={upsellPlans}
                upsellDescription={upsellDescription}
                onSetPlan={handleSetPlan}
              />
            }
          </div>
          <div className="flex flex-col gap-4 rounded-lg">
            {/* Payment Method Here */}
            <div className="text-lg font-semibold text-white mb-2">
              Chọn hình thức thanh toán
            </div>
            <PaymentMethods
              data={paymentMethods}
              currentGateway={currentGateway}
              onSetGateway={setCurrentGateway}
            />
          </div>
        </div>
        {/* Cột phải: Thông tin thanh toán */}
        <div className="flex flex-col gap-4 bg-eerie-black rounded-lg p-4 sm:p-6 min-w-0 h-fit">
          <PaymentTotal
            selectedPlan={selectedPlan as Plan}
            onCheckout={handleCheckout}
            policyHtml={policyHtml}
            onCouponChange={handleCouponChange}
            loading={loading}
          />
        </div>
      </div>
      {/* ModalPaymentQR integration */}
      <ModalPaymentQR
        open={!!qrData}
        onClose={() => setQRData(null)}
        data={qrData}
        gateway={currentGateway}
      />
      <ModalCreditCard
        open={!!isOpenModalCreditCard}
        onClose={handleCloseModalCreditCard}
        onSubmit={handleSubmitCreditCard}
      />
      <ModalConfirm
        open={isModalOpen}
        modalContent={modalContent}
        bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
        onSubmit={() => {
          setIsModalOpen(false);
          router.push('/');
        }}
        onHidden={() => {
          setIsModalOpen(false);
          router.push('/');
        }}
      />
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-black-06">
          <LuLoaderCircle className="animate-spin text-fpl" size={48} />
        </div>
      )}
    </div>
  ) : (
    <div className="w-full max-w-[1230px] mx-auto h-auto flex flex-col mt-35 ">
      <h3 className="text-[32px] font-semibold leading-[1.3] text-white-smoke mb-[32px]"></h3>
    </div>
  );
};

export default PaymentPackageDetail;
