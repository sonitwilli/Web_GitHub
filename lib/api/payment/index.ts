import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { SEND_OTP_TYPES } from '@/lib/constant/texts';
import { PAYMENT_HUB_CONFIG } from '@/lib/constant/paymentMethods';

// Interface for generic API response
export interface ApiResponse<T = unknown> {
  title: string;
  tokens: never[];
  error_code?: string;
  msg?: string;
  data?: T;
  seconds?: number;
  verify_token?: string;
  status?: boolean;
  status_code?: number;
  content?: string;
  msg_data?: T;
}

// Interface for Token
export interface Token {
  device_type?: string;
  plan_id?: string;
  plan_name?: string;
  plan_type?: string;
  last_update?: string;
  next_payment_date?: string;
  price_display?: string;
  start_payment_date?: string;
  image_v2?: string;
  status?: string;
  wallet_id_display?: string;
  name?: string;
  wallet_id?: string;
  user_id?: string;
  subscription_id?: string;
  profile_id?: string;
  slug?: string;
}

// Interface for fetchUserTokens response data
export interface FetchUserTokensResponseData {
  tokens: Token[];
}

// Interface for fetchUserTokens params
export interface FetchUserTokensParams {
  client_id?: string;
}

// fetchUserTokens
export const fetchUserTokens = async (): Promise<
  AxiosResponse<ApiResponse<FetchUserTokensResponseData>>
