import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNextRecommend } from '@/lib/hooks/useNextRecommend';
import styles from './NextRecommend.module.css';
import { FaPlay } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import PosterOverlays from '../../overlays/PosterOverlays';
import { PosterOverlayItem } from '@/lib/utils/posterOverlays/types';
import { RootState, useAppSelector } from '@/lib/store';
import useScreenSize from '@/lib/hooks/useScreenSize';

interface NextRecommendProps {
  isExpanded?: boolean;
}

const NextRecommend: React.FC<NextRecommendProps> = ({ isExpanded }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);
  const {
    isVisible,
    recommendData,
    countdown,
    onWatchNow,
    onWatchTrailer,
    onClose,
  } = useNextRecommend();

  const isFullscreen = useAppSelector((s: RootState) => s.player.isFullscreen);
  const { width } = useScreenSize();
  // Check if user is mobile
  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);
  const isHideImg = useMemo(() => {
    return width >= 768 && width <= 1280 && !isExpanded;
  }, [width, isExpanded]);
  const handlePosterOverlays = useCallback((positionRibbons: string[]) => {
    setPosterOverlaysReady(positionRibbons);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowAnimation(true), 50);
      return () => clearTimeout(timer);
    }
    setShowAnimation(false);
  }, [isVisible]);

  if (!isVisible || !recommendData) return null;

  const hasTrailer = recommendData.is_trailer === '1';

  return (
    <div
      className={`absolute inset-0 w-full h-full xl:rounded-2xl z-3 overflow-hidden bg-gradient-to-b from-black/20 via-black/80 to-black ${styles.nextRecommend}`}
    >
      {/* Container */}
      <div
        className={`flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-8 absolute bottom-[20px] tablet:bottom-[42px] xl:bottom-10 ${
          isExpanded
            ? 'left-[16px] tablet:left-[32px] xl:left-[351px] right-[16px] tablet:right-[32px] xl:right-auto xl:max-w-[1216px]'
            : isMobile
            ? 'left-[16px] right-[16px]'
            : isFullscreen
            ? 'left-1/2 -translate-x-1/2 max-w-[1216px] w-[calc(100%-32px)]'
            : 'left-[16px] tablet:left-[32px] right-[16px] tablet:right-[32px] xl:left-[32px] xl:right-auto xl:max-w-[1216px]'
        }`}
      >
        {/* Image */}
        <div
          className={`${
            isHideImg ? 'hidden' : 'hidden xl:block'
          } w-full xl:w-[416px] h-[120px] tablet:h-[140px] xl:h-[234px] bg-cover bg-center rounded-2xl flex-none order-0 z-0`}
        >
          <div
            className={`relative rounded-2xl ${
              posterOverlaysReady.includes('top-ribbon')
                ? 'overflow-visible mt-[3px]'
                : posterOverlaysReady.includes('mid-ribbon')
                ? 'overflow-visible ml-[3px] mr-[3px]'
                : posterOverlaysReady.includes('bottom-ribbon')
                ? 'overflow-visible mb-[3px]'
                : 'overflow-hidden'
            }`}
          >
            <img
              src={
                recommendData.image?.landscape_title ||
                recommendData.image?.landscape ||
                '/images/default-poster-horizontal.png'
              }
              alt={recommendData.title_vie || recommendData.title}
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.currentTarget.src = '/images/default-poster-horizontal.png';
              }}
            />

            {/* Poster Overlays */}
            {recommendData.poster_overlays &&
              recommendData.poster_overlays.length > 0 && (
                <PosterOverlays
                  posterOverlays={
                    recommendData.poster_overlays as PosterOverlayItem[]
                  }
                  blockType="feature_horizontal_slider"
                  positionLabelsStatus={[{}]}
                  onHandlePosterOverlays={handlePosterOverlays}
                />
              )}
          </div>
        </div>

        {/* Content Container */}
        <div
          className={`flex flex-col items-start p-0 gap-2 tablet:gap-3 xl:gap-8 h-auto xl:h-[232px] flex-none order-1 flex-grow z-[1] w-full xl:w-auto xl:flex-1 min-w-0`}
        >
          {/* Info Section */}
          <div
            className={`flex flex-col items-start p-0 gap-2 tablet:gap-3 xl:gap-4 w-full h-auto xl:h-[152px] flex-none order-0 self-stretch min-w-0`}
          >
            {/* Title */}
            <div className="flex justify-between w-full min-w-0">
              <h2
                className={`flex-1 h-auto font-semibold text-[18px] tablet:text-[22px] xl:text-[28px] leading-[130%] tracking-[0.02em] text-white overflow-hidden text-ellipsis whitespace-nowrap min-w-0`}
              >
                {recommendData.title_vie || recommendData.title}
              </h2>

              {/* Close Button */}
              <button
                className={`w-7 h-7 flex items-center justify-center cursor-pointer flex-shrink-0 ml-2`}
                onClick={onClose}
                aria-label="Đóng khuyến nghị"
              >
                <IoCloseOutline className="w-7 h-7 text-white-smoke hover:opacity-80" />
              </button>
            </div>

            {/* Meta Data */}
            <div className="flex items-center gap-2 flex-wrap w-full min-w-0">
              {recommendData.detail?.priority_tag && (
                <span className="px-2 py-1 bg-fpl rounded text-white-smoke text-sm tablet:text-base font-medium flex-shrink-0">
                  {recommendData.detail.priority_tag}
                </span>
              )}
              {recommendData.detail?.priority_tag &&
                recommendData.detail?.meta_data &&
                recommendData.detail.meta_data.length > 0 && (
                  <span className="text-spanish-gray font-medium flex-shrink-0">
                    •
                  </span>
                )}
              {recommendData.detail?.meta_data?.map(
                (item: string, idx: number) => (
                  <React.Fragment key={idx}>
                    <span className="text-spanish-gray font-medium text-[12px] tablet:text-sm xl:text-base leading-[130%] flex-shrink-0">
                      {item}
                    </span>
                    {idx <
                      (recommendData.detail?.meta_data?.length || 0) - 1 && (
                      <span className="text-spanish-gray font-medium flex-shrink-0">
                        •
                      </span>
                    )}
                  </React.Fragment>
                ),
              )}
            </div>

            {/* Description */}
            <p
              className={`overflow-hidden text-ellipsis font-normal text-[12px] tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke flex-none order-2 self-stretch line-clamp-2 xl:line-clamp-3 w-full min-w-0`}
            >
              {recommendData.detail?.description}
            </p>
          </div>

          {/* Buttons Section */}
          <div
            className={`flex flex-row items-center p-0 gap-3 tablet:gap-4 w-full h-auto flex-none order-1 min-w-0`}
          >
            {hasTrailer ? (
              <>
                {/* Watch Now Button - No animation when trailer exists */}
                <button
                  className={`flex items-center justify-center cursor-pointer px-3 tablet:px-4 xl:px-6 py-2 xl:py-3 gap-2 w-[120px] tablet:w-[140px] xl:w-[178px] h-[36px] tablet:h-[38px] xl:h-12 rounded-[40px] bg-gradient-to-r from-fpl to-red-600 hover:from-fpl-dark hover:to-red-700 transition-all ${styles.focusRing} flex-shrink-0`}
                  onClick={onWatchNow}
                  aria-label="Xem ngay"
                >
                  <div className="w-5 h-5 tablet:w-6 tablet:h-6 flex items-center justify-center">
                    <FaPlay className="w-3 h-3 tablet:w-3.5 tablet:h-[18px] text-white-smoke" />
                  </div>
                  <span className="font-semibold text-xs tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke whitespace-nowrap">
                    Xem ngay
                  </span>
                </button>

                {/* Trailer Button - Only countdown text, no color animation */}
                <button
                  className={`relative cursor-pointer flex items-center justify-center px-3 tablet:px-4 xl:px-6 py-2 xl:py-3 gap-2 w-[140px] tablet:w-[160px] xl:w-[197px] h-[36px] tablet:h-[38px] xl:h-12 rounded-[40px] bg-charleston-green/80 hover:bg-charleston-green transition-all overflow-hidden ${styles.focusRing} flex-shrink-0`}
                  onClick={onWatchTrailer}
                  aria-label="Phát trailer"
                >
                  <div className="relative z-2 w-5 h-5 tablet:w-6 tablet:h-6 flex items-center justify-center">
                    <FaPlay className="w-3 h-3 tablet:w-3.5 tablet:h-[18px] text-white-smoke" />
                  </div>
                  <span className="relative z-2 font-semibold text-xs tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke whitespace-nowrap">
                    {countdown > 0
                      ? `Phát trailer (${countdown}s)`
                      : 'Phát trailer'}
                  </span>
                </button>
              </>
            ) : (
              /* Single Watch Now Button - With countdown color animation and auto-redirect */
              <button
                className={`relative cursor-pointer flex items-center justify-center px-4 tablet:px-5 xl:px-6 py-2 xl:py-3 gap-2 w-[120px] tablet:w-[140px] xl:w-[178px] h-[36px] tablet:h-[38px] xl:h-12 rounded-[40px] bg-charleston-green-08 hover:bg-charleston-green transition-colors duration-200 overflow-hidden ${styles.focusRing} ${styles.button} flex-shrink-0`}
                onClick={onWatchNow}
                aria-label="Xem ngay"
                type="button"
              >
                {/* Progress Background with CSS Keyframe Animation - Same as WatchAndSkipCredit */}
                {showAnimation && countdown > 0 && (
                  <div className={styles.progressAnimation} />
                )}

                {/* Gradient Background - Left side 87px width like WatchAndSkipCredit */}
                <div className="absolute left-0 top-0 w-[87px] h-[48px] rounded-l-[40px] z-0" />

                {/* Play Icon */}
                <div className="relative z-2 w-5 h-5 tablet:w-6 tablet:h-6 flex items-center justify-center">
                  <FaPlay className="w-3 h-3 tablet:w-[14px] tablet:h-[14px] text-white-smoke" />
                </div>
                <span className="relative z-2 font-semibold text-xs tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke whitespace-nowrap">
                  Xem ngay
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextRecommend;
