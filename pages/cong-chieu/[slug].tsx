import EventComponent from '@/lib/components/event/EventComponent';
import PlayerPageContextWrapper from '@/lib/components/player/context/PlayerPageContextWrapper';
import DefaultLayout from '@/lib/layouts/Default';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const PremiereContentPage = () => {
  return (
    <DefaultLayout>
      <EventComponent type="premier" />
    </DefaultLayout>
  );
};

export default function PremierePage() {
  return (
    <PlayerPageContextWrapper>
      <PremiereContentPage />
    </PlayerPageContextWrapper>
  );
}

export const getServerSideProps = (async (context) => {
  const { slug } = context.params as { slug: string };
  
  const seoProps = await createSeoPropsFromMeta({
    pageId: slug,
    fallbackTitle: 'FPT Play - Công Chiếu | Phim Mới Ra Rạp',
    fallbackDescription: 'Xem những bộ phim mới nhất đang công chiếu trên FPT Play - Cập nhật liên tục các tác phẩm điện ảnh hot nhất.',
    pathPrefix: '/cong-chieu',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
