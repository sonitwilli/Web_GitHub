import LandingPageComponent from '@/lib/components/landing-page/LandingPageComponent';
import DefaultLayout from '@/lib/layouts/Default';
import { useRouter } from 'next/router';

const UsingPoliciesPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <DefaultLayout>
      <div className="flex items-center justify-center">
        <LandingPageComponent slug={slug as string} type="dieu-khoan" />
      </div>
    </DefaultLayout>
  );
};
export default UsingPoliciesPage;
