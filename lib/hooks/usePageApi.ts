/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import {
  BlockItemResponseType,
  BlockItemType,
  getBlockItemData,
  getPageData,
  getRecommendData,
  PageDataResponseType,
  RecommendBlockItemType,
} from '@/lib/api/blocks';
import { useRouter } from 'next/router';
import { TOKEN, TYPE_PR } from '../constant/texts';

export const validBlockTypes = [
  'vod_detail',
  'horizontal_slider',
  'horizontal_slider_small',
  'horizontal_highlight_without_background',
  'feature_horizontal_slider',
  'vertical_slider_small',
  'vertical_slider_medium',
  'numeric_rank',
  'auto_expansion',
  'category',
  'horizontal_slider_hyperlink',
  'horizontal_slider_with_background',
  'ads',
  'sport_sidebyside',
  'horizontal_banner_with_title',
  'new_vod_detail',
];

export default function usePageApi({ currentId }: { currentId?: string }) {
  const router = useRouter();
  const [pageData, setPageData] = useState<PageDataResponseType>({});
  const [pageDataStatus, setPageDataStatus] = useState<string | undefined>(
    undefined,
  );
  const [recommendBlocks, setRecommendBlocks] = useState<
    RecommendBlockItemType[]
  >([]);
  const [highLightBlock, setHighLightBlock] = useState<BlockItemType>({});
  const [highLightBlockData, setHighLightBlockData] =
    useState<BlockItemResponseType>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageDataError, setPageDataError] = useState<string | null>(null);
  const [recommendBlocksError, setRecommendBlocksError] = useState<
    string | null
  >(null);
  const [highlightBlockError, setHighlightBlockError] = useState<string | null>(
    null,
  );

  const blocksSortedRecommend = useMemo(() => {
    const tempArr = [];
    const arrNotPosition = [];
    const pstNotArr = [];
    let arrInitital = [];
    const recommendMap = new Map(recommendBlocks.map((i) => [i.id, i]));
    const original = pageData?.data?.blocks || [];
    for (let i = 0; i < original.length; i++) {
      if (recommendMap.has(original[i].id)) {
        const temp = {
          ...original[i],
          position: recommendMap.get(original[i].id)?.position,
        };
        tempArr.push(temp);
      } else {
        arrNotPosition.push(original[i]);
      }
    }
    const compairPosition = (arr: RecommendBlockItemType[]) => {
      return arr.sort((a: any, b: any) =>
        a.position > b.position ? 1 : b.position > a.position ? -1 : 0,
      );
    };
    arrInitital = compairPosition(tempArr);
    const recomendDef = new Map(arrInitital.map((i) => [i?.position, i]));
    for (
      let i = 1;
      i < Math.max(...(recommendBlocks || []).map((o) => o.position as number));
      i++
    ) {
      if (!recomendDef.has(i)) {
        pstNotArr.push(i);
      }
    }
    for (let i = 0; i < pstNotArr.length; i++) {
      if (arrNotPosition[i]) arrNotPosition[i].position = pstNotArr[i];
    }
    const arrMerge = arrInitital.concat(arrNotPosition);
    arrInitital = compairPosition(arrMerge);
    const unique = arrInitital
      .filter((obj, index) => {
        return index === arrInitital.findIndex((o) => obj.id === o.id);
      })
      .map((block) => ({
        ...block,
        tracking_name: 'blocksSortedRecommend',
      }));
    return unique as BlockItemType[];
  }, [pageData, recommendBlocks]);

  const blocksSortedRecommendNotHighlight = useMemo(() => {
    return (blocksSortedRecommend || [])
      .filter(
        (block) =>
          // block.block_type === 'auto_expansion' &&
          block.block_type &&
          !block?.block_type?.toUpperCase().includes('HIGHLIGHT') &&
          validBlockTypes.includes(block.block_type),
      )
      .map((block) => ({
        ...block,
        tracking_name: 'blocksSortedRecommendNotHighlight',
      }));
  }, [blocksSortedRecommend]);

  const notHighLightBlocks = useMemo(() => {
    return blocksSortedRecommend
      ?.filter(
        (block) =>
          block.id !== highLightBlock?.id &&
          block.block_type &&
          validBlockTypes.includes(block.block_type),
      )
      .map((block) => ({ ...block, tracking_name: 'notHighLightBlocks' }));
  }, [blocksSortedRecommend, highLightBlock]);

  const fetchPageData = async () => {
    setIsLoading(true);
    setPageDataError(null);
    setHighlightBlockError(null);
    const isKid = localStorage.getItem(TYPE_PR) === '2';
    const { id } = router.query;
    let pageId = '';
    if (router.pathname === '/' && !isKid) {
      pageId = 'home';
    } else if (id && !isKid) {
      pageId = id as string;
    } else {
      pageId = 'home-kids';
    }
    let hlight: BlockItemType = {};
    if (currentId) {
      pageId = currentId;
    }

    try {
      const pageDataRes = await getPageData({ page_id: pageId });
      setPageDataStatus(pageDataRes?.data?.status);
      hlight =
        pageDataRes?.data?.data?.blocks?.find((item) =>
          item?.block_type?.toUpperCase().includes('HIGHLIGHT'),
        ) || {};
      setPageData({
        ...pageDataRes?.data,
        data: {
          ...pageDataRes?.data?.data,
          blocks: [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            /*@ts-ignore*/
            ...pageDataRes?.data?.data?.blocks?.map((item, index) => ({
              ...item,
              original_position: index,
              tracking_name: 'original',
            })),
          ],
        },
      });
      setHighLightBlock(hlight);
    } catch (err: any) {
      console.log('err fetch page data', err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi khi tải dữ liệu trang';
      console.log('errorMessage', errorMessage);
      setPageDataError(errorMessage);
      setError(errorMessage);
    }

    if (hlight?.id) {
      try {
        const highLightRes = await getBlockItemData({
          block: hlight,
        });
        setHighLightBlockData({
          ...highLightRes?.data,
          // data: highLightRes?.data?.data?.map((item) => ({
          //   ...item,
          //   trailer_info: {
          //     url: 'https://vodcdn.fptplay.net/POVOD/encoded/2025/05/15/friendzone-2025-vn-tr-2b643694c2b86442/H264/master.m3u8',
          //   },
          // })),
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Lỗi khi tải dữ liệu highlight';
        setHighlightBlockError(errorMessage);
        setError(errorMessage);
      }
    }
    setIsLoading(false);
  };

  const fetchRecommendBlocks = async () => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(TOKEN);
      if (!token) {
        return;
      }
    }
    setIsLoading(true);
    setRecommendBlocksError(null);
    const { id } = router.query;
    let pageId = '';
    if (router.pathname === '/') {
      pageId = 'home';
    } else if (id) {
      pageId = id as string;
    }

    try {
      const res = await getRecommendData({ page_id: pageId });
      setRecommendBlocks(
        (res?.data?.data?.blocks || []).map((item) => ({
          ...item,
          tracking_name: 'recommmendBlocks',
        })),
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi khi tải dữ liệu recommend';
      setRecommendBlocksError(errorMessage);
      setError(errorMessage);
    }
    setIsLoading(false);
  };

  const reloadData = async () => {
    setIsLoading(true);
    setError(null);
    setPageDataError(null);
    setRecommendBlocksError(null);
    setHighlightBlockError(null);
    await fetchRecommendBlocks();
    await fetchPageData();
    setIsLoading(false);
  };

  const clearErrors = () => {
    setError(null);
    setPageDataError(null);
    setRecommendBlocksError(null);
    setHighlightBlockError(null);
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    reloadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id]);
  return {
    pageData,
    pageDataStatus,
    recommendBlocks,
    highLightBlock,
    notHighLightBlocks,
    highLightBlockData,
    blocksSortedRecommend,
    blocksSortedRecommendNotHighlight,
    setHighLightBlockData,
    reloadData,
    isLoading,
    error,
    pageDataError,
    recommendBlocksError,
    highlightBlockError,
    clearErrors,
  };
}
