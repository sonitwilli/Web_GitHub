import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Account';
import ProfileWrapper from '@/lib/components/multi-profile/ProfileWrapper';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const ProfilePage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto f-container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[148px]">
            <ProfileWrapper />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProfilePage;

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'multi-profiles',
    fallbackTitle: 'FPT Play - Hồ Sơ Đa Người Dùng | Quản Lý Profile Gia Đình',
    fallbackDescription: 'Tạo và quản lý nhiều hồ sơ người dùng trên FPT Play - Trải nghiệm cá nhân hóa cho từng thành viên trong gia đình.',
    pathPrefix: '/tai-khoan/multi-profiles',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;