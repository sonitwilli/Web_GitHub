import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbCheck } from 'react-icons/tb';
import { MdOutlineLock } from 'react-icons/md';
import { MdOutlineGroup } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import PinModal from '@/lib/components/modal/ModalPin';
import { IoCloseOutline } from 'react-icons/io5';
import Link from 'next/link';
import { Profile } from '@/lib/api/user';
import {
  DEFAULT_ERROR_MSG,
  HAVING_ERROR,
  TYPE_PR,
  ALREADY_SHOWN_MODAL_MANAGEMENT_CODE,
  PROFILE_TYPES,
} from '@/lib/constant/texts';
import ConfirmModal from '@/lib/components/modal/ModalConfirm';
import { useProfileContext } from '@/lib/components/contexts/ProfileContext';
import { ModalPinRef } from '@/lib/components/modal/ModalPin';
import { showToast } from '@/lib/utils/globalToast';
import { trackingEnterFuncLog16 } from '@/lib/tracking/trackingCommon';
import ForgetPasswordModalProfile, {
  ForgetPasswordModalProfileRef,
} from '@/lib/components/modal/ModalForgetPassword';
import { useDispatch } from 'react-redux';
import ModalFillCode from '@/lib/components/modal/ModalFillCode';
import ModalManagementCode from '@/lib/components/modal/ModalManagementCode';
import { getUserInfo } from '@/lib/api/user';
import { checkPassword } from '@/lib/api/multi-profiles';
import { setOtpType } from '@/lib/store/slices/otpSlice';
import { SEND_OTP_TYPES } from '@/lib/constant/texts';
import { ModalManagementCodeRef } from '@/lib/components/modal/ModalManagementCode';
import { updateProfile } from '@/lib/api/multi-profiles';
import { changeUserInfo } from '@/lib/store/slices/userSlice';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { trackingLoginProfileLog104 } from '@/lib/tracking/trackingProfile';

interface Props {
  profiles: Profile[];
  currentProfile?: Profile;
  disableDropdown?: boolean;
  onOpenDropdown?: () => void;
}

interface ModalContent {
  title?: string;
  content?: string;
  buttons?: {
    accept?: string;
    cancel?: string;
  };
}

interface IModalFillCodeRef {
  setError?: (err: string) => void;
}

const fallbackAvatar = '/images/default-avatar.png';

// Portal component để render modal vào body
const ModalPortal = ({
  children,
  isMobileOrTablet,
}: {
  children: React.ReactNode;
  isMobileOrTablet: boolean;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isMobileOrTablet) {
    return createPortal(children, document.body);
  }

  return <>{children}</>;
};

