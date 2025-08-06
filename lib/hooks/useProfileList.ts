import { useState, useCallback } from 'react';
import { getProfileList,  } from '@/lib/api/multi-profiles'; // Adjust path to where getProfileList is located
import { Profile } from '@/lib/api/user'

interface UseProfileListProps {
  setIsEmpty?: (value: boolean) => void;
  setIsError?: (value: boolean) => void;
}

export const useProfileList = ({ setIsEmpty, setIsError }: UseProfileListProps = {}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsError?.(false);

    try {
      const result = await getProfileList();

      if (result.status === '1') {
        setIsEmpty?.(result?.data?.profiles.length === 0);
        setProfiles(result?.data?.profiles || []);
      } else {
        setProfiles([]);
        setIsEmpty?.(true);
        setIsError?.(true);
        setError(new Error('Failed to fetch profiles'));
      }
    } catch (err) {
      setProfiles([]);
      setError(err instanceof Error ? err : new Error('Failed to fetch profiles'));
      setIsEmpty?.(true);
      setIsError?.(true);
    } finally {
      setIsLoading(false);
    }
  }, [setIsEmpty, setIsError]);

  return { profiles, fetchProfiles, isLoading, error };
};