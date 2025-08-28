import {
  // CookiesType,
  getChannels,
  // getSuggestChannels,
} from '@/lib/api/channel';
import PageBlocks from '@/lib/components/blocks/PageBlocks';
import BlockLoading from '@/lib/components/loading/BlockLoading';
import EmblaTopSlider from '@/lib/components/slider/embla/top-slider/EmblaTopSlider';
import usePageApi from '@/lib/hooks/usePageApi';
import DefaultLayout from '@/lib/layouts/Default';
import type { GetServerSideProps } from 'next';
import { SeoProps } from '@/lib/components/seo/SeoHead';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeAdsLoaded } from '@/lib/store/slices/appSlice';
import { loadJsScript } from '@/lib/utils/methods';
import { HISTORY_TEXT } from '@/lib/constant/texts';
import { trackingLoadBlockDisplayLog511 } from '@/lib/hooks/useTrackingHome';

export const getServerSideProps = (async (context) => {
  const { id } = context.params as { id: string };
  if (id === 'channel') {
    let defaultChannel = 'fpt-play';
    try {
      const res = await getChannels();
      defaultChannel = res?.data?.data?.default_channel || 'fpt-play';
    } catch {
      defaultChannel = 'fpt-play';
    }
    return {
      redirect: {
        destination: `/xem-truyen-hinh/${defaultChannel}?${HISTORY_TEXT.LANDING_PAGE}=0`,
        permanent: false,
      },
    };
  }

  const seoProps = await createSeoPropsFromMeta({
    pageId: id,
    fallbackTitle: 'FPT Play - Danh mục',
    fallbackDescription:
      'Khám phá các danh mục phim ảnh, chương trình giải trí đa dạng trên FPT Play.',
    pathPrefix: '/trang',
  });

  return { props: { seoProps, key: id } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: string }>;

export default function CategoryPage() {
  const {
    highLightBlockData,
    highLightBlock,
    blocksSortedRecommendNotHighlight,
    blocksSortedRecommend,
  } = usePageApi({});
  useEffect(() => {
    if (blocksSortedRecommend?.length > 0) {
      trackingLoadBlockDisplayLog511(
        blocksSortedRecommend.filter(
          (item) =>
            item?.need_recommend === '1' || item?.need_recommend === '2',
        ),
      );
    }
  }, [blocksSortedRecommend]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isExistedAds } = useAppSelector((state) => state.app);
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
