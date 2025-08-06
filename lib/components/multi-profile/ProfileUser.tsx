import { useRouter } from 'next/router';
import { Profile } from '@/lib/api/user';
import { MdOutlineLock } from 'react-icons/md';
import { OPTIONALS } from '@/lib/constant/texts';
import { useDispatch } from 'react-redux';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';

interface ProfilesMetaData {
  title_manager?: string;
}

interface ProfileUserProps {
  dataUser?: Profile;
  isActive?: boolean;
  profilesMetaData?: ProfilesMetaData;
  setSelectUser?: (user: Profile) => void; // Callback to replace Vuex SET_SELECT_USER
}

const ProfileUser: React.FC<ProfileUserProps> = ({
  dataUser = {},
  isActive = false,
  profilesMetaData = {},
  setSelectUser,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const updateQuery = () => {
    const currentPath = router.pathname;
    const currentQuery = { ...router.query };

    // Thêm hoặc cập nhật query param
    const updatedQuery = {
      ...currentQuery,
      child: OPTIONALS,
    };

    router.push(
      {
        pathname: currentPath,
        query: updatedQuery,
      },
      undefined,
      { shallow: true },
    ); // shallow = true nếu không muốn gọi lại getServerSideProps
  };

  // Handle routing and user selection
  const handleDataRoute = () => {
    if (dataUser) {
      setSelectUser?.(dataUser); // Update selected user
      dispatch(
        setSideBarLeft({
          text: profilesMetaData?.title_manager || '',
          url: `${window?.location?.origin}/tai-khoan?tab=ho-so`,
        }),
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userSelected', JSON.stringify(dataUser));
      }
      updateQuery();
    }
  };

  return (
    <div
      className="w-full bg-eerie-black px-4 sm:px-6 py-4 rounded-xl cursor-pointer hover:bg-charleston-green"
      onClick={handleDataRoute}
    >
      <div className="flex items-center">
        <div className="relative shrink-0">
          {dataUser?.profile_type === '2' && (
            <img
              className="absolute w-full bottom-[4px] left-0 right-[4px] pl-[4px] pr-[9px]"
              src="/images/profiles/child.png"
              alt="child"
            />
          )}
          <img
            src={dataUser.avatar_url || '/default-avatar.png'} // Fallback image
            alt="User Avatar"
            className="w-[32px] h-[32px] rounded-full object-cover"
          />
        </div>
        {/* Info */}
        <div className="w-full px-4">
          <div className="text-platinum text-base font-medium leading-6">
            {dataUser.name || 'Unknown User'}
          </div>
        </div>
        {/* Label for active profile */}
        {isActive && (
          <div className="profile-user__label">
            <span className="inline-block text-base font-medium leading-6 text-white-smoke bg-black-olive-404040 rounded-md px-2 py-1 mr-[17px] whitespace-nowrap">
              Hồ sơ của bạn
            </span>
          </div>
        )}
        {dataUser?.pin_type === '1' && !isActive && (
          <MdOutlineLock
            size={24}
            className="text-white-smoke inline-block text-[18px] mr-[17px]"
          />
        )}
        {/* Chevron icon for click event */}
        <div
          className="cursor-pointer text-white"
          role="button"
          aria-label="Navigate to profile management"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;
