import DefaultLayout from '@/lib/layouts/Default';
import ErrorComponent from '@/lib/components/error/ErrorComponent';
import { ERROR_URL_MSG, PAGE_NOT_FOUND_MSG } from '@/lib/constant/errors';

const InfoIndexPage = () => {
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

export default InfoIndexPage;
