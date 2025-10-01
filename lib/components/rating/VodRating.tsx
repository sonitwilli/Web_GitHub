import { BlockSlideItemType, SlideHightlightInfoType } from '@/lib/api/blocks';
import { useMemo } from 'react';

interface Props {
  star?: string;
  count?: string;
  isHovered?: boolean;
  slide?: BlockSlideItemType;
  type?: 'top-slide' | 'block-slide' | 'hovered-slide';
  hightlightInfo?: SlideHightlightInfoType;
}

export default function VodRating({ type, hightlightInfo }: Props) {
  const bgColor = useMemo(
    () => String(hightlightInfo?.bg_color || hightlightInfo?.bg || '#2C2C2C'),
    [hightlightInfo],
  );

  if (
    !hightlightInfo ||
    (!hightlightInfo.avg_rate &&
      hightlightInfo.count &&
      parseInt(hightlightInfo.count) === 0)
  ) {
    return null;
  }

  return (
    <div
      className={`h-[28px] flex items-center w-fit gap-[8px] border border-white/10 tablet:px-[5px] xl:px-[7px] rounded-[5px] xl:rounded-[7px] ${
        type === 'hovered-slide' ? '!bg-transparent !border-0 !px-0' : ''
      }`}
      style={{
        backgroundColor: bgColor,
      }}
    >
      {hightlightInfo?.icon && (
        <img
          src={hightlightInfo.icon}
          alt="rating"
          className="h-[15px] w-[15px] min-w-[15px] xl:h-[21px] xl:w-[21px] xl:min-w-[21px]"
          width={24}
          height={24}
        />
      )}
      <div className="flex items-center gap-[4px]">
        {hightlightInfo?.avg_rate && (
          <span className="font-[600] text-[14px] xl:text-[16px]">
            {hightlightInfo.avg_rate}
          </span>
        )}
        {hightlightInfo?.count && (
          <span className="text-spanish-gray font-[500] text-[14px] xl:text-[16px]">
            {hightlightInfo.count}
          </span>
        )}
      </div>
    </div>
  );
}
