import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Image from 'next/image';
import { CiHeart } from 'react-icons/ci';
import { ActionType } from '../vod/VodActionButtons';

export interface Props {
  isActive?: boolean;
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  onClick?: () => void;
  isChannel?: boolean;
  type?: ActionType;
}

export default function LikeReaction({
  isActive,
  onClick,
  isChannel,
  type,
}: Props) {
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
      {isActive ? (
        <Image src="/images/heart-fill.png" alt="like" width={24} height={24} />
      ) : (
        <CiHeart className="text-[25px]" />
      )}

      {isChannel && (
        <span className="font-[600] text-[16px] leading-[130%] tracking-[0.32px] text-white-smoke block">
          {isActive ? <>Bỏ theo dõi</> : <>Theo dõi</>}
        </span>
      )}
    </button>
  );
}
