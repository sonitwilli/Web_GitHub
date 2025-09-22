import React from 'react';
import DefaultLayout from '@/lib/layouts/Default';
import FPTPlayBox650 from '@/lib/components/dang-ky-dich-vu/Box650';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const Box650Page = () => {
  return (
    <DefaultLayout>
      <FPTPlayBox650 />
    </DefaultLayout>
  );
};

export default Box650Page;

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'box-650',
    fallbackTitle: 'FPT Play - Box 650 | Hộp giải mã FPT Play',
    fallbackDescription: 'Thông tin sản phẩm FPT Play Box 650 - hướng dẫn kết nối, bảo hành và tính năng.',
    pathPrefix: '/dang-ky-dich-vu/box-650',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;