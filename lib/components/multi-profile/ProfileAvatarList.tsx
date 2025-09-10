import React, { useState, useEffect } from 'react';
import { useProfileAvatars } from '@/lib/hooks/useProfileAvatars';
import { Avatar } from '@/lib/api/multi-profiles';
import { GoArrowLeft } from 'react-icons/go';
import CustomImage from '@/lib/components/common/CustomImage';
import ProfileHeading from '@/lib/components/multi-profile/ProfileHeading';
import { useRouter } from 'next/router';

interface AvatarGroup {
  avatars: Avatar[];
  group_id: string;
  group_name: string;
  group_position: string;
}

interface AvatarGroup {
  avatars: Avatar[];
  group_id: string;
  group_name: string;
  group_position: string;
}

interface ProfileAvatarListProps {
  title?: string;
  defaultAvatar?: Avatar;
  onChange?: (avatar: Avatar) => void;
  onClickNav?: (selected: Avatar) => void;
}

const ProfileAvatarList: React.FC<ProfileAvatarListProps> = ({
  title = 'Chọn ảnh đại diện',
  defaultAvatar = {} as Avatar,
  onChange,
  onClickNav,
}) => {
  const { avatars, fetchAvatars, isLoading, error } = useProfileAvatars({
    setIsEmpty: (isEmpty) => console.log('Is empty:', isEmpty),
    setIsError: (isError) => console.log('Is error:', isError),
  });
  const router = useRouter();
  const [selected, setSelected] = useState<Avatar>(defaultAvatar);
  const [sortedAvatars, setSortedAvatars] = useState<AvatarGroup[]>([]);
  const backTitle = router?.query?.['is-setting']
    ? 'Chỉnh sửa hồ sơ'
    : 'Tạo hồ sơ';

  useEffect(() => {
    const handleFetchAvatars = async () => {
      await fetchAvatars();
    };
    handleFetchAvatars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelected(defaultAvatar);
  }, [defaultAvatar]);

  useEffect(() => {
    if (!avatars.length) {
      setSortedAvatars([]);
      return;
    }

    // Sort groups by group_position
    setSortedAvatars(
      avatars.sort(
        (a, b) => parseInt(a.group_position) - parseInt(b.group_position),
      ),
    );
  }, [avatars, defaultAvatar]);

  useEffect(() => {
    if (Object.keys(selected).length > 0) {
      onChange?.(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleNavClick = () => {
    onClickNav?.(selected);
  };

  return (
    <div className="max-w-[1916px]">
      <div className="">
        <div
          onClick={handleNavClick}
          className="relative xl:absolute inline-flex items-center left-0 cursor-pointer min-w-[280px] pl-0 xl:pl-[20px] p-[20px] mb-[22px] xl:mb-0 rounded-[10px] relative hover:bg-eerie-black"
        >
          <div className="inline-flex items-center gap-2">
            <GoArrowLeft size={24} className="text-white-smoke" />
            <p className="m-0 text-white">{backTitle}</p>
          </div>
        </div>

        <div className="relative xl:min-w-[916px] xl:absolute xl:right-0 overflow-hidden p-0 xl:p-4 top-0 left-1/2 -translate-x-1/2 mx-auto">
          <div className="text-left ml-0 xl:ml-4 mb-6 xl:mb-4">
            <ProfileHeading>{title}</ProfileHeading>
          </div>
          <div className="overflow-auto md:min-w-[888px] p-0 xl:p-4 max-h-custom [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {isLoading && (
              <p className="text-center text-gray-500">Loading...</p>
            )}
            {error && (
              <p className="text-center text-red-500 bg-red-100 rounded-lg p-3 mx-4">
                {error.message}
              </p>
            )}
            {sortedAvatars.map((group, groupIndex) => (
              <div
                key={`group-${group.group_id}-${groupIndex}`}
                className="mb-[56px] w-full mx-auto"
              >
                <h3 className="text-white-smoke text-lg font-medium mb-4">
                  {group.group_name}
                </h3>
                <div
                  className={`
                  flex flex-wrap gap-6 gap-[24px] xl:gap-[39px] justify-start
                  xl:mb-[56px]
                  mx-auto
                `}
                >
                  {group.avatars.map((avatar, index) => (
                    <div
                      key={`avatar-item-${group.group_id}-${index}`}
                      className={`
                      relative cursor-pointer transition-all duration-500 
                      hover:opacity-95 hover:scale-105
                      ${
                        avatar.id === (selected.avatar_id || selected?.id)
                          ? 'rounded-full'
                          : ''
                      }
                    `}
                      onClick={() => {
                        setSelected(avatar);
                        onClickNav?.(avatar);
                      }}
                    >
                      <CustomImage
                        className="h-[80px] w-[80px]
                      xl:h-[140px] xl:w-[140px] rounded-full object-cover"
                        src={avatar.image || '/images/profiles/placeholder.png'}
                        alt={avatar.name}
                      />
                      {avatar.id === (selected.avatar_id || selected?.id) && (
                        <div
                          className="absolute h-[80px] w-[80px]
                          xl:h-[140px] xl:w-[140px] inset-0 flex items-center justify-center bg-black/50 rounded-full"
                        >
                          {}
                          <img
                            src="/images/profiles/done.png"
                            alt="selected avatar"
                            className="w-6 h-6"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarList;
