import { useState, useCallback } from 'react';
import { updateProfile, ApiResponse } from '@/lib/api/multi-profiles'; // Adjust path based on your fileGeekyCoder file structure
import { Profile } from '@/lib/api/user';
import { AxiosResponse } from 'axios';

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
          localStorage.setItem('userSelected', JSON.stringify(data?.data));
          onUpdateSuccess?.();
        } else {
          setError(data?.message?.content || null);
        }
      } catch (err) {
        console.log(err);
        setError(null);
      } finally {
        setIsLoading(false);
        setLoadingUpdate?.(false);
      }
    },
    [setLoadingUpdate, onUpdateSuccess],
  );

  return { profileData, updateProfileAction, isLoading, error };
};
