import dynamic from 'next/dynamic';

const InstallIntroductionCastComponent = dynamic(
  () =>
    import('@/lib/components/landing-page/InstallIntroductionCastComponent'),
  {
    ssr: false,
  },
);

const InstallIntroductionCast = () => {
  return <InstallIntroductionCastComponent />;
};

export default InstallIntroductionCast;
