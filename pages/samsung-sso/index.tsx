import DefaultLayout from '@/lib/layouts/Default';
import SamSungSSOComponent from '@/lib/components/samsung-sso/SamSungSSOComponent';
import { GetServerSideProps } from 'next';

const SamsungSSOLayout = () => {
  return (
    <>
      <DefaultLayout>
        <div className="mt-25 px-4">
          <SamSungSSOComponent />
        </div>
      </DefaultLayout>
    </>
  );
};

export const getServerSideProps = (async () => {
  return { props: { key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ key: number }>;

export default SamsungSSOLayout;