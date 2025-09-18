import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useVodFetcher } from '@/lib/hooks/useVodFetcher';
import EmblaBlockSlideItem from '@/lib/components/slider/embla/block-slider/EmblaBlockSlideItem';
import ShortVideoContent from '@/lib/components/short-video/ShortVideoContent';
import { throttle } from 'lodash';
import DefaultLayout from '@/lib/layouts/Default';
import { BlockTypeType, BlockItemType, getBlockItemData } from '@/lib/api/blocks';
import { loadJsScript } from '@/lib/utils/methods';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeAdsLoaded } from '@/lib/store/slices/appSlice';
import { createSeoPropsFromMeta, createSeoPropsFromMetaData } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';
import { changePageBlocks } from '@/lib/store/slices/blockSlice';

export const getServerSideProps = (async (context) => {
  const { type, id } = context.params as { type: string; id: string };

  const getBlockTypeTitle = (blockType: string) => {
    switch (blockType) {
      case 'short_vod':
        return 'Short Videos';
      case 'movie':
        return 'Phim Lẻ - FPT Play | Phim Chiếu Rạp & Blockbuster';
      case 'series':
        return 'Phim Bộ - FPT Play | Phim Truyền Hình & Series';
      case 'tv':
        return 'Truyền Hình - FPT Play | Kênh TV & Chương Trình Trực Tiếp';
      case 'sport':
        return 'Thể Thao - FPT Play | Bóng Đá & Thể Thao Trực Tiếp';
      default:
        return 'FPT Play - Giải Trí & Truyền Hình Trực Tuyến';
    }
  };

  const getBlockTypeDescription = (blockType: string) => {
    switch (blockType) {
      case 'short_vod':
        return 'Short Videos';
      case 'movie':
        return 'Thưởng thức bộ sưu tập phim lẻ đa dạng từ Hollywood đến Châu Á, phim chiếu rạp mới nhất và các tác phẩm blockbuster trên FPT Play.';
      case 'series':
        return 'Xem phim bộ, series hot và chương trình truyền hình chất lượng cao với phụ đề tiếng Việt trên FPT Play.';
      case 'tv':
        return 'Theo dõi các kênh truyền hình trực tiếp, chương trình giải trí và tin tức 24/7 trên FPT Play.';
      case 'sport':
        return 'Xem bóng đá trực tiếp, thể thao 24/7 với chất lượng HD, không quảng cáo trên FPT Play.';
      default:
        return 'Giải trí không giới hạn với hàng nghìn bộ phim, chương trình truyền hình và nội dung độc quyền trên FPT Play.';
    }
  };

  // Extract the actual block ID from the URL parameter
  const tagId = id.split('-').pop() || '';
  
  const block: BlockItemType = {
    block_type: (type as BlockTypeType) || 'category',
    custom_data: tagId === 'becauseyouwatched' ? 'None' : '',
    id: tagId,
    type: type,
  };

  try {
    // Fetch block data to get meta information for SEO
    const blockResponse = await getBlockItemData({
      block,
      page_index: 1,
      page_size: 1, // Only need meta data, not all content
    });

    const metaData = blockResponse.data?.meta;
    
    if (metaData) {
      // Create SEO props using the actual API response data
      const seoProps = createSeoPropsFromMetaData({
        meta_title: metaData.name,
        meta_description: metaData.short_description,
        name: metaData.name,
        index: 1, // Allow indexing for category pages
        follow: 1, // Allow following links
      }, tagId, `/block/${type}`);

      return { props: { seoProps } };
    } else {
      // If no meta data available, use fallback
      const seoProps = await createSeoPropsFromMeta({
        pageId: tagId,
        fallbackTitle: getBlockTypeTitle(type),
        fallbackDescription: getBlockTypeDescription(type),
        pathPrefix: `/block/${type}`,
      });

      return { props: { seoProps } };
    }
  } catch (error) {
    console.error('Error fetching block data for SEO:', error);
    
    // Fallback to basic SEO if API call fails
    const seoProps = await createSeoPropsFromMeta({
      pageId: tagId,
      fallbackTitle: getBlockTypeTitle(type),
      fallbackDescription: getBlockTypeDescription(type),
      pathPrefix: `/block/${type}`,
    });

    return { props: { seoProps } };
  }
}) satisfies GetServerSideProps<{ seoProps: SeoProps }>;

