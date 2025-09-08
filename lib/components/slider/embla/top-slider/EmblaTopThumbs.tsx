import { BlockSlideItemType } from '@/lib/api/blocks';
import { scaleImageUrl } from '@/lib/utils/methods';
import React, { useMemo } from 'react';
import { isEventEnded } from '@/lib/utils/eventUtils';

type PropType = {
  selected: boolean;
  index: number;
  onClick: () => void;
  slide?: BlockSlideItemType;
};

export const EmblaTopThumbs: React.FC<PropType> = (props) => {
  const { selected, index, onClick, slide } = props;

  // Check if this thumbnail should be hidden (ended event)
  const shouldHideThumb = useMemo(() => {
    return slide ? isEventEnded(slide) : false;
  }, [slide]);

  // Don't render ended events
  if (shouldHideThumb) {
    return null;
  }

  return (
    <div
      className={'embla-thumbs__slide'.concat(
        selected ? ' embla-thumbs__slide--selected' : '',
      )}
    >
      <button onClick={onClick} type="button">
        <div
          key={index}
          className={`flex-none border-[1px] tablet:border-[2px] xl:border-[3px] flex items-center justify-center cursor-pointer rounded-lg overflow-hidden ease-out duration-500 ${
            selected
              ? 'border-white scale-[1.075]'
              : 'border-[rgba(255,255,255,0.12)]'
          }`}
          style={
            selected ? { boxShadow: '2px 2px 8px 0px rgba(0, 0, 0, 0.24)' } : {}
          }
        >
          <img
            src={scaleImageUrl({
              imageUrl:
                slide?.image?.landscape || slide?.image?.landscape_title,
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
