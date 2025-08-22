import { useEffect, useState } from 'react';
import { getConfig } from '../api/config';

export default function useKid() {
  const [preventKidText, setPreventKidText] = useState('');

  // Lấy msg_not_support từ API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        const msgNotSupport =
          response.data?.data?.profile?.msg_not_support || '';
        setPreventKidText(msgNotSupport);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };

    fetchConfig();
  }, []);

  return { preventKidText };
}
