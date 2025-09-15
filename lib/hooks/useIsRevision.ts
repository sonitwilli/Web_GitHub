import { useEffect, useState } from 'react';
import { REVISION } from '@/lib/constant/texts';

export const useIsRevision = (): boolean => {
  const [isRevision, setIsRevision] = useState(false);

  useEffect(() => {
    const revision = localStorage.getItem(REVISION);

    if (revision) {
      setIsRevision(true);
    } else {
      setIsRevision(false);
    }
  }, []);

  return isRevision;
};
