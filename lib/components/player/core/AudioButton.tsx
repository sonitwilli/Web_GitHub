/* eslint-disable jsx-a11y/alt-text */

import useAudio from '@/lib/hooks/useAudio';
import AudioContent from './AudioContent';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { useContext, useEffect } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';

export interface AudioItemType {
  language?: string;
  shortLanguage?: string;
  id?: string | number;
  name?: string;
  codec?: string;
  default?: boolean;
  label?: string;
  groupId?: string;
  X_URI?: string;
  X_CODEC?: string;
  X_LANGUAGE?: string;
  X_SHORT_LANGUAGE?: string;
  X_LABEL?: string;
  X_NAME?: string;
  X_CHANNEL?: string;
  X_AUTOSELECT?: string;
  X_DEFAULT?: string;
  X_GROUP_ID?: string;
  X_SAMPLE_RATE?: string;
  X_ID?: string;
  X_BITRATE?: string;
}

export default function AudioButton() {
  const { setControlPopupType, isUserInactive } =
    useContext(PlayerWrapperContext);

  const { open, setOpen, containerRef, filterdAudios } = useAudio();
  const { width } = useScreenSize();

  // Close menu when user becomes inactive
  useEffect(() => {
    if (isUserInactive && open) {
      setOpen(false);
    }
  }, [isUserInactive, open, setOpen]);
  const click = () => {
    if (width < 768) {
      if (setControlPopupType) {
        setControlPopupType('audio');
      }
    } else {
      setOpen(!open);
    }
  };

  if (!filterdAudios?.length || filterdAudios?.length < 2) {
    return;
  }
  return (
    <div
      ref={containerRef}
      className="c-control-button c-control-button-audio relative"
    >
      <div
        className={`min-w-[280px] pb-[16px] absolute left-1/2 bottom-[calc(100%_+_28px)] -translate-x-1/2 bg-eerie-black-09 rounded-[12px] ${
          open ? 'block' : 'hidden'
        }`}
      >
        <AudioContent onClick={() => setOpen(false)} />
      </div>
      <div onClick={click} className="c-control-button-icon">
        <img
          src="/images/player/graphic_eq.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      <div className={`c-control-hover-text ${open ? 'hidden' : 'block'}`}>
        Âm thanh
      </div>
    </div>
  );
}
