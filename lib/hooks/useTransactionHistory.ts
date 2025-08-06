import { useState, useEffect, useRef } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { localStorageWithExpiry } from '@/lib/utils/sport';
import {
  doGetTransactionHistory,
  TransactionHistoryResponse,
  TransactionHistoryParams,
} from '@/lib/api/history';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { useAppDispatch } from '@/lib/store';

interface TransactionHistoryData {
  page?: number;
  per_page?: number;
  total_page?: number;
  transactions?: Array<{
    id?: number;
    detail?: string;
    timestamp?: string;
    type?: number;
  }>;
}

interface UseTransactionHistoryResult {
  data?: TransactionHistoryData | null;
  loading?: boolean;
  error?: string | null;
  refetch: (params?: Partial<TransactionHistoryParams> & { sso?: boolean }) => Promise<void>;
}

export const useTransactionHistory = (
  initialParams: Partial<TransactionHistoryParams> & { sso?: boolean } = { page: 1, per_page: 10, sso: false },
): UseTransactionHistoryResult => {
  const [data, setData] = useState<TransactionHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedParams = useRef<string>('');
  const { setItem, getItem, removeItem } = localStorageWithExpiry<TransactionHistoryData>(
    'transactionHistory',
    null,
  );
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fetchData = async (params: Partial<TransactionHistoryParams> & { sso?: boolean }) => {
    const paramKey = JSON.stringify(params);

    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<TransactionHistoryResponse> = await doGetTransactionHistory({
        page: params.page,
        per_page: params.per_page,
        sso: params.sso,
      });

      const transactionData: TransactionHistoryData = {
        page: response.data?.page || 1,
        per_page: response.data?.per_page || 10,
        total_page: response.data?.total_page || 1,
        transactions: response.data?.transactions || [],
      };

      setItem(transactionData, 0.1); // Cache for 30 minutes
      setData(transactionData);
      lastFetchedParams.current = paramKey;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch transaction history';
      setError(errorMessage);
      if(err instanceof AxiosError && err.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = getItem();
    if (cachedData) {
      setData(cachedData);
    } else {
      fetchData(initialParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams.page, initialParams.per_page, initialParams.sso]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const queryStart = url.indexOf('?');
      const queryString = queryStart !== -1 ? url.slice(queryStart + 1) : '';
      const params = new URLSearchParams(queryString);
      const hasTab = params.has('tab');

      if (!hasTab) {
        removeItem();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, removeItem]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      removeItem();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [removeItem]);

  const refetch = async (params: Partial<TransactionHistoryParams> & { sso?: boolean } = initialParams) => {
    await fetchData(params);
  };

  return { data, loading, error, refetch };
};