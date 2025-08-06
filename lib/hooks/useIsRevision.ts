import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const useIsRevision = (): boolean => {
  const searchParams = useSearchParams();
  const [isRevision, setIsRevision] = useState(false);

  useEffect(() => {
    const revision = localStorage.getItem('revision');
    const type = searchParams.get('type');

    if (revision && type === 'test_event_before') {
      setIsRevision(true);
    } else {
      setIsRevision(false);
    }
  }, [searchParams]);

  return isRevision;
};
