import { useState, useCallback } from 'react';
import { getProfilesAvatarList, AvatarGroup } from '@/lib/api/multi-profiles';

interface UseProfileAvatarsProps {
  setIsEmpty?: (value: boolean) => void;
  setIsError?: (value: boolean) => void;
}

export const useProfileAvatars = ({ setIsEmpty, setIsError }: UseProfileAvatarsProps = {}) => {
  const [avatars, setAvatars] = useState<AvatarGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvatars = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsError?.(false);

    try {
      const result = await getProfilesAvatarList();

      if (result.success) {
        setIsEmpty?.(avatars.length === 0);
        setAvatars(result?.data || []);
      } else {
        setAvatars([]);
        setIsEmpty?.(true);
        setIsError?.(true);
        setError(new Error(result.error || 'Failed to fetch avatars'));
      }
    } catch (err) {
      setAvatars([]);
      setError(err instanceof Error ? err : new Error('Failed to fetch avatars'));
      setIsEmpty?.(true);
      setIsError?.(true);
    } finally {
      setIsLoading(false);
    }
  }, [setIsEmpty, setIsError, avatars.length]);

  return { avatars, fetchAvatars, isLoading, error };
};