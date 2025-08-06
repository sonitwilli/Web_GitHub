/* eslint-disable jsx-a11y/alt-text */

import useResolution from '@/lib/hooks/useResolution';
import ResolutionContent from './ResolutionContent';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { useContext, useEffect } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';
import { usePlayerPageContext } from '../context/PlayerPageContext';
export interface ResolutionItemType {
  language?: string;
  id?: string | number;
  name?: string;
  codec?: string;
  default?: boolean;
  audioCodec?: string;
  videoCodec?: string;
  codecSet?: string;
  height?: number | string;
  width?: number;
  bitrate?: number;
  type?: 'hls' | 'dash';
  fps?: number;
}

export default function Resolution() {
  const { setControlPopupType, isUserInactive } =
    useContext(PlayerWrapperContext);
  const { containerRef, open, setOpen } = useResolution();
  const { width } = useScreenSize();
  const { previewHandled } = usePlayerPageContext();

  // Close menu when user becomes inactive
  useEffect(() => {
    if (isUserInactive && open) {
      setOpen(false);
    }
  }, [isUserInactive, open, setOpen]);
  const click = () => {
    if (width < 768) {
      if (setControlPopupType) {
        setControlPopupType('resolution');
      }
    } else {
      setOpen(!open);
    }
  };

  if (previewHandled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="c-control-button c-control-button-resolution relative"
    >
      <div
        className={`w-[280px] pb-[16px] absolute right-0 bottom-[calc(100%_+_24px)] translate-x-[55px] bg-eerie-black-09 rounded-[12px] ${
          open ? 'block' : 'hidden'
        }`}
      >
        <ResolutionContent onClick={() => setOpen(false)} />
      </div>
      <div onClick={click} className="c-control-button-icon">
        <img
          src="/images/player/resolution.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      {width >= 768 && (
        <div className={`c-control-hover-text ${open ? 'hidden' : ''}`}>
          Chất lượng
        </div>
      )}
    </div>
  );
}
