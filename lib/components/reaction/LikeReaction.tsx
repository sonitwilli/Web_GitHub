import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Image from 'next/image';
import { CiHeart } from 'react-icons/ci';
import { ActionType } from '../vod/VodActionButtons';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useMemo } from 'react';
import { IoNotifications } from 'react-icons/io5';
import { BiSolidBellOff } from 'react-icons/bi';

export interface Props {
  isActive?: boolean;
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  onClick?: () => void;
  isChannel?: boolean;
  type?: ActionType;
}

const TEXT = {
  follow: 'Bỏ theo dõi',
  unFollow: 'Theo dõi',
  order: 'Đặt lịch',
  unOrder: 'Hủy đặt lịch',
};

export default function LikeReaction({
  isActive,
  onClick,
  isChannel,
  type,
}: Props) {
  const { dataChannel } = usePlayerPageContext();
  const isCommingSoon = useMemo(
    () => dataChannel?.is_coming_soon === '1',
    [dataChannel],
  );

  const renderActiveIcon = () => {
    if (isCommingSoon) {
      return <IoNotifications className="text-[24px]" />;
    }
    return (
      <Image src="/images/heart-fill.png" alt="like" width={24} height={24} />
    );
  };

  const renderIcon = () => {
    if (isCommingSoon) {
      return (
        <BiSolidBellOff
          style={{ transform: 'scaleX(-1)' }}
          className="text-[24px]"
        />
      );
    }
    return <CiHeart className="text-[25px]" />;
  };

  return (
    <button
      className={`bg-white-012 border border-white-024 hover:bg-white-016 rounded-full p-[7px] xl:p-[11px]
         hover:cursor-pointer flex items-center justify-center ${
           isChannel
             ? '!bg-charleston-green hover:!bg-black-olive-404040 !rounded-[40px] !border-none gap-[8px] !w-fit !h-fit !p-0 !px-[16px] !py-[8px]'
             : ''
         } ${
        type !== 'hovered-slide'
          ? 'w-[32px] h-[32px] xl:w-[48px] xl:h-[48px] '
          : 'w-[40px] h-[40px] !p-[8px]'
      }`}
      aria-label="like"
      onClick={onClick}
    >
      {isActive ? renderActiveIcon() : renderIcon()}

      {isChannel && (
        <span className="font-[600] text-[16px] leading-[130%] tracking-[0.32px] text-white-smoke block">
          {isActive ? (
            <>{isCommingSoon ? TEXT.order : TEXT.follow}</>
          ) : (
            <>{isCommingSoon ? TEXT.unOrder : TEXT.unFollow}</>
          )}
        </span>
      )}
    </button>
  );
}
