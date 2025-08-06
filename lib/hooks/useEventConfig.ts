import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookies-next';
import { getEventConfig } from '@/lib/api/config';

export const useEventConfig = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchEventConfig = async () => {
      try {
        const response = await getEventConfig();
        if (response?.data && response?.data?.data && response.data.data.length > 0) {
          setCookie('setting_welcome', JSON.stringify(response.data.data), {
            path: '/',
            maxAge: 3600 * 24 * 7,
          });
          window.location.href = '/wc.html';
        }
      } catch (error) {
        console.error('Failed to fetch event config:', error);
      }
    };

    fetchEventConfig();
  }, [router]);
};
