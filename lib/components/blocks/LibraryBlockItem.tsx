import { BlockItemType, BlockMetaType } from '@/lib/api/blocks';
import { useCallback, useContext, useEffect, useState } from 'react';
import LibrarySlide from '../slider/embla/block-slider/LibrarySlide';
import ShowMore from '@/lib/components/buttons/ShowMore';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { useGetBlockData } from '@/lib/hooks/useGetBlockData'; // Adjust the import path as needed
import { useFetchRecommendBlock } from '@/lib/hooks/useFetchRecommendBlock';
import { AppContext } from '@/lib/components/container/AppContainer';
// import NoData from '@/lib/components/empty-data/NoData';

interface Props {
  block?: BlockItemType;
  setIsEmpty?: (value: boolean) => void;
  setIsError?: (value: boolean) => void;
  registerReloadData?: (reloadData: () => void) => void;
}

export default function LibraryBlockItem({
  block,
  setIsEmpty,
  setIsError,
  registerReloadData,
}: Props) {
  const { blockData, getBlockData, error, isLoading } = useGetBlockData({
    block,
    setIsEmpty,
    setIsError,
  });
  const [blockMeta, setBlockMeta] = useState<BlockMetaType>({});
  const [isShowMore, setIsShowMore] = useState<boolean>(false);
  const router = useRouter();
  const queryId =
    typeof router.query.id === 'string' ? router.query.id : undefined;
  const dispatch = useAppDispatch();
  const appCtx = useContext(AppContext);
  const { info } = useAppSelector((state) => state.user);
  const { configs } = appCtx;

  const { data, fetchRecommendBlock } = useFetchRecommendBlock({
    dataIndex: block || {},
    dataDefault: blockData,
    blockId: block?.id || '',
    profile_id: info?.profile?.profile_id || '',
    cache_time: configs?.recommend_ttl || '0',
    isLogged: info?.user_id_str !== '' || false,
  });

  useEffect(
    () => {
      if (block?.id && info?.profile?.profile_id) {
        fetchRecommendBlock(configs);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockData]
  );

  const handleReloadData = useCallback(() => {
    if (queryId) {
      getBlockData(1000);
    } else {
      getBlockData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  // Register handleReloadData with parent
  useEffect(() => {
    if (registerReloadData) {
      registerReloadData(handleReloadData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerReloadData]);

  useEffect(() => {
    if (blockData?.meta) {
      setBlockMeta(blockData.meta);
    }
    if (blockData?.data?.length === 0 && setIsEmpty) {
      setIsEmpty(true);
    }
    if (
      Array.isArray(blockData?.data) &&
      blockData?.data?.length > 0 &&
      setIsEmpty
    ) {
      setIsEmpty(false);
    }

    if (error) {
      setIsError?.(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockData?.data]);

  const handleShowMoreClick = async () => {
    setIsShowMore((prev) => !prev);

    dispatch(
      setSideBarLeft({
        url: '/tai-khoan?tab=thu-vien',
        text: 'Thư viện',
      })
    );

    if (block?.id) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, id: block.id },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  useEffect(() => {
    if (queryId) {
      getBlockData(1000);
    } else {
      getBlockData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  useEffect(() => {
    if (
      (!queryId &&
        Array.isArray(data) &&
        data?.length > Number(block?.redirect?.view_more_limit)) ||
      (!queryId && !data)
    ) {
      setIsShowMore(false);
      dispatch(
        setSideBarLeft({
          url: '/',
          text: 'Quay lại FPT Play',
        })
      );
    } else if (
      (queryId &&
        Array.isArray(data) &&
        data?.length > Number(block?.redirect?.view_more_limit)) ||
      (queryId && !data)
    ) {
      setIsShowMore(true);
      dispatch(
        setSideBarLeft({
          url: '/tai-khoan?tab=thu-vien',
          text: 'Thư viện',
        })
      );
    }
  }, [queryId, data, block?.redirect?.view_more_limit, dispatch]);

  if (isLoading || data?.length === 0) {
    return null;
  }

  return (
    <div
      style={
        block?.block_type === 'horizontal_slider_with_background'
          ? {
              backgroundImage: `url(${block?.background_image?.smarttv})`,
            }
          : {}
      }
      className={`${
        block?.block_type === 'horizontal_slider_with_background'
          ? 'relative pb-[20px] pt-[100px] bg-cover bg-no-repeat bg-top'
          : 'relative'
      }`}
    >
      <div className="flex items-center gap-[16px] justify-between sm:justify-start mb-0 xl:mb-4">
        {
          <h2
            className={`${
              queryId
                ? 'text-[18px] sm:text-[28px]'
                : 'text-[18px] sm:text-[24px]'
            } font-[700] leading-[1.3] text-white-smoke pl-0 sm:pl-[16px]`}
          >
            {data?.length ? blockData?.meta?.name || block?.name : ''}
          </h2>
        }
        {Array.isArray(data) &&
          data?.length > 0 &&
          data?.length > Number(block?.redirect?.view_more_limit) &&
          !isShowMore && <ShowMore onClick={handleShowMoreClick} />}
      </div>
      <LibrarySlide
        key={queryId}
        slidesItems={data || []}
        block={block}
        slideClassName={`block-slider-${block?.block_type}`}
        blockMeta={blockMeta}
        reloadData={handleReloadData}
      />
    </div>
  );
}
