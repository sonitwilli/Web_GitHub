/* eslint-disable jsx-a11y/alt-text */

import { useMemo } from 'react';
import { PAUSE_PLAYER_MANUAL, VIDEO_ID } from '@/lib/constant/texts';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { saveSessionStorage } from '@/lib/utils/storage';

export default function PlayPause() {
  const { isVideoPaused, setIsPauseClick } = usePlayerPageContext();
  const text = useMemo(() => {
    if (isVideoPaused) {
      return 'Tiếp tục phát';
    } else {
      return 'Tạm dừng';
    }
  }, [isVideoPaused]);

  const click = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        if (setIsPauseClick) {
          setIsPauseClick(new Date().getTime());
        }
        if (isVideoPaused) {
          video.play();
        } else {
          video.pause();
          saveSessionStorage({
            data: [
              {
                key: PAUSE_PLAYER_MANUAL,
                value: 'true',
              },
            ],
          });
        }
      }
    } catch {}
  };
  return (
    <div
      className="c-control-button c-control-button-playpause"
      onClick={click}
    >
      <img
        src="/images/player/play_arrow.png"
        className={`c-control-button-icon w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px] ${
          isVideoPaused ? '' : 'hidden'
        }`}
      />
      <img
        src="/images/player/pause.png"
        className={`c-control-button-icon w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px] ${
          isVideoPaused ? 'hidden' : ''
        }`}
      />

      <div className="c-control-hover-text">{text}</div>
    </div>
  );
}
