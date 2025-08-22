import React, { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

type ViewportInfo = {
  width?: number;
  height?: number;
  browser?: string;
  device?: string;
  os?: string;
};

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
      ? result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)
      : 'Desktop',
    os: result?.os?.name,
  };
};

const Viewport: React.FC = () => {
  const [info, setInfo] = useState<ViewportInfo>(getViewportInfo());
  useEffect(() => {
    function handleResize() {
      setInfo(getViewportInfo());
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed bottom-[2px] right-[2px] bg-black/70 text-white p-[2px] rounded-lg text-[12px] z-[9999] font-mono pointer-events-none select-none shadow-lg">
      <div>O: {info.os}</div>
      <div>W: {info.width}px</div>
      <div>H: {info.height}px</div>
      <div>B: {info.browser}</div>
      <div>D: {info.device}</div>
    </div>
  );
};

export default Viewport;
