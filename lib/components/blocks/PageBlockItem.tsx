import {
  BlockItemResponseType,
  BlockItemType,
  BlockSlideItemType,
  getBlockItemData,
} from '@/lib/api/blocks';
import { useContext, useEffect, useMemo, useState } from 'react';
import { viToEn } from '@/lib/utils/methods';
import { SPORT_SIDEBYSIDE } from '@/lib/constant/texts';
import { AppContext } from '../container/AppContainer';
import EmblaBlockSlider from '@/lib/components/slider/embla/block-slider/EmblaBlockSlider';
import BlockHorizontalWithTitle from '@/lib/components/blocks/BlockHorizontalWithTitle';
import TodayTableLeagueResult from '@/lib/components/sport/TodayTableLeagueResult';
import SportSideBySide from '@/lib/components/sport/SportSideBySide';
import ShowMore from '../buttons/ShowMore';
import { useAppSelector } from '@/lib/store';
import { useFetchRecommendBlock } from '@/lib/hooks/useFetchRecommendBlock';
import NewVodDetail from '../slider/embla/new-vod-detail-slider/NewVodDetail';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useRouter } from 'next/router';
import { Match } from '@/lib/api/blocks';

interface Props {
  block?: BlockItemType;
  setIsEmpty?: (value: boolean) => void;
  blockFullData?: BlockItemResponseType;
  onFetchCompleted?: () => void;
  useContainer?: boolean;
  keywordSearch?: string;
}

