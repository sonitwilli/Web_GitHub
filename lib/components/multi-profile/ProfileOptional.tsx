import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdHistory } from 'react-icons/md';
import { HiOutlineChevronRight } from 'react-icons/hi';
import { checkPassword } from '@/lib/api/multi-profiles';
import ModalFillManagementCode from '@/lib/components/modal/ModalFillCode';
import ConfirmModal, {
  ModalContent,
} from '@/lib/components/modal/ModalConfirm';
import ModalManagementCodeNotice from '@/lib/components/modal/ModalManagementCode';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { switchProfile } from '@/lib/api/user';
import { setOtpType } from '@/lib/store/slices/otpSlice';
import ForgetPasswordModalProfile, {
  ForgetPasswordModalProfileRef,
} from '@/lib/components/modal/ModalForgetPassword'; // Import the component
import {
  ALREADY_SHOWN_MODAL_MANAGEMENT_CODE,
  DEFAULT_ERROR_MSG,
  PROFILE_TYPES,
  TYPE_PR,
  SEND_OTP_TYPES,
  INFORM
} from '@/lib/constant/texts';
import { useProfileContext } from '@/lib/components/contexts/ProfileContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { showToast } from '@/lib/utils/globalToast';
import { getUserInfo } from '@/lib/api/user';
import { DETAIL_PR } from '@/lib/constant/texts';
import { AxiosError } from 'axios';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

