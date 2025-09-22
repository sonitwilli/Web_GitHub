import { useState, useEffect, useRef, useCallback } from 'react';
import ProfileHistory from '@/lib/components/multi-profile/ProfileItem'; // Assume this is a React component
import { LiaTrashAlt } from 'react-icons/lia';
import ConfirmModal from '@/lib/components/modal/ModalConfirm'; // Assume this is a React component
import SpinnerLoading from '@/lib/components/common/Loading'; // Assume this is a React component
import { useProfileContext } from '@/lib/components/contexts/ProfileContext'; // Custom context to replace Vuex
import {
  getHistoryView,
  HistoryItem,
  deleteProfileHistory as Delete,
} from '@/lib/api/history'; // API function to fetch history
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { Profile } from '@/lib/api/user';
import { showToast } from '@/lib/utils/globalToast';
import { useDispatch } from 'react-redux';
import { ERROR_CONNECTION, HAVING_ERROR } from '@/lib/constant/texts';
import NoData from '../empty-data/NoData';
import ErrorData from '../error/ErrorData';

interface ProfileHistoryData {
  list_history: HistoryItem[];
}

interface ModalContent {
  title: string;
  content: string;
  buttons: {
    accept: string;
    cancel: string;
  };
}

const ProfileHistoryContainer: React.FC = () => {
  const [profileHistory, setProfileHistory] = useState<ProfileHistoryData>({
    list_history: [],
  });
  const [dataWatching, setDataWatching] = useState<HistoryItem[]>([]);
  const [isPerPage, setIsPerPage] = useState<number>(10);
  const [userSelect, setUserSelect] = useState<Profile | null>(null);
  const [isServerError, setIsServerError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const { selectedProfile } = useProfileContext();
  const [modalContent] = useState<ModalContent>({
    title: 'Xóa lịch sử xem',
    content:
      'Bạn muốn xóa vĩnh viễn lịch sử xem của hồ sơ này? Các thông tin sau khi bị xóa sẽ không thể khôi phục lại',
    buttons: {
      accept: 'Xóa',
      cancel: 'Hủy',
    },
  });

  const confirmModalRef = useRef<{
    openModal: () => void;
    closeModal: () => void;
  }>(null);

  // Replace Vuex mapGetters and mapMutations
  useEffect(() => {
    dispatch(
      setSideBarLeft({
        text: 'Thông tin hồ sơ',
        url: `${window?.location?.origin}/tai-khoan?tab=ho-so&child=quan-ly-va-tuy-chon`,
      })
    );

    let user: Profile | null = selectedProfile;
    if (!user && typeof window !== 'undefined') {
      try {
        const userTemp = localStorage.getItem('userSelected');
        if (userTemp) {
          user = JSON.parse(userTemp);
        }
      } catch (err) {
        console.error('Error parsing userSelected from localStorage:', err);
      }
    }
    setUserSelect(user);

    if (user?.profile_id) {
      getProfileHistory(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile]);

  // Watch effect for profileHistory.list_history
  useEffect(() => {
    setDataWatching(profileHistory.list_history.slice(0, isPerPage));
  }, [profileHistory.list_history, isPerPage]);

  const getProfileHistory = useCallback(
    async (user: Profile) => {
      try {
        setIsLoading(true);
        setIsServerError(false);
        const res = await getHistoryView(user?.profile_id || '', 1, 10000);

        if (res?.data.status === '1' || res?.data.code === 200) {
          setProfileHistory({
            list_history: (res?.data?.data || []).map((item: HistoryItem) => ({
              ...item,
              name: res?.data?.meta?.name || '',
            })),
          });
          setIsLoading(false);
        } else {
          setProfileHistory({ list_history: [] });
          setIsLoading(false);
        }
      } catch (err) {
        console.log('Error fetching profile history:', err);

        setIsLoading(false);
        setIsServerError(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPerPage]
  );

  const deleteProfileHistory = async (profile_id: string) => {
    try {
      const res = await Delete(profile_id);

      if (res?.data.status === '1') {
        setProfileHistory({ list_history: [] });
        // if (userSelect) {
        //   await wait({ time: 1000 });
        //   getProfileHistory(userSelect);
        // }
        confirmModalRef.current?.closeModal();
      } else {
        confirmModalRef.current?.closeModal();
        // Assume showToast is a utility function
        showToast({
          title: res?.data?.message?.title || ERROR_CONNECTION,
          desc: res?.data?.message?.content || HAVING_ERROR,
        });
      }
    } catch (err) {
      console.log(err);

      showToast({
        title: ERROR_CONNECTION,
        desc: HAVING_ERROR,
      });
      confirmModalRef.current?.closeModal();
    }
  };

  const handleConfirm = (action: string) => {
    switch (action) {
      case 'cancel':
        confirmModalRef.current?.closeModal();
        break;
      case 'accept':
        if (userSelect?.profile_id) {
          deleteProfileHistory(userSelect.profile_id);
        }
        break;
      default:
        confirmModalRef.current?.closeModal();
    }
  };

  const handleDeleteAll = () => {
    confirmModalRef.current?.openModal();
  };

  const handleShowMore = () => {
    setIsPerPage((prev) => prev + 30);
  };

  return (
    <div className="profile-history min-h-[60vh] select-none font-normal text-white xl:mt-[4px]">
      <div className="profile-history-group flex max-w-full xl:max-w-[856px] items-center justify-between flex-shrink-0">
        <span className="text-[24px] xl:text-[28px] font-medium">
          Lịch sử xem của {userSelect?.name}
        </span>
        {profileHistory?.list_history?.length > 0 && (
          <button
            className="cursor-pointer erase-all flex items-center gap-1.5 rounded-[40px] bg-[#2c2c2e] px-4 py-2 text-base font-medium text-[#ffffffde] hover:bg-[#3c3c3e] transition-colors"
            onClick={handleDeleteAll}
          >
            <LiaTrashAlt size={24} />
            Xóa tất cả
          </button>
        )}
      </div>
      {profileHistory?.list_history?.length > 0 && !isLoading ? (
        <div className="profile-history__selected mt-6 max-w-full xl:max-w-[856px] rounded-lg bg-eerie-black p-6">
          <ProfileHistory
            data={dataWatching}
            isMore={dataWatching.length < profileHistory.list_history.length}
            onShowMore={handleShowMore}
          />
        </div>
      ) : isLoading && !isServerError ? (
        <div className="flex justify-center items-center h-screen max-h-[200px]">
          <SpinnerLoading />
        </div>
      ) : isServerError && !isLoading ? (
        <ErrorData
          onRetry={() => userSelect && getProfileHistory(userSelect)}
        />
      ) : (
        profileHistory?.list_history?.length === 0 && <NoData />
      )}
      <ConfirmModal
        ref={confirmModalRef}
        modalContent={modalContent}
        onSubmit={() => handleConfirm('accept')}
        onCancel={() => handleConfirm('cancel')}
      />
    </div>
  );
};

export default ProfileHistoryContainer;
