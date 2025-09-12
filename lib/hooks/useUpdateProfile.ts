import { useState, useCallback } from 'react';
import { updateProfile, ApiResponse } from '@/lib/api/multi-profiles'; // Adjust path based on your fileGeekyCoder file structure
import { Profile } from '@/lib/api/user';
import { AxiosResponse } from 'axios';
import { trackingModifyProfileLog103 } from '../tracking/trackingProfile';
import { ERROR_CONNECTION, PROFILE_TYPES } from '../constant/texts';
import { checkError } from '../utils/profile';
import { showToast } from '../utils/globalToast';

interface UseUpdateProfileProps {
  setLoadingUpdate?: (value: boolean) => void;
  onUpdateSuccess?: () => void;
}

export const useUpdateProfile = ({
  setLoadingUpdate,
  onUpdateSuccess,
}: UseUpdateProfileProps = {}) => {
  const [profileData, setProfileData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfileAction = useCallback(
    async (
      params: {
        name?: string;
        avatar_id?: string;
        avatar_url?: string;
        profile_type?: string;
        pin?: string;
      },
      selectedProfile: Profile | null,
    ) => {
      setIsLoading(true);
      setLoadingUpdate?.(true);
      setError(null);
      try {
        const response: AxiosResponse<ApiResponse> = await updateProfile(
          params,
          selectedProfile,
        );
        const data: ApiResponse = response.data;
        setProfileData(data);
        if (data.status === '1') {
          trackingModifyProfileLog103({
            Screen: 'ModifiedProfile',
            Event: 'ModifiedProfile',
            ItemId: selectedProfile?.profile_id || '',
            ItemName: selectedProfile?.name || '',
            Status: selectedProfile?.profile_type === PROFILE_TYPES.KID_PROFILE ? 'Kid' : 'Normal',
          });
          localStorage.setItem('userSelected', JSON.stringify(data?.data));
          onUpdateSuccess?.();
        } else {
          // setError(data?.message?.content || null);
          throw new Error(data?.message?.content as unknown as string);
        }
      } catch (err) {
        console.log(err);
        setError(null);
        showToast({
          title: ERROR_CONNECTION,
          desc: checkError({ error: err }),
        });
      } finally {
        setIsLoading(false);
        setLoadingUpdate?.(false);
      }
    },
    [setLoadingUpdate, onUpdateSuccess],
  );

  return { profileData, updateProfileAction, isLoading, error };
};
