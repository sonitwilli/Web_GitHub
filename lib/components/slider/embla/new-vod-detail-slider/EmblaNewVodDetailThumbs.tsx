import { BlockSlideItemType } from '@/lib/api/blocks';
import { scaleImageUrl } from '@/lib/utils/methods';
import React from 'react';

type PropType = {
  selected: boolean;
  index: number;
  onClick: () => void;
  slide?: BlockSlideItemType;
};

export const EmblaNewVodDetailThumbs: React.FC<PropType> = (props) => {
  const { selected, index, onClick, slide } = props;

  return (
    <div
      className={`embla-thumbs__slide`.concat(
        selected ? ' embla-thumbs__slide--selected' : '',
      )}
    >
      <button onClick={onClick} type="button">
        <div
          key={index}
          className={`flex-none border-[3px] flex items-center justify-center cursor-pointer rounded-lg overflow-hidden ease-out duration-500 ${
            selected
              ? 'border-white scale-[1.1]'
              : 'border-[rgba(255,255,255,0.12)]'
          }`}
        >
          <img
            src={scaleImageUrl({
              imageUrl: slide?.image?.portrait || slide?.image?.portrait_mobile,
              width: 80,
            })}
            alt={slide?.title}
            className="w-full"
            loading="lazy"
          />
        </div>
      </button>
    </div>
  );
};
