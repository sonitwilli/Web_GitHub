import { useRouter } from 'next/router';
import { useMemo } from 'react';
import CustomImage from '@/lib/components/common/CustomImage';
import { PROFILE_TYPES, PROFILE_DEFAULT_AVATAR, PIN_TYPES, NUMBER_PR, TYPE_PR } from '@/lib/constant/texts'
import { Profile } from '@/lib/api/user'

interface ProfileCardProps {
  data?: Profile;
  editable?: boolean;
  isTick?: boolean;
  clickProfile?: (profile: Profile) => void;
}

// Custom image scaling function (mocked, replace with your logic)
const scaleImage = ({ url, width, height }: { url?: string; width: number; height: number }) => {
  return url ? `${url}?w=${width}&h=${height}` : PROFILE_DEFAULT_AVATAR;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ data = {} }) => {
  const router = useRouter();

  // Computed properties
  const isWatching = useMemo(() => router.pathname.includes('/watching'), [router.pathname]);

  const showIconEdit = useMemo(() => {
    if (isWatching) return false;
    if (data?.allow_edit === '1') return true;
    return false;
  }, [isWatching, data?.allow_edit]);

  const storageProfileId = useMemo(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(NUMBER_PR) : null;
  }, []);

  const storageProfileType = useMemo(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(TYPE_PR) : null;
  }, []);

  const disabled = useMemo(() => {
    if (isWatching) return false;
    if (storageProfileType === PROFILE_TYPES.KID_PROFILE) {
      return data?.profile_id !== storageProfileId;
    }
    return false;
  }, [isWatching, storageProfileType, data?.profile_id, storageProfileId]);


  return (
    <div className="relative flex flex-col items-center">
      {data?.profile_id === storageProfileId && (
        <CustomImage
          className="absolute -top-2 left-1/2 w-5 h-5 min-w-5 -translate-x-1/2 md:-top-4 md:w-8 md:h-8 md:min-w-8"
          src="/images/profiles/done.png"
          alt="done"
          width={'32px'}
          height={'32px'}
        />
      )}

      <div
        className={`relative ${disabled ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <CustomImage
          className="w-18 h-18 min-w-18 rounded-2xl md:w-25 md:h-25 md:min-w-25 lg:w-40 lg:h-40 lg:min-w-40"
          src={scaleImage({ url: data?.avatar_url, width: 160, height: 160 })}
          alt={data?.name || 'Profile Avatar'}
          width={'160px'}
          height={'160px'}
        />
        {data?.profile_type === PROFILE_TYPES.KID_PROFILE && (
          <CustomImage
            className="absolute left-1/2 bottom-2.5 w-12 min-w-12 -translate-x-1/2 lg:w-16 lg:min-w-16"
            src="/images/profiles/child_2.png"
            alt="child"
            width={'48px'}
            height={'48px'}
          />
        )}
        {showIconEdit && (
          <div
            className={`absolute inset-0 z-[1] flex items-center justify-center ${
              isWatching ? 'bg-transparent' : 'bg-black/50'
            }`}
          >
            <CustomImage
              className="w-5 h-5 min-w-5 md:w-10 md:h-10 md:min-w-10"
              src="/images/profiles/edit.png"
              alt="edit"
              width={'40px'}
              height={'40px'}
            />
          </div>
        )}
        {data?.pin_type === PIN_TYPES.REQUIRED_PIN && (
          <CustomImage
            className="absolute right-0.5 top-0.5 w-5 h-5 min-w-5 lg:w-8 lg:h-8 lg:min-w-8 lg:right-2 lg:top-2"
            src="/images/profiles/lock_white.png"
            alt="lock"
            width={'32px'}
            height={'32px'}
          />
        )}
      </div>

      <p className="pt-4 text-center text-base leading-6 m-0">{data?.name}</p>
    </div>
  );
};

export default ProfileCard;