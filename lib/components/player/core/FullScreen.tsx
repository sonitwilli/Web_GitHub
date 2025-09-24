/* eslint-disable jsx-a11y/alt-text */

import { RootState } from '@/lib/store';
import { useMemo } from 'react';
import usePlayer from '@/lib/hooks/usePlayer';
import { useSelector } from 'react-redux';

export default function FullScreen() {
  const isFullscreen = useSelector(
    (state: RootState) => state.player.isFullscreen,
  );
  const { clickFullScreen } = usePlayer();

  const text = useMemo(() => {
    if (isFullscreen) {
      return 'Thoát toàn màn hình';
    } else {
      return 'Toàn màn hình';
    }
  }, [isFullscreen]);
  return (
    <div className="c-control-button c-control-button-fullscreen">
      {isFullscreen ? (
        <img
          src="/images/player/fullscreen_exit.png"
          className="c-control-button-icon w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
          onClick={clickFullScreen}
        />
      ) : (
        <img
          src="/images/player/fullscreen.png"
          className="c-control-button-icon w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
          onClick={clickFullScreen}
        />
      )}
      <div className="c-control-hover-text">{text}</div>
    </div>
  );
}
