import dynamic from 'next/dynamic';
import DefaultLayout from '@/lib/layouts/Default';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

export const getServerSideProps = (async (context) => {
  const { id } = context.params as { id: string };

  const seoProps = await createSeoPropsFromMeta({
    pageId: id,
    fallbackTitle: 'FPT Play - Diễn Viên | Thông Tin & Phim Ảnh',
    fallbackDescription:
      'Khám phá thông tin diễn viên và các tác phẩm điện ảnh, phim truyền hình trên FPT Play.',
    pathPrefix: '/dien-vien',
  });

  return { props: { seoProps } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps }>;

const DetailActorComponent = dynamic(
  () => import('@/lib/components/actor/DetailActorComponent'),
  {
    ssr: false,
  },
);

const DetailActorPage = () => {
  return (
    <DefaultLayout>
      <DetailActorComponent />
    </DefaultLayout>
  );
};

export default DetailActorPage;
