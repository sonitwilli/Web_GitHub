import { getChannels } from '@/lib/api/channel';
import { GetServerSideProps } from 'next';

export const getServerSideProps = (async () => {
  let defaultChannel = 'fpt-play';
  try {
    const res = await getChannels();
    defaultChannel = res?.data?.data?.default_channel || 'fpt-play';
  } catch {
    defaultChannel = 'fpt-play';
  }
  return {
    redirect: {
      destination: `/xem-truyen-hinh/${defaultChannel}`,
      permanent: false,
    },
  };
}) satisfies GetServerSideProps<{ key: string }>;

export default function CategoryPage() {
  return '';
}
