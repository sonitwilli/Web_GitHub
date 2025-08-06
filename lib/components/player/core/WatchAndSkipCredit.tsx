import React, { useMemo } from 'react';
import { FaPlay } from 'react-icons/fa';
import styles from './WatchAndSkipCredit.module.css';
import { useWatchAndSkipCredit } from '@/lib/hooks/useWatchAndSkipCredit';
import { useNextEpisodeNavigation } from '@/lib/hooks/useNextEpisodeNavigation';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { useVodPageContext } from '../context/VodPageContext';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import useScreenSize from '@/lib/hooks/useScreenSize';

interface WatchAndSkipCreditProps {
  endContent?: number;
  hasNextEpisode?: boolean;
  onWatchCredit: () => void;
  onPlayNext: () => void;
}

const WatchAndSkipCredit: React.FC<WatchAndSkipCreditProps> = ({
  endContent,
  hasNextEpisode,
  onWatchCredit,
  onPlayNext,
}) => {
  const {
    isVisible,
    showAnimation,
    // countdown, // Not displayed in UI per design requirements
    watchCredit,
    skipToNext,
  } = useWatchAndSkipCredit(endContent, hasNextEpisode, onPlayNext);

  // Get context data for navigation
  const { streamType, dataChannel } = usePlayerPageContext();
  const { nextEpisode, routerChapterId } = useVodPageContext();

  // Use the new navigation hook
  const { navigateToNextEpisode, canNavigateNext } = useNextEpisodeNavigation({
    currentChannel: dataChannel,
    nextEpisode,
    contentType:
      streamType === 'vod'
        ? 'vod'
        : streamType === 'channel'
        ? 'channel'
        : 'vod',
    routerChapterId,
  });

  // Enhanced skip function using the new hook
  const handleSkipToNext = () => {
    if (canNavigateNext) {
      navigateToNextEpisode();
    } else {
      // Fallback to original skipToNext and onPlayNext
      skipToNext();
      onPlayNext();
    }
  };

  const handleWatchCredit = () => {
    watchCredit();
    onWatchCredit();
  };

  const isFullscreen = useSelector(
    (state: RootState) => state.player.isFullscreen,
  );
  const { width } = useScreenSize();
  // Check if user is mobile
  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);
  if (!isVisible) return null;

  return (
    <div
      className={`
        watch-and-skip-credit 
        absolute 
        ${!isFullscreen && isMobile ? 'top-4! bottom-none right-4' : ''}
        right-4 bottom-[84px]
        tablet:right-[32px]
        tablet:top-auto
        tablet:bottom-[84px]
        xl:bottom-[92px] z-2 transition-opacity duration-300 
        ${styles.watchAndSkipCredit}`}
    >
      {/* Container with exact Figma dimensions */}
      <div className="flex flex-row items-center gap-2 xl:gap-4 w-[280px] xl:w-[340px] h-[37px] xl:h-[48px]">
        {/* Watch Credit Button - 146px width */}
        <button
          onClick={handleWatchCredit}
          className={`flex flex-row justify-center items-center px-3 py-2 xl:px-6 xl:py-3 gap-2 whitespace-nowrap w-[122px] xl:w-[146px] h-[37px] xl:h-[48px] bg-charleston-green-08 hover:bg-charleston-green rounded-[40px] border-none cursor-pointer transition-colors duration-200 font-semibold text-base leading-[130%] tracking-[0.02em] text-white-smoke ${styles.focusRing}`}
          aria-label="Xem danh đề"
          type="button"
        >
          <span>Xem danh đề</span>
        </button>

        {/* Skip to Next Episode Button - 178px width */}
        <button
          onClick={handleSkipToNext}
          className={`relative flex flex-row justify-center whitespace-nowrap items-center px-3 py-2 xl:px-6 xl:py-3 gap-2 w-[146px] xl:w-[178px] h-[37px] xl:h-[48px] bg-charleston-green-08 hover:bg-charleston-green rounded-[40px] border-none cursor-pointer transition-colors duration-200 overflow-hidden font-semibold text-base leading-[130%] tracking-[0.02em] text-white-smoke ${styles.focusRing} ${styles.button}`}
          aria-label="Tập tiếp theo"
          type="button"
        >
          {/* Progress Background with CSS Keyframe Animation - Now visible */}
          {showAnimation && <div className={styles.progressAnimation} />}

          {/* Gradient Background - Left side 87px width */}
          <div className="absolute left-0 top-0 w-[87px] h-[48px] rounded-l-[40px] z-0" />

          {/* Skip Next Icon */}
          <div className="relative z-2 w-6 h-6 flex items-center justify-center">
            <FaPlay className="w-[14px] h-[14px] text-white-smoke" />
          </div>

          {/* Text - No Countdown */}
          <span className="relative z-2">Tập tiếp theo</span>
        </button>
      </div>
    </div>
  );
};

export default WatchAndSkipCredit;
