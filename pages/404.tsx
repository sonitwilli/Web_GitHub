import { ERROR_URL_MSG, PAGE_NOT_FOUND_MSG } from '@/lib/constant/errors';
import DefaultLayout from '@/lib/layouts/Default';
import dynamic from 'next/dynamic';

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

export default NotFoundPage;
