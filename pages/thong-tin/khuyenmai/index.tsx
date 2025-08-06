import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Default';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const InformationDiscountComponent = dynamic(
  () =>
    import('@/lib/components/landing-page/khuyen-mai/DiscountComponent').then(
      (mod) => mod.InformationDiscountComponent,
    ),
  {
    ssr: false,
  },
);

const InformationDiscountPage = () => {
  return (
    <DefaultLayout>
      <InformationDiscountComponent />
    </DefaultLayout>
  );
};

export default InformationDiscountPage;

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'khuyenmai',
    fallbackTitle: 'FPT Play - Khuyến Mãi | Ưu Đãi Đặc Biệt Hấp Dẫn',
    fallbackDescription: 'Khám phá các chương trình khuyến mãi, ưu đãi đặc biệt từ FPT Play - Tiết kiệm chi phí và trải nghiệm giải trí tuyệt vời.',
    pathPrefix: '/thong-tin/khuyenmai',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
