import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useVodFetcher } from '@/lib/hooks/useVodFetcher';
import EmblaBlockSlideItem from '@/lib/components/slider/embla/block-slider/EmblaBlockSlideItem';
import ShortVideoContent from '@/lib/components/short-video/ShortVideoContent';
import { throttle } from 'lodash';
import DefaultLayout from '@/lib/layouts/Default';
import { BlockTypeType, BlockItemType } from '@/lib/api/blocks';
import { loadJsScript } from '@/lib/utils/methods';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeAdsLoaded } from '@/lib/store/slices/appSlice';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

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

  const seoProps = await createSeoPropsFromMeta({
    pageId: id,
    fallbackTitle: getBlockTypeTitle(type),
    fallbackDescription: getBlockTypeDescription(type),
    pathPrefix: `/block/${type}`,
  });

  return { props: { seoProps } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps }>;

const BlockDetailPage: React.FC = () => {
  const blockLoadingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { adsLoaded } = useAppSelector((state) => state.app);
  const tagId = router.query.id
    ? (router.query.id as string).split('-').pop() || ''
    : '';

  const block: BlockItemType = {
    block_type: (router.query.type as BlockTypeType) || '',
    custom_data: tagId === 'becauseyouwatched' ? 'None' : '',
    id: tagId || '',
    type: router.query.type as string,
  };

  const { vods, metaBlock, isLoading, isFullList, fetchNextPage } =
    useVodFetcher(block);

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
        <div className="f-container mx-auto max-w-7xl">
          {adsLoaded && (
            <div className="ads_masthead_banner">
              <ins
                className="adsplay-placement adsplay-placement-relative"
                data-aplpm="105-111"
          />
          <ins
            className="adsplay-placement adsplay-placement-top-fixed"
                data-aplpm="1911010302-"
              />
            </div>
          )}
        </div>
        <div className={`mx-auto w-full bg-smoky-black min-h-screen ${router.query.type !== 'short_vod' ? 'f-container' : ''}`}>
          {router.query.type === 'short_vod' && <ShortVideoContent />}
          
          {router.query.type !== 'short_vod' && (
            <>
              {/* Title */}
              <div className="flex justify-start items-center mb-[16px] lg:mb-[40px] mt-[120px] lg:mt-[186px]">
                {metaBlock?.name && (
                  <h1 className="text-left text-white font-bold text-[40px] leading-[130%] tracking-[2%] capitalize">
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
