import { useEffect } from 'react';
import { useProfileContext } from '@/lib/components/contexts/ProfileContext'; // Đường dẫn đến ProfileContext
import ProfileUser from '@/lib/components/multi-profile/ProfileUser'; // Component ProfileUser
import NoData from '@/lib/components/empty-data/NoData'; // Component NoData
import { GoPlus } from 'react-icons/go';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import ErrorData from '@/lib/components/error/ErrorData';
import Loading from '@/lib/components/common/Loading';

const ProfileInfo: React.FC = () => {
  const {
    profilesList,
    profileError,
    defaultProfile,
    profilesMetaData,
    refetchProfiles,
    profileLoading,
    getListProfile,
    setSelectedProfile,
  } = useProfileContext();

  const dispatch = useDispatch();

  const router = useRouter();

  // Tương đương với mounted
  useEffect(() => {
    // Lấy danh sách hồ sơ
    getListProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(
        setSideBarLeft({
          text: 'Quay lại FPT Play',
          url: '/',
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (profileLoading) {
    return (
      <div className="select-none font-normal">
        <div className="profile-info">
          <Loading />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="select-none font-normal">
        <div className="profile-info">
          <h1 className="profile-info__title text-[20px] tablet:text-2xl font-medium text-white leading-9">
            {profilesMetaData?.title_manager || 'Quản lý hồ sơ'}
          </h1>
          <ErrorData onRetry={refetchProfiles} />
        </div>
      </div>
    );
  }

  return (
    <div className="select-none font-normal">
      <div className="profile-info">
        <h1 className="profile-info__title text-[20px] tablet:text-2xl font-medium text-white leading-9">
          {profilesMetaData?.title_manager || 'Quản lý hồ sơ'}
        </h1>
        {profilesList && profilesList.length > 0 ? (
          <div className="profile-info__list-user mt-6 flex max-w-[914px] flex-col items-start gap-4 rounded-lg">
            {profilesList.map((item, idx) => (
              <ProfileUser
                key={idx}
                dataUser={item}
                profilesMetaData={profilesMetaData || {}}
                isActive={defaultProfile?.profile_id === item?.profile_id}
                setSelectUser={setSelectedProfile}
              />
            ))}
            {profilesList.length < 5 && (
              <div
                onClick={() => router.push('/tai-khoan/multi-profiles')}
                className="w-full flex items-center bg-eerie-black px-4 sm:px-6 py-4 rounded-xl gap-4 hover:bg-charleston-green cursor-pointer"
              >
                <span className="bg-black-olive-404040 w-8 h-8 rounded-full relative">
                  <GoPlus className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform w-[24px] h-[24px] inline-block" />
                </span>{' '}
                <span className="text-white-smoke text-base font-semibold leading-[1.3]">
                  Thêm hồ sơ
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-[50px]">
            <NoData />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
