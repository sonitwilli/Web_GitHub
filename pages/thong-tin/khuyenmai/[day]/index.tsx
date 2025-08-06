import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Default';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const DetailInformationDiscountComponent = dynamic(
  () =>
    import('@/lib/components/landing-page/khuyen-mai/DiscountComponent').then(
      (mod) => mod.DetailInformationDiscountComponent,
    ),
  {
    ssr: false,
  },
);

const InformationDiscountPage = () => {
  return (
    <DefaultLayout>
      <DetailInformationDiscountComponent />
    </DefaultLayout>
  );
};

export default InformationDiscountPage;

export const getServerSideProps = (async (context) => {
  const { day } = context.params as { day: string };
  
  const seoProps = await createSeoPropsFromMeta({
    pageId: day,
    fallbackTitle: 'FPT Play - Khuyến Mãi Chi Tiết | Ưu Đãi Đặc Biệt',
    fallbackDescription: 'Chi tiết chương trình khuyến mãi FPT Play - Nhận ngay các ưu đãi hấp dẫn và tiết kiệm chi phí giải trí.',
    pathPrefix: '/thong-tin/khuyenmai',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
