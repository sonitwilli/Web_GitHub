import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import ProfileList from '@/lib/components/multi-profile/ProfileList';
import ProfileForm from '@/lib/components/multi-profile/ProfileForm';
import {
  PROFILE_TYPES,
  PIN_TYPES,
  DEFAULT_ERROR_MSG,
  TYPE_PR,
  INFORM,
} from '@/lib/constant/texts'; // Adjust path
import { useProfileList } from '@/lib/hooks/useProfileList'; // Adjust path to your hook
import { useUpdateProfile } from '@/lib/hooks/useUpdateProfile'; // Adjust path to your hook
import { Profile, getUserInfo } from '@/lib/api/user';
import { showToast } from '@/lib/utils/globalToast';

const ProfileWrapper: React.FC = () => {
  const router = useRouter();
  const { profiles, fetchProfiles } = useProfileList();
  const [tab, setTab] = useState<'list' | 'add' | 'edit'>('add');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  // Use the updateProfile hook
  const { updateProfileAction, isLoading: updateLoading, error: errorUpdate } = useUpdateProfile({
    setLoadingUpdate: setLoading,
    onUpdateSuccess: () => {
      if (user) {
        router.push('/tai-khoan?tab=ho-so&child=quan-ly-va-tuy-chon');
      } else {
        router.push('/tai-khoan?tab=ho-so');
      }
    },
  });

  // Mock ProfileMixin logic for storageProfileId
  const storageProfileId = useMemo(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('profile_id')
      : null;
  }, []);

  useEffect(() => {
    const fetchProfileList = async () => {
      await fetchProfiles();
    };
    fetchProfileList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed property: userMapIndex
  const userMapIndex = useMemo(() => {
    return profiles.filter(
      (item: Profile) => item?.profile_id === user?.profile_id
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  // On mount: handle query and user setup
  useEffect(() => {
    const setup = async () => {
      if (router.query['is-setting'] && typeof localStorage !== 'undefined') {
        const storedUser = localStorage.getItem('userSelected');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setUser(parsedUser);
        if (parsedUser && userMapIndex?.length > 0) {
          setSelectedProfile(userMapIndex[0] || null);
        }
      }
    };
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, userMapIndex]);

  useEffect(() => {
    if (window?.location?.search) {
      setTab('edit');
    } else {
      localStorage.removeItem('userSelected');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (tab === 'edit') {
      const storedUser = localStorage.getItem('userSelected');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
      if (parsedUser && userMapIndex?.length > 0) {
        setSelectedProfile(userMapIndex[0] || null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Handlers
  const handleCancelBtn = () => {
    if (user) {
      router.push('/tai-khoan?tab=ho-so&child=quan-ly-va-tuy-chon');
    } else {
      router.push('/tai-khoan?tab=ho-so');
    }
  };

  const confirmProfileList = () => {
    router.push('/tai-khoan/multi-profiles/watching');
  };

  const removePin = (data: {
    avarta?: { avatar_url?: string };
    name?: string;
  }) => {
    setSelectedProfile({
      ...selectedProfile,
      avatar_url: data?.avarta?.avatar_url,
      name: data?.name,
      pin_type: PIN_TYPES.NO_PIN,
      pin: '',
    });
    // Note: Refs like profileFormEdit are not directly replicable in React.
    // Consider passing state or callbacks to ProfileForm to manage pin and isRemovePin.
  };

  const clickProfile = async (profile: Profile) => {
    try {
      setLoading(true);
      setSelectedProfile(profile);
      if (profile.profile_id === storageProfileId) {
        setTab('edit');
        return;
      }
      if (localStorage.getItem(TYPE_PR) === PROFILE_TYPES.MASTER_PROFILE) {
        const response = await getUserInfo();
        const dataUserRes = await response;
        if (response) {
          await fetchProfiles();
          setSelectedProfile(profile);
        } else {
          showToast({
            title: INFORM,
            desc: dataUserRes?.data?.msg || DEFAULT_ERROR_MSG,
          });
          return;
        }
      }
    } catch {
      // Handle error silently as in original
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {tab === 'list' && !user && (
        <ProfileList
          heading="Chỉnh sửa hồ sơ" // Adjust if profilesMetaData.title_update is dynamic
          clickAdd={() => setTab('add')}
          confirm={confirmProfileList}
          clickProfile={(profile: Profile) => clickProfile(profile || {})}
        />
      )}

      {(tab === 'edit' || user) && (
        <ProfileForm
          errorUpdate={errorUpdate}
          title="Chỉnh sửa hồ sơ"
          profile={selectedProfile || {}}
          loading={loading || updateLoading}
          onRemovePin={removePin}
          onCancel={handleCancelBtn}
          onConfirm={(params) => updateProfileAction(params, selectedProfile)}
        />
      )}

      {tab === 'add' && !user && (
        <ProfileForm
          title="Tạo hồ sơ"
          onCancel={() => router.push('/tai-khoan?tab=ho-so')}
        />
      )}
    </div>
  );
};

export default ProfileWrapper;
