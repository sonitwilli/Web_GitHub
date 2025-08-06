import EventComponent from '@/lib/components/event/EventComponent';
import PlayerPageContextWrapper from '@/lib/components/player/context/PlayerPageContextWrapper';
import DefaultLayout from '@/lib/layouts/Default';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const EventContentPage = () => {
  return (
    <DefaultLayout>
      <EventComponent type="event" />
    </DefaultLayout>
  );
};

export default function EventPage() {
  return (
    <PlayerPageContextWrapper>
      <EventContentPage />
    </PlayerPageContextWrapper>
  );
}

export const getServerSideProps = (async (context) => {
  const { slug } = context.params as { slug: string };
  
  const seoProps = await createSeoPropsFromMeta({
    pageId: slug,
    fallbackTitle: 'FPT Play - Sự Kiện | Tin Tức & Hoạt Động Mới Nhất',
    fallbackDescription: 'Cập nhật các sự kiện, tin tức và hoạt động mới nhất trên FPT Play - Nền tảng giải trí hàng đầu Việt Nam.',
    pathPrefix: '/su-kien',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
