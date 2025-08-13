import PageBlocks from '@/lib/components/blocks/PageBlocks';
import BlockLoading from '@/lib/components/loading/BlockLoading';
import usePageApi from '@/lib/hooks/usePageApi';
import DefaultLayout from '@/lib/layouts/Default';
import EmblaTopSlider from '@/lib/components/slider/embla/top-slider/EmblaTopSlider';
import { useEventConfig } from '@/lib/hooks/useEventConfig';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeAdsLoaded } from '@/lib/store/slices/appSlice';
import { loadJsScript } from '@/lib/utils/methods';
import type { GetServerSideProps } from 'next';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

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
    blocksSortedRecommendNotHighlight,
  } = usePageApi({});

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isExistedAds } = useAppSelector((state) => state.app);
  useEventConfig();

  useEffect(() => {
    if (router.isReady && process.env.NEXT_PUBLIC_API_ADS) {
      const timer = setTimeout(() => {
        loadJsScript({
          src: process.env.NEXT_PUBLIC_API_ADS!,
          id: 'ads-script',
          cb: () => {
            // Lưu vào store khi script load thành công
            dispatch(changeAdsLoaded(true));
          },
        });
      }, 10000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [router.isReady, dispatch]);

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
