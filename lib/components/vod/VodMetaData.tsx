import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { LuDot } from 'react-icons/lu';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  metaData?: { data?: string; color?: boolean }[];
  type?: 'top-slide' | 'block-slide' | 'hovered-slide';
}

export default function VodMetaData({ metaData, type }: Props) {
  return (
    <>
      {metaData?.map((detail, index) => (
        <div
          key={index}
          className={`flex items-center gap-[2px] md:gap-[4px] font-[500] text-shadow-top-slide`}
        >
          <span
            className={` text-[18px] ${detail?.color ? 'text-fpl' : ''} ${
              type === 'hovered-slide' ? '!text-[14px]' : ''
            }`}
          >
            {detail.data}
          </span>
          {index < metaData?.length - 1 && <LuDot />}
        </div>
      ))}
    </>
  );
}