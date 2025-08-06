import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useContext } from 'react';
import { usePlayerPageContext } from '../context/PlayerPageContext';

export default function PlayerTopMask() {
  const pageCtx = useContext(ChannelPageContext);
  const { selectedTimeShift } = pageCtx;
  const { dataChannel } = usePlayerPageContext();
  return (
    <div
      id="player_top_mask"
      className="player_mask top_mask opacity-0 ease-out duration-500 bg-linear-to-b from-[rgba(13,13,12,0.6)] to-[rgba(13,13,12,0.001)] h-[136px] w-full absolute top-0 left-0 z-[1]"
    >
      {(selectedTimeShift?.title || dataChannel?.name) && (
        <div
          id="player_title"
          className="mt-[49px] mx-[32px] font-[500] leading-[150%] text-[28px] text-white max-w-1/2 line-clamp-1"
        >
          {selectedTimeShift?.title || dataChannel?.name}
        </div>
      )}
    </div>
  );
}
