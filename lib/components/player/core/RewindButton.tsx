import { PLAYER_NAME, PLAYER_NAME_TYPE } from '@/lib/constant/texts';
import { saveSeekEvent } from '@/lib/utils/seekTracking';

interface Props {
  playerName?: PLAYER_NAME_TYPE;
}
export default function Rewind({ playerName }: Props) {
  const onClick = () => {
    try {
      if (playerName === PLAYER_NAME.SHAKA) {
        const video = document.getElementById('vid') as HTMLVideoElement;
        if (video) {
          video.currentTime = Math.max(video.currentTime - 10, 0);

          // Track seek event
          saveSeekEvent({
            timestamp: Date.now(),
            direction: 'backward',
            method: 'button',
          });
        }
      }
    } catch {}
  };
  return (
    <div
      id="rewind_button"
      className="w-full h-full flex items-center justify-center text-[28px] gap-[24px]"
    >
      <div className="hover:cursor-pointer" onClick={onClick}>
        <img
          src="/images/replay_10.png"
          alt="replay"
          className="w-[28px] h-[28px]"
        />
      </div>
    </div>
  );
}
