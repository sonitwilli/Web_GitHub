import Service3GComponent from '@/lib/components/landing-page/dich-vu/Service3GComponent';
import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Default';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';
import React from 'react';

const Service3GPage = () => {
  return (
    <DefaultLayout>
      <Service3GComponent />
    </DefaultLayout>
  );
};

export default Service3GPage;

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: '3g',
    fallbackTitle: 'FPT Play - Dịch Vụ 3G | Xem Phim Trên Di Động',
    fallbackDescription: 'Trải nghiệm dịch vụ FPT Play 3G - Xem phim, TV shows chất lượng cao trên thiết bị di động với gói cước ưu đãi.',
    pathPrefix: '/dich-vu/3g',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
