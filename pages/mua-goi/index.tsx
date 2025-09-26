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
    fallbackTitle: 'Đăng Ký Mua Gói FPT Play - Xem Ngay Nội Dung Yêu Thích',
    fallbackDescription: 'Chọn gói FPT Play để xem phim, show, anime, thể thao và truyền hình trên nhiều thiết bị cùng lúc. Giải trí liền mạch, không giới hạn.',
    // pathPrefix: '/mua-goi',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