export default function PageBlockItem({
  block,
  setIsEmpty,
  onFetchCompleted,
  useContainer = true,
  keywordSearch,
}: Props) {
  const appCtx = useContext(AppContext);
  const { width } = useScreenSize();
  const { configs } = appCtx;
  const { streamType } = usePlayerPageContext();
  const router = useRouter();
  const [blockData, setBlockData] = useState<BlockItemResponseType>({});
  const { info } = useAppSelector((state) => state.user);
  const [isFetchDefaultDataCompleted, setIsFetchDefaultDataCompleted] =
    useState(false);

  // Kiểm tra xem có đang ở trang xem-video hay không
  const isVideoWatchPage = router.pathname.includes('xem-video');

  const getBlockData = async () => {
    if (!block?.type) {
      return;
    }
    try {
      if (streamType === 'playlist') {
        setBlockData(block as unknown as BlockItemResponseType);
        return;
      } else {
        const res = await getBlockItemData({
          block: block || {},
          keywordSearch: keywordSearch,
        });
        setBlockData(res?.data);
      }

      // setBlockData({
      //   ...res?.data,
      //   data: res?.data?.data?.map((item) => ({
      //     ...item,
      //     trailer_info: {
      //       url: 'https://vodcdn.fptplay.net/POVOD/encoded/2025/05/15/friendzone-2025-vn-tr-2b643694c2b86442/H264/master.m3u8',
      //     },
      //   })),
      // });
      // if (res?.data?.code !== 200 || !res?.data?.data?.length) {
      //   if (setIsEmpty) {
      //     // setIsEmpty(true);
      //   }
      // }
    } catch {
      //
    } finally {
      setIsFetchDefaultDataCompleted(true);
    }
  };

  const { data, fetchRecommendBlock, isSortCompleted } = useFetchRecommendBlock(
    {
      dataIndex: block || {},
      dataDefault: blockData || {},
      blockId: block?.id || '',
      profile_id: info?.profile?.profile_id || '',
      cache_time: configs?.recommend_ttl || '0',
      isLogged: info?.user_id_str !== '' || false,
    },
  );

  const isFetchAllCompleted = useMemo(() => {
    if (!blockData?.data?.length) {
      return !!isFetchDefaultDataCompleted;
    }
    return isFetchDefaultDataCompleted && isSortCompleted;
  }, [isFetchDefaultDataCompleted, isSortCompleted, blockData]);

  useEffect(() => {
    if (isFetchAllCompleted) {
      if (onFetchCompleted) onFetchCompleted();
    }
  }, [isFetchAllCompleted, onFetchCompleted]);

  useEffect(() => {
    if (isFetchDefaultDataCompleted) {
      if (!blockData?.data?.length) {
        if (setIsEmpty) {
          setIsEmpty(true);
        }
        return;
      }
    }
  }, [
    isSortCompleted,
    isFetchDefaultDataCompleted,
    blockData?.data?.length,
    setIsEmpty,
  ]);

  const linkMore = useMemo(() => {
    if (block?.type === 'page') {
      return `/trang/${block.id}`;
    } else {
      return `/block/${block?.type}/${viToEn(block?.name || '')}-${block?.id}`;
    }
  }, [block]);

  useEffect(() => {
    getBlockData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  useEffect(() => {
    if (
      block?.id &&
      Array.isArray(blockData?.data) &&
      blockData?.data?.length > 0
    ) {
      fetchRecommendBlock(configs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockData]);

  if (block?.block_type === 'auto_expansion') {
    return (
      <NewVodDetail
        data={data as BlockSlideItemType[]}
        block={block}
        blockData={blockData}
      />
    );
  }

  if (block?.block_type === 'horizontal_banner_with_title' && width >= 1280) {
    return (
      <BlockHorizontalWithTitle
        slidesItems={data || []}
        block={block}
        slideClassName={`block-slider-${block?.block_type}`}
        blockData={blockData}
        linkMore={linkMore}
      />
    );
  }

  if (block?.block_type === SPORT_SIDEBYSIDE?.[0]) {
    // Check if we're on the main sport page by checking the query id
    const isMainSportPage = router.query.id === 'sport';

    // Check if there are today matches (TodayTableLeagueResult will render null if none)
    const hasTodayMatches =
      blockData?.data &&
      Array.isArray(blockData.data) &&
      blockData.data.some((item: BlockSlideItemType) => {
        return (
          item?.league?.matches &&
          item.league.matches.some((match: Match) => {
            // get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            return match.match_date === today;
          })
        );
      });

    return (
      <div className={`${useContainer ? 'f-container' : ''} mb-[24px]`}>
        <div className="w-full">
          {isMainSportPage ? (
            hasTodayMatches ? (
              <div className="flex flex-col flex-1">
                <div className="py-3 font-semibold text-2xl text-white">
                  Lịch đấu hôm nay
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="rounded-b-lg">
                    <TodayTableLeagueResult
                      blockData={blockData}
                      height=""
                      pageType={block?.id}
                    />
                  </div>
                </div>
              </div>
            ) : null
          ) : (
            // On league pages, show full SportSideBySide
            <SportSideBySide data={block} blockData={blockData} />
          )}
        </div>
      </div>
    );
  }
  if (block?.type === 'search') {
    return (
      <div>
        <div
          className={`${useContainer ? 'f-container' : ''} mb-[16px] b-title ${
            !blockData?.meta?.short_description
              ? 'flex items-center gap-[16px]'
              : ''
          }`}
        >
          <h2 className="text-[20px] 2xl:text-[24px] max-w-[90%] font-[600] text-white-smoke truncate">
            {blockData?.meta?.name || block?.name}
          </h2>
          {blockData?.meta?.short_description && (
            <div className="text-[16px] text-spanish-gray mt-1 w-full flex items-center gap-2">
              {blockData?.meta?.short_icon && (
                <img
                  src={blockData.meta.short_icon}
                  alt="Short icon"
                  className="w-[24px] h-[24px] object-contain"
                />
              )}
              <span>{blockData.meta.short_description}</span>
            </div>
          )}
          {blockData?.data &&
            blockData?.data?.length > Number(configs?.number_item_of_page) &&
            !isVideoWatchPage && <ShowMore href={linkMore} variant="link" />}
        </div>
        <div className={`${useContainer ? 'f-slider-container' : ''}`}>
          <EmblaBlockSlider
            slidesItems={data || []}
            block={block}
            slideClassName={`block-slider-${block?.block_type}`}
          />
        </div>
      </div>
    );
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
          ? 'pb-[20px] pt-[100px] bg-cover bg-no-repeat bg-top'
          : ''
      }`}
    >
      <div
        className={`${useContainer ? 'f-container' : ''} mb-[14px] md:mb-[24px] ${
          !blockData?.meta?.short_description
            ? 'flex items-center gap-0 md:gap-[16px] justify-between tablet:justify-start'
            : ''
        }`}
      >
        <h2 className="text-[16px] 2xl:text-[24px] pr-[16px] md:pr-0 font-[600] text-white-smoke truncate max-w-[90%]">
          {blockData?.meta?.name || block?.name}
        </h2>
        {blockData?.meta?.short_description && (
          <div className="text-[16px] text-spanish-gray mt-1 w-full">
            {blockData.meta.short_description}
          </div>
        )}
        {blockData?.data &&
          blockData?.data?.length > Number(configs?.number_item_of_page) &&
          !isVideoWatchPage && <ShowMore href={linkMore} variant="link" />}
      </div>
      <div className={`${useContainer ? 'f-container' : ''}`}>
        <EmblaBlockSlider
          slidesItems={data || []}
          block={block}
          slideClassName={`block-slider-${block?.block_type} block-type-${block?.type}`}
        />
      </div>
    </div>
  );
}