> => {
  try {
    const token = localStorage.getItem('token') || 'aaaaaaaaaa';

    const params: FetchUserTokensParams = {
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    };

    const response = await axiosInstance.get('/payment/user_tokens', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response;
  } catch (error) {
    console.error(
      'Error fetching user tokens:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// Interface for doSendOtpNewFlow params
export interface SendOtpNewFlowParams {
  phone?: string;
  type?: string;
  verify_token?: string;
  client_id?: string;
  type_otp?: string;
}

// Interface for validate OTP response data
export interface ValidateOtpResponseData {
  verify_token?: string;
}

// Interface for doSendOtpNewFlow response data
export interface SendOtpNewFlowResponseData {
  seconds?: number;
  email?: string;
  mask_phone?: string;
  otp_length?: string;
  text_format?: string[];
  title?: string;
}

// doSendOtpNewFlow
export const doSendOtpNewFlow = async ({
  phone,
}: {
  phone: string;
}): Promise<{
  validateResponse: AxiosResponse<ApiResponse<ValidateOtpResponseData>>;
  sendResponse: AxiosResponse<ApiResponse<SendOtpNewFlowResponseData>>;
}> => {
  try {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Step 1: Validate OTP request
    const validateParams: SendOtpNewFlowParams = {
      phone,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      type: SEND_OTP_TYPES.DELETE_AUTO_EXTEND,
    };

    const validateResponse = await axiosInstance.post(
      '/account/otp/validate_user_payment',
      validateParams,
    );

    if (!validateResponse?.data?.data?.verify_token) {
      throw new Error('Failed to obtain verify token');
    }

    // Step 2: Send OTP
    const sendParams: SendOtpNewFlowParams = {
      phone,
      type_otp: SEND_OTP_TYPES.DELETE_AUTO_EXTEND,
      verify_token: validateResponse.data.data.verify_token,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    };

    const sendResponse = await axiosInstance.post(
      '/account/otp/send',
      sendParams,
    );

    return {
      validateResponse,
      sendResponse,
    };
  } catch (error) {
    console.error(
      'Error sending OTP for new flow:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// Interface for cancelExtend params
export interface CancelExtendParams {
  type_otp: string;
  verify_token: string;
  client_id?: string;
  subscription_id?: string;
  profile_id?: string;
  slug?: string;
}

// Interface for cancelExtend response data
export interface CancelExtendResponseData {
  status_code?: number;
  content?: string;
  msg_data?: string;
}

// cancelExtend
export const cancelExtend = async ({
  item,
  verify_token,
}: {
  item: Token;
  verify_token: string;
}): Promise<AxiosResponse<ApiResponse<CancelExtendResponseData>>> => {
  try {
    if (!item.user_id || !verify_token) {
      throw new Error('User ID and verify token are required');
    }

    const params: CancelExtendParams = {
      type_otp: 'remove_auto_pay',
      verify_token,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      subscription_id: item.subscription_id,
      profile_id: item.profile_id,
      slug: item.slug,
    };

    const response = await axiosInstance.post(
      '/payment/remove_user_token',
      params,
    );
    return response;
  } catch (error) {
    console.error(
      'Error cancelling auto extend:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// Interface for get_package_plans API response
export interface ConfigPaymentHub {
  slug?: string;
  payment_gateway_code?: string;
  display_mode?: {
    groupPlatform?: string;
    displayMode?: string;
    isSafari?: string;
  };
}
export interface GetPackagePlansResponse {
  msg_content?: string;
  msg_code?: string;
  msg_data?: {
    background_consumption_mode?: string;
    package_name?: string;
    promo_img_stand?: string;
    promo_img_horizon?: string;
    promo_icon?: string;
    plans?: Plan[];
    package_type?: string;
    upsell_plans?: unknown;
    background?: string;
    background_detail_package?: string;
    promotion_description?: string;
    upsell_description?: string;
    config_payment_hub?: ConfigPaymentHub[];
    icon?: string;
    description?: string;
  };
  msg_data_error?: {
    expired_date: string;
    from_date: string;
    id: number;
    is_sub: number;
    last_update: string;
    next_date: string;
    plan_id: number;
    plan_type: string;
    status: number;
  };
}

export interface Plan {
  value_date?: number;
  original_price?: number;
  discount_display?: number;
  plan_description?: string;
  allow_payment_gateways?: string[];
  plan_type?: string;
  currency?: string;
  is_promotion?: number;
  partner?: string;
  display_value?: string;
  packages?: unknown[];
  plan_id?: number;
  drm_system_type?: string;
  amount_str?: string;
  amount?: number;
  platform?: string;
  plan_info?: string;
  plan_name?: string;
  status?: number;
  description?: string;
  is_promotion_plan?: number;
  box_no_contract?: number;
  display_platforms?: string[];
  ios_original_price?: string;
  discount?: number;
  extra_value?: unknown[];
  subs_handle?: number;
  ios_discount_price?: string;
  name?: string;
  allow_payment_gateways_info?: AllowPaymentGatewayInfo[];
  package?: string;
  country?: string;
  plan_feature?: string;
  value?: number;
  ios_promotion_display?: string;
  payment_gateways?: string[];
  fptplay_promotion_name?: string;
  ios_promotion_info?: string;
  discount_percent?: number;
  display?: boolean;
  playcoin?: number;
  value_display?: string;
  expire_time?: string;
  config_payment_hub?: ConfigPaymentHub[];
  package_type?: string;
  payment_gateway_code?: string;
  display_mode?: {
    platform?: string;
    displayMode?: string;
    isSafari?: string;
  };
}

export interface AllowPaymentGatewayInfo {
  smartv_box_background_image?: string;
  image_v2?: string;
  image?: string;
  gateway_promotion_name?: string;
  sub_methods?: unknown;
  promotion_info?: string;
  fast_purchase_promotion_image?: string;
  fast_purchase_gateway?: string;
  fast_purchase_background_image?: string;
  slug?: string;
  name?: string;
  display_mode?: {
    platform?: string;
    displayMode?: string;
    isSafari?: string;
  };
  payment_gateway_code?: string;
}

// Interface for getPackagePlans params
export interface GetPackagePlansParams {
  from_source: string;
  package_type: string;
}

export const getPackagePlans = async ({
  from_source,
  package_type,
}: GetPackagePlansParams): Promise<
  AxiosResponse<ApiResponse<CancelExtendResponseData>>
> => {
  try {
    const params = {
      from_source,
      package_type,
      'X-Agent': 'web-playfpt',
    };

    const response = await axiosInstance.get('/payment/get_package_plans', {
      params,
    });
    return response;
  } catch (error) {
    console.error(
      'Error getting package plans:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

export interface CheckCouponParams {
  plan_id: string;
  coupon: string;
}
export interface CheckCouponResponseData {
  msg?: string;
  msg_data?: {
    add_plans_free?: Array<{ unknown: unknown }>;
    applyCouponValue?: number;
    code?: string;
    coupon_type?: string;
    discount_amount?: number;
    limited_money?: number;
    value?: number;
  };
  msg_code?: string;
  status?: number;
}

export const checkCoupon = async ({
  plan_id,
  coupon,
}: CheckCouponParams): Promise<AxiosResponse<CheckCouponResponseData>> => {
  try {
    const response = await axiosInstance.post('/payment/check_coupon', {
      plan_id,
      coupon,
    });
    return response;
  } catch (error) {
    console.error('Error checking coupon:', error);
    throw error;
  }
};

// Interface cho params checkout
export interface CheckoutPaymentParams {
  user_id?: string;
  plan_id?: number;
  gateway?: string;
  coupon?: string;
  amount?: number;
  email?: string;
  phone?: string;
  formData?: {
    card_number?: string;
    card_cvv?: string;
    card_expiration_month?: string;
    card_expiration_year?: string;
  };
  number?: string;
  cvv?: string;
  month?: string;
  year?: string;
  full_address?: string;
  full_name?: string;
  tax_code?: string;
  affiliate_source?: string;
  traffic_id?: string;
  coupon_code?: string;
  display_mode?: string;
  payment_gateway_code?: string;
  is_invoice_required?: number;
  card_number?: string;
  card_cvv?: string;
  card_expiration_month?: string;
  card_expiration_year?: string;
  auto_pay?: number;
  device_type?: string;
  cancel_url?: string;
  return_url?: string;
  redirect_url?: string;
}

// Interface cho response checkout
export interface CheckoutPaymentResponseData {
  status?: number;
  msg?: string;
  msg_data?: CheckoutResponse;
  display_mode?: string;
  msg_code?: string;
  status_code?: number;
  msg_content?: string;
}
export interface CheckoutResponse {
  binding_link?: string;
  deep_link?: string;
  expire_time?: string;
  payment_url?: string;
  pay_url?: string;
  qr_code?: string;
  trans_id?: string;
  payment_gateway_code?: string;
  display_mode?: {
    platform?: string;
    displayMode?: string;
    isSafari?: string;
  };
  order_id?: string;
  value_display?: string;
}
// Hàm gọi API checkout
export const checkoutPayment = async (params: CheckoutPaymentParams) => {
  try {
    const response = await axiosInstance.post<CheckoutPaymentResponseData>(
      '/payment/checkout',
      params,
    );
    return response;
  } catch (error) {
    console.error('Error in checkoutPayment:', error);
    throw error;
  }
};

// Hàm tạo transaction cho các cổng payment hub
export const paymentHubCreateApi = async (
  params: CheckoutPaymentParams,
): Promise<AxiosResponse<CheckoutPaymentResponseData>> => {
  try {
    const paymentHubEndpoint = PAYMENT_HUB_CONFIG.apiCreate;
    const response = await axiosInstance.post(paymentHubEndpoint, params);
    return response;
  } catch (error) {
    console.error('Error in paymentHubCreate:', error);
    throw error;
  }
};

// Hàm tạo transaction và gen QR cho các cổng QR code
export const qrCodeCreateApi = async (
  url: string,
  params: CheckoutPaymentParams,
): Promise<AxiosResponse<CheckoutPaymentResponseData>> => {
  try {
    const response = await axiosInstance.post(url, params);
    return response;
  } catch (error) {
    console.error('Error in qrCodeCreate:', error);
    throw error;
  }
};

export interface CheckTransactionStatusParams {
  trans_id: string;
  payment_gateway_code: string;
}
export interface CheckTransactionStatusResponseData {
  status?: number;
  msg?: string;
  msg_code?: string;
  msg_data?: {
    status_code?: number | string;
    message?: string;
  };
}
// Hàm gọi API check transaction status
export const checkTransactionStatusApi = async (
  url: string,
  params: CheckTransactionStatusParams,
): Promise<AxiosResponse<CheckTransactionStatusResponseData>> => {
  const response = await axiosInstance.get(url, { params });
  return response;
};

export interface PackagePreview {
  img_url?: string;
  plan_type?: string;
  title?: string;
  background_consumption_mode?: string;
  img_background?: string;
  tablet_img?: string;
}

export const fetchPackagesPreview = async (
  type: string,
): Promise<PackagePreview[]> => {
  const res = await axiosInstance.get('/payment/get_packages_preview', {
    params: {
      is_drm: '1',
      package_type: type,
      from_source: 'play',
    },
  });
  return res.data.msg_data || [];
};

export interface CheckAccountStatusResponse {
  status: boolean;
  msg?: string;
  data?: {
    from_date?: string;
    next_date?: string;
  };
}

export const checkAccountStatus = async (
  type: string,
): Promise<CheckAccountStatusResponse> => {
  try {
    // Use the same logic as Nuxt - call get_package_plans API
    const response = await axiosInstance.get(
      `/payment/get_package_plans?package_type=${type}&from_source=play&is_preview=1`,
    );

    const data = response?.data;

    // If no response or msg_code is not 'error', allow payment
    if (!data || data?.msg_code !== 'error') {
      return {
        status: true,
      };
    }

    // If msg_code is 'error', return error with message
    return {
      status: false,
      msg: data?.msg_content || '',
      data: data?.msg_data_error || {},
    };
  } catch {
    return {
      status: true,
    };
  }
};
