import dynamic from 'next/dynamic';
import { NextPageContext } from 'next';
import { TITLE_SYSTEM_ERROR } from '@/lib/constant/errors';
import DefaultLayout from '@/lib/layouts/Default';
import * as Sentry from '@sentry/nextjs';
import { createDefaultSeoProps } from '@/lib/components/seo/SeoHead';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const ErrorComponent = dynamic(
  () => import('@/lib/components/error/ErrorComponent'),
);

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
  seoProps?: SeoProps;
}

const ErrorPage = ({ statusCode, message }: ErrorPageProps) => {
  return (
    <DefaultLayout>
      <ErrorComponent code={statusCode ?? 666} message={message} />
    </DefaultLayout>
  );
};

ErrorPage.getInitialProps = async (contextData: NextPageContext) => {
  const statusCode =
    contextData?.res?.statusCode || contextData?.err?.statusCode || 666;
  const message = contextData?.err?.message || TITLE_SYSTEM_ERROR;
  
  // Create SEO props for error pages
  const seoProps = createDefaultSeoProps({
    title: `Lỗi ${statusCode} - FPT Play`,
    description: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
    url: 'https://fptplay.vn/error',
    robots: 'noindex, nofollow',
  });
  
  await Sentry.captureUnderscoreErrorException(contextData);
  return { statusCode, message, seoProps };
};

export default ErrorPage;
