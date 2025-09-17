import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Default';
import PaymentPackageDetail from '@/lib/components/payment/PaymentPackageDetail';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';

const PackageDetailPage = () => {
  return (
    <DefaultLayout>
      <PaymentPackageDetail />
    </DefaultLayout>
  );
};

export default PackageDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  const seoProps = await createSeoPropsFromMeta({
    pageId: `dich-vu-${id}`,
    fallbackTitle: 'FPT Play - Dịch Vụ | Gói Dịch Vụ Giải Trí',
    fallbackDescription: 'Tìm hiểu chi tiết về các gói dịch vụ FPT Play - Trải nghiệm giải trí không giới hạn với giá ưu đãi.',
    pathPrefix: '/mua-goi/dich-vu',
  });

  return {
    props: {
      seoProps,
    },
  };
};
