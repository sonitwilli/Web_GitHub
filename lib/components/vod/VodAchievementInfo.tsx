import { BlockSlideItemType } from '@/lib/api/blocks';
import { useMemo, useState } from 'react';

interface Props {
  slide?: BlockSlideItemType;
}

export default function VodAchievementInfo({ slide }: Props) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const imagesInfo = useMemo(() => {
    return (
      slide?.achievement_info?.filter((item) => item?.type === 'image') || []
    );
  }, [slide]);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <div className="flex flex-wrap items-center gap-[12px] mb-[12px] tablet:mb-[16px] ">
      {imagesInfo &&
        imagesInfo?.length > 0 &&
        imagesInfo.map((image, index) => {
          // Only show images that have loaded successfully
          if (failedImages.has(index)) {
            return null;
          }

          return (
            <div key={index}>
              <img
                src={image.content}
                alt={slide?.title_vie || slide?.title}
                className="h-[28px]"
                onError={() => handleImageError(index)}
              />
            </div>
          );
        })}
    </div>
  );
}
