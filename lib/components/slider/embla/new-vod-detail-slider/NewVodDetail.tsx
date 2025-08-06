import {
  BlockItemResponseType,
  BlockItemType,
  BlockSlideItemType,
} from '@/lib/api/blocks';
import EmblaBlockSlider from '../block-slider/EmblaBlockSlider';
import { createContext, useEffect, useState } from 'react';
import NewVodDetailSlideItem from './NewVodDetailSlideItem';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import useScreenSize from '@/lib/hooks/useScreenSize';

interface Props {
  blockData?: BlockItemResponseType;
  block?: BlockItemType;
  data?: BlockSlideItemType[]; // list items slide
}

interface ContextType {
  selectedSlide?: BlockSlideItemType;
  setSelectedSlide?: (v: BlockSlideItemType) => void;
  isInViewport?: boolean;
}

export const NewVodContext = createContext<ContextType>({
  isInViewport: false,
});

export default function NewVodDetail({ blockData, block, data }: Props) {
  const { width } = useScreenSize();
  const [selectedSlide, setSelectedSlide] = useState<BlockSlideItemType>();
  const { isInViewport, targetElement } = useIntersectionObserver({
    threshold: 0.3,
  });
  useEffect(() => {
    if (data?.length) {
      setSelectedSlide(data[0]);
    }
  }, [data]);
  return (
    <NewVodContext.Provider
      value={{ selectedSlide, setSelectedSlide, isInViewport }}
    >
      <div ref={targetElement}>
        <div className={`f-container flex items-center gap-[16px] mb-[16px]`}>
          <h2 className="text-[20px] 2xl:text-[24px] font-[600] text-white-smoke capitalize line-clamp-1 max-w-full">
            {blockData?.data?.length
              ? blockData?.meta?.name || block?.name
              : ''}
          </h2>
        </div>
        <div className="f-container">
          <NewVodDetailSlideItem slide={selectedSlide} block={block} />
        </div>
        <div
          className={`${width >= 1280 ? 'f-container' : ''} mt-[32px] xl:mt-0`}
        >
          <EmblaBlockSlider
            slidesItems={data || []}
            block={block}
            slideClassName={`block-slider-${block?.block_type}`}
          />
        </div>
      </div>
    </NewVodContext.Provider>
  );
}
