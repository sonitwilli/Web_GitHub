import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { useMemo } from 'react';
import VodRating from '../rating/VodRating';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  type?: 'top-slide' | 'block-slide' | 'hovered-slide';
}

export default function VodHighlightInfo({ slide }: Props) {
  const imagesInfo = useMemo(() => {
    return (
      slide?.highlighted_info?.filter((item) => item?.type === 'image') || []
    );
  }, [slide]);

  const ratingInfo = useMemo(() => {
    return (
      slide?.highlighted_info?.filter((item) => item?.type === 'rating') || []
    );
  }, [slide]);
  return (
    <div className="flex items-center gap-[12px]">
      {imagesInfo &&
        imagesInfo?.length > 0 &&
        imagesInfo.map((image, index) => (
          <div key={index}>
            <img
              src={image.content}
              alt={slide?.title_vie || slide?.title}
              className="h-[28px]"
            />
          </div>
        ))}

      {ratingInfo &&
        ratingInfo?.length > 0 &&
        ratingInfo.map((image, index) => (
          <div key={index}>
            <VodRating hightlightInfo={ratingInfo[0]} />
          </div>
        ))}
    </div>
  );
}
