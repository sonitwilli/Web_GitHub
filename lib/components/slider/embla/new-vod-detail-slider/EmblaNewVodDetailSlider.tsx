import React, { useState, useEffect, useCallback, createContext } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaNewVodDetailThumbs } from './EmblaNewVodDetailThumbs';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Fade from 'embla-carousel-fade';
import NewVodDetailSlideItem from './NewVodDetailSlideItem';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

type PropType = {
  options?: EmblaOptionsType;
  block?: BlockItemType;
  slidesItems?: BlockSlideItemType[];
};

interface NewVodSliderContextType {
  isInViewport?: boolean;
}
export const NewVodSliderContext = createContext<NewVodSliderContextType>({
  isInViewport: false,
});

const EmblaNewVodDetailSlider: React.FC<PropType> = (props) => {
  const { isInViewport, targetElement } = useIntersectionObserver({
    threshold: 0.3,
  });
  const { slidesItems, block } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [Fade()],
  );
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <NewVodSliderContext.Provider
      value={{
        isInViewport,
      }}
    >
      <div className="embla">
        <div className="embla__viewport" ref={emblaMainRef}>
          <div className="embla__container" ref={targetElement}>
            {slidesItems?.map((slide, index) => (
              <div className="embla__slide" key={index}>
                <NewVodDetailSlideItem slide={slide} block={block} />
              </div>
            ))}
          </div>
        </div>

        <div className={`embla-thumbs mt-[20px] xl:mt-0`}>
          <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
            <div className="embla-thumbs__container">
              {slidesItems?.map((slide, index) => (
                <EmblaNewVodDetailThumbs
                  slide={slide}
                  key={index}
                  onClick={() => onThumbClick(index)}
                  selected={index === selectedIndex}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </NewVodSliderContext.Provider>
  );
};

export default EmblaNewVodDetailSlider;
