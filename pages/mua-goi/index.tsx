import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Default';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const BuyPackageComponent = dynamic(
  () => import('@/lib/components/buy-package/BuyPackageComponent'),
  {
    ssr: false,
  },
);

const BuyPackagePage = () => {
  return (
    <DefaultLayout>
      <BuyPackageComponent />
    </DefaultLayout>
  );
};

export default BuyPackagePage;

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'mua-goi',
    fallbackTitle: 'FPT Play - Mua Gói | Các Gói Dịch Vụ Giải Trí Hấp Dẫn',
    fallbackDescription: 'Khám phá và mua các gói dịch vụ FPT Play với giá ưu đãi - Truy cập không giới hạn phim bộ, phim lẻ, thể thao và nhiều nội dung hấp dẫn khác.',
    pathPrefix: '/mua-goi',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
