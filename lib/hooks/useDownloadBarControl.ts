import { useCallback, useState, useEffect } from 'react';

// Global state for download bar visibility
let globalIsHidden = false;
const listeners = new Set<(isHidden: boolean) => void>();

const notifyListeners = (isHidden: boolean) => {
  listeners.forEach(listener => listener(isHidden));
};

// Export global functions that can be used anywhere
export const hideDownloadBarGlobally = () => {
  globalIsHidden = true;
  notifyListeners(true);
};

export const showDownloadBarGlobally = () => {
  globalIsHidden = false;
  notifyListeners(false);
};

export const useDownloadBarControl = () => {
  const [isHidden, setIsHidden] = useState(globalIsHidden);

  useEffect(() => {
    // Subscribe to global state changes
    const listener = (newIsHidden: boolean) => {
      setIsHidden(newIsHidden);
    };
    listeners.add(listener);

    // Cleanup
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const hideBar = useCallback(() => {
    hideDownloadBarGlobally();
  }, []);

  const showBar = useCallback(() => {
    showDownloadBarGlobally();
  }, []);

  return {
    isHidden,
    hideBar,
    showBar,
  };
};