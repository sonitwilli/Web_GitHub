/* eslint-disable jsx-a11y/alt-text */
import { useContext } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';

export default function ScheduleButton() {
  const { setShowBroadcastSchedule } = useContext(PlayerWrapperContext);
  const click = () => {
    if (setShowBroadcastSchedule) setShowBroadcastSchedule(true);
  };
  return (
    <div className="c-control-button c-control-button-schedule">
      <div onClick={click} className="c-control-button-icon">
        <img
          src="/images/player/schedule.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      <div className="c-control-hover-text">Lịch phát sóng</div>
    </div>
  );
}
