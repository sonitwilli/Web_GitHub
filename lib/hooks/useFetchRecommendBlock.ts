import { useCallback, useState } from 'react';
import { localStorageWithExpiry } from '@/lib/utils/sport';
import {
  BlockItemResponseType,
  BlockSlideItemType,
  BlockItemType,
} from '@/lib/api/blocks';
import { useGetRecommendBlock } from './useGetRecommendBlock';
import { ConfigDataType } from '@/lib/api/main';

interface UseFetchRecommendBlockProps {
  dataIndex: BlockItemType;
  dataDefault: BlockItemResponseType;
  blockId: string;
  profile_id: string;
  cache_time: string | number;
  isLogged: boolean;
}

interface CacheBlock {
  [key: string]: BlockItemResponseType;
}

export const useFetchRecommendBlock = ({
  dataIndex,
  dataDefault,
  blockId,
  profile_id,
  cache_time,
  isLogged,
}: UseFetchRecommendBlockProps) => {
  const [isSortCompleted, setIsSortCompleted] = useState(false);
  const [data, setData] = useState<BlockSlideItemType[] | null>(
    dataDefault?.data || null,
  );
  const { setItem, getItem } = localStorageWithExpiry<CacheBlock>(
    profile_id,
    {},
  );
  const { getBlockData } = useGetRecommendBlock({
    block: dataIndex,
  });

  const mergeAndSortArrays = useCallback(
    (
      a: BlockSlideItemType[],
      b: BlockSlideItemType[],
      currentConfig?: ConfigDataType,
    ): BlockSlideItemType[] => {
      const result: BlockSlideItemType[] = [...a];
      const recommendData: BlockSlideItemType[] = [...b];
      const seen: Set<string> = new Set();
      let bIndex: number = 0;
      let aIndex: number = 0;

      for (const item of result) {
        if (item.pin === '1' || typeof item.pin === 'undefined') {
          seen.add(item?.id as string);
        }
      }

      while (
        (currentConfig?.number_item_of_page &&
          aIndex < +currentConfig?.number_item_of_page &&
          aIndex < result.length) ||
        bIndex < recommendData.length
      ) {
        if (aIndex >= result.length) {
          if (!seen.has(recommendData[bIndex].id as string)) {
            result.push(recommendData[bIndex]);
            seen.add(recommendData[bIndex].id as string);
            aIndex++;
          } else {
            bIndex++;
          }
        } else if (
          seen.has(result[aIndex]?.id as string) &&
          result[aIndex].pin === '0'
        ) {
          result.splice(aIndex, 1);
        } else if (
          bIndex >= recommendData.length ||
          result[aIndex].pin === '1' ||
          typeof result[aIndex].pin === 'undefined'
        ) {
          seen.add(result[aIndex]?.id as string);
          aIndex++;
        } else {
          while (
            bIndex < recommendData.length &&
            result[aIndex] &&
            recommendData[bIndex]
          ) {
            if (seen.has(recommendData[bIndex]?.id as string)) {
              bIndex++;
            } else if (
              result[aIndex]?.pin === '1' ||
              typeof result[aIndex]?.pin === 'undefined'
            ) {
              seen.add(result[aIndex]?.id as string);
              aIndex++;
            } else if (recommendData[bIndex]) {
              recommendData.push(result[aIndex]);
              result[aIndex] = recommendData[bIndex];
              seen.add(recommendData[bIndex]?.id as string);
              bIndex++;
              aIndex++;
            }
          }
        }
      }

      return result;
    },
    [],
  );

  //   Snowden: Warning: The `mergeAndSortArrays` function must be called with `this` as its first argument, but this is not the case. This is an error. To fix this, you must either bind `this` to the function or include it as the first argument of the call. For example: `mergeAndSortArrays.bind(this)(a, b)` or `mergeAndSortArrays.call(this, a, b)`.

  const fetchRecommendBlock = useCallback(
    async (currentConfig?: ConfigDataType) => {
      try {
        const dataClone: BlockItemResponseType = JSON.parse(
          JSON.stringify(dataDefault),
        );
        const { data: dataDf } = dataClone;
        let dataRes: BlockItemResponseType | null = null;
        const cacheBlock: CacheBlock | null = getItem();

        if (!isLogged && typeof localStorage !== 'undefined') {
          setData(dataDf || []);
          setIsSortCompleted(true);
          return;
        }

        if (dataIndex?.need_recommend === '0' && cacheBlock?.[`${blockId}`]) {
          delete cacheBlock?.[`${blockId}`];
          setItem(cacheBlock, +cache_time);
        }

        if (dataIndex?.need_recommend === '0') {
          setData(dataDf || []);
          setIsSortCompleted(true);
          return;
        }

        if (cacheBlock?.[`${blockId}`]) {
          dataRes = cacheBlock[`${blockId}`];
        } else if(dataIndex?.need_recommend === '1') {
          const response = await getBlockData();

          dataRes = response || null;

          if (!dataRes?.data) {
            setData(dataDf || []);
            setIsSortCompleted(true);
            return;
          }

          if (dataRes.code === 200 && typeof localStorage !== 'undefined') {
            const temp: CacheBlock = {
              ...(cacheBlock || {}),
              [`${blockId}`]: dataRes,
            };

            setItem(temp, +cache_time);
          }
        }

        const { data: dataRcmBlc } = dataRes || {};

        if (!dataRcmBlc) {
          setData(dataDf || []);
        } else {
          const dataMerged: BlockSlideItemType[] = mergeAndSortArrays(
            dataDf || [],
            dataRcmBlc || [],
            currentConfig,
          );

          setData(dataMerged);
        }
      } catch (error) {
        console.log(error);
        const { data: dataDf } = dataDefault;
        setData(dataDf || []);
        setIsSortCompleted(true);
      } finally {
        setIsSortCompleted(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataIndex, dataDefault, blockId],
  );

  return { data, fetchRecommendBlock, isSortCompleted };
};
