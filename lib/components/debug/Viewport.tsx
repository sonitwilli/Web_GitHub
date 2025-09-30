import useUA from '@/lib/hooks/useUA';
import { userAgentInfo } from '@/lib/utils/ua';
import React, { useEffect, useState } from 'react';

const Viewport: React.FC = () => {
  const { viewportInfo } = useUA();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [device, setDevice] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const d = userAgentInfo();
      setDevice(d);
    }
  }, []);
  return (
    <div className="Viewport fixed bottom-[100px] left-[16px] bg-black/70 text-white p-[2px] rounded-lg text-[12px] z-[9999] font-mono pointer-events-none select-none shadow-lg">
      <div>
        O: {viewportInfo.os}-{viewportInfo.osVersion}
      </div>
      <div>
        B: {viewportInfo.browser}-{viewportInfo.browserMajor}
      </div>
      <div>D: {viewportInfo.device}</div>
      <div>Model: {device.device?.model}</div>
      <div>Platform: {navigator?.platform}</div>
      <div>UA: {navigator?.userAgent}</div>
      <div>Ipad: {String(device?.isFromIpad)}</div>
    </div>
  );
};

export default Viewport;
