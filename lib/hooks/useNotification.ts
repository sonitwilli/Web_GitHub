import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import {
  onFetchCategoryList,
  onFetchInboxDetail,
  onFetchInboxList,
  onMarkReadInbox,
} from '../api/notification';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { showToast } from '../utils/globalToast';
import { DEFAULT_ERROR_MSG, ERROR_CONNECTION } from '../constant/texts';

export type InboxPagingType = {
  page: number;
  limit: number;
  total: number;
  total_page: number;
};

export function useNotification() {
  const dispatch = useDispatch();

  const handleError = useCallback(
    (error: unknown) => {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
        return;
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: DEFAULT_ERROR_MSG,
        });
      }
    },
    [dispatch],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await onFetchCategoryList();
      if (res.data.status === 1 && res.data.data) {
        return res.data.data;
      }
    } catch (error) {
      handleError(error);
    }
    return [];
  }, [handleError]);

  const fetchInbox = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      category_id?: string;
      status?: string;
    }) => {
      try {
        const res = await onFetchInboxList(params || {});
        if (res.data.status === 1) {
          return {
            data: res.data.data ?? [],
            paging: res.data.paging ?? {},
          };
        }
      } catch (error) {
        handleError(error);
      }
      return { data: [], paging: {} };
    },
    [handleError],
  );

  const fetchInboxDetail = useCallback(
    async (category_id: string, inbox_id: string) => {
      try {
        const res = await onFetchInboxDetail({ category_id, inbox_id });
        if (res.data.status === 1 && res.data.data) {
          return res.data.data;
        }
      } catch (error) {
        handleError(error);
      }
      return null;
    },
    [handleError],
  );

  const markRead = useCallback(
    async (ids: string[]) => {
      try {
        await onMarkReadInbox({ inbox_ids: ids });
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  return {
    fetchCategories,
    fetchInbox,
    fetchInboxDetail,
    markRead,
  };
}
