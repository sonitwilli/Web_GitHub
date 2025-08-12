import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type QualityMap = Record<number, string>;

interface MonitorQualityContextValue {
  qualityByIndex: QualityMap;
  requestQuality: (playerIndex: number, height: string) => void;
  clearAll: () => void;
}

const MonitorQualityContext = createContext<
  MonitorQualityContextValue | undefined
>(undefined);

export const MonitorQualityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [qualityByIndex, setQualityByIndex] = useState<QualityMap>({});

  const requestQuality = useCallback((playerIndex: number, height: string) => {
    setQualityByIndex((prev) => ({ ...prev, [playerIndex]: height }));
  }, []);

  const clearAll = useCallback(() => {
    setQualityByIndex({});
  }, []);

  const value = useMemo(
    () => ({ qualityByIndex, requestQuality, clearAll }),
    [qualityByIndex, requestQuality, clearAll],
  );

  return (
    <MonitorQualityContext.Provider value={value}>
      {children}
    </MonitorQualityContext.Provider>
  );
};

export function useMonitorQuality(): MonitorQualityContextValue {
  const ctx = useContext(MonitorQualityContext);
  if (!ctx) {
    throw new Error(
      'useMonitorQuality must be used within MonitorQualityProvider',
    );
  }
  return ctx;
}
