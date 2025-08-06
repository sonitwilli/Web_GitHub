import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { Profile } from '@/lib/api/user';
import {
  ProfileMetaData,
  doCreateNewProfile,
  getProfileList as fetchProfiles,
} from '@/lib/api/multi-profiles';
import {
  CHANGE_PIN_SUCCESS_MSG,
  DEFAULT_ERROR_MSG,
  ERROR_CONNECTION,
  PIN_TYPES,
} from '@/lib/constant/texts';
import { checkError, removeProfile, saveProfile } from '@/lib/utils/profile';
import {
  getUserInfo as getUserData,
  checkPassword as ValidateUser,
  loginProfile as SwitchProfile,
  switchProfile as SwitchPrfWithId,
  checkProfilePin as CheckPin,
  updateProfile as UpdatePrf,
} from '@/lib/api/user';
import { CheckPasswordRequest } from '@/lib/api/user';
import { showToast } from '@/lib/utils/globalToast';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { AxiosError } from 'axios';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

interface ProfileUpdate {
  name?: string;
  avatar_id?: string;
  avatar_url?: string;
  profile_type?: string;
  pin?: string;
}

interface ProfileCreate {
  name: string;
  avatar_id: string;
  avatar_url: string;
  profile_type: string;
  pin: string;
}

