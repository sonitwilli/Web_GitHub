import dynamic from 'next/dynamic';
import DefaultLayout from '@/lib/layouts/Default';
import { useRouter } from 'next/router';
import React from 'react';

const LandingPageComponent = dynamic(
  () => import('@/lib/components/landing-page/LandingPageComponent'),
  {
    ssr: false,
  },
);

const PolicyAndrRegulationPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <DefaultLayout>
      <div className="flex items-center justify-center">
        <LandingPageComponent slug={slug as string} type="non-navbar" />
      </div>
    </DefaultLayout>
  );
};

export default PolicyAndrRegulationPage;
