import React, { useState, useEffect } from 'react';
import { useProfileAvatars } from '@/lib/hooks/useProfileAvatars';
import { useFetchRecommendedProfile } from '@/lib/hooks/useCreateProfile';
import { useCreateNewProfile } from '@/lib/hooks/useCreateNewProfile'; // Import the new hook
import CustomImage from '@/lib/components/common/CustomImage';
import ProfileButton from '@/lib/components/common/ProfileButton';
import ProfileHeading from '@/lib/components/multi-profile/ProfileHeading';
import ProfileAvatarList from '@/lib/components/multi-profile/ProfileAvatarList';
import PinModal from '@/lib/components/modal/ModalPin';
import TogglerButton from '@/lib/components/common/ToggleButton';
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
import Loading from '@/lib/components/common/Loading';
import styles from './ProfileForm.module.css';

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
    profile_type: string;
    pin?: string;
  }) => void;
  onRemovePin?: (data: { name?: string; avarta?: Avatar }) => void;
  onCreateSuccess?: () => void;
}

const nameRegex =
  /^[0-9a-zA-Z_ÀÁÂÃÈÉÊẾÌĨÍÒÓÔÕÙÚĂĐŨƠàáâãèéêếìĩíòóôõùúăđũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ ]+$/;

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile = {} as Profile,
  title = '',
  type = 'create',
  loading = false,
  errorUpdate,
  onCancel,
  onConfirm,
  onRemovePin,
}) => {
  const { fetchAvatars } = useProfileAvatars();
  const [isChild, setIsChild] = useState<boolean>(false);
  const [isAvatar, setIsAvatar] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
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

  useEffect(() => {
    const handleFetchDataRecommendProfile = async () => {
      try {
        await fetchAvatars();
        if (title === 'Tạo hồ sơ') {
          await fetchRecommendedProfile();
        }
        checkDefaultProfile();
      } catch (error) {
        console.log(error);
      }
    };
    handleFetchDataRecommendProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, profile?.profile_id]);

  useEffect(() => {
    if (name !== profileData?.name) {
      setName(profileData?.name || '');
    }
    if (
      selectedAvatar.avatar_id !== profileData?.avatar_id ||
      selectedAvatar.avatar_url !== profileData?.avatar_url
    ) {
      setSelectedAvatar({
        avatar_id: profileData?.avatar_id || '',
        avatar_url: profileData?.avatar_url || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

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
    if (title === 'Chỉnh sửa hồ sơ' && profile?.name) {
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

  const handleCancel = () => {
    onCancel?.();
  };

  const handleConfirm = () => {
    const data = {
      name: name.trim() || '',
      avatar_id: selectedAvatar.avatar_id || '',
      avatar_url: selectedAvatar.avatar_url || '',
      profile_type: isChild
        ? PROFILE_TYPES.KID_PROFILE
        : PROFILE_TYPES.MASTER_PROFILE,
      ...(pin && pin.length === 4 && { pin }),
      ...(isRemovePin && { pin: '' }),
    };
    if (title === 'Tạo hồ sơ') {
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
            <p className="text-silver-chalice text-base leading-[1.3] mb-2">
              Tên hồ sơ
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
          {(profile?.profile_type === PROFILE_TYPES.KID_PROFILE ||
            title === 'Tạo hồ sơ') && (
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
            className={`w-full mb-[40px] ${
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
          <div className="flex items-center justify-between gap-3">
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
                !validNameChange
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
              Đang tải hồ sơ gợi ý...
            </div>
          )}
          {error && (
            <div className="text-[#ef1348] text-base leading-6">
              Lỗi khi tải hồ sơ gợi ý: {error.message}
            </div>
          )}
          {isCreating && (
            <div className="text-gray-500 text-base leading-6">
              Đang tạo hồ sơ...
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
