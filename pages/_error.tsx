import dynamic from 'next/dynamic';
import { NextPageContext } from 'next';
import { TITLE_SYSTEM_ERROR } from '@/lib/constant/errors';
import DefaultLayout from '@/lib/layouts/Default';

const ErrorComponent = dynamic(
  () => import('@/lib/components/error/ErrorComponent'),
);

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage = ({ statusCode, message }: ErrorPageProps) => {
  return (
    <DefaultLayout>
      <ErrorComponent code={statusCode ?? 666} message={message} />
    </DefaultLayout>
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 666;
  const message = err?.message || TITLE_SYSTEM_ERROR;
  return { statusCode, message };
};

export default ErrorPage;
