import { useState, useCallback } from 'react';
import { doFetchRecommendedProfile } from '@/lib/api/multi-profiles'
import { ApiResponse } from '@/lib/api/multi-profiles';
import { Profile } from '@/lib/api/user';

interface UseFetchRecommendedProfileProps {
  setIsError?: (value: boolean) => void;
}

export const useFetchRecommendedProfile = ({setIsError }: UseFetchRecommendedProfileProps) => {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendedProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsError?.(false);
    try {
      const response = await doFetchRecommendedProfile();
      const data: ApiResponse = response.data;
      if (data.status === '1') {
        setProfileData(data?.data || null);
      } else {
        setProfileData(null);
        setIsError?.(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recommended profile'));
      setIsError?.(true);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profileData, fetchRecommendedProfile, isLoading, error };
};