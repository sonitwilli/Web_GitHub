import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store';
import { changeTabActive } from '../store/slices/appSlice';

export default function useTabActivity() {
  const [isTabActive, setIsTabActive] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true,
  );
  const dispatch = useAppDispatch();
  const handleVisibilityChange = () => {
    setIsTabActive(!document.hidden);
  };

  const handleFocus = () => {
    setIsTabActive(true);
  };

  const handleBlur = () => {
    setIsTabActive(false);
  };
  useEffect(() => {
    // Check if APIs are available (SSR safety)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    dispatch(changeTabActive(isTabActive));
  }, [isTabActive, dispatch]);

  return { isTabActive };
}
