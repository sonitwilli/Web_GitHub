import { BlockSlideItemType } from '@/lib/api/blocks';

import { useMemo } from 'react';
import { LuDot } from 'react-icons/lu';

interface Props {
  slide?: BlockSlideItemType;
}

export default function BlockItemMetaData({ slide }: Props) {
  const vodDetailHighlight = useMemo(() => {
    const dataDetailHighlight = [];
    if (slide?.detail?.priority_tag) {
      dataDetailHighlight.push({
        data: slide.detail.priority_tag,
        color: true,
      });
    }
    if (slide?.detail?.meta_data?.length) {
      slide.detail.meta_data.forEach((element) => {
        dataDetailHighlight.push({
          data: element,
          color: false,
        });
      });
    }
    return dataDetailHighlight;
  }, [slide]);

  return (
    <>
      {vodDetailHighlight && vodDetailHighlight?.length > 0 ? (
        <div className="flex items-center mt-[12px]">
          {vodDetailHighlight.map((detail, index) => (
            <div key={index} className="flex items-center">
              <span
                className={`text-[12px] md:text-[14px] lg:text-[16px] text-white-smoke leading-[130%] tracking-[0.32px] font-[500] ${
                  detail?.color ? 'text-fpl' : ''
                }`}
              >
                {detail.data}
              </span>
              {index < vodDetailHighlight?.length - 1 && <LuDot />}
            </div>
          ))}
        </div>
      ) : (
        ''
      )}
    </>
  );
}
