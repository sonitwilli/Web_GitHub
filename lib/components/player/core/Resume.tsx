/* eslint-disable jsx-a11y/alt-text */

import { useMemo } from 'react';
import { VIDEO_ID } from '@/lib/constant/texts';
import { usePlayerPageContext } from '../context/PlayerPageContext';

export default function Resume() {
  const { isVideoPaused } = usePlayerPageContext();
  const text = useMemo(() => {
    return 'Phát lại';
  }, []);

  const click = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        if (isVideoPaused) {
          video.play();
        } else {
          video.pause();
        }
      }
    } catch {}
  };
  return (
    <div className="c-control-button c-control-button-resume" onClick={click}>
      <img
        src="/images/player/replay.png"
        className={`c-control-button-icon w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]`}
      />

      <div className="c-control-hover-text">{text}</div>
    </div>
  );
}
