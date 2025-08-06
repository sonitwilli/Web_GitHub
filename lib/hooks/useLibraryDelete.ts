import { useState, useCallback } from 'react';
import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { showToast } from '@/lib/utils/globalToast';
import { ERROR_CONNECTION, HAVING_ERROR } from '../constant/texts';

export interface PageDataResponseType {
  message?: string;
  status?: string;
}

interface UseDeleteDataBlockResult {
  deleteData?: (type?: string) => Promise<AxiosResponse<PageDataResponseType>>;
  isLoading?: boolean;
  error?: Error | null;
  response?: AxiosResponse<PageDataResponseType> | null;
}

export const useDeleteDataBlock = (): UseDeleteDataBlockResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<AxiosResponse<PageDataResponseType> | null>(null);

  const deleteData = useCallback(async (type?: string): Promise<AxiosResponse<PageDataResponseType>> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post(`config/personal_content/remove/${type}`);
      setResponse(res);
      setIsLoading(false);
      const { data: {status, message} } = res;
      if (status && status === '0') {
        showToast({
          title: message && message?.title ? message?.title : ERROR_CONNECTION,
          desc: message && message?.content ? message?.content : HAVING_ERROR,
          styleData: 'bg-eerie-black rounded-2xl border border-black-olive-404040',
        });
        setError(message && message?.content ? message?.content : HAVING_ERROR);
      }
      return res;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error('An error occurred during deletion'));
      showToast({
          title: ERROR_CONNECTION,
          desc: HAVING_ERROR,
          styleData: 'bg-eerie-black rounded-2xl border border-black-olive-404040',
        });
      return {} as AxiosResponse<PageDataResponseType>;
    }
  }, []);

  return { deleteData, isLoading, error, response };
};