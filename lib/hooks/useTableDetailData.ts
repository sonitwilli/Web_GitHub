// hooks/useTableDetailData.ts
import { useState, useEffect, useRef } from 'react';
import { AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { groupBy, forEach } from 'lodash';
import { localStorageWithExpiry } from '@/lib/utils/sport';
import {
  getTableDetailData,
  PageDataResponseType,
  BlockSlideItemType,
  Match,
} from '@/lib/api/sport';

interface HighlightBlock {
  id?: string | number;
  name?: string;
  type?: string;
  block_type?: string;
  custom_data?: string;
  list_items?: BlockSlideItemType[] | BlockSlideItemType[][];
  date?: string;
}

interface UseTableDetailDataResult {
  data: HighlightBlock | null;
  loading: boolean;
  error: string | null;
  refetch: (data: HighlightBlock, tagSelect?: string) => Promise<void>;
}

// Hàm chuyển đổi chuỗi tiếng Việt không dấu
const viToEn = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '-');
};

export const useTableDetailData = (
  initialData?: HighlightBlock,
  tagSelect?: string,
): UseTableDetailDataResult => {
  const [data, setData] = useState<HighlightBlock | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedId = useRef<string | number>('');
  const { setItem, getItem, removeItem } = localStorageWithExpiry<HighlightBlock>('sportData', null);
  const router = useRouter();

  // Hàm changeGroupByData
  const changeGroupByData = (rawData: HighlightBlock): HighlightBlock => {
    if (tagSelect !== '' && rawData?.list_items) {
      const index = rawData.list_items.findIndex(
        (item: BlockSlideItemType) => viToEn(item.title || '') === tagSelect,
      );

      if (index !== -1) {
        // Allow league.matches to be null or undefined — treat as empty array
        const league = (rawData.list_items[index] as BlockSlideItemType)
          ?.league;
  // league.matches may be null — normalize to an array.
  const matches: Match[] = league?.matches ?? [];
        const groupKey =
          matches?.[0]?.id === 'match_date' ? 'match_date' : 'round_name';

        // Nhóm dữ liệu theo match_date hoặc round_name
        const channelGroupIds = groupBy(matches, groupKey);

        const newListItems: BlockSlideItemType[] | BlockSlideItemType[][] = [];

        // Làm phẳng các nhóm thành mảng một chiều
        forEach(channelGroupIds, (items) => {
          newListItems.push(items); // Phân rã mảng con vào newListItems
        });

        // Tạo HighlightBlock mới
        const newSportSide: HighlightBlock = {
          list_items: newListItems,
          block_type: 'sport_sidebyside',
          id: 'none_sport',
          name: rawData.name || 'Sport SideBySide',
          type: rawData.type || 'league',
        };

        return newSportSide;
      }
    }

    // Trả về dữ liệu gốc nếu không có tagSelect hoặc không tìm thấy index
    return rawData;
  };

  const fetchData = async (fetchData: HighlightBlock, tagSelect?: string) => {
    if (fetchData?.id && fetchData.id === lastFetchedId.current && !tagSelect)
      return;

    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<PageDataResponseType> =
        await getTableDetailData({
          data: fetchData,
        });
      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'API error');
      }

      const highlightBlock: HighlightBlock = {
        id: fetchData.id,
        name: fetchData.name || 'League Table',
        type: fetchData.type || 'league',
        block_type: fetchData.block_type || 'table',
        custom_data: fetchData.custom_data,
        list_items: response.data.data || [],
        date: fetchData.date,
      };

      setItem(highlightBlock, 30); // Lưu dữ liệu vào localStorage với thời gian hết hạn 30 phút

      // Áp dụng changeGroupByData để chuyển đổi dữ liệu
      const processedData = changeGroupByData(highlightBlock);

      setData(processedData);
      lastFetchedId.current = fetchData?.id ?? 0;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch table league detail';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData?.id) {
      const dataStorage = getItem();
      if (dataStorage) {
        const processedData = changeGroupByData(dataStorage);
        setData(processedData);
      } else {
        fetchData(initialData, tagSelect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id, tagSelect]);

  // Sử dụng useEffect để lắng nghe sự kiện chuyển trang
  useEffect(() => {
    // Hàm xử lý khi bắt đầu chuyển trang
    const handleRouteChange = (url: string) => {
      // Phân tích URL để lấy query
      const queryStart = url.indexOf('?');
      const queryString = queryStart !== -1 ? url.slice(queryStart + 1) : '';
      const params = new URLSearchParams(queryString);

      // Kiểm tra xem query có chứa 'tab' hay không
      const hasTab = params.has('tab');

      if (!hasTab) {
        removeItem(); // Xóa dữ liệu khỏi localStorage
      }
    };

    // Đăng ký sự kiện routeChangeStart
    router.events.on('routeChangeStart', handleRouteChange);

    // Cleanup: Hủy đăng ký sự kiện khi component unmount
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, removeItem]); // Dependency array bao gồm router.events và removeItem

  // Sử dụng useEffect để lắng nghe sự kiện reload
  useEffect(() => {
    // Hàm xử lý khi trang được reload hoặc đóng
    const handleBeforeUnload = () => {
      removeItem(); // Xóa dữ liệu khỏi localStorage
    };

    // Đăng ký sự kiện beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: Hủy đăng ký sự kiện khi component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [removeItem]); // Dependency array bao gồm removeItem

  const refetch = async (data: HighlightBlock, tagSelect?: string) => {
    if (data?.id) {
      await fetchData(data, tagSelect);
    }
  };

  return { data, loading, error, refetch };
};
