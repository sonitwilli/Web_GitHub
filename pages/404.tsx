import { ERROR_URL_MSG, PAGE_NOT_FOUND_MSG } from '@/lib/constant/errors';
import DefaultLayout from '@/lib/layouts/Default';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { createDefaultSeoProps } from '@/lib/components/seo/SeoHead';

const ErrorComponent = dynamic(
  () => import('@/lib/components/error/ErrorComponent'),
  {
    ssr: false,
  },
);

const NotFoundPage = () => {
  return (
    <DefaultLayout>
      <ErrorComponent
        code={404}
        message={PAGE_NOT_FOUND_MSG}
        subMessage={ERROR_URL_MSG}
      />
    </DefaultLayout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const seoProps = createDefaultSeoProps({
    title: 'Trang không tồn tại - FPT Play',
    description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    url: 'https://fptplay.vn/404',
    robots: 'noindex, nofollow',
  });

  return {
    props: {
      seoProps,
    },
  };
};

export default NotFoundPage;
