import LandingPageComponent from '@/lib/components/landing-page/LandingPageComponent';
import DefaultLayout from '@/lib/layouts/Default';
import { useRouter } from 'next/router';
import React from 'react';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'about',
    fallbackTitle: 'FPT Play - Giới Thiệu | Về Chúng Tôi',
    fallbackDescription: 'Tìm hiểu về FPT Play - Nền tảng giải trí trực tuyến hàng đầu Việt Nam với hàng ngàn nội dung chất lượng cao.',
    pathPrefix: '/gioi-thieu',
  });

  return { props: { seoProps } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps }>;

const IntroductionPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <DefaultLayout>
      <div className="flex items-center justify-center">
        <LandingPageComponent slug={slug as string} type="default" />
      </div>
    </DefaultLayout>
  );
};

export default IntroductionPage;
