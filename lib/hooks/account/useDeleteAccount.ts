import { useCallback } from 'react';
import {
  getDeleteAccountStatus,
  validateDisableUser,
  sendOtpDeleteAccountNewFlow,
  disableAccount,
} from '@/lib/api/account';
import { showToast } from '@/lib/utils/globalToast';
import { TITLE_SEND_OTP_FAIL, DEFAULT_ERROR_MSG } from '@/lib/constant/texts';
import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { openLoginModal } from '@/lib/store/slices/loginSlice';

export interface PackageItem {
  plan_name?: string;
  expired_date?: string;
  next_date?: string;
}

interface DeleteAccountStatusResponse {
  status: number | null;
  packages: PackageItem[];
  extras: PackageItem[];
  content: string;
  message: string;
}

export function useDeleteAccount() {
  const dispatch = useDispatch();
  const checkStatus =
    useCallback(async (): Promise<DeleteAccountStatusResponse> => {
      try {
        const res = await getDeleteAccountStatus();
        const status = res?.data?.status || res?.status;
        const data = res?.data?.data;
        return {
          status,
          packages: (data?.packages as PackageItem[]) || [],
          extras: (data?.extras as PackageItem[]) || [],
          content: data?.content || '',
          message: res?.data?.message || '',
        };
      } catch {
        return {
          status: null,
          packages: [],
          extras: [],
          content: '',
          message: '',
        };
      }
    }, []);

  const validate = useCallback(async () => {
    try {
      const res = await validateDisableUser();
      if (res?.data?.error_code === '0') {
        return {
          verify_token: res?.data?.data?.verify_token as string,
          mask_phone: res?.data?.data?.mask_phone as string,
        };
      }
      return {};
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(openLoginModal());
        }
      }
      return {};
    }
  }, [dispatch]);

  const sendOtp = useCallback(async (phone: string, verify_token: string) => {
    try {
      const sendRes = await sendOtpDeleteAccountNewFlow(phone, verify_token);
      return sendRes?.data;
    } catch {
      showToast({ title: TITLE_SEND_OTP_FAIL, desc: DEFAULT_ERROR_MSG });
      return null;
    }
  }, []);

  const doDisable = useCallback(async (verify_token: string) => {
    const res = await disableAccount(verify_token);
    return res?.data;
  }, []);

  return { checkStatus, validate, sendOtp, doDisable };
}
