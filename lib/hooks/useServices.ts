import { useState, useEffect } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { localStorageWithExpiry } from '@/lib/utils/sport';
import { doFetchServices } from '@/lib/api/services';
import { useAppDispatch } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';

// Define interfaces for service items and API response
interface ServiceItem {
  plan_name?: string;
  from_date?: string;
  next_date?: string;
  is_sub?: number;
}

interface ServicesData {
  packages?: ServiceItem[];
  extras?: ServiceItem[];
}

interface ApiResponse {
  msg_data?: ServicesData;
}

// Interface for fetch params
interface FetchServicesParams {
  client_id?: string;
}

interface UseFetchServicesResult {
  data?: ServicesData | null;
  loading?: boolean;
  error?: string | null;
  refetch?: (params?: Partial<FetchServicesParams>) => Promise<void>;
}

export const useFetchServices = (
  initialParams: Partial<FetchServicesParams> = { client_id: process.env.NEXT_PUBLIC_CLIENT_ID },
): UseFetchServicesResult => {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setItem, getItem, removeItem } = localStorageWithExpiry<ServicesData>(
    'servicesData',
    null,
  );
  const router = useRouter();
  const dispatch = useAppDispatch();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<ApiResponse> = await doFetchServices();

      if (!response?.data?.msg_data?.packages || !response?.data?.msg_data?.extras) {
        throw new Error('API error: Invalid response data');
      }

      const servicesData: ServicesData = {
        packages: response.data.msg_data.packages,
        extras: response.data.msg_data.extras,
      };

      setItem(servicesData, 0.1); // Cache for 30 minutes
      setData(servicesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services data');
      if(err instanceof AxiosError && err.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
      throw new Error('Failed to fetch services data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = getItem();
    if (cachedData) {
      setData(cachedData);
    } else {
      fetchData();
    }
  }, [initialParams.client_id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const refetch = async () => {
    await fetchData();
  };

  return { data, loading, error, refetch };
};