import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useContext } from 'react';
import ShareReaction from '../reaction/ShareReaction';
import dynamic from 'next/dynamic';
import useModalToggle from '@/lib/hooks/useModalToggle';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
const ModalShare = dynamic(() => import('@/lib/components/modal/ModalShare'), {
  ssr: false,
});
export default function ChannelInfo() {
  const { showModalShare, setShowModalShare } = useModalToggle({});
  const ctx = useContext(ChannelPageContext);
  const { selectedTimeShift } = ctx;
  const { dataChannel } = usePlayerPageContext();
  return (
    <div>
      {selectedTimeShift?.title && (
        <div className="mb-[24px] max-w-full line-clamp-2 font-[600] text-[32px] leading-[130%] tracking-[0.64px] text-white-smoke">
          {selectedTimeShift?.title}
        </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-[16px]">
        <div className="flex items-center gap-[8px]">
          <div className="bg-white-smoke rounded-full w-[40px] h-[40px] tablet:w-[48px] tablet:h-[48px] flex items-center justify-center px-[7px]">
            <img
              src={dataChannel?.original_logo}
              alt={dataChannel?.alias_name}
            />
          </div>

          <h3 className="font-[600] text-[18px] xl:text-[20px] leading-[130%] tracking-[0.4px] text-white-smoke">
            {dataChannel?.alias_name}
          </h3>
        </div>

        <ShareReaction isChannel onClick={() => setShowModalShare(true)} />

        {/* Modal share */}
        {showModalShare && (
          <ModalShare
            open={showModalShare}
            onClose={() => setShowModalShare(false)}
            isChannel
            dataChannel={dataChannel}
          />
        )}
      </div>
    </div>
  );
}
