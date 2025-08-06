import { useState, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import {
  fetchUserTokens,
  doSendOtpNewFlow,
  cancelExtend,
  ApiResponse,
  FetchUserTokensResponseData,
  ValidateOtpResponseData,
  SendOtpNewFlowResponseData,
  CancelExtendResponseData,
  Token,
} from '@/lib/api/payment'; // Adjust path to your API file
import { useAppDispatch } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

interface AutoExtendState {
  loading: boolean;
  error: string | null;
  fetchUserTokensData: ApiResponse<FetchUserTokensResponseData> | null;
  validateOtpData: ApiResponse<ValidateOtpResponseData> | null; // Added for validate response
  sendOtpData: ApiResponse<SendOtpNewFlowResponseData> | null;
  cancelExtendData: ApiResponse<CancelExtendResponseData> | null;
}

interface UseAutoExtendReturn {
  fetchUserTokens: () => Promise<
    AxiosResponse<ApiResponse<FetchUserTokensResponseData>>
  >;
  doSendOtpNewFlow: (params: { phone: string }) => Promise<{
    validateResponse: AxiosResponse<ApiResponse<ValidateOtpResponseData>>;
    sendResponse: AxiosResponse<ApiResponse<SendOtpNewFlowResponseData>>;
  }>;
  cancelExtend: (params: {
    item: Token;
    verify_token: string;
  }) => Promise<AxiosResponse<ApiResponse<CancelExtendResponseData>>>;
  state: AutoExtendState;
  resetState: () => void;
}

export const useAutoExtend = (): UseAutoExtendReturn => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<AutoExtendState>({
    loading: false,
    error: null,
    fetchUserTokensData: null,
    validateOtpData: null, // Initialize new state field
    sendOtpData: null,
    cancelExtendData: null,
  });

  const handlerFetchUserTokens = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchUserTokens();
      setState((prev) => ({
        ...prev,
        loading: false,
        fetchUserTokensData: response.data,
      }));
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      if(error instanceof AxiosError && error.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
      throw new Error('Failed to fetch user tokens');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDoSendOtpNewFlow = useCallback(
    async (params: { phone: string }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await doSendOtpNewFlow(params);
        const { validateResponse, sendResponse } = result;
        setState((prev) => ({
          ...prev,
          loading: false,
          validateOtpData: validateResponse.data, // Store validate response data
          sendOtpData: sendResponse.data, // Store send response data
        }));
        return result; // Return both responses
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [],
  );

  const handleCancelExtend = useCallback(
    async (params: { item: Token; verify_token: string }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await cancelExtend(params);
        setState((prev) => ({
          ...prev,
          loading: false,
          cancelExtendData: response.data,
        }));
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [],
  );

  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      fetchUserTokensData: null,
      validateOtpData: null, // Reset new state field
      sendOtpData: null,
      cancelExtendData: null,
    });
  }, []);

  return {
    fetchUserTokens: handlerFetchUserTokens,
    doSendOtpNewFlow: handleDoSendOtpNewFlow,
    cancelExtend: handleCancelExtend,
    state,
    resetState,
  };
};