/* eslint-disable jsx-a11y/alt-text */

import { VIDEO_ID } from '@/lib/constant/texts';
import { ControlPopupType } from './MobilePopup';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { playerButtonProps } from '../common/playerButtonProps';

interface Props {
  type?: ControlPopupType;
}

export default function RewindForward({ type }: Props) {
  const { isVideoPaused, isEndVideo, videoCurrentTime, videoDuration } =
    usePlayerPageContext();
  const rewind = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        video.currentTime = Math.max(video.currentTime - 10, 0);
      }
    } catch {}
  };
  const forward = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        video.currentTime = Math.max(video.currentTime + 10, 0);
      }
    } catch {}
  };

  const play = () => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      if (video.paused) {
        video
          .play()
          .then(() => {})
          .catch(() => {});
      } else {
        video.pause();
      }
    }
  };
  return (
    <>
      <div
        className="c-control-button c-control-button-rewind"
        onClick={rewind}
        {...playerButtonProps}
      >
        <img
          src="/images/player/replay_10.png"
          className={`c-control-button-icon ${
            type === 'fullcreen' ? 'w-[40px] h-[40px]' : 'w-[32px] h-[32px]'
          }`}
          width={type === 'fullcreen' ? 40 : 32}
          height={type === 'fullcreen' ? 40 : 32}
          alt="rewind"
        />
        <div className="c-control-hover-text">Tua lui 10s</div>
      </div>

      {type === 'fullcreen' && (
        <>
          {isEndVideo &&
            typeof videoCurrentTime === 'number' &&
            typeof videoDuration === 'number' &&
            videoCurrentTime >= videoDuration ? (
              <img
                src="/images/player/replay.png"
                className="w-[40px] h-[40px]"
                alt="play-pause"
                width={40}
                height={40}
                onClick={play}
                {...playerButtonProps}
              />
            ) : (
              <img
                src={isVideoPaused ? '/images/player/play_arrow.png' : '/images/player/pause.png'}
                alt="play-pause"
                width={40}
                height={40}
                className="w-[40px] h-[40px]"
                onClick={play}
                {...playerButtonProps}
              />
            )}
        </>
      )}

      <div
        className="c-control-button c-control-button-forward"
        onClick={forward}
        {...playerButtonProps}
      >
        <img
          src="/images/player/forward_10.png"
          className={`c-control-button-icon ${
            type === 'fullcreen' ? 'w-[40px] h-[40px]' : 'w-[32px] h-[32px]'
          }`}
          width={type === 'fullcreen' ? 40 : 32}
          height={type === 'fullcreen' ? 40 : 32}
          alt="forward"
        />
        <div className="c-control-hover-text">Tua tới 10s</div>
      </div>
    </>
  );
}