import { useState, useCallback } from 'react';
import {
  BlockItemResponseType,
  BlockItemType,
  getBlockItemData,
} from '@/lib/api/blocks';
import { wait } from '@/lib/utils/promise';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { useAppDispatch, useAppSelector } from '../store';

interface UseGetBlockDataProps {
  block?: BlockItemType;
  setIsEmpty?: (value: boolean) => void;
  setIsError?: (value: boolean) => void;
}

export const useGetBlockData = ({
  block,
  setIsEmpty,
  setIsError,
}: UseGetBlockDataProps) => {
  const [blockData, setBlockData] = useState<BlockItemResponseType>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const {configs} = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const getBlockData = useCallback(
    async (page_size = configs?.number_item_of_page || 30, delay = 2000) => {
      if (!block?.type) {
        setIsEmpty?.(true);
        setIsError?.(true);
        return;
      }
      setIsLoading(true);
      setError(null);
      setIsError?.(false);
      try {
        await wait({ time: delay });
        const res = await getBlockItemData({
          block: block || {},
          page_size: parseInt(page_size as string),
        });
        setBlockData(res?.data);
        if (res?.data?.code === 401) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
          setIsEmpty?.(false);          
          setIsError?.(true);
          return;
        }
        if (res?.data?.code !== 200 || !res?.data?.data?.length) {
          setIsEmpty?.(true);
        } else {
          setIsEmpty?.(false);
        }
        setIsError?.(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch block data'),
        );
        setIsEmpty?.(true);
        setIsError?.(true);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block, setIsEmpty, setIsError],
  );

  return { blockData, getBlockData, isLoading, error };
};
