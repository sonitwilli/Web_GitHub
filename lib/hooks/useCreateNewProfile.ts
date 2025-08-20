import { useState, useCallback } from 'react';
import {
  doCreateNewProfile,
  ProfileData,
  ApiResponse,
} from '@/lib/api/multi-profiles'; // Adjust path based on your file structure
import { showToast } from '@/lib/utils/globalToast';
import { useRouter } from 'next/router';
import { trackingRegisteredProfileLog102 } from '../tracking/trackingProfile';
import { PROFILE_TYPES } from '../constant/texts';

interface UseCreateNewProfileProps {
  setLoadingCreate?: (value: boolean) => void;
}

export const useCreateNewProfile = ({
  setLoadingCreate,
}: UseCreateNewProfileProps) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter()

  const createNewProfile = useCallback(
    async (params: {
      name: string;
      avatar_id: string;
      avatar_url: string;
      // display_name: string;
      profile_type: string;
      pin?: string;
    }) => {
      setIsLoading(true);
      setLoadingCreate?.(true);
      setError(null);
      try {
        const response = await doCreateNewProfile(params);
        const data: ApiResponse = response.data;
        if (data.status === '1') {
          setProfileData(data.data as ProfileData);
          showToast({
            title: data?.message?.title,
            desc: data?.message?.content || '',
          });
          trackingRegisteredProfileLog102({
            ItemId: params.profile_type === PROFILE_TYPES.KID_PROFILE ? 'Kid' : 'Normal',
            ItemName: params.name,
          });
          router.push('/tai-khoan?tab=ho-so');
        } else {
          throw new Error(
            data.msg || 'Service error: Failed to create profile',
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to create profile'),
        );
      } finally {
        setIsLoading(false);
        setLoadingCreate?.(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setLoadingCreate],
  );

  return { profileData, createNewProfile, isLoading, error };
};
