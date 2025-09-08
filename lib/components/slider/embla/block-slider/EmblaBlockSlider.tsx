import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from 'next/router';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';

import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from '@/lib/components/slider/embla/top-slider/EmblaCarouselArrowButtons';
import EmblaBlockSlideItem from './EmblaBlockSlideItem';
import useScreenSize from '@/lib/hooks/useScreenSize';

interface BlockContextType {
  imageHeight?: number;
  changeImageHeight?: (n: number) => void;
  imageLoaded?: boolean;
  setImageLoaded?: (value: boolean) => void;
}

export const BlockContext = React.createContext<BlockContextType>({
  imageHeight: 0,
});

type PropType = {
  children?: React.ReactNode;
  options?: EmblaOptionsType;
  block?: BlockItemType;
  slidesItems?: BlockSlideItemType[];
  slideClassName?: string;
};

const EmblaBlockSlider: React.FC<PropType> = (props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { width } = useScreenSize();
  const [imageHeight, setImageHeight] = useState(0);
  const { slidesItems, slideClassName, block } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const isSearchingPage = useMemo(
    () => router.pathname.startsWith('/tim-kiem'),
    [router.pathname],
  );

  let slidesToScroll = 1;
  if (width < 768) {
    slidesToScroll = 1;
  } else if (block?.block_type === 'new_vod_detail') {
    slidesToScroll = width < 1280 ? 1 : 2;
  } else {
    slidesToScroll = 3;
  }

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    slidesToScroll,
    dragFree: false,
    align: 'start',
  });

  useEffect(() => {}, [selectedIndex]);

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, setSelectedIndex]);

  const timeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on('select', onSelect).on('reInit', () => {
      timeRef.current = setTimeout(() => {
        setImageLoaded(true);
      }, 500);
      onSelect();
    });
  }, [emblaMainApi, onSelect]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaMainApi);

  useEffect(() => {
    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
        timeRef.current = null;
      }
    };
  }, []);

  return (
    <BlockContext.Provider
      value={{
        imageHeight,
        changeImageHeight: (n: number) => setImageHeight(n),
        imageLoaded,
        setImageLoaded,
      }}
    >
      <div className={`block-slider ${slideClassName}`}>
        <div className="embla">
          <div
            className={`embla__viewport ${
              block?.type === 'vod_related' ||
              block?.type === 'vod_season' ||
              block?.type === 'trailer'
                ? 'py-[8px] px-[8px] -mx-[8px]'
                : ''
            }`}
            ref={emblaMainRef}
          >
            <div
              className={`nvmnvmnvm embla__container ${
                isSearchingPage ? '!ml-[15px]' : ''
              }`}
            >
              {slidesItems?.map((slide, index) => (
                <EmblaBlockSlideItem
                  key={index}
                  block={block}
                  slide={slide}
                  index={index}
                />
              ))}
            </div>
          </div>

          <div
            className={`block-slider-arrow-${
              block?.block_type
            } block-slider-arrow hidden xl:flex items-center justify-center text-[rgba(255,255,255,0.3)]
               hover:text-white hover:cursor-pointer duration-400 absolute top-0 ${
                 block?.type === 'vod_related' ||
                 block?.type === 'famous_people'
                   ? '-left-[8px] w-[156px] bg-gradient-to-l from-smoky-black/1 to-smoky-black justify-start text-white-smoke pb-[20px]'
                   : '-left-[50px]'
               }  -translate-y-1/2 ${prevBtnDisabled ? '!hidden' : ''} ${
              block?.block_type === 'auto_expansion' ? 'top-1/2' : ''
            }`}
            style={{
              marginTop: `${
                block?.block_type === 'auto_expansion'
                  ? ''
                  : block?.type === 'vod_related' ||
                    block?.type === 'famous_people'
                  ? `${imageHeight / 2 + 24}px`
                  : `${imageHeight / 2}px`
              }`,
              height: `${
                block?.type === 'vod_related' || block?.type === 'famous_people'
                  ? imageHeight + 75
                  : ''
              }px`,
            }}
          >
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
          </div>

          <div
            className={`block-slider-arrow-${
              block?.block_type
            } block-slider-arrow hidden xl:flex items-center justify-center text-[rgba(255,255,255,0.3)] hover:text-white hover:cursor-pointer duration-400 absolute top-0 
              ${
                block?.type === 'vod_related' || block?.type === 'famous_people'
                  ? '-right-[8px] w-[156px] bg-gradient-to-r from-smoky-black/1 to-smoky-black justify-end text-white-smoke pb-[20px]'
                  : '-right-[50px]'
              }  -translate-y-1/2 ${nextBtnDisabled ? '!hidden' : ''} ${
              block?.block_type === 'auto_expansion' ? 'top-1/2' : ''
            } ${
              !imageLoaded ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            style={{
              marginTop: `${
                block?.block_type === 'auto_expansion'
                  ? ''
                  : block?.type === 'vod_related' ||
                    block?.type === 'famous_people'
                  ? `${imageHeight / 2 + 24}px`
                  : `${imageHeight / 2}px`
              }`,
              height: `${
                block?.type === 'vod_related' || block?.type === 'famous_people'
                  ? imageHeight + 75
                  : ''
              }px`,
            }}
          >
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </div>
      </div>
    </BlockContext.Provider>
  );
};

export default EmblaBlockSlider;