// Định nghĩa kiểu dữ liệu cho Context
interface ProfileContextType {
  profilesList: Profile[];
  defaultProfile: Profile | null;
  profilesMetaData: ProfileMetaData | null;
  isLogoutProfile: boolean;
  selectedProfile: Profile | null;
  showPinModal: boolean;
  showCreatePinModal: boolean;
  showPasswordModal: boolean;
  showPasswordModalLogin: boolean;
  showForgetPasswordModal: boolean;
  showConfirmKidToMasterModal: boolean;
  pin: string;
  password: string;
  profileError: string;
  setProfileError: (msg: string) => void;
  profileLoading: boolean;
  setProfileLoading: (value: boolean) => void;
  refetchProfiles: () => Promise<void>;
  refetchUserInfo: () => Promise<void>;
  modalContentKidToMaster: {
    title: string;
    content: string;
    buttons: { accept: string; cancel: string };
  };
  storageProfileId: string;
  storageProfileType: string;
  setProfilesList: (profiles: Profile[]) => void;
  setDefaultProfile: (profile: Profile | null) => void;
  setProfilesMetaData: (meta: ProfileMetaData | null) => void;
  setIsLogoutProfile: (value: boolean) => void;
  setSelectedProfile: (profile: Profile | null) => void;
  setShowPinModal: (value: boolean) => void;
  setShowCreatePinModal: (value: boolean) => void;
  setShowPasswordModal: (value: boolean) => void;
  setShowPasswordModalLogin: (value: boolean) => void;
  setShowForgetPasswordModal: (value: boolean) => void;
  setShowConfirmKidToMasterModal: (value: boolean) => void;
  setPin: (value: string) => void;
  setPassword: (value: string) => void;
  checkDefaultProfile: () => void;
  createProfile: (params: ProfileCreate, cb?: () => void) => Promise<void>;
  switchProfile: (profile?: Profile) => Promise<void>;
  getUserInfo: () => Promise<void>;
  getListProfile: () => Promise<void>;
  checkPassword: (options?: {
    password?: string;
    version?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  loginProfile: (options?: {
    profile_id?: string;
    pin?: string;
  }) => Promise<{ success: boolean; data?: Profile; error?: string }>;
  checkProfilePin: (options?: {
    profile?: Profile;
    pin?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (options?: {
    params?: ProfileUpdate;
    profile_id?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  handleLoginSuccess: (options?: { profile?: Profile }) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { info } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [defaultProfile, setDefaultProfile] = useState<Profile | null>(null);
  const [profilesMetaData, setProfilesMetaData] =
    useState<ProfileMetaData | null>(null);
  const [isLogoutProfile, setIsLogoutProfile] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showCreatePinModal, setShowCreatePinModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showPasswordModalLogin, setShowPasswordModalLogin] =
    useState<boolean>(false);
  const [showForgetPasswordModal, setShowForgetPasswordModal] =
    useState<boolean>(false);
  const [showConfirmKidToMasterModal, setShowConfirmKidToMasterModal] =
    useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [modalContentKidToMaster, setModalContentKidToMaster] = useState<{
    title: string;
    content: string;
    buttons: { accept: string; cancel: string };
  }>({
    title: 'Chuyển đổi hồ sơ',
    content: '',
    buttons: { accept: 'Tiếp tục', cancel: 'Hủy bỏ' },
  });
  const [profileError, setProfileError] = useState<string>('');

  // Computed properties
  const storageProfileId = defaultProfile?.profile_id || '';
  const storageProfileType = defaultProfile?.profile_type || '';

  // Check default profile
  const checkDefaultProfile = useCallback(() => {
    setDefaultProfile(info?.profile || null);
  }, [info]);

  // Create profile
  const createProfile = useCallback(
    async (params: ProfileCreate, cb?: () => void) => {
      setProfileError('');
      try {
        setProfileLoading(true);
        const response = await doCreateNewProfile(params);
        const data = await response.data;
        if (data?.status === '1') {
          router.push('/tai-khoan/multi-profiles/watching');
          if (cb) cb();
        } else {
          setProfileError(data?.msg || DEFAULT_ERROR_MSG);
          showToast({
            title: ERROR_CONNECTION,
            desc: data?.msg || DEFAULT_ERROR_MSG,
          });
        }
      } catch (error) {
        const errMsg = checkError({ error });
        setProfileError(errMsg);
        showToast({
          title: ERROR_CONNECTION,
          desc: errMsg,
        });
      } finally {
        setProfileLoading(false);
      }
    },
    [router],
  );

  // Switch profile
  const switchProfile = useCallback(
    async (profile: Profile = {} as Profile) => {
      setProfileError('');
      try {
        localStorage.removeItem('page_home');
        setProfileLoading(true);
        const response = await SwitchPrfWithId(profile?.profile_id || '');
        const data = await response.data;
        if (data?.status === '1') {
          if (data?.data?.pin_type === PIN_TYPES.NO_PIN) {
            const loginResult = await loginProfile({
              profile_id: profile.profile_id,
            });
            if (loginResult?.success) {
              handleLoginSuccess({ profile: loginResult?.data || {} });
            } else {
              setProfileError(loginResult.error || DEFAULT_ERROR_MSG);
              showToast({ desc: loginResult.error || DEFAULT_ERROR_MSG });
            }
            setTimeout(() => setProfileLoading(false), 1000);
            return;
          }
          if (data?.data?.pin_type === PIN_TYPES.REQUIRED_PIN) {
            setShowPinModal(true);
            return;
          }
          if (data?.data?.pin_type === PIN_TYPES.CONFIRM_KID_TO_MASTER) {
            setModalContentKidToMaster((prev) => ({
              ...prev,
              content: data?.data?.msg_warning_switch || '',
            }));
            setShowConfirmKidToMasterModal(true);
            return;
          }
        } else {
          setProfileError(data?.message?.content || DEFAULT_ERROR_MSG);
          showToast({ desc: data?.message?.content || DEFAULT_ERROR_MSG });
        }
      } catch (error) {
        const errMsg = checkError({ error });
        setProfileError(errMsg);
        showToast({ desc: errMsg });
      } finally {
        setTimeout(() => setProfileLoading(false), 1000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  // Get user info
  const getUserInfo = useCallback(async () => {
    setProfileError('');
    try {
      const response = await getUserData();
      const data = await response?.data;
      if (data?.profile) {
        setDefaultProfile(data.profile || {});
        saveProfile({ profile: data.profile });
      }
    } catch (error) {
      setProfileError(checkError({ error }));
      removeProfile();
    }
  }, []);

  // Get list profile
  const getListProfile = useCallback(async () => {
    setProfileError('');
    try {
      setProfileLoading(true);
      const data = await fetchProfiles();
      if (data?.status === '1') {
        setProfilesList(data?.data?.profiles || []);
        setProfilesMetaData(data?.data?.meta_data || null);
      } else if(data?.status === '401') {
        setProfileError(DEFAULT_ERROR_MSG);
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      } else {
        setProfileError(data?.msg || DEFAULT_ERROR_MSG);
      }
    } catch (error) {
      const errMsg = checkError({ error });
      setProfileError(errMsg);
      console.log('error', error);
      
      if(error instanceof AxiosError && error.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
    } finally {
      setProfileLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check password
  const checkPassword = useCallback(
    async ({
      password = '',
      version,
    }: { password?: string; version?: number } = {}) => {
      setProfileError('');
      try {
        setProfileLoading(true);
        const data: CheckPasswordRequest = {
          params: {
            passcode: password,
            client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
            type: 'profile',
          },
        };
        if (version === 1) {
          data.query = { fid: '1' };
        }
        const response = await ValidateUser(data);
        const result = await response?.data;
        if (result?.data?.status_code === 1) {
          return { success: true };
        } else {
          setProfileError(result?.msg || DEFAULT_ERROR_MSG);
          return {
            success: false,
            error: result?.msg || DEFAULT_ERROR_MSG,
          };
        }
      } catch (error) {
        const errMsg = checkError({ error });
        setProfileError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setProfileLoading(false);
      }
    },
    [],
  );

  // Login profile
  const loginProfile = useCallback(
    async ({ profile_id = '', pin = '' } = {}) => {
      setProfileError('');
      try {
        setProfileLoading(true);
        const params: { profile_id?: string; pin?: string } = { profile_id };
        if (pin) params.pin = pin;
        const response = await SwitchProfile({ ...params });
        const data = await response.data;
        if (data?.status === '1' && data?.data) {
          saveProfile({ profile: data.data });
          return { success: true, data: data.data };
        } else {
          setProfileError(DEFAULT_ERROR_MSG);
          return { success: false, error: DEFAULT_ERROR_MSG };
        }
      } catch (error) {
        const errMsg = checkError({ error });
        setProfileError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setProfileLoading(false);
      }
    },
    [],
  );

  // Check profile pin
  const checkProfilePin = useCallback(
    async ({ profile = {} as Profile, pin = '' } = {}) => {
      setProfileError('');
      try {
        setProfileLoading(true);
        const response = await CheckPin({
          profile_id: profile?.profile_id,
          pin,
        });
        const data = await response.data;
        if (data?.status === '1') {
          return { success: true };
        } else {
          setProfileError(data?.message?.content || DEFAULT_ERROR_MSG);
          return {
            success: false,
            error: data?.message?.content || DEFAULT_ERROR_MSG,
          };
        }
      } catch (error) {
        const errMsg = checkError({ error });
        setProfileError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setProfileLoading(false);
      }
    },
    [],
  );

  // Update profile
  const updateProfile = useCallback(async ({ profile_id = '' } = {}) => {
    setProfileError('');
    try {
      setProfileLoading(true);
      const response = await UpdatePrf(profile_id);
      const data = await response.data;
      if (data?.status === '1') {
        sessionStorage.setItem(
          CHANGE_PIN_SUCCESS_MSG,
          data?.message?.content || 'Mã PIN được cập nhật thành công',
        );
        return { success: true };
      } else {
        setProfileError(data?.message?.content || DEFAULT_ERROR_MSG);
        return {
          success: false,
          error: data?.message?.content || DEFAULT_ERROR_MSG,
        };
      }
    } catch (error) {
      const errMsg = checkError({ error });
      setProfileError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Handle login success
  const handleLoginSuccess = useCallback(
    async ({ profile = {} as Profile } = {}) => {
      saveProfile({ profile });
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.reload()
    },
    [router],
  );

  // Refetch helpers
  const refetchProfiles = useCallback(async () => {
    await getListProfile();
  }, [getListProfile]);
  const refetchUserInfo = useCallback(async () => {
    await getUserInfo();
  }, [getUserInfo]);

  // Mounted hook
  useEffect(() => {
    checkDefaultProfile();
  }, [checkDefaultProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profilesList,
        defaultProfile,
        profilesMetaData,
        isLogoutProfile,
        selectedProfile,
        showPinModal,
        showCreatePinModal,
        showPasswordModal,
        showPasswordModalLogin,
        showForgetPasswordModal,
        showConfirmKidToMasterModal,
        pin,
        password,
        profileLoading,
        modalContentKidToMaster,
        storageProfileId,
        storageProfileType,
        profileError,
        setProfileError,
        setProfilesList,
        setDefaultProfile,
        setProfilesMetaData,
        setIsLogoutProfile,
        setSelectedProfile,
        setShowPinModal,
        setShowCreatePinModal,
        setShowPasswordModal,
        setShowPasswordModalLogin,
        setShowForgetPasswordModal,
        setShowConfirmKidToMasterModal,
        setPin,
        setPassword,
        setProfileLoading,
        checkDefaultProfile,
        createProfile,
        switchProfile,
        getUserInfo,
        getListProfile,
        checkPassword,
        loginProfile,
        checkProfilePin,
        updateProfile,
        handleLoginSuccess,
        refetchProfiles,
        refetchUserInfo,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};
