import { useEffect, useState } from 'react';
import { IResult, UAParser } from 'ua-parser-js';

export interface ViewportInfo {
  width?: number;
  height?: number;
  browser?: string;
  device?: string;
  os?: string;
  osVersion?: string;
  browserVersion?: string;
  browserMajor?: string;
}

export default function useUA() {
  const [ua, setUa] = useState<IResult | null>(null);

  const getViewportInfo = (): ViewportInfo => {
    if (typeof window === 'undefined') {
      return {};
    }
    const parser = new UAParser();
    const result = parser.getResult();
    return {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
      browser: result.browser.name || 'Unknown',
      device: result.device.type
        ? result.device.type.charAt(0).toUpperCase() +
          result.device.type.slice(1)
        : 'Desktop',
      os: result?.os?.name,
      osVersion: result?.os?.version,
      browserVersion: result?.browser?.version,
      browserMajor: result?.browser?.major,
    };
  };

  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(
    getViewportInfo(),
  );

  function handleResize() {
    setViewportInfo(getViewportInfo());
  }

  const getUAInfo = () => {
    if (typeof window === 'undefined') {
      return {};
    }
    const parser = new UAParser();
    const result = parser.getResult();
    setUa(result);
  };
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getUAInfo();
  }, []);
  return { ua, getUAInfo, getViewportInfo, viewportInfo };
}
