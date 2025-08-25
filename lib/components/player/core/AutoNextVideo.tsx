import React, { useEffect, useState } from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { useAutoNextVideo } from '@/lib/hooks/useAutoNextVideo';
import { useNextEpisodeNavigation } from '@/lib/hooks/useNextEpisodeNavigation';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { useVodPageContext } from '../context/VodPageContext';
import styles from './AutoNextVideo.module.css';
import { FaPlay } from 'react-icons/fa';
import { RootState, useAppSelector } from '@/lib/store';

interface ExtendedChannelDetailType extends ChannelDetailType {
  title_vie?: string;
  ribbon_logo?: string;
  priority_tag?: string;
  meta_data?: string[];
}

interface AutoNextVideoProps {
  isExpanded: boolean;
}

const AutoNextVideo: React.FC<AutoNextVideoProps> = ({ isExpanded }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const { isVisible, autoNext, closeAutoNext, dataChannel, nextEpisode } =
    useAutoNextVideo();

  // Get context data for navigation
  const { streamType } = usePlayerPageContext();
  const { routerChapterId } = useVodPageContext();

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

  // Enhanced autoNext function using the new hook
  const handleAutoNext = () => {
    if (canNavigateNext) {
      navigateToNextEpisode();
    } else {
      // Fallback to original autoNext
      autoNext();
    }
  };

  const isFullscreen = useAppSelector((s: RootState) => s.player.isFullscreen);

  // Trigger animation when component becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure component is rendered before starting animation
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible]);

  if (!isVisible || !nextEpisode) {
    return null;
  }

  // Cast to extended type
  const extendedChannel =
    streamType === 'playlist'
      ? (nextEpisode as ExtendedChannelDetailType)
      : (dataChannel as ExtendedChannelDetailType);

  // Render all details in one array to avoid extra gaps
  const renderDetailsRow = () => {
    const items: React.ReactNode[] = [];

    // Add VIP icon if exists
    const ribbonLogo = extendedChannel?.ribbon_logo;
    if (ribbonLogo) {
      items.push(
        <img key="vip" src={ribbonLogo} alt="VIP" className="w-[30px] h-4" />,
      );
    }

    // Add priority tag if exists
    const priorityTag = extendedChannel?.priority_tag;
    if (priorityTag) {
      items.push(
        <span
          key="priority"
          className="text-white-smoke font-medium text-sm tablet:text-base leading-[130%] tracking-[0.02em] flex-none"
        >
          {priorityTag}
        </span>,
      );
    }

    // Add metadata if exists
    const metaData = extendedChannel?.meta_data;
    if (metaData && Array.isArray(metaData) && metaData.length > 0) {
      metaData.forEach((element: string, idx: number) => {
        items.push(
          <span
            key={`meta-${idx}`}
            className="text-spanish-gray font-medium text-[12px] tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] flex-none"
          >
            {element}
          </span>,
        );
      });
    }

    // Add separators between items (not at start/end)
    const itemsWithSeparators: React.ReactNode[] = [];
    items.forEach((item, index) => {
      itemsWithSeparators.push(item);
      // Add separator after each item except the last one
      if (index < items.length - 1) {
        itemsWithSeparators.push(
          <span
            key={`sep-${index}`}
            className="text-spanish-gray font-medium text-[12px] tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] flex-none"
          >
            •
          </span>,
        );
      }
    });

    return itemsWithSeparators;
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full xl:rounded-2xl z-3 overflow-hidden ${styles.overlayGradient}`}
    >
      {/* Container - positioned according to Figma spec */}
      <div
        className={`w-full flex flex-col xl:flex-row xl:items-end xl:justify-between items-start gap-4 tablet:gap-6 xl:gap-[104px] absolute bottom-[20px] tablet:bottom-[42px] xl:bottom-[40px] ${
          isExpanded
            ? 'left-[16px] tablet:left-[32px] xl:left-[351px] right-[16px] tablet:right-[32px] xl:right-auto xl:max-w-[1216px]'
            : isFullscreen
            ? 'left-1/2 -translate-x-1/2 max-w-[1216px] w-[calc(100%-32px)]'
            : 'left-[16px] tablet:left-[24px] xl:left-[32px] right-[16px] tablet:right-[24px] xl:right-auto xl:max-w-[1216px]'
        }`}
      >
        {/* Info Section */}
        <div
          className={`flex flex-col items-start gap-2 tablet:gap-3 xl:gap-4 flex-1 w-full ${
            isFullscreen ? 'w-full' : 'xl:max-w-[870px]'
          }`}
        >
          {/* Main Title */}
          {streamType === 'playlist' ? (
            <h2 className="w-full font-semibold text-[18px] tablet:text-[22px] xl:text-[28px] leading-[130%] tracking-[0.02em] text-white m-0 break-words line-clamp-1 tablet:line-clamp-none">
              {nextEpisode?.title}
            </h2>
          ) : (
            <h2 className="w-full font-semibold text-[18px] tablet:text-[22px] xl:text-[28px] leading-[130%] tracking-[0.02em] text-white m-0 break-words line-clamp-1 tablet:line-clamp-none">
              {extendedChannel?.title_vie || dataChannel?.title}
            </h2>
          )}

          {/* Next Episode Title */}
          {streamType !== 'playlist' && (
            <h3 className="font-medium text-[12px] tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke m-0 break-words line-clamp-1 tablet:line-clamp-none">
              {nextEpisode?.title}
            </h3>
          )}

          {/* Details Row - No gap at start/end, only between items */}
          <div className="flex flex-row items-center gap-2 w-full flex-wrap overflow-hidden">
            {renderDetailsRow()}
          </div>

          {/* Description - 3 lines max with overflow hidden */}
          {streamType === 'playlist' ? (
            <p
              className={`w-full font-normal text-[12px] tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke m-0 break-words overflow-hidden line-clamp-2 xl:line-clamp-3`}
            >
              {nextEpisode?.description}
            </p>
          ) : (
            <p
              className={`w-full font-normal text-[12px] tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke m-0 break-words overflow-hidden line-clamp-2 xl:line-clamp-3`}
            >
              {dataChannel?.description}
            </p>
          )}
        </div>

        {/* Button Section */}
        <div
          className="flex flex-row items-center gap-3 tablet:gap-4 flex-shrink-0 xl:flex-shrink-0
                     w-full xl:w-auto xl:justify-start xl:order-1 xl:flex-wrap xl:gap-3"
        >
          {/* Cancel Button */}
          <button
            className="flex flex-row justify-center items-center px-3 tablet:px-4 xl:px-6 py-2 xl:py-3 gap-2 w-[100px] tablet:w-[110px] xl:w-[120px] h-[36px] tablet:h-[38px] xl:h-12 rounded-[40px] 
                       border-none cursor-pointer transition-all duration-200 flex-none
                       bg-charleston-green-08 hover:bg-charleston-green"
            onClick={closeAutoNext}
          >
            <span className="font-semibold text-xs tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke whitespace-nowrap">
              Hủy
            </span>
          </button>

          {/* Auto Next Button */}
          <button
            className="flex flex-row justify-center items-center px-3 tablet:px-4 xl:px-6 py-2 xl:py-3 gap-2 w-[140px] tablet:w-[150px] xl:w-[178px] h-[36px] tablet:h-[38px] xl:h-12 rounded-[40px] 
                       border-none cursor-pointer relative overflow-hidden transition-all duration-200 flex-none
                       bg-charleston-green-08 hover:bg-charleston-green"
            onClick={handleAutoNext}
          >
            {/* Progress Background with CSS Keyframe Animation */}
            {showAnimation && <div className={styles.progressAnimation} />}

            {/* Play Icon */}
            <div className="relative z-2 w-5 h-5 tablet:w-6 tablet:h-6 flex items-center justify-center">
              <FaPlay className="w-3 h-3 tablet:w-3.5 tablet:h-[18px] text-white-smoke" />
            </div>

            {/* Button Text */}
            <span className="font-semibold text-xs tablet:text-sm xl:text-base leading-[130%] tracking-[0.02em] text-white-smoke flex-none z-2 whitespace-nowrap">
              Tập tiếp theo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoNextVideo;
