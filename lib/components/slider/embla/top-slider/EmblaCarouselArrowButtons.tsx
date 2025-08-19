import React, {
  ComponentPropsWithRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { EmblaCarouselType } from 'embla-carousel';
import { MdArrowForwardIos, MdOutlineArrowBackIos } from 'react-icons/md';

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined,
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    const canScrollPrev = emblaApi.canScrollPrev();
    const canScrollNext = emblaApi.canScrollNext();

    setPrevBtnDisabled(!canScrollPrev);
    setNextBtnDisabled(!canScrollNext);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

type PropType = ComponentPropsWithRef<'button'>;

export const PrevButton: React.FC<PropType> = (props) => {
  const { ...restProps } = props;

  return (
    <button
      type="button"
      {...restProps}
      className="PrevButton hover:cursor-pointer text-spanish-gray hover:text-white"
    >
      <MdOutlineArrowBackIos size={36} />
    </button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { ...restProps } = props;

  return (
    <button
      type="button"
      {...restProps}
      className="NextButton hover:cursor-pointer text-spanish-gray hover:text-white"
    >
      <MdArrowForwardIos size={36} />
    </button>
  );
};
