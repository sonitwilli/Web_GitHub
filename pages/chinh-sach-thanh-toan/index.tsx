import LandingPageComponent from '@/lib/components/landing-page/LandingPageComponent';
import DefaultLayout from '@/lib/layouts/Default';
import { useRouter } from 'next/router';

const PaymentPoliciesPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <DefaultLayout>
      <div className="flex items-center justify-center mt-5">
        <LandingPageComponent slug={slug as string} type="chinh-sach" />
      </div>
    </DefaultLayout>
  );
};
export default PaymentPoliciesPage;
