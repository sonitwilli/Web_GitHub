import { PAUSE_PLAYER_MANUAL, VIDEO_ID } from '@/lib/constant/texts';
import { ControlPopupType } from './MobilePopup';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { playerButtonProps } from '../common/playerButtonProps';
import { saveSeekEvent } from '@/lib/utils/seekTracking';
import { saveSessionStorage } from '@/lib/utils/storage';

interface Props {
  type?: ControlPopupType;
}

export default function RewindForward({ type }: Props) {
  const {
    isVideoPaused,
    isEndVideo,
    videoCurrentTime,
    videoDuration,
    streamType,
  } = usePlayerPageContext();
  const rewind = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        video.currentTime = Math.max(video.currentTime - 10, 0);
        // if (video.paused) {
        //   video.play().catch(() => {});
        // }
        // Track seek event
        saveSeekEvent({
          timestamp: Date.now(),
          direction: 'backward',
          method: 'button',
        });
      }
    } catch {}
  };
  const forward = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        const currentTime = video.currentTime;
        const duration = video.duration || 0;
        const newTime = Math.min(currentTime + 10, duration);

        // For timeshift: prevent seeking forward if already at or near the end
        if (streamType === 'timeshift') {
          const timeThreshold = 2; // 2 seconds threshold near end
          if (currentTime >= duration - timeThreshold) {
            // Don't seek if we're already near the end of timeshift
            return;
          }
        }

        video.currentTime = newTime;
        // if (video.paused) {
        //   video.play().catch(() => {});
        // }
        // Track seek event
        saveSeekEvent({
          timestamp: Date.now(),
          direction: 'forward',
          method: 'button',
        });
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
              src={
                isVideoPaused
                  ? '/images/player/play_arrow.png'
                  : '/images/player/pause.png'
              }
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
