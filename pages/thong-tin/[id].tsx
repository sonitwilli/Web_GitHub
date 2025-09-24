import React, { useEffect, useState } from 'react';
import LandingPageComponent from '@/lib/components/landing-page/LandingPageComponent';
import DefaultLayout from '@/lib/layouts/Default';
import { useRouter } from 'next/router';
import ErrorComponent from '@/lib/components/error/ErrorComponent';
import { ERROR_URL_MSG, PAGE_NOT_FOUND_MSG } from '@/lib/constant/errors';
import { LANDING_PAGE_TYPE_POLICY } from '@/lib/constant/texts';
import { fetchDataPolicy } from '@/lib/api/landing-page';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';

const InfoPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageExists, setPageExists] = useState<boolean>(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const checkPageExists = async (): Promise<void> => {
        try {
          setIsLoading(true);
          const data = await fetchDataPolicy(id);
          
          if (data && data.length > 0) {
            setPageExists(true);
          } else {
            setPageExists(false);
          }
        } catch {
          setPageExists(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkPageExists();
    }
  }, [id]);

  if (!router.isReady || !id) {
    return null;
  }

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center mt-5">
        </div>
      </DefaultLayout>
    );
  }

  if (!pageExists) {
    return (
      <DefaultLayout>
        <ErrorComponent
          code={404}
          message={PAGE_NOT_FOUND_MSG}
          subMessage={ERROR_URL_MSG}
        />
      </DefaultLayout>
    );
  }

  const slug = id as string;

  return (
    <DefaultLayout>
      <div className="flex items-center justify-center mt-5">
        <LandingPageComponent slug={slug} type={LANDING_PAGE_TYPE_POLICY} />
      </div>
    </DefaultLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  const seoProps = await createSeoPropsFromMeta({
    pageId: `${id}`,
    fallbackTitle: 'FPT Play - Thông Tin',
    fallbackDescription: 'Thông tin chi tiết về các dịch vụ và chính sách của FPT Play.',
    pathPrefix: '/thong-tin',
  });

  return {
    props: {
      seoProps,
    },
  };
};

export default InfoPage;