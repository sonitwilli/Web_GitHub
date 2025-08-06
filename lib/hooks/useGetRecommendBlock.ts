import { useState, useCallback } from 'react';
import { BlockItemResponseType, BlockSlideItemType, getBlockSortData } from '@/lib/api/blocks';

interface UseGetBlockDataProps {
  block?: BlockSlideItemType;
  setIsEmpty?: (value: boolean) => void;
  setIsError?: (value: boolean) => void;
}

export const useGetRecommendBlock = ({ block, setIsEmpty, setIsError }: UseGetBlockDataProps) => {
  const [blockData, setBlockData] = useState<BlockItemResponseType>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getBlockData = useCallback(
    async () => {
      if (!block?.block_type || !block?.id) {
        setIsEmpty?.(true);
        setIsError?.(true);
        return;
      }
      setIsLoading(true);
      setError(null);
      setIsError?.(false);
      try {
        const res = await getBlockSortData({
          block: block || {},
        });
        
        setBlockData(res?.data);
        if (res?.data?.code !== 200 || !res?.data?.data?.length) {
          setIsEmpty?.(true);
        } else {
          setIsEmpty?.(false);
        }
        setIsError?.(false);

        return res?.data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch block data'));
        setIsEmpty?.(true);
        setIsError?.(true);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [block, setIsEmpty, setIsError]
  );

  return { blockData, getBlockData, isLoading, error };
};