import { SKIP_INTRO_BUTTON_TEXT } from '@/lib/constant/texts';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { RootState } from '@/lib/store';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

interface SkipIntroProps {
  isVisible: boolean;
  onSkip: () => void;
}

const SkipIntro: React.FC<SkipIntroProps> = ({ isVisible, onSkip }) => {
  const isFullscreen = useSelector(
    (state: RootState) => state.player.isFullscreen,
  );
  const { width } = useScreenSize();
  // Check if user is mobile
  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={onSkip}
      className={`absolute flex flex-row justify-center items-center whitespace-nowrap px-[13.5px] tablet:px-6 py-[8px] tablet:py-3 gap-2 w-[153px] tablet:w-[174px] h-[37px] tablet:h-12 bottom-4 right-4 tablet:bottom-[84px] xl:right-[32px] xl:bottom-[92px] ${
        !isFullscreen && isMobile ? 'top-4! bottom-none right-4' : ''
      } bg-charleston-green-08 rounded-[40px] transition-all duration-300 hover:bg-charleston-green focus:outline-none focus:border-none z-2 cursor-pointer skip-intro-button`}
      aria-label={SKIP_INTRO_BUTTON_TEXT}
    >
      {/* Button Text */}
      <span className="w-[126px] h-[21px] font-semibold text-base leading-[130%] tracking-[0.02em] text-white-smoke flex-none order-1 flex-grow-0">
        {SKIP_INTRO_BUTTON_TEXT}
      </span>
    </button>
  );
};

export default SkipIntro;
