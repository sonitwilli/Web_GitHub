'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useRef,
  useContext,
  useMemo,
} from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaTopThumbs } from './EmblaTopThumbs';
import { BlockItemType, BlockItemResponseType } from '@/lib/api/blocks';
import TopSlideItem from '../../TopSlideItem';
import Fade from 'embla-carousel-fade';
import Autoplay, { AutoplayType } from 'embla-carousel-autoplay';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTopSliderHeight } from '@/lib/store/slices/appSlice';
import { AppContext } from '@/lib/components/container/AppContainer';
import { useFetchRecommendBlock } from '@/lib/hooks/useFetchRecommendBlock';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { filterEndedEvents } from '@/lib/utils/eventUtils';

type PropType = {
  options?: EmblaOptionsType;
  block?: BlockItemType;
  slidesItems?: BlockItemResponseType;
};

interface TopSliderContextType {
  isMuted?: boolean;
  handleChangeIsMuted?: (val?: boolean) => void;
  isInViewport?: boolean;
}
export const TopSliderContext = createContext<TopSliderContextType>({
  isMuted: true,
  isInViewport: false,
});

const EmblaTopSlider: React.FC<PropType> = (props) => {
  const { width } = useScreenSize();
  const dispatch = useAppDispatch();
  const { slidesItems, block } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { timeStartBlockPlayer } = useAppSelector((state) => state.blockSlice);
  const { isInViewport, targetElement } = useIntersectionObserver({
    threshold: 0.3,
  });

  const autoplay = useRef<AutoplayType>(
    Autoplay({
      delay: 15000,
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const appCtx = useContext(AppContext);
  const { info } = useAppSelector((state) => state.user);
  const { configs } = appCtx;

  const { data, fetchRecommendBlock } = useFetchRecommendBlock({
    dataIndex: block || {},
    dataDefault: slidesItems || {},
    blockId: block?.id || '',
    profile_id: info?.profile?.profile_id || '',
    cache_time: configs?.recommend_ttl || '0',
    isLogged: info?.user_id_str !== '' || false,
  });

  const filteredData = useMemo(() => {
    return data ? filterEndedEvents(data) : [];
  }, [data]);

  useEffect(() => {
    try {
      if (isInViewport) {
        if (autoplay.current && typeof autoplay.current.play === 'function') {
          autoplay.current.play();
        }
      } else {
        if (autoplay.current && typeof autoplay.current.stop === 'function') {
          autoplay.current.stop();
        }
      }
    } catch {}
  }, [isInViewport]);

  useEffect(() => {
    fetchRecommendBlock(configs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id]);

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [autoplay.current, Fade()],
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
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const checkHeight = useCallback(() => {
    if (!sliderRef.current) {
      return;
    }
    try {
      const h = sliderRef.current.scrollHeight;
      dispatch(changeTopSliderHeight(h));
    } catch {}
  }, [sliderRef, dispatch]);

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

  const [isMuted, setIsMuted] = useState(true);

  // pause auto play khi phát trailer các block
  useEffect(() => {
    try {
      if (timeStartBlockPlayer) {
        if (autoplay.current && typeof autoplay.current.stop === 'function') {
          autoplay.current.stop();
        }
      }
    } catch {}
  }, [timeStartBlockPlayer]);

  useEffect(() => {
    const t = setTimeout(() => {
      checkHeight();
    }, 1000);

    return () => {
      clearTimeout(t);
    };
  }, [checkHeight]);

  return (
    <TopSliderContext.Provider
      value={{
        isMuted,
        handleChangeIsMuted: () => setIsMuted(!isMuted),
        isInViewport,
      }}
    >
      <div className="embla" id="top_slider" ref={sliderRef}>
        <div className="embla__viewport" ref={emblaMainRef}>
          <div className="embla__container" ref={targetElement}>
            {Array.isArray(filteredData) &&
              filteredData.length > 0 &&
              filteredData.map((slide, index) => (
                <div
                  className={`embla__slide ${
                    index === selectedIndex ? 'embla__slide--active' : ''
                  }`}
                  key={index}
                >
                  <TopSlideItem
                    slide={slide}
                    block={block}
                    isInview={index === selectedIndex}
                    index={index}
                  />
                </div>
              ))}
          </div>
        </div>

        <div
          className={`embla-thumbs ${width < 1280 ? 'f-container w-full' : ''}`}
        >
          <div className="embla-thumbs__viewport pb-[4px]" ref={emblaThumbsRef}>
            <div className="embla-thumbs__container">
              {Array.isArray(filteredData) &&
                filteredData.length > 0 &&
                filteredData.map((slide, index) => (
                  <EmblaTopThumbs
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
    </TopSliderContext.Provider>
  );
};

export default EmblaTopSlider;
