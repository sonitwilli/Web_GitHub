import PageBlocks from '@/lib/components/blocks/PageBlocks';
import BlockLoading from '@/lib/components/loading/BlockLoading';
import usePageApi from '@/lib/hooks/usePageApi';
import DefaultLayout from '@/lib/layouts/Default';
import EmblaTopSlider from '@/lib/components/slider/embla/top-slider/EmblaTopSlider';
import { useEventConfig } from '@/lib/hooks/useEventConfig';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import { useAppSelector } from '@/lib/store';
import type { GetServerSideProps } from 'next';
import type { SeoProps } from '@/lib/components/seo/SeoHead';
import { useEffect } from 'react';
import { trackingLoadBlockDisplayLog511 } from '@/lib/hooks/useTrackingHome';

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'home',
    fallbackTitle:
      'FPT Play - Trang Chủ | Xem Phim, Show, Anime, TV, Thể Thao Miễn Phí',
    fallbackDescription:
      'Trang chủ FPT Play - Nền tảng giải trí trực tuyến hàng đầu Việt Nam. Xem miễn phí hàng ngàn bộ phim, show TV, anime, thể thao trực tiếp và chương trình truyền hình chất lượng cao.',
    pathPrefix: '',
  });

  return { props: { seoProps } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps }>;

export default function HomePage() {
  const {
    highLightBlockData,
    highLightBlock,
    blocksSortedRecommend,
    blocksSortedRecommendNotHighlight,
  } = usePageApi({});
  useEffect(() => {
    if (blocksSortedRecommend?.length > 0) {
      trackingLoadBlockDisplayLog511(blocksSortedRecommend);
    }
  }, [blocksSortedRecommend]);
  const { isExistedAds } = useAppSelector((state) => state.app);
  useEventConfig();

  return (
    <>
      <DefaultLayout>
        <div
          className={`relative ${
            isExistedAds ? 'pt-0' : 'pt-[80px] tablet:pt-0'
          }`}
        >
          <div className="mb-[40px] xl:mb-0">
            {highLightBlockData?.data &&
            highLightBlockData?.data?.length > 0 ? (
              <EmblaTopSlider
                slidesItems={highLightBlockData || {}}
                block={highLightBlock}
              />
            ) : (
              <BlockLoading />
            )}
          </div>
          <div className="mt-[40px]  xl:-mt-[220px] 2xl:-mt-[270px] relative">
            <PageBlocks blocks={blocksSortedRecommendNotHighlight} />
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
