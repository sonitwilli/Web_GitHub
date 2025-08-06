import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';
import {
  doDeleteWebToken,
  doDeleteWebTokenSso,
  doDeleteNativeToken,
  doDeleteNativeTokenSso,
  ClearWebTokensResponse,
} from '@/lib/api/notice'; // Adjust path to your API file

interface AuthTokensState {
  loading: boolean;
  error: string |	null;
  data: ClearWebTokensResponse | null;
}

interface UseAuthTokensReturn {
  deleteWebToken: (params: {
    socialLogin?: boolean;
    phone?: string;
    password?: string;
    social_email?: string;
  }) => Promise<AxiosResponse<ClearWebTokensResponse>>;
  deleteWebTokenSso: (params: {
    phone?: string;
    password?: string;
    social_email?: string;
  }) => Promise<AxiosResponse<ClearWebTokensResponse>>;
  deleteNativeToken: (params: { phone: string }) => Promise<AxiosResponse<ClearWebTokensResponse>>;
  deleteNativeTokenSso: (params: { phone: string }) => Promise<AxiosResponse<ClearWebTokensResponse>>;
  state: AuthTokensState;
  resetState: () => void;
}

export const useAuthTokens = (): UseAuthTokensReturn => {
  const [state, setState] = useState<AuthTokensState>({
    loading: false,
    error: null,
    data: null,
  });

  const deleteWebToken = useCallback(
    async (params: {
      socialLogin?: boolean;
      phone?: string;
      password?: string;
      social_email?: string;
    }): Promise<AxiosResponse<ClearWebTokensResponse>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await doDeleteWebToken(params);
        setState((prev) => ({ ...prev, loading: false, data: response.data }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [],
  );

  const deleteWebTokenSso = useCallback(
    async (params: {
      phone?: string;
      password?: string;
      social_email?: string;
    }): Promise<AxiosResponse<ClearWebTokensResponse>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await doDeleteWebTokenSso(params);
        setState((prev) => ({ ...prev, loading: false, data: response.data }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [],
  );

  const deleteNativeToken = useCallback(
    async (params: { phone: string }): Promise<AxiosResponse<ClearWebTokensResponse>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await doDeleteNativeToken(params);
        setState((prev) => ({ ...prev, loading: false, data: response.data }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [],
  );

  const deleteNativeTokenSso = useCallback(
    async (params: { phone: string }): Promise<AxiosResponse<ClearWebTokensResponse>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await doDeleteNativeTokenSso(params);
        setState((prev) => ({ ...prev, loading: false, data: response.data }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [],
  );

  const resetState = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    deleteWebToken,
    deleteWebTokenSso,
    deleteNativeToken,
    deleteNativeTokenSso,
    state,
    resetState,
  };
};