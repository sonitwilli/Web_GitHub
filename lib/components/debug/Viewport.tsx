import useUA from '@/lib/hooks/useUA';
import React from 'react';

const Viewport: React.FC = () => {
  const { viewportInfo } = useUA();
  return (
    <div className="Viewport fixed bottom-[2px] right-[2px] bg-black/70 text-white p-[2px] rounded-lg text-[12px] z-[9999] font-mono pointer-events-none select-none shadow-lg">
      <div>
        O: {viewportInfo.os}-{viewportInfo.osVersion}
      </div>
      <div>
        B: {viewportInfo.browser}-{viewportInfo.browserMajor}
      </div>
      <div>W: {viewportInfo.width}px</div>
      <div>H: {viewportInfo.height}px</div>
      <div>D: {viewportInfo.device}</div>
    </div>
  );
};

export default Viewport;
