import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';
import { changePassword, ChangePasswordRequest, ChangePasswordResponse } from '@/lib/api/auth';

interface ChangePasswordHook {
  changePassword: (data: ChangePasswordRequest) => Promise<AxiosResponse<ChangePasswordResponse>>;
  isLoading: boolean;
  error: string | null;
  response: ChangePasswordResponse | null;
}

export const useChangePassword = (): ChangePasswordHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChangePasswordResponse | null>(null);

  const handleChangePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      try {
        const result = await changePassword(data);
        setResponse(result.data);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to change password';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    changePassword: handleChangePassword,
    isLoading,
    error,
    response,
  };
};