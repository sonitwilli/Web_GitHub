import { useState, useEffect } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { localStorageWithExpiry } from '@/lib/utils/sport';
import { doFetchDevices, ApiResponse } from '@/lib/api/devices';
import { useAppDispatch } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

interface DeviceDetail {
  title?: string;
  msg?: string;
  icon?: string;
  type?: string;
}

interface Device {
  device_id?: string;
  device_name?: string;
  device_icon?: string;
  last_access?: string;
  is_whitelist?: string;
  is_current?: string;
  device_detail?: DeviceDetail[];
}

interface DeviceData {
  title?: string;
  sub_title_current_group?: string;
  sub_title_other_group?: string;
  title_remove?: string;
  sub_title_remove?: string;
  devices?: Device[];
}

interface UseFetchDevicesResult {
  data: DeviceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchDevices = (): UseFetchDevicesResult => {
  const [data, setData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setItem, getItem, removeItem } = localStorageWithExpiry<DeviceData>(
    'deviceData',
    null,
  );
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<ApiResponse> = await doFetchDevices();

      if (response?.data?.data?.devices?.length === 0) {
        throw new Error('API error: No devices found');
      }

      const deviceData: DeviceData = response.data.data || {};

      setItem(deviceData, 0.1); // Cache for 6 minutes
      setData(deviceData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch devices data';
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
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