export default function UserDropdownMenu({
  profiles,
  currentProfile,
  disableDropdown,
  onOpenDropdown,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState<string>('');
  const [isForgotPin, setIsForgotPin] = useState(false);
  const [pinModalTitle, setPinModalTitle] =
    useState<string>('Nhập mã PIN hồ sơ');
  const [pinModalType, setPinModalType] = useState<
    'create' | 'access' | 'edit'
  >('access');
  const profilePinModalRef = useRef<ModalPinRef>(null);
  const forgotPasswordModalRef = useRef<ForgetPasswordModalProfileRef>(null);
  const modalFillCodeRef = useRef<IModalFillCodeRef>(null);
  const modalManagementCodeRef = useRef<ModalManagementCodeRef>(null);
  const dispatch = useDispatch();
  const {
    selectedProfile,
    setSelectedProfile,
    showPinModal,
    checkProfilePin,
    setShowPinModal,
    loginProfile,
    handleLoginSuccess,
  } = useProfileContext();
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: 'Chuyển đổi hồ sơ',
    content: '',
    buttons: {
      accept: 'Xác nhận',
      cancel: 'Hủy',
    },
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [showModalFillManagementCode, setShowModalFillManagementCode] =
    useState(false);
  const [showModalManagementCode, setShowModalManagementCode] = useState(false);
  const [isConfirmManagementCode, setIsConfirmManagementCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subTitle, setSubTitle] = useState<string>('');
  const [isErrorCode, setIsErrorCode] = useState<string>('');

  const handleConfirmPin = (pin: string) => {
    setPin(pin);
  };

  const confirmAddPin = async (pin: string) => {
    setLoading(true);
    profilePinModalRef.current?.setError('');
    if (!isForgotPin) {
      const checkPinResult = await checkProfilePin({
        profile: selectedProfile || {},
        pin,
      });

      if (checkPinResult?.defaultData?.error_code === '3') {
        setIsErrorCode('3');
        setModalContent({
          title:
            checkPinResult?.defaultData?.message?.title || 'Hồ sơ đã bị xóa',
          content:
            checkPinResult?.defaultData?.message?.content ||
            'Hồ sơ này đã bị xóa bởi thiết bị khác',
          buttons: {
            accept: 'Đóng',
          },
        });
        setShowPinModal(false);
        setIsConfirmModalOpen(true);
        return;
      } else if (checkPinResult.error) {
        profilePinModalRef.current?.setError(checkPinResult.error);
        return;
      }
    }
    const updateResult = await updateProfile(
      { pin, type: pinModalType },
      selectedProfile,
    );
    setLoading(false);

    if (updateResult?.data?.status === '0') {
      const data = updateResult?.data;
      if (data?.error_code === '3') {
        setIsErrorCode('3');
        setModalContent({
          title: data?.message?.title || 'Hồ sơ đã bị xóa',
          content:
            data?.message?.content || 'Hồ sơ này đã bị xóa bởi thiết bị khác',
          buttons: {
            accept: 'Đóng',
          },
        });
        setShowPinModal(false);
        setIsConfirmModalOpen(true);
        return;
      } else {
        profilePinModalRef.current?.setError(
          updateResult?.data?.msg || DEFAULT_ERROR_MSG,
        );
        setIsForgotPin(false);
        return;
      }
    }

    setLoading(true);
    await checkLoginProfile();
    setLoading(false);
  };

  const isKidProfile = useMemo(() => {
    if (typeof window !== 'undefined') {
      const profileType = localStorage.getItem(TYPE_PR);
      return profileType === '2';
    }
  }, []);

  useEffect(() => {
    if (selectedProfile?.pin_type === '1') {
      setShowPinModal(true);
      setPinModalTitle('Nhập mã PIN hồ sơ');
      setSubTitle(
        'Vui lòng nhập mã PIN gồm 4 số (0-9) để tiến hành chuyển đổi hồ sơ người dùng',
      );
      setPinModalType('access');
    } else if (isKidProfile && selectedProfile?.profile_type === '1') {
      setModalContent({
        ...modalContent,
        content: `Bạn muốn chuyển đổi hồ sơ trẻ em sang hồ sơ ${selectedProfile?.name}?`,
      });
      setIsConfirmModalOpen(true);
    } else {
      checkLoginProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile?.profile_id]);

  async function checkLoginProfile() {
    if (!selectedProfile) return;
    const loginResult = await loginProfile({
      profile_id: selectedProfile?.profile_id,
    });
    if (isErrorCode === '3') {
      setIsErrorCode('');
      window.location.href = '/';
      return;
    }
    if (loginResult?.success) {
      console.log(1111111111, loginResult);
      
      trackingLoginProfileLog104({
        Status: loginResult?.data?.profile_type === PROFILE_TYPES.KID_PROFILE ? 'Kid' : 'Normal',
        ItemName: selectedProfile?.name,
        isLandingPage: '1',
      });

      handleLoginSuccess({ profile: loginResult?.data || {} });
      setShowPinModal(false);
    } else if (loginResult?.defaultData?.error_code === '3') {
      setIsErrorCode('3');
      setModalContent({
        title: loginResult?.defaultData?.message?.title || 'Hồ sơ đã bị xóa',
        content:
          loginResult?.defaultData?.message?.content ||
          'Hồ sơ này đã bị xóa bởi thiết bị khác',
        buttons: {
          accept: 'Đóng',
        },
      });
      setIsConfirmModalOpen(true);
      return;
    } else {
      showToast({
        title: HAVING_ERROR,
        desc: loginResult.error || DEFAULT_ERROR_MSG,
      });
    }
    setIsConfirmModalOpen(false);
    setPin('');
  }

  const handleSwitchProfile = async (profile: Profile) => {
    if (currentProfile?.profile_id === profile?.profile_id) {
      setIsOpen(false);
      return;
    }
    setSelectedProfile(null);
    setTimeout(() => {
      setSelectedProfile(profile);
    }, 0);
  };

  const handleCancelPinModal = () => {
    setShowPinModal(false);
  };

  const handleCancelConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleCancelFillManagementCode = () => {
    setShowModalFillManagementCode(false);
    setShowModalManagementCode(false);
  };

  useEffect(() => {
    if (pin) {
      confirmAddPin(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // ✅ useEffect để lắng nghe sự thay đổi của disableDropdown
  useEffect(() => {
    if (disableDropdown) {
      setIsOpen(false); // tự động đóng dropdown nếu bị disable
    }
  }, [disableDropdown]);

  const handleForgetPin = async () => {
    try {
      const response = await getUserInfo();
      const data = response?.data;
      setSubTitle(
        'Vui lòng nhập mã quản lý gồm 6 số (0-9) để thực hiện chỉnh sửa hồ sơ người dùng',
      );
      setLoading(false);
      setIsForgotPin(true);
      if (data) {
        dispatch(changeUserInfo(data));
        if (data?.allow_pin === '1') {
          setIsConfirmManagementCode(true); // chưa có mã quản lý
        } else {
          setIsConfirmManagementCode(false); // đã có mã quản lý
        }
        if (
          !isConfirmManagementCode &&
          typeof window !== 'undefined' &&
          localStorage.getItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE) === '1'
        ) {
          setShowModalFillManagementCode(true);
        } else {
          modalManagementCodeRef.current?.show?.();
        }
      } else {
        showToast({
          title: 'Thông báo',
          desc: DEFAULT_ERROR_MSG,
        });
        return;
      }
      setShowPinModal(false);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('password_form_event', 'forget_pin');
      }
    } catch {
      // handle error nếu cần
    }
  };

  // Confirm mã quản lý (dùng cho ModalFillCode)
  const confirmManagementCode = async (pw: string) => {
    setLoading(true);
    const result = await checkPassword({ password: pw, version: 1 });
    setLoading(false);
    if (result.success) {
      setShowModalFillManagementCode(false);
      handleRestep();
      // Có thể redirect hoặc thực hiện logic khác nếu cần
    } else {
      modalFillCodeRef.current?.setError?.(result.error || DEFAULT_ERROR_MSG);
    }
  };

  // Quên mã quản lý (dùng cho ModalFillCode)
  const handleForgetPassword = () => {
    dispatch(setOtpType(SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE));
    forgotPasswordModalRef.current?.setOpen(true);
    setShowModalFillManagementCode(false);
  };

  // Xác nhận tạo mã quản lý mới (dùng cho ModalManagementCode)
  const onConfirmCreateManagementCode = () => {
    if (forgotPasswordModalRef.current) {
      forgotPasswordModalRef.current.openModal();
    }
    setShowModalManagementCode(false);
  };

  const handleRestep = () => {
    setPinModalTitle('Thiết lập mã PIN hồ sơ');
    setSubTitle(
      'Vui lòng nhập mã PIN gồm 4 số (0-9) để tiến hành thiết lập mã PIN hồ sơ',
    );
    setPinModalType('edit');
    setShowPinModal(true);
  };

  const { width } = useScreenSize();

  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  const isMobileOrTablet = useMemo(() => {
    return width <= 1024; // Bao gồm cả mobile và tablet
  }, [width]);

  return (
    <div className="relative group">
      {/* Avatar Button */}
      <div
        className="absolute top-[12px] left-[12px] tablet:top-[10px] tablet:left-[24px] xl:top-[7px] xl:left-0 w-[32px] h-[32px] tablet:w-[48px] tablet:h-[48px] tablet:w-[42px] tablet:h-[42px] rounded-full border-2 border-white cursor-pointer"
        onMouseEnter={() => {
          if (!disableDropdown) setIsOpen(true);
        }}
        onMouseLeave={() => {
          if (!disableDropdown) setIsOpen(false);
        }}
        onClick={() => {
          if (isMobileOrTablet) {
            if (!disableDropdown) {
              setIsOpen(true);
              onOpenDropdown?.();
            } else {
              setIsOpen(false);
            }
          }
        }}
      >
        <div
          className="w-full h-full rounded-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              currentProfile?.avatar_url || fallbackAvatar
            })`,
          }}
        />

        {isKidProfile && (
          <img
            className="absolute bottom-[4px] left-0 right-[4px] pl-[4px] pr-[8px]"
            src="/images/profiles/child.png"
            alt="child"
          />
        )}
      </div>

      {/* Dropdown */}
      {!disableDropdown && (
        <div
          className={`
            absolute
            top-[56px] left-[12px] w-[244px]
            tablet:top-[71px] tablet:left-[24px]
            tablet:top-[58px] tablet:left-auto tablet:right-[8px] tablet:w-[300px]
            z-50 transition-all duration-200
            ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          `}
          onMouseEnter={() => {
            if (!disableDropdown) setIsOpen(true);
          }}
          onMouseLeave={() => {
            if (!disableDropdown) setIsOpen(false);
          }}
        >
          <div className="relative bg-sm rounded-[16px] shadow-lg py-2 tablet:py-4 bg-eerie-black border-1 border-charleston-green">
            <ul className="text-sm text-white">
              {profiles.map((profile) => (
                <li
                  onClick={() => handleSwitchProfile(profile as Profile)}
                  key={profile.profile_id}
                  className="flex items-center pl-[16px] tablet:pl-[24px] pr-[10px] tablet:pr-[12px] py-3 gap-4 transition cursor-pointer text-white-smoke hover:bg-charleston-green"
                >
                  <div className="relative">
                    <div
                      className="w-[24px] h-[24px] rounded-full border border-white bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          profile.avatar_url || fallbackAvatar
                        })`,
                      }}
                    />
                    {profile?.profile_type === '2' && (
                      <img
                        className="absolute bottom-[4px] left-0 right-[4px] pl-[4px] pr-[4px]"
                        src="/images/profiles/child.png"
                        alt="child"
                      />
                    )}
                  </div>
                  <span className="flex-1 text-[13.65px] tablet:text-[16px] font-normal">
                    {profile.name}
                  </span>
                  {currentProfile?.profile_id === profile?.profile_id && (
                    <TbCheck
                      className="text-white-smoke"
                      fontSize={isTablet ? 20.5 : 24}
                    />
                  )}
                  {profile?.pin_type === '1' &&
                    currentProfile?.profile_id !== profile?.profile_id && (
                      <MdOutlineLock
                        className="text-spanish-gray"
                        fontSize={isTablet ? 20.5 : 24}
                      />
                    )}
                </li>
              ))}

              {!isKidProfile && (
                <div>
                  <div className="w-full h-[1px] bg-charleston-green my-3"></div>

                  <Link
                    href="/tai-khoan?tab=ho-so"
                    prefetch={false}
                    className="flex items-center pl-[16px] tablet:pl-[24px] pr-[10px] tablet:pr-[12px] py-3 gap-4 transition cursor-pointer text-white-smoke hover:bg-charleston-green"
                  >
                    <MdOutlineGroup
                      fontSize={isTablet ? 20.5 : 24}
                      className="text-white-smoke"
                    />
                    <span className="flex-1 text-[13.65px] tablet:text-[16px]">
                      Quản lý hồ sơ
                    </span>
                  </Link>

                  <Link
                    href="/tai-khoan?tab=tong-quan"
                    prefetch={false}
                    className="flex items-center  pl-[16px] tablet:pl-[24px] pr-[10px] tablet:pr-[12px] py-3 gap-4 transition cursor-pointer text-white-smoke hover:bg-charleston-green"
                    onClick={() => trackingEnterFuncLog16('EnterAccount')}
                  >
                    <IoSettingsOutline fontSize={isTablet ? 20.5 : 24} />
                    <span className="flex-1 text-[13.65px] tablet:text-[16px]">
                      Tài khoản và cài đặt
                    </span>
                  </Link>
                </div>
              )}
            </ul>
          </div>
        </div>
      )}
      {showPinModal && selectedProfile && (
        <ModalPortal isMobileOrTablet={isMobileOrTablet}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-eerie-black rounded-[16px] p-4 tablet:p-8 relative max-w-[calc(100vw-32px)] tablet:max-w-[460px]">
              <button
                className="absolute top-4 right-4 text-white-smoke cursor-pointer"
                onClick={handleCancelPinModal}
              >
                <IoCloseOutline size={28} />
              </button>
              <PinModal
                ref={profilePinModalRef}
                avatarUrl={selectedProfile.avatar_url || ''}
                defaultValue={pin.split('')}
                title={pinModalTitle}
                subTitle={subTitle}
                loading={false}
                type={pinModalType}
                profile={selectedProfile}
                onConfirm={handleConfirmPin}
                onForget={handleForgetPin}
                onCancel={handleCancelPinModal}
              />
            </div>
          </div>
        </ModalPortal>
      )}
      <ConfirmModal
        modalContent={modalContent}
        onHidden={() => {
          setIsConfirmModalOpen(false);
        }}
        onSubmit={checkLoginProfile}
        onCancel={handleCancelConfirmModal}
        open={isConfirmModalOpen}
      />
      <ModalFillCode
        ref={modalFillCodeRef}
        open={showModalFillManagementCode}
        loading={loading}
        subTitle={subTitle}
        onConfirm={confirmManagementCode}
        onCancel={handleCancelFillManagementCode}
        onForget={handleForgetPassword}
        onHidden={handleCancelFillManagementCode}
      />
      <ModalManagementCode
        ref={modalManagementCodeRef}
        open={showModalManagementCode}
        isConfirm={isConfirmManagementCode}
        onAcknowledge={() => setShowModalFillManagementCode(true)}
        onConfirm={onConfirmCreateManagementCode}
      />
      <ForgetPasswordModalProfile
        ref={forgotPasswordModalRef}
        Restep={handleRestep}
      />
    </div>
  );
}
