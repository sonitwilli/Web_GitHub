import { useRouter } from 'next/router';
import { ProfileProvider } from '@/lib/components/contexts/ProfileContext';
import ProfileInfo from '@/lib/components/multi-profile/ProfileInfo'; // Điều chỉnh đường dẫn theo cấu trúc thư mục của bạn
import { OPTIONALS, HISTORYWATCH } from '@/lib/constant/texts'
import ProfileOptional from '@/lib/components/multi-profile/ProfileOptional';
import ProfileHistory from '@/lib/components/multi-profile/ProfileHistoryContainer'; // Điều chỉnh đường dẫn theo cấu trúc thư mục của bạn

const ProfileWrapper: React.FC = () => {
  const router = useRouter();
  const { child } = router.query;

  return (
    <ProfileProvider>
      {!child && <ProfileInfo />}
      {child === OPTIONALS && <ProfileOptional />}
      {child === HISTORYWATCH && <ProfileHistory />}
    </ProfileProvider>
  );
};

export default ProfileWrapper;