import React, { useState, useEffect } from 'react';
// import React, { useState, useEffect, useMemo } from 'react';
import { useProfileAvatars } from '@/lib/hooks/useProfileAvatars';
import { useFetchRecommendedProfile } from '@/lib/hooks/useCreateProfile';
import { useCreateNewProfile } from '@/lib/hooks/useCreateNewProfile'; // Import the new hook
import CustomImage from '@/lib/components/common/CustomImage';
import ProfileButton from '@/lib/components/common/ProfileButton';
import ProfileHeading from '@/lib/components/multi-profile/ProfileHeading';
import ProfileAvatarList from '@/lib/components/multi-profile/ProfileAvatarList';
import PinModal from '@/lib/components/modal/ModalPin';
import TogglerButton from '@/lib/components/common/ToggleButton';
import ModalConfirm, {
  ModalContent,
} from '@/lib/components/modal/ModalConfirm';
import { IoIosArrowDown } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';
import { BiPencil } from 'react-icons/bi';
import { LiaTrashAlt } from 'react-icons/lia';
import {
  PIN_TYPES,
  PROFILE_TYPES,
  PROFILE_DEFAULT_AVATAR,
} from '@/lib/constant/texts';
import { Profile } from '@/lib/api/user';
import { Avatar } from '@/lib/api/multi-profiles';
// import { Avatar, verifyProfileName } from '@/lib/api/multi-profiles';
import Loading from '@/lib/components/common/Loading';
import styles from './ProfileForm.module.css';
import { useAppSelector } from '@/lib/store'; // Adjust the import path as needed
import { CREATE_PROFILE, EDIT_PROFILE } from '@/lib/constant/texts';
import { deleteProfile } from '@/lib/api/multi-profiles'; // Adjust the import path as needed
import { useRouter } from 'next/router';
import { switchProfile } from '@/lib/api/user';
// import { removeVietnameseTones } from '@/lib/utils/removeVietnameseTones';
import { trackingModifyProfileLog103 } from '@/lib/tracking/trackingProfile';

interface ProfileFormProps {
  errorUpdate?: string | null;
  profile?: Profile;
  title?: string;
  pinTitle?: string;
  type?: string;
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: (data: {
    name: string;
    avatar_id: string;
    avatar_url: string;
    // display_name: string;
    nickname?: string;
    profile_type: string;
    pin?: string;
  }) => void;
  onRemovePin?: (data: { name?: string; avarta?: Avatar }) => void;
  onCreateSuccess?: () => void;
  listProfiles?: Profile[];
}

const nameRegex =
  /^[0-9a-zA-Z_ÀÁÂÃÈÉÊẾÌĨÍÒÓÔÕÙÚĂĐŨƠàáâãèéêếìĩíòóôõùúăđũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ ]+$/;

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile = {} as Profile,
  title = '',
  type = 'create',
  loading = false,
  errorUpdate,
  // listProfiles = [],
  onCancel,
  onConfirm,
  onRemovePin,
}) => {
  const { fetchAvatars } = useProfileAvatars();
  const [isChild, setIsChild] = useState<boolean>(false);
  const [isAvatar, setIsAvatar] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  // const [displayName, setDisplayName] = useState<string>('');
  // const [nickname, setNickname] = useState<string>('');
  // const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  // const [msgWarningEditNickname, setMsgWarningEditNickname] =
  //   useState<string>('');
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: '',
    content: '',
    buttons: {
      accept: 'Xóa',
      cancel: 'Đóng',
    },
  });
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [validNameChange, setValidNameChange] = useState<boolean>(true);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>({
    avatar_id: '',
    avatar_url: '',
  });
  const [showAddPinModal, setShowAddPinModal] = useState<boolean>(false);
  const [showEditPinModal, setShowEditPinModal] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [showPinDropdown, setShowPinDropdown] = useState<boolean>(false);
  const [isRemovePin, setIsRemovePin] = useState<boolean>(false);
  const [loadingCreate, setLoadingCreate] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isErrorCode, setIsErrorCode] = useState<string | null>(null);
  // const [nicknameErrors, setNicknameErrors] = useState<string[]>([]);
  // const [isValidatingNickname, setIsValidatingNickname] =
  //   useState<boolean>(false);
  // const [nicknameChangeCount, setNicknameChangeCount] = useState<number>(0);
  // const [initialNickname, setInitialNickname] = useState<string>('');
  // const [displayNameErrors, setDisplayNameErrors] = useState<string[]>([]);
  // const [isValidatingDisplayName, setIsValidatingDisplayName] =
  //   useState<boolean>(false);
  // const [displayNameChangeCount, setDisplayNameChangeCount] =
  //   useState<number>(0);
  // const [initialDisplayName, setInitialDisplayName] = useState<string>('');
  const router = useRouter();

  // Sử dụng hook useFetchRecommendedProfile
  const { profileData, fetchRecommendedProfile, isLoading, error } =
    useFetchRecommendedProfile({
      setIsError,
    });

  // Sử dụng hook useCreateNewProfile
  const {
    createNewProfile,
    isLoading: isCreating,
    error: createError,
  } = useCreateNewProfile({
    setLoadingCreate,
  });

  // const { info } = useAppSelector((state) => state.user);
  const { messageConfigs } = useAppSelector((state) => state.app);
  // const isRootProfile = useMemo(
  //   () => listProfiles?.find((item) => item?.is_root === '1'),
  //   [listProfiles],
  // );

  const getDefailProfile = async () => {
    try {
      const response = await switchProfile(profile?.profile_id || '');
      const data = await response?.data;
      // if (data?.status === '1') {
      //   setNickname(data?.data?.nickname || '');
      //   if (data?.data?.allow_edit_nickname === '1') {
      //     setMsgWarningEditNickname('');
      //   } else if (data?.data?.allow_edit_nickname === '0') {
      //     setIsEditingNickname(true);
      //     setMsgWarningEditNickname(
      //       data?.data?.msg_warning_edit_nickname || '',
      //     );
      //   }
      //   return;
      // }
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
          setIsOpenModal(true);
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
          setIsOpenModal(true);
          setIsErrorCode('4');
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    const handleFetchDataRecommendProfile = async () => {
      try {
        await fetchAvatars();
        if (title === CREATE_PROFILE) {
          await fetchRecommendedProfile();
        }
        checkDefaultProfile();
      } catch (error) {
        console.log(error);
      }
    };
    handleFetchDataRecommendProfile();
    getDefailProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, profile?.profile_id]);

  useEffect(() => {
    if (name !== profileData?.name) {
      setName(profileData?.name || profile?.name || '');
    }
    // Initialize display name and nickname when profileData changes
    // if (!displayName) {
    //   const initDisplayName =
    //     profileData?.display_name || profile?.display_name || '';
    //   setDisplayName(initDisplayName);
    //   setInitialDisplayName(initDisplayName);
    // }
    // if (!nickname) {
    //   const base = profileData?.nickname || profile?.nickname || '';
    //   const nick = removeVietnameseTones(base)
    //     .toLowerCase()
    //     .replace(/[^a-z0-9]+/g, '')
    //     .slice(0, 24);
    //   setNickname(nick);
    //   localStorage.setItem('initialNickname', nick);
    //   setInitialNickname(nick);
    // }
    if (
      selectedAvatar.avatar_id !== profileData?.avatar_id ||
      selectedAvatar.avatar_url !== profileData?.avatar_url
    ) {
      setSelectedAvatar({
        avatar_id: profileData?.avatar_id || profile?.avatar_id || '',
        avatar_url: profileData?.avatar_url || profile?.avatar_url || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  // useEffect(() => {
  //   if (!isEditingNickname) return;

  //   setIsValidatingNickname(false);

  //   // Chỉ chạy validation từ lần thay đổi thứ 2 trở đi và khi nickname khác giá trị ban đầu
  //   if (nicknameChangeCount >= 1 && nickname !== initialNickname) {
  //     const timer = setTimeout(() => {
  //       (async () => {
  //         setIsValidatingNickname(true);
  //         const errs = await validateNickname(nickname);
  //         setNicknameErrors(errs.slice(0, 1));
  //         setIsValidatingNickname(false);
  //       })();
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [nickname, isEditingNickname, nicknameChangeCount, initialNickname]);

  // useEffect(() => {
  //   if (!displayName) return;

  //   setIsValidatingDisplayName(false);

  //   // Chỉ chạy validation từ lần thay đổi thứ 2 trở đi và khi displayName khác giá trị ban đầu
  //   if (displayNameChangeCount >= 1 && displayName !== initialDisplayName) {
  //     const timer = setTimeout(() => {
  //       (async () => {
  //         setIsValidatingDisplayName(true);
  //         const errs = await validateDisplayName(displayName);
  //         setDisplayNameErrors(errs.slice(0, 1));
  //         setIsValidatingDisplayName(false);
  //       })();
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [displayName, displayNameChangeCount, initialDisplayName]);

  useEffect(() => {
    // console.log('isError', isError);
  }, [isError]);

  useEffect(() => {
    const valid = nameRegex.test(name.trim());
    if (!isLoading && name !== '') {
      setValidNameChange(valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (isChild) {
      setPin('');
    }
  }, [isChild]);

  useEffect(() => {
    setIsRemovePin(false);
  }, [pin]);

  useEffect(() => {
    if (showAddPinModal || showEditPinModal) {
      setShowPinDropdown(false);
    }
  }, [showAddPinModal, showEditPinModal]);

  const checkDefaultProfile = () => {
    if (title === EDIT_PROFILE && profile?.name) {
      if (name !== profile.name) {
        setName(profile.name);
      }
      if (
        selectedAvatar.avatar_id !== profile.avatar_id ||
        selectedAvatar.avatar_url !== profile.avatar_url
      ) {
        setSelectedAvatar({
          avatar_id: profile.avatar_id || '',
          avatar_url: profile.avatar_url || '',
        });
      }
      if (profile.profile_type === PROFILE_TYPES.KID_PROFILE && !isChild) {
        setIsChild(true);
      }
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setIsOpenModal(false);
      if (isErrorCode === '3') {
        router.push('/tai-khoan?tab=ho-so');
        return;
      }
      if (isErrorCode === '4') {
        window.location.href = '/';
        return;
      }
      const response = await deleteProfile(
        profile.profile_id || '',
        profile?.name || '',
      );
      if (response?.data?.status === '0') {
        switch (response?.data?.error_code) {
          case '3':
            setModalContent({
              title: response?.data?.message?.title || 'Hồ sơ đã bị xóa',
              content:
                response?.data?.message?.content ||
                'Hồ sơ đã bị xoá bởi thiết bị khác.',
              buttons: {
                accept: 'Đóng',
              },
            });
            setIsOpenModal(true);
            setIsErrorCode('3');
            break;
          case '4':
            setModalContent({
              title: response?.data?.message?.title || 'Hồ sơ đã bị xóa',
              content:
                response?.data?.message?.content ||
                messageConfigs?.profile?.action_delete?.msg_deleted ||
                'Hồ sơ này đã bị xóa. Nhấn “Xác nhận” để chuyển qua sử dụng hồ sơ mặc định.',
              buttons: {
                accept: 'Xác nhận',
              },
            });
            setIsOpenModal(true);
            setIsErrorCode('4');
            break;
          default:
            setIsErrorCode(null);
            break;
        }
      } else {
        trackingModifyProfileLog103({
          Screen: 'RemovedProfile',
          Event: 'RemovedProfile',
          ItemId: profile.profile_id || '',
          ItemName: profile.name || '',
          Status:
            profile?.profile_type === PROFILE_TYPES.KID_PROFILE
              ? 'Kid'
              : 'Normal',
        });
        router.push('/tai-khoan?tab=ho-so');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // const validateDisplayName = async (value: string): Promise<string[]> => {
  //   const v = (value || '').trim();
  //   const len = v.length;

  //   // Check if contains only numbers, letters (including Vietnamese characters) and spaces
  //   const allowed =
  //     /^[a-zA-Z0-9ÀÁÂÃÈÉÊẾÌĨÍÒÓÔÕÙÚĂĐŨƠàáâãèéêếìĩíòóôõùúăđũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ\s]+$/.test(
  //       v,
  //     );

  //   // Priority 1: Length and allowed characters
  //   if (!(len >= 2 && len <= 20) || !allowed || v === '') {
  //     console.log('Length and allowed characters', v);

  //     return [
  //       'Tên hiển thị không hợp lệ. Tên hiển thị bao gồm từ 2 đến 15 ký tự (a-z, 0-9)',
  //     ];
  //   }

  //   // Remote validation
  //   try {
  //     const apiRes = await verifyProfileName({ display_name: v });
  //     if (apiRes?.status === '1') {
  //       return [];
  //     }
  //     return [
  //       apiRes?.message?.content ||
  //         'Tên hiển thị không hợp lệ. Vui lòng chọn tên hiển thị khác.',
  //     ];
  //   } catch {
  //     return ['Không thể xác thực tên hiển thị. Vui lòng thử lại.'];
  //   }
  // };

  // const validateNickname = async (value: string): Promise<string[]> => {
  //   const v = (value || '').trim();
  //   const lower = v.toLowerCase();
  //   const len = v.length;
  //   const allowed = /^[a-z0-9._]+$/.test(lower);

  //   if (v === localStorage.getItem('initialNickname')) {
  //     return [];
  //   }

  //   // Priority 1
  //   if (!(len >= 2 && len <= 15) || !allowed || v === '') {
  //     return [
  //       'Biệt danh bao gồm từ 2 đến 15 ký tự (a-z, 0-9, dấu gạch dưới _ , dấu chấm .)',
  //     ];
  //   }
  //   // Priority 2
  //   if (/^[_\.]|[_\.]$/.test(v)) {
  //     return [
  //       'Biệt danh không bắt đầu hoặc kết thúc bằng dấu gạch dưới, dấu chấm.',
  //     ];
  //   }

  //   // Priority 3
  //   if (/__|\.\.|_.|._/.test(v)) {
  //     return [
  //       'Biệt danh không thể chứa liên tiếp nhiều dấu gạch dưới, dấu chấm.',
  //     ];
  //   }

  //   // Remote validation
  //   try {
  //     const apiRes = await verifyProfileName({ nickname: v });
  //     if (apiRes?.status === '1') {
  //       return [];
  //     }
  //     return [
  //       apiRes?.message?.content ||
  //         'Biệt danh không hợp lệ. Vui lòng chọn biệt danh khác.',
  //     ];
  //   } catch {
  //     return ['Không thể xác thực biệt danh. Vui lòng thử lại.'];
  //   }
  // };

  const handleConfirm = async () => {
    const data: {
      name: string;
      avatar_id: string;
      avatar_url: string;
      // display_name: string;
      profile_type: string;
      pin?: string;
      nickname?: string;
    } = {
      name: name.trim() || '',
      avatar_id: selectedAvatar.avatar_id || '',
      avatar_url: selectedAvatar.avatar_url || '',
      // display_name: displayName.trim() || '',
      profile_type: isChild
        ? PROFILE_TYPES.KID_PROFILE
        : PROFILE_TYPES.MASTER_PROFILE,
      ...(pin && pin.length === 4 && { pin }),
      ...(isRemovePin && { pin: '' }),
    };

    // if (
    //   title === EDIT_PROFILE &&
    //   nickname !== localStorage.getItem('initialNickname')
    // ) {
    //   data.nickname = nickname.trim() || '';
    // }

    if (title === CREATE_PROFILE) {
      createNewProfile(data);
    } else {
      onConfirm?.(data);
    }
  };

  const handleRemovePin = () => {
    setPin('');
    setIsRemovePin(true);
    onRemovePin?.({ name, avarta: selectedAvatar });
    setShowPinDropdown(false);
  };

  const handleClickNavAvatarList = (avatar: Avatar) => {
    setSelectedAvatar({
      avatar_id: avatar.id || '',
      avatar_url: avatar.image || avatar?.avatar_url || '',
    });

    setIsAvatar(false);
  };

  const handleConfirmPin = (pin: string) => {
    setPin(pin);
    setShowAddPinModal(false);
  };

  const handleConfirmEditPin = (pin: string) => {
    setPin(pin);
    setShowEditPinModal(false);
  };

  const pinTitleAdd =
    type === 'create' ? (!pin ? 'Thiết lập' : 'Chỉnh sửa') : '';
  const hideToggler = profile?.profile_type === PROFILE_TYPES.MASTER_PROFILE;

  if (isLoading) {
    return (
      <div className="relative">
        <div className="max-w-[542px] relative min-h-[500px] mx-auto">
          <Loading />
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      {!isAvatar ? (
        <div className="max-w-[542px] mx-auto mt-[104px] tablet:mt-[152px]">
          <div className="mb-4 text-center">
            <ProfileHeading>{title}</ProfileHeading>
          </div>
          <div className="text-center mt-[24px] tablet:mt-[40px] mb-[24px]">
            <div
              className="relative text-center cursor-pointer inline-block "
              onClick={() => setIsAvatar(true)}
            >
              <CustomImage
                className="w-[80px] tablet:w-[120px] h-[80px] tablet:h-[120px] rounded-full"
                src={selectedAvatar?.avatar_url || PROFILE_DEFAULT_AVATAR}
                alt="PROFILE_DEFAULT_AVATAR"
              />
              <div className="absolute top-0 right-0 bg-white rounded-full flex items-center justify-center w-5 tablet:w-8 h-5 tablet:h-8">
                <img
                  src="/images/profiles/edit_black.png"
                  alt="edit avatar"
                  className="w-[18px] h-[18px] min-w-[18px]"
                />
              </div>
              {isChild && (
                <img
                  className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-16"
                  src="/images/profiles/child_2.png"
                  alt="edit avatar"
                />
              )}
            </div>
          </div>

          <div className="w-full mb-[24px]">
            <p className="text-white-smoke font-medium text-base leading-[1.3] mb-2">
              Tên hồ sơ
              {/* <span className="text-base leading-[1.3] font-normal text-silver-chalice mt-2 inline-block">
                Dùng để phân biệt các hồ sơ trong cùng tài khoản và hiển thị
                trong giao diện chọn hồ sơ. Ví dụ: “Bố”, “Mẹ”, “Bé Na”,...
              </span> */}
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setValidNameChange(nameRegex.test(name.trim()))}
              maxLength={15}
              className={`${
                !validNameChange || createError?.message || errorUpdate
                  ? 'border-scarlet focus:border-scarlet'
                  : 'border-black-olive-404040 focus:border-gray'
              } border w-full py-[18px] px-6 rounded-[104px] bg-[rgba(0,0,0,0.05)] text-white-smoke text-base leading-6 outline-none`}
            />
            {!validNameChange && !errorUpdate && (
              <div className="mt-3 text-left text-[#ef1348] text-base leading-6">
                Tên hồ sơ không hợp lệ. Tên hồ sơ bao gồm từ 1 đến 15 ký tự
                (a-z, 0-9)
              </div>
            )}
            {errorUpdate && !validNameChange && (
              <div className="mt-3 text-left text-[#ef1348] text-base leading-6">
                {errorUpdate}
              </div>
            )}
            {createError && (
              <div className="mt-3 text-[#ef1348] text-base leading-6">
                {createError.message}
              </div>
            )}
          </div>

          {/* Display Name */}
          {/* <div className="w-full mb-[24px]">
            <p className="text-white-smoke font-medium text-base leading-[1.3] mb-2">
              Tên hiển thị
            </p>
            <p className="text-silver-chalice text-base leading-[1.3] mb-2">
              Dùng để hiển thị công khai khi tham gia các hoạt động cộng đồng
              trên FPT Play như bình luận, trò chuyện trực tiếp và các hoạt động
              khác.
            </p>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setDisplayNameChangeCount((prev) => prev + 1);
                  if (displayNameErrors.length) setDisplayNameErrors([]);
                }}
                maxLength={15}
                className={`border ${
                  displayNameErrors.length
                    ? 'border-scarlet focus:border-scarlet'
                    : 'border-black-olive-404040 focus:border-gray'
                } w-full py-[18px] pl-6 pr-12 rounded-[104px] bg-[rgba(0,0,0,0.05)] text-white-smoke text-base leading-6 outline-none overflow-hidden whitespace-nowrap text-ellipsis`}
              />
              {isValidatingDisplayName && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-white-smoke border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {displayNameErrors.length > 0 && (
              <div className="mt-3 text-left text-[#ef1348] text-base leading-6">
                {displayNameErrors.map((msg, idx) => (
                  <div key={`display-name-err-${idx}`}>{msg}</div>
                ))}
              </div>
            )}
          </div> */}

          {/* Nickname */}
          {/* {title === EDIT_PROFILE && (
            <div className="w-full mb-[24px]">
              <p className="text-white-smoke font-medium text-base leading-[1.3] mb-2">
                Biệt danh
              </p>
              {msgWarningEditNickname && (
                <p className="text-silver-chalice text-base leading-[1.3] mb-2">
                  {msgWarningEditNickname}
                </p>
              )}
              {!isEditingNickname ? (
                <div className="flex items-center gap-2 text-silver-chalice text-base leading-[1.3]">
                  <span>@{nickname}</span>
                  <button
                    type="button"
                    aria-label="Chỉnh sửa biệt danh"
                    className="inline-flex items-center text-white-smoke hover:text-fpl"
                    onClick={() => {
                      setIsEditingNickname(true);
                      setNicknameChangeCount(0);
                      setInitialNickname(nickname);
                    }}
                  >
                    <BiPencil className="ml-1" fontSize={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      msgWarningEditNickname
                        ? 'text-black-olive-404040'
                        : 'text-silver-chalice'
                    }`}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    value={nickname}
                    disabled={!!msgWarningEditNickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameChangeCount((prev) => prev + 1);
                      if (nicknameErrors.length) setNicknameErrors([]);
                    }}
                    maxLength={24}
                    className={`border ${
                      nicknameErrors.length
                        ? 'border-scarlet focus:border-scarlet'
                        : msgWarningEditNickname
                        ? 'border-charleston-green focus:border-charleston-green cursor-not-allowed'
                        : 'border-black-olive-404040 focus:border-gray'
                    } w-full py-[18px] pl-8 pr-12 rounded-[104px] bg-[rgba(0,0,0,0.05)] ${
                      msgWarningEditNickname
                        ? 'text-black-olive-404040'
                        : 'text-white-smoke'
                    } text-base leading-6 outline-none`}
                  />
                  {isValidatingNickname && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-white-smoke border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )}
              {nicknameErrors.length > 0 && (
                <div className="mt-3 text-left text-[#ef1348] text-base leading-6">
                  {nicknameErrors.map((msg, idx) => (
                    <div key={`nick-err-${idx}`}>{msg}</div>
                  ))}
                </div>
              )}
            </div>
          )} */}
          {(profile?.profile_type === PROFILE_TYPES.KID_PROFILE ||
            title === CREATE_PROFILE) && (
            <div className="w-full mb-[24px]">
              <p className="text-silver-chalice text-base leading-[1.3] mb-2">
                Phân loại hồ sơ
              </p>
              <div className="px-4 tablet:px-6 py-4 rounded-[12px] bg-eerie-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white-smoke text-base leading-6 font-medium mb-2">
                      Trẻ em
                    </p>
                    <p className="text-spanish-gray text-base leading-[1.3] max-w-[284px] tablet:max-w-none">
                      Chỉ hiển thị các nội dung cho độ tuổi từ 13 trở xuống
                    </p>
                  </div>
                  <div className="w-10">
                    <TogglerButton
                      defaultValue={isChild}
                      isKid={hideToggler}
                      onChange={setIsChild}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            className={`w-full mb-[24px] ${
              isChild ? 'pointer-events-none opacity-37' : ''
            }`}
          >
            <p className="text-silver-chalice text-base leading-[1.3] mb-2">
              Quản lý mã PIN
            </p>
            <div className="flex items-center justify-between px-4 tablet:px-6 py-4 rounded-[12px] bg-eerie-black relative">
              <div>
                <p
                  className={`${
                    !(profile?.pin_type === PIN_TYPES.REQUIRED_PIN) && !pin
                      ? 'mb-2'
                      : ''
                  } text-white-smoke text-base leading-6 font-medium`}
                >
                  Mã PIN hồ sơ
                </p>
                {!(profile?.pin_type === PIN_TYPES.REQUIRED_PIN) && !pin && (
                  <p className="text-spanish-gray text-base leading-[1.3] max-w-[284px] tablet:max-w-none">
                    Thiết lập mã PIN để nâng cao bảo mật hồ sơ
                  </p>
                )}
              </div>
              {!(profile?.pin_type === PIN_TYPES.REQUIRED_PIN) && !pin ? (
                <p
                  className="text-white-smoke text-base leading-6 font-medium cursor-pointer"
                  onClick={() => setShowAddPinModal(true)}
                >
                  {pinTitleAdd}
                </p>
              ) : (
                <div className="relative">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowPinDropdown(!showPinDropdown)}
                  >
                    <span className="text-white-smoke text-base leading-6 font-medium">
                      Chỉnh sửa
                    </span>
                    <IoIosArrowDown
                      fontSize={17}
                      className={`${showPinDropdown ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              )}
              {showPinDropdown && (
                <div className="absolute z-10 right-0 top-full bg-charleston-green w-[252px] rounded-2xl py-4">
                  <div className="hover:bg-black-olive-404040">
                    <div
                      className="py-4 px-5 flex items-center whitespace-nowrap text-base leading-6 cursor-pointer transition-colors"
                      onClick={() => {
                        setShowEditPinModal(true);
                        setShowPinDropdown(false);
                      }}
                    >
                      <BiPencil className="mr-3" fontSize={20} /> Đổi mã PIN hồ
                      sơ
                    </div>
                  </div>
                  <div className="hover:bg-black-olive-404040">
                    <div
                      className="py-4 px-5 flex items-center whitespace-nowrap text-base leading-6 cursor-pointer transition-colors"
                      onClick={handleRemovePin}
                    >
                      <LiaTrashAlt className="mr-3" fontSize={20} /> Xóa mã PIN
                      hồ sơ
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* {title === EDIT_PROFILE &&
            info?.profile?.profile_id !== profile?.profile_id &&
            profile?.profile_id !== info?.user_id_str && (
              <div className="w-full mb-[24px]">
                <div className="px-4 tablet:px-6 py-4 rounded-[12px] bg-eerie-black">
                  <div className="flex items-center justify-between">
                    <p className="text-white-smoke text-base leading-6 font-medium">
                      Xóa hồ sơ
                    </p>
                    <button
                      onClick={() => {
                        setModalContent({
                          title:
                            messageConfigs?.profile?.action_delete
                              ?.title_delete || 'Bạn muốn xóa hồ sơ?',
                          content:
                            messageConfigs?.profile?.action_delete?.msg_delete?.replace(
                              '%s',
                              isRootProfile?.name || '',
                            ) ||
                            `Hồ sơ bị xóa sẽ không thể khôi phục. Thiết bị sử dụng hồ sơ này sẽ được chuyển về hồ sơ ${isRootProfile?.name}.`,
                          buttons: {
                            accept: 'Xóa',
                            cancel: 'Đóng',
                          },
                        });
                        setIsOpenModal(true);
                      }}
                      className="cursor-pointer text-white-smoke text-base leading-6 font-medium outline-0 bg-transparent p-0 m-0"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )} */}
          <ModalConfirm
            modalContent={modalContent}
            open={isOpenModal}
            onSubmit={handleDeleteProfile}
            onCancel={() => setIsOpenModal(false)}
            onHidden={() => setIsOpenModal(false)}
          />
          <div className="flex items-center justify-between gap-3 pt-4">
            <ProfileButton
              variant="dark"
              width="full"
              disabled={loading || loadingCreate || isLoading || isCreating}
              onClickBtn={handleCancel}
              className="bg-charleston-green"
            >
              Hủy
            </ProfileButton>
            <ProfileButton
              width="full"
              className={`${
                !validNameChange ||
                loading ||
                loadingCreate ||
                isLoading ||
                isCreating
                // nicknameErrors.length > 0 ||
                // displayNameErrors.length > 0
                  ? styles.disabledButton
                  : styles.enabledButton
              }`}
              disabled={
                !validNameChange ||
                loading ||
                loadingCreate ||
                isLoading ||
                isCreating
              }
              onClickBtn={handleConfirm}
            >
              Hoàn tất
            </ProfileButton>
          </div>
          {isLoading && (
            <div className="text-gray-500 text-base leading-6">
              <Loading />
            </div>
          )}
          {error && (
            <div className="text-[#ef1348] text-base leading-6">
              Lỗi khi tải hồ sơ gợi ý: {error.message}
            </div>
          )}
          {isCreating && (
            <div className="text-gray-500 text-base leading-6">
              <Loading />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-[94px] tablet:mt-[120px]">
          <ProfileAvatarList
            defaultAvatar={selectedAvatar}
            onClickNav={handleClickNavAvatarList}
          />
        </div>
      )}
      {showAddPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-eerie-black rounded-[16px] p-8 relative max-w-[calc(100vw-32px)] sm:max-w-[460px]">
            <button
              className="absolute top-4 right-4 text-white-smoke"
              onClick={() => setShowAddPinModal(false)}
            >
              <IoCloseOutline size={28} />
            </button>
            <PinModal
              avatarUrl={selectedAvatar?.avatar_url || ''}
              defaultValue={pin.split('')}
              loading={loading}
              profile={profile}
              onConfirm={handleConfirmPin}
              onCancel={() => setShowAddPinModal(false)}
            />
          </div>
        </div>
      )}
      {showEditPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-eerie-black rounded-[16px] p-8 relative max-w-[calc(100vw-32px)] sm:max-w-[460px]">
            <button
              className="absolute top-4 right-4 text-white-smoke"
              onClick={() => setShowEditPinModal(false)}
            >
              <IoCloseOutline size={28} />
            </button>
            <PinModal
              avatarUrl={selectedAvatar?.avatar_url || ''}
              title="Đổi mã PIN hồ sơ"
              subTitle="Vui lòng nhập mã PIN gồm 4 số (0-9) để thực hiện đổi mã PIN hồ sơ."
              defaultValue={pin.split('')}
              loading={loading}
              profile={profile}
              onConfirm={handleConfirmEditPin}
              onCancel={() => setShowEditPinModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