const ProfileOptional: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    selectedProfile,
    setSelectedProfile,
    setShowPinModal,
    setShowPasswordModal,
    setShowPasswordModalLogin,
  } = useProfileContext();
  const [loading, setLoading] = useState<boolean>(false);
  const currentUser = useSelector((state: RootState) => state.user);
  const [showModalFillManagementCode, setShowModalFillManagementCode] =
    useState<boolean>(false);
  const [showModalManagementCode, setShowModalManagementCode] =
    useState<boolean>(false);
  const [isConfirmManagementCode, setIsConfirmManagementCode] =
    useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isErrorCode, setIsErrorCode] = useState<string>('');

  const modalFillManagementCodeRef = useRef<{
    error?: string;
    setError: (error: string) => void;
  }>(null);
  const modalManagementCodeNoticeRef = useRef<{ show: () => void }>(null);
  const forgotPasswordModalRef = useRef<ForgetPasswordModalProfileRef>(null); // Ref for ForgetPasswordModalProfile

  const getProfileList = async () => {
    // Simulate API call
    return [];
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('userSelected');
      const profile = (data && JSON.parse(data)) || null;
      setSelectedProfile(profile);
      dispatch(
        setSideBarLeft({
          text: 'Quản lý hồ sơ',
          url: `${window?.location?.origin}/tai-khoan?tab=ho-so`,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProfile?.profile_id) {
      getDefailProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile?.profile_id]);

  const handleDataRoute = () => {
    dispatch(
      setSideBarLeft({
        text: 'Thông tin hồ sơ',
        url: `${window?.location?.origin}/tai-khoan?tab=ho-so&child=quan-ly-va-tuy-chon`,
      })
    );
    router.push(`/tai-khoan?tab=ho-so&child=lich-su-xem`, undefined);
  };

  const handleEditProfile = () => {
    const temp = localStorage.getItem(DETAIL_PR) || '';
    const defaultProfile = JSON.parse(temp) || '';
    if (selectedProfile?.profile_id === defaultProfile?.profile_id) {
      router.push('/tai-khoan/multi-profiles?is-setting=1');
    } else {
      clickProfile();
    }
  };

  const getDefailProfile = async () => {
    try {
      const response = await switchProfile(selectedProfile?.profile_id || '');
      const data = await response?.data;
      switch (data?.error_code) {
        case '3':
          setModalContent({
            title: data?.message?.title || 'Hồ sơ đã bị xóa',
            content:
              data?.message?.content || 'Hồ sơ này đã bị xóa bởi thiết bị khác',
            buttons: {
              accept: 'Đóng',
            },
          });
          setIsConfirmModalOpen(true);
          setIsErrorCode('3');
          break;
        case '4':
          setModalContent({
            title: data?.message?.title || 'Hồ sơ đã bị xóa',
            content:
              data?.message?.content ||
              'Hồ sơ này đã bị xóa. Nhấn “Xác nhận” để chuyển qua sử dụng hồ sơ mặc định.',
            buttons: {
              accept: 'Xác nhận',
            },
          });
          setIsConfirmModalOpen(true);
          setIsErrorCode('4');
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const confirmManagementCode = async (pw: string) => {
    setLoading(true);
    const result = await checkPassword({ password: pw, version: 1 });
    setLoading(false);

    if (result.success) {
      setShowModalFillManagementCode(false);
      router.push('/tai-khoan/multi-profiles?is-setting=1');
    } else {
      if (modalFillManagementCodeRef.current) {
        modalFillManagementCodeRef.current.setError(
          result.error || ''
        );
      }
    }
  };

  const handleConfirmModal = () => {
    if (isErrorCode === '3') {
      router.push('/tai-khoan?tab=ho-so');
      return;
    }

    if (isErrorCode === '4') {
      window.location.href = '/';
      return;
    }
  };

  const clickProfile = async () => {
    try {
      setLoading(true);
      const storageProfileId =
        typeof window !== 'undefined'
          ? localStorage.getItem('profile_id')
          : null;
      if (selectedProfile?.profile_id === storageProfileId) {
        router.push('/tai-khoan/multi-profiles?is-setting=1');
        return;
      }
      if (
        typeof window !== 'undefined' &&
        localStorage.getItem(TYPE_PR) === PROFILE_TYPES.MASTER_PROFILE
      ) {
        const response = await getUserInfo();
        const data = await response?.data;
        if (data?.profile?.profile_id) {
          if (data?.allow_pin === '1') {
            setIsConfirmManagementCode(true);
          } else {
            setIsConfirmManagementCode(false);
          }
          if (
            !isConfirmManagementCode &&
            localStorage.getItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE) === '1'
          ) {
            setShowModalFillManagementCode(true);
          } else {
            modalManagementCodeNoticeRef.current?.show();
          }
        } else {
          showToast({
            title: INFORM,
            desc: DEFAULT_ERROR_MSG,
          });
          return;
        }
        await getProfileList();
        setLoading(false);
        if (sessionStorage) {
          sessionStorage.setItem('password_form_event', 'update_profile');
        }
      }
    } catch (err) {
      // Handle error
      if (err instanceof AxiosError && err.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      } else {
        showToast({
          title: INFORM,
          desc: DEFAULT_ERROR_MSG,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = () => {
    dispatch(setOtpType(SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE));
    setShowPinModal(false);
    setShowPasswordModal(false);
    setShowPasswordModalLogin(false);
    forgotPasswordModalRef.current?.setOpen(true);
    setShowModalFillManagementCode(false);
  };

  const onConfirmCreateManagementCode = () => {
    if (forgotPasswordModalRef.current) {
      forgotPasswordModalRef.current.openModal(); // Open CreateManagementCodeModal via ref
    }
    setShowModalManagementCode(false); // Close ModalManagementCodeNotice
  };

  return (
    <div className="max-w-[856px]">
      <h2 className="text-[20px] tablet:text-[28px] font-semibold heading-[1.3] text-white-smoke mb-6 tablet:mb-[48px]">
        Thông tin hồ sơ
      </h2>
      {selectedProfile && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-[60px] tablet:w-[72px]">
              {selectedProfile?.profile_type === '2' && (
                <img
                  className="absolute w-full bottom-[10px] left-[4px] right-[4px] pl-[4px] pr-[20px]"
                  src="/images/profiles/child.png"
                  alt="child"
                />
              )}
              {}
              <img
                src={selectedProfile.avatar_url || '/default-avatar.png'} // Fallback image
                alt="User Avatar"
                className="w-[60px] tablet:w-[72px] h-[60px] tablet:h-[72px] rounded-full object-cover"
              />
            </div>

            <div>
              <div className="text-white-smoke text-[20px] tablet:text-[24px] font-medium leading-[1.3]">
                {selectedProfile.name}
              </div>
            </div>
          </div>

          <div
            onClick={handleEditProfile}
            className="cursor-pointer flex items-center justify-between p-4 bg-eerie-black hover:bg-charleston-green rounded-lg mb-4"
          >
            <div className="flex items-center gap-4">
              <MdOutlineModeEditOutline
                className="text-silver-chalice"
                size={24}
              />
              <span className="text-platinum text-base font-semibold leading-6">
                Chỉnh sửa hồ sơ
              </span>
            </div>
            <HiOutlineChevronRight
              className="text-white cursor-pointer"
              size={20}
            />
          </div>

          {(currentUser?.info?.profile?.is_root === '1' ||
            (currentUser?.info?.profile?.profile_id ||
              currentUser?.info?.user_id_str) ===
              selectedProfile?.profile_id) && (
            <div
              onClick={handleDataRoute}
              className="cursor-pointer flex items-center justify-between p-4 bg-eerie-black hover:bg-charleston-green rounded-lg mb-4"
            >
              <div className="flex items-center gap-4">
                <MdHistory className="text-silver-chalice" size={24} />
                <span className="text-platinum text-base font-semibold leading-[1.3]">
                  Lịch sử xem
                </span>
              </div>
              <HiOutlineChevronRight
                className="text-white cursor-pointer"
                size={20}
              />
            </div>
          )}
          <ModalFillManagementCode
            ref={modalFillManagementCodeRef}
            open={showModalFillManagementCode}
            loading={loading}
            onConfirm={confirmManagementCode}
            onCancel={() => setShowModalFillManagementCode(false)}
            onForget={handleForgetPassword}
            onHidden={() => setShowModalFillManagementCode(false)}
          />

          <ModalManagementCodeNotice
            ref={modalManagementCodeNoticeRef}
            open={showModalManagementCode}
            isConfirm={isConfirmManagementCode}
            onAcknowledge={() => setShowModalFillManagementCode(true)}
            onConfirm={onConfirmCreateManagementCode}
          />

          <ForgetPasswordModalProfile
            ref={forgotPasswordModalRef}
            Restep={() => router.push('/tai-khoan/multi-profiles?is-setting=1')}
          />
          <ConfirmModal
            modalContent={modalContent || {}}
            onHidden={() => {
              setIsConfirmModalOpen(false);
            }}
            onSubmit={handleConfirmModal}
            open={isConfirmModalOpen}
          />
        </>
      )}
    </div>
  );
};

export default ProfileOptional;