const BlockDetailPage: React.FC = () => {
  const blockLoadingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isHeaderAdsClosed } = useAppSelector((state) => state.app);
  useLayoutEffect(() => {
    dispatch(changePageBlocks([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagId = router.query.id
    ? (router.query.id as string).split('-').pop() || ''
    : '';

  const block: BlockItemType = {
    block_type: (router.query.block_type as BlockTypeType) || '',
    custom_data: tagId === 'becauseyouwatched' ? 'None' : '',
    id: tagId || '',
    type: router.query.type as string,
  };

  const { vods, metaBlock, isLoading, isFullList, fetchNextPage } =
    useVodFetcher(block);
  const [adsExist, setAdsExist] = useState(false);

  // Memoized onScroll handler
  const onScroll = () => {
    if (
      blockLoadingRef.current &&
      window.innerHeight + window.scrollY >=
        blockLoadingRef.current.offsetTop &&
      !isLoading &&
      !isFullList
    ) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (router.isReady && process.env.NEXT_PUBLIC_API_ADS) {
      const timer = setTimeout(() => {
        loadJsScript({
          src: process.env.NEXT_PUBLIC_API_ADS!,
          id: 'ads-script',
          cb: () => {
            dispatch(changeAdsLoaded(true));
          },
        });
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [router.isReady, dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleInitBanner = () => {
      try {
        const ins = document.querySelector('ins[data-aplpm="105-111"]');
        const existedAds = ins
          ? (ins as HTMLElement).children.length > 0
          : false;
        setAdsExist(existedAds);
      } catch {}
    };

    document.addEventListener('initBanner', handleInitBanner);
    return () => {
      document.removeEventListener('initBanner', handleInitBanner);
    };
  }, []);

  // Memoized throttled onScroll
  const throttledOnScroll = throttle(onScroll, 1000);

  useEffect(() => {
    fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id, router.query.type]);

  useEffect(() => {
    window.addEventListener('scroll', throttledOnScroll);
    return () => {
      window.removeEventListener('scroll', throttledOnScroll);
      localStorage.removeItem('_menuSession');
    };
  }, [throttledOnScroll]);

  return (
    <DefaultLayout>
      <div className="mb-5">
        <div
          className={`mx-auto w-full bg-smoky-black min-h-screen ${
            router.query.type !== 'short_vod' ? 'f-container' : ''
          }`}
        >
          {router.query.type === 'short_vod' && <ShortVideoContent />}

          {router.query.type !== 'short_vod' && (
            <>
              {/* Title */}
              <div
                className={`flex justify-start items-center mb-[16px] lg:mb-[40px] ${
                  isHeaderAdsClosed || isHeaderAdsClosed === null || !adsExist
                    ? 'mt-[120px] lg:mt-[184px]'
                    : 'mt-[104px]'
                }`}
              >
                {metaBlock?.name && (
                  <h1 className="text-left text-white font-bold text-[18px] md:text-[40px] leading-[130%] tracking-[2%] line-clamp-2 overflow-hidden">
                    {metaBlock.name}
                  </h1>
                )}
              </div>
              {/* Content */}
              {Array.isArray(vods) && vods.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-[26px] gap-x-[26px]  lg:gap-y-[63px] lg:gap-x-6">
                  {vods.map((item, index) => (
                    <div key={index} className="animate-fade-in">
                      <EmblaBlockSlideItem
                        block={block}
                        slide={item}
                        metaBlock={metaBlock}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div ref={blockLoadingRef} className="text-center">
                {isLoading && !isFullList && (
                  <button className="bg-gradient-to-r from-portland-orange to-lust text-white rounded-lg w-60 h-12">
                    ĐANG TẢI DỮ LIỆU
                  </button>
                )}
              </div>
            </>
          )}

          <div className="ads_overlay_balloon_banner">
            <ins
              data-aplpm="11320103-11320203"
              className="adsplay-placement adsplay-placement-fixed"
            />
            <ins
              className="adsplay-placement adsplay-placement-fixed"
              data-aplpm="113-"
            />
            <ins
              className="adsplay-placement adsplay-placement-fixed"
              data-aplpm="104-112"
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default BlockDetailPage;
