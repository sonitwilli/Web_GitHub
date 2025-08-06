import { useRouter } from 'next/router';
import { useCallback } from 'react';
import {
  CheckoutPaymentParams,
  paymentHubCreateApi,
  qrCodeCreateApi,
} from '@/lib/api/payment';
import type {
  Plan,
  AllowPaymentGatewayInfo,
  ConfigPaymentHub,
} from '@/lib/api/payment';
import { MethodOptions, PAYMENT_HUB_CONFIG } from '../constant/paymentMethods';
import { userAgentInfo } from '../utils/ua';
import { getConfig } from '../utils/paymentService';
import { trackingStoreKey } from '../constant/tracking';
import { CouponData } from '../components/payment/PaymentTotal';

// Định nghĩa type cho user
export interface CheckoutUser {
  user_id: string;
  user_email?: string;
  user_phone?: string;
}

export interface CurrentPackage {
  config_payment_hub?: AllowPaymentGatewayInfo[];
  [key: string]: unknown;
}

interface UseCheckoutProps {
  user: CheckoutUser;
  plan: Plan;
  currentPackage: CurrentPackage;
  currentGateway: string;
  formData?: Record<string, unknown>;
  paymentHubConfig?: ConfigPaymentHub[];
}

export function useCheckout({
  user,
  plan,
  currentPackage,
  currentGateway,
  formData,
  paymentHubConfig,
}: UseCheckoutProps) {
  const router = useRouter();

  // Hàm tìm paymentHubConfig
  const findPaymentHubConfig = useCallback(() => {
    console.log('paymentHubConfig', paymentHubConfig);
    if (!paymentHubConfig || paymentHubConfig.length === 0) return null;
    if (!currentGateway) return null;
    const result = paymentHubConfig.find(
      (config: AllowPaymentGatewayInfo) => config.slug === currentGateway,
    );
    return result ? JSON.parse(JSON.stringify(result)) : null;
  }, [paymentHubConfig, currentGateway]);

  const paymentHubCreate = async (
    method: string,
    data: CheckoutPaymentParams,
    paymentHubConfig: AllowPaymentGatewayInfo,
  ) => {
    try {
      const option: MethodOptions | null = getConfig(method);

      if (!option) {
        throw new Error('Phương thức thanh toán không tồn tại.');
      }
      // Create transaction
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const { payment_gateway_code, display_mode } = paymentHubConfig;
      const isSafari = userAgentInfo()?.isSafari;
      const mode =
        isSafari && currentGateway === 'applepayqr'
          ? display_mode?.isSafari
          : display_mode?.displayMode;
      const response = await paymentHubCreateApi({
        number: data?.formData?.card_number || data?.number || '',
        cvv: data?.formData?.card_cvv || data?.cvv || '',
        month: data?.formData?.card_expiration_month || data?.month || '',
        year: data?.formData?.card_expiration_year || data?.year || '',
        plan_id: data?.plan_id,
        coupon_code: data.coupon,
        payment_gateway_code,
        display_mode: mode,
        affiliate_source: data.affiliate_source || '',
        traffic_id: data.traffic_id || '',
        return_url: `${baseUrl}/mua-goi/dich-vu/thanh-toan/`,
        is_invoice_required: data?.is_invoice_required || 0,
        full_address: data?.full_address || '',
        full_name: data?.full_name || '',
        email: data?.email || '',
        tax_code: data?.tax_code || '',
      });

      // Handler error
      if (
        !response ||
        response.status === 0 ||
        response.data?.msg_code === 'error'
      ) {
        return router.push({
          pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
          query: {
            method,
            status_code: response.status,
            error_message: response.data?.msg || response.data?.msg_content,
          },
        });
      }
      const displayMode =
        response?.data?.msg_data?.display_mode || display_mode?.displayMode;
      switch (displayMode) {
        case 'QR_IMAGE':
          // console.log('mode QR_IMAGE created', {
          //   text: {
          //     checkUrl: PAYMENT_HUB_CONFIG.apiCheck,
          //     returnUrl: `/mua-goi/dich-vu/thanh-toan/${method}`,
          //     ...option.text,
          //   },
          //   data: response.msg_data,
          // })
          return {
            text: {
              checkUrl: PAYMENT_HUB_CONFIG.apiCheck,
              returnUrl: `/mua-goi/dich-vu/thanh-toan/${method}`,
              ...option.text,
            },
            data: { ...response?.data?.msg_data, payment_gateway_code },
            display_mode: displayMode,
          };
        case 'REDIRECT_URL': {
          const obj = JSON.parse(
            localStorage.getItem('payment_tracking') || '{}',
          );
          obj.payment.trans_id =
            response?.data?.msg_data?.trans_id ||
            response?.data?.msg_data?.order_id;
          //   updateTracking(obj)
          const redirectUrl = response?.data?.msg_data?.value_display;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            router.push({
              pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
            });
          }
          break;
        }
        case 'APP_TO_APP': {
          const obj = JSON.parse(
            localStorage.getItem('payment_tracking') || '{}',
          );
          obj.payment.trans_id =
            response?.data?.msg_data?.trans_id ||
            response?.data?.msg_data?.order_id;
          //   updateTracking(obj)
          const redirectUrl = response?.data?.msg_data?.value_display || '';
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            router.push({
              pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
            });
          }
          break;
        }
        case 'QR_CODE':
          console.log('mode QR_CODE created');
          break;
        default:
          console.log('mode unknown');
          break;
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      return router.push({
        pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
        query: {
          method,
          status_code: 0,
          msg: err.message,
          error_message: err.message,
        },
      });
    }
  };
  const creditCreate = async (data: CheckoutPaymentParams) => {
    const option: MethodOptions | null = getConfig(currentGateway);
    if (!option) {
      throw new Error('Phương thức thanh toán không tồn tại.');
    }
    // Lấy lại giá trị từ localStrorage để kiểm tra
    const trafficId =
      localStorage && localStorage.getItem(trackingStoreKey.UTM_LINK)
        ? localStorage.getItem(trackingStoreKey.UTM_LINK)
        : null;

    if (trafficId) {
      // Tạo đối tượng URLSearchParams từ phần query string của URL
      const searchParams = new URLSearchParams(new URL(trafficId).search);

      // Lấy giá trị của tham số utm_source
      const utmSource = searchParams.get('utm_source');

      if (utmSource || trafficId) {
        data.affiliate_source = utmSource?.toString();
        data.traffic_id = trafficId?.toString();
      }

      if (utmSource === 'masoffer') {
        data.affiliate_source = 'masoffer';
        data.traffic_id = trafficId;
      }
    }
    try {
      const url = option.createTransactionUrl || '';
      const response = await qrCodeCreateApi(url, {
        ...data.formData,
        plan_id: data.plan_id,
        affiliate_source: data.affiliate_source || '',
        traffic_id: data.traffic_id || '',
        coupon_code: data.coupon,
        redirect_url: data.redirect_url,
        cancel_url: data.redirect_url,
        return_url: data.redirect_url,
      });

      console.log('responseCredit', response);

      if (response?.data?.status === 1) {
        const payUrl =
          response?.data?.msg_data?.pay_url ||
          response?.data?.msg_data?.payment_url ||
          '';
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          router.push(
            `/mua-goi/dich-vu/thanh-toan/that-bai?method=foxpay_credit&status_code=${response?.data?.status}&error=Quý khách vui vòng thử lại hoặc gọi Tổng đài 19006600 để được hỗ trợ`,
          );
        }
        // this.vm.$router.push(`/mua-goi/dich-vu/thanh-toan/foxpay_credit`)
        // if (statusCode === 2) {
        //   const visa3ds = response?.msg_data || ''
        //   visa3ds.checkUrl = 'payment/foxpay_check'
        //   visa3ds.returnUrl = '/mua-goi/dich-vu/thanh-toan/foxpay_credit'
        //   return visa3ds
        // } else {
        //   this.vm.$router.push(
        //     `/mua-goi/dich-vu/thanh-toan/thanh-cong?method=foxpay_credit&status_code=${statusCode}&error=${message}`
        //   )
        // }
      } else {
        router.push(
          `/mua-goi/dich-vu/thanh-toan/that-bai?method=foxpay_credit&status_code=${
            response?.data?.status
          }&error=${response?.data?.msg || response?.data?.msg_content}`,
        );
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const qrCreate = async (data: CheckoutPaymentParams) => {
    try {
      const option: MethodOptions | null = getConfig(currentGateway);
      if (!option) {
        throw new Error('Phương thức thanh toán không tồn tại.');
      }

      // Trường hợp cổng hybrid và người dùng đang sử dụng mobile thì redirect link
      if (option.hybrid && !userAgentInfo()?.isFromPc) {
        return await redirect(data);
      }

      const url = option.createQRCodeUrl || '';
      const response = await qrCodeCreateApi(url, data);

      // Các trường hợp thanh toán thành công ngay khi tạo transaction.
      // Ví ZaloPay: đã liên kết ví sẽ response msg_code là success
      // Nhập mã khuyến mãi SODEXO: response msg_code là redeem_direct_success
      if (
        response &&
        response.data.status === 1 &&
        ((currentGateway === 'zalo_pay' &&
          response.data.msg_code === 'success') ||
          response.data.msg_code === 'redeem_direct_success') &&
        !response.data.msg_data?.qr_code &&
        !response.data.msg_data?.deep_link
      ) {
        return router.push({
          pathname: '/mua-goi/dich-vu/thanh-toan/thanh-cong',
          query: {
            method: currentGateway,
            status_code: response.status,
          },
        });
      }

      // Trường hợp có response nhưng msg_code là error
      if (
        !response ||
        response.status === 0 ||
        response.data?.msg_code === 'error'
      ) {
        return router.push({
          pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
          query: {
            method: currentGateway,
            status_code: response.status,
            error_message: response.data?.msg || response.data?.msg_content,
          },
        });
      }

      // Các trường hợp redirect link khi dùng mobile
      if (
        !userAgentInfo()?.isFromPc &&
        currentGateway !== 'applepayqr' &&
        (response?.data?.msg_data?.deep_link ||
          response?.data?.msg_data?.payment_url ||
          response?.data?.msg_data?.pay_url)
      ) {
        if (currentGateway === 'viet_qr') {
          window.location.href = response?.data?.msg_data?.payment_url || '';
        } else window.location.href = response?.data?.msg_data?.deep_link || '';
      } else {
        // Trường hợp data có qr_code thì hiển thị modal QR
        return {
          text: {
            checkUrl: option.checkTransactionUrl,
            returnUrl: `/mua-goi/dich-vu/thanh-toan/${currentGateway}`,
            ...option.text,
          },
          data: response?.data?.msg_data,
        };
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      return router.push({
        pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
        query: {
          method: currentGateway,
          status_code: 0,
          msg: error.message,
          error_message: error.message,
        },
      });
    }
  };
  const redirect = async (data: CheckoutPaymentParams) => {
    const option: MethodOptions | null = getConfig(currentGateway);
    if (!option) {
      throw new Error('Phương thức thanh toán không tồn tại.');
    }
    console.log('redirect', data);

    // const userAgent = this.getUserAgent()
    const url = option.createTransactionUrl || '';
    const response = await qrCodeCreateApi(url, data);
    const obj = JSON.parse(localStorage.getItem('payment_tracking') || '{}');
    obj.payment.trans_id =
      response?.data?.msg_data?.trans_id || response?.data?.msg_data?.order_id;
    localStorage.setItem('payment_tracking', JSON.stringify(obj));
    if (!response || response.data?.status !== 1) {
      if (response.data?.status === 0 && response.data?.msg)
        throw new Error(response.data?.msg);
      else return response;
    }
    // Handler for input code SODEXO
    if (
      response &&
      response.data?.status === 1 &&
      response.data?.msg_code === 'redeem_direct_success' &&
      !response.data?.msg_data?.qr_code &&
      !response.data?.msg_data?.deep_link
    ) {
      return router.push({
        pathname: '/mua-goi/dich-vu/thanh-toan/thanh-cong',
        query: {
          method: currentGateway,
          status_code: 1,
        },
      });
    }
    console.log('response redirect', response);
    const redirectUrl =
      response.data?.msg_data?.pay_url || response.data?.msg_data?.payment_url;

    // Redirect to partner portal
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      return router.push({
        pathname: '/mua-goi/dich-vu/thanh-toan/that-bai',
      });
    }
  };
  // Hàm checkout
  const checkout = useCallback(
    async ({ coupon }: { coupon?: CouponData }) => {
      if (!user || !plan || !currentGateway)
        throw new Error('Missing payment info');
      const params: CheckoutPaymentParams = {
        user_id: user.user_id,
        plan_id: plan.plan_id!,
        gateway: currentGateway,
        coupon: coupon?.code || undefined,
        amount: plan.amount! * 1000,
        email: user.user_email,
        phone: user.user_phone,
        formData: formData || undefined,
        redirect_url: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/mua-goi/dich-vu/thanh-toan/${
          currentGateway === 'e-wallet' ? formData?.type_wallet : currentGateway
        }`,
        return_url: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/mua-goi/dich-vu/thanh-toan/${
          currentGateway === 'e-wallet' ? formData?.type_wallet : currentGateway
        }`,
        cancel_url: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/mua-goi/dich-vu/thanh-toan/${
          currentGateway === 'e-wallet' ? formData?.type_wallet : currentGateway
        }`,
        auto_pay: 0,
        device_type: 'unknown',
      };
      const dataTracking = {
        label: 'payment_result',
        payment: {
          package_type: currentPackage.package_type,
          package_name: currentPackage.name,
          plan_name: plan.plan_name,
          duration: plan.display_value || plan.value_date + ' Ngày',
          payment_method: currentGateway,
          promotion: plan.discount_display,
          result: '',
          month_prepaid: Math.round(plan.value_date! / 30).toString(),
          data: {
            user_id: user.user_id,
            amount: plan.amount! * 1000,
            plan_id: plan.plan_id,
            email: user.user_email,
            phone: user.user_phone,
            redirect_url: `${window.location.protocol}//${
              window.location.host
            }/mua-goi/dich-vu/thanh-toan/${
              currentGateway === 'e-wallet'
                ? formData?.type_wallet
                : currentGateway
            }`,
            type_wallet:
              currentGateway === 'e-wallet'
                ? formData?.type_wallet
                : currentGateway,
            coupon,
          },
        },
      };
      localStorage.setItem('payment_tracking', JSON.stringify(dataTracking));
      const paymentHubConfig = findPaymentHubConfig();
      console.log('paymentHubConfig', paymentHubConfig);
      switch (currentGateway) {
        case 'zalo_pay':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await qrCreate(params);
          }
        case 'foxpay':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await qrCreate(params);
          }
        case 'airpay':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await qrCreate(params);
          }
        case 'viet_qr':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await qrCreate(params);
          }
        case 'vn_pay':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await qrCreate(params);
          }
        case 'applepayqr':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            const isSafari = userAgentInfo()?.isSafari;
            if (isSafari) {
              return await redirect(params);
            } else {
              return await qrCreate(params);
            }
          }
        case 'momo_walle':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await redirect(params);
          }

        case 'viettel_pay':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await redirect(params);
          }
        case 'grab_pay':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await redirect(params);
          }
        case 'foxpay_atm':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await redirect(params);
          }
        case 'foxpay_atm':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await redirect(params);
          }
        case 'napas_atm':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await redirect(params);
          }

        case 'foxpay_credit':
          if (paymentHubConfig) {
            return await paymentHubCreate(
              currentGateway,
              params,
              paymentHubConfig,
            );
          } else {
            return await creditCreate(params);
          }
      }
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [
      user,
      plan,
      currentGateway,
      formData,
      currentPackage,
      findPaymentHubConfig,
      paymentHubCreate,
      qrCreate,
      redirect,
      currentPackage,
    ],
  );

  return {
    checkout,
    findPaymentHubConfig,
  };
}
