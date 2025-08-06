import dynamic from 'next/dynamic';
import DefaultLayout from '@/lib/layouts/Default';

const DownloadLandingPageComponent = dynamic(
  () => import('@/lib/components/landing-page/DownloadLandingPageComponent'),
  {
    ssr: false,
  },
);

const InstallIntroductionCast = () => {
  return (
    <DefaultLayout>
      <DownloadLandingPageComponent />
    </DefaultLayout>
  );
};

export default InstallIntroductionCast;
