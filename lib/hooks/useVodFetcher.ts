import { useState, useCallback, useEffect } from 'react';
import { AxiosResponse } from 'axios';
import { getCookie } from 'cookies-next';
import {
  getBlockItemData,
  BlockItemResponseType,
  PageMetaType,
  BlockSlideItemType,
  BlockItemType,
} from '@/lib/api/blocks';
import { BLOCK_PAGE_SIZE } from '@/lib/constant/texts';
import { convertTimeStandardVN } from '@/lib/utils/sport';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseVodFetcherResult {
  vods?: BlockSlideItemType[];
  metaBlock?: PageMetaType;
  currentPage?: number;
  isLoading?: boolean;
  isFullList?: boolean;
  fetchNextPage: () => Promise<void>;
  reset: () => void;
}

export const useVodFetcher = (block: BlockItemType): UseVodFetcherResult => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vods, setVods] = useState<BlockSlideItemType[]>([]);
  const [metaBlock, setMetaBlock] = useState<PageMetaType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullList, setIsFullList] = useState(false);
  const convertTime = convertTimeStandardVN();

  // Hàm để tạo query string từ object
  const createQueryString = useCallback((params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params).toString();
    return searchParams ? `?${searchParams}` : '';
  }, []);

  const fetchData = useCallback(async () => {
    if (isFullList || isLoading) return;
    if (!block?.id) return;

    setIsLoading(true);

    try {
      const pageSize =
        typeof window !== 'undefined' ? getCookie(BLOCK_PAGE_SIZE) : 30;

      const res: AxiosResponse<BlockItemResponseType> = await getBlockItemData({
        block,
        page_index: currentPage,
      });

      const fetchedData = res.data?.data || [];
      const fetchedMeta = res.data?.meta || {};

      setVods((prev) => [...prev, ...fetchedData]);
      setMetaBlock(fetchedMeta);

      if (
        fetchedData.length === 0 ||
        fetchedData.length < (pageSize as number)
      ) {
        setIsFullList(true);
      } else {
        setCurrentPage((prev) =>  prev + 1);
      }
    } catch (error) {
      console.error('Fetch vod error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [block, currentPage, isFullList, isLoading]);

  // Check live data
  const checkDataLive = (data: BlockSlideItemType): boolean => {
    const currentTime = new Date();
    const currentTimestamp = Math.floor(currentTime.getTime() / 1000);
    let status: string | null = null;

    const startTime = parseInt(data.start_time || data.begin_time || '0');
    const endTime = parseInt(data.end_time || '0');

    if (currentTimestamp < startTime) {
      const countdownTime = startTime - currentTimestamp;
      if (countdownTime < 3600) {
        if (countdownTime < 1) {
          status = null;
        } else if (countdownTime < 60) {
          status =
            countdownTime < 10 ? `00:0${countdownTime}` : `00:${countdownTime}`;
        } else {
          let second: string | number = countdownTime % 60;
          let min: string | number = Math.floor(countdownTime / 60);
          if (second < 10) second = `0${second}`;
          if (min < 10) min = `0${min}`;
          status = `${min}:${second}`;
        }
      } else {
        status = convertTime(startTime * 1000, 'hh:mm | dd/MM/yyyy');
      }
    } else if (currentTimestamp > startTime && currentTimestamp < endTime) {
      status = null;
    } else if (data.end_time && currentTimestamp > endTime) {
      status = 'Đã kết thúc';
    } else if (!data.end_time) {
      status = null;
    }

    return (
      status === 'Đã kết thúc' ||
      (data.type === 'vod_playlist' && data.playlist_total === '0')
    );
  };

  // Initialize component
  useEffect(() => {
    const newDate = new Date().toISOString();
    localStorage.setItem('_menuSession', newDate);

    // Filter live vods
    setVods((prev) => prev.filter((vod) => !checkDataLive(vod)));

    const query = Object.fromEntries(searchParams.entries());
    // Clean up query params
    if (query.pre_page) {
      const queries = { ...query };
      delete queries.pre_page; // Xóa tham số pre_page
      const queryString = createQueryString(queries); // Tạo query string mới
      router.replace(`${window.location.pathname}${queryString}`, {
        scroll: false,
      });
    }

    return () => {
      localStorage.removeItem('_menuSession');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const reset = () => {
    setVods([]);
    setMetaBlock({});
    setCurrentPage(1);
    setIsFullList(false);
  };

  return {
    vods,
    metaBlock,
    isLoading,
    currentPage,
    isFullList,
    fetchNextPage: fetchData,
    reset,
  };
};
