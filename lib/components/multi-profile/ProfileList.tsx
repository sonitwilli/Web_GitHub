import { useState, useEffect } from 'react';
import ProfileButton from '@/lib/components/common/ProfileButton';
import ProfileCard from '@/lib/components/multi-profile/ProfileCard';
import ProfileHeading from '@/lib/components/multi-profile/ProfileHeading';
import { PROFILE_TYPES, TYPE_PR } from '@/lib/constant/texts'; // Adjust the import path as necessary
import { useProfileList } from '@/lib/hooks/useProfileList'; // Adjust path to your hook
import { Profile } from '@/lib/api/user';
import CustomImage from '@/lib/components/common/CustomImage'

interface ProfileListProps {
  type?: string;
  heading?: string;
  addText?: string;
  confirmText?: string;
  editableProfile?: boolean;
  loading?: boolean;
  clickProfile?: (profile: Profile) => void;
  clickAdd?: () => void;
  confirm?: () => void;
}

const ProfileList: React.FC<ProfileListProps> = ({
  type = 'edit',
  heading = 'Chỉnh sửa hồ sơ',
  addText = 'Thêm người dùng',
  confirmText = 'Hoàn tất',
  loading = false,
  clickProfile,
  clickAdd,
  confirm,
}) => {
  const { profiles, fetchProfiles, isLoading } = useProfileList();
  const [storageProfileId, setStorageProfileId] = useState<string | null>(null);
  const [storageProfileType, setStorageProfileType] = useState<string | null>(null);

  // Fetch profiles and set storage values on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorageProfileId(localStorage.getItem('profile_id'));
      setStorageProfileType(localStorage.getItem(TYPE_PR));
      fetchProfiles(); // Fetch profiles on mount
    }
  }, [fetchProfiles]);

  return (
    <div className={`mx-auto ${loading || isLoading ? 'pointer-events-none' : ''}`}>
      <div className="mb-20 2xl:mb-32">
        <ProfileHeading>{heading}</ProfileHeading>
      </div>

      <div className="flex flex-wrap justify-center gap-6 lg:gap-16">
        {profiles.map((profile: Profile, idx: number) => (
          <ProfileCard
            key={`profile-${idx}`}
            data={profile}
            isTick={profile.profile_id === storageProfileId}
            clickProfile={() => clickProfile?.(profile)}
          />
        ))}

        {profiles?.length < 5 &&
          storageProfileType === PROFILE_TYPES.MASTER_PROFILE && (
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={clickAdd}
            >
              <span
                className="w-18 h-18 min-w-18 rounded-2xl flex items-center justify-center bg-[#202020] hover:bg-[#353535] transition-all duration-300
                md:w-25 md:h-25 md:min-w-25 md:rounded-8 lg:w-40 lg:h-40 lg:min-w-40"
              >
                <CustomImage
                  src="/images/profiles/cancel.png"
                  alt="add"
                  width={'160px'}
                  height={'160px'}
                />
              </span>
              <p className="pt-4 text-center text-base leading-6 m-0 text-[#616161]">
                {addText}
              </p>
            </div>
          )}
      </div>

      <div className="mt-10 text-center 2xl:mt-20">
        <ProfileButton
          variant={type === 'watching' ? 'dark' : ''}
          onClickBtn={confirm}
        >
          {confirmText}
        </ProfileButton>
      </div>
    </div>
  );
};

export default ProfileList;