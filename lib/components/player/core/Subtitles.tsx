/* eslint-disable jsx-a11y/alt-text */

import useSubtitle from '@/lib/hooks/useSubtitle';
import SubtitleContent from './SubtitleContent';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { useContext, useEffect } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';

export interface SubtitleItemType {
  language?: string;
  shortLanguage?: string;
  id?: string | number;
  name?: string;
  codec?: string;
  default?: boolean;
  label?: string;
  autoselect?: boolean;
}

export default function Subtitles() {
  const { subs, open, setOpen, containerRef } = useSubtitle();
  const { width } = useScreenSize();
  const { setControlPopupType, isUserInactive } =
    useContext(PlayerWrapperContext);

  // Close menu when user becomes inactive
  useEffect(() => {
    if (isUserInactive && open) {
      setOpen(false);
    }
  }, [isUserInactive, open, setOpen]);

  const click = () => {
    if (width < 768) {
      if (setControlPopupType) {
        setControlPopupType('subtile');
      }
    } else {
      setOpen(!open);
    }
  };
  if (!subs?.length || subs.length < 2) {
    return;
  }
  return (
    <div
      ref={containerRef}
      className="c-control-button c-control-button-audio relative"
    >
      <div
        className={`c-control-button-icon min-w-[280px] pb-[16px] absolute left-1/2 bottom-[calc(100%_+_28px)] -translate-x-1/2 bg-eerie-black-09 rounded-[12px] ${
          open ? 'block' : 'hidden'
        }`}
      >
        <SubtitleContent onClick={() => setOpen(false)} />
      </div>
      <div onClick={click} className="c-control-button-icon">
        <img
          src="/images/player/subtitles.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      {width >= 768 && (
        <div className={`c-control-hover-text ${open ? 'hidden' : 'block'}`}>
          Phụ đề
        </div>
      )}
    </div>
  );
}
