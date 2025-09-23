import styles from './ListEspisode.module.css';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import EpisodeItem from './EpisodeItem';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useVodPageContext } from '../player/context/VodPageContext';
import { useAppSelector } from '@/lib/store';
import { Episode } from '@/lib/api/vod';
import { PlayListVideo } from '@/lib/api/playlist';

interface Props {
  position?: 'default' | 'fullscreen' | 'bottom';
}

const ListEspisodeComponent = ({ position }: Props) => {
  const { dataChannel, dataPlaylist } = usePlayerPageContext();
  const { currentEpisode, openEpisodesFullscreen } = useVodPageContext();
  const { isFullscreen } = useAppSelector((s) => s.player);

  const dataEspisodes = useMemo(() => {
    if (
      dataPlaylist?.videos?.length &&
      dataPlaylist?.videos?.length > 0 &&
      dataPlaylist?.tracking?.content_type === 'vod_playlist'
    ) {
      return dataPlaylist?.videos;
    }

    return dataChannel?.episodes || [];
  }, [
    dataChannel?.episodes,
    dataPlaylist?.tracking?.content_type,
    dataPlaylist?.videos,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isManualPageChange, setIsManualPageChange] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    slidesToScroll: 1,
    loop: false,
    startIndex: 0,
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const episodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const deviceWidth = window.innerWidth;

  const itemsPerPage = 15;
  const totalPages = useMemo(() => {
    return Math.ceil(dataEspisodes.length / itemsPerPage);
  }, [dataEspisodes]);

  // Dynamic episode height calculated from actual DOM element
  const [episodeHeight, setEpisodeHeight] = useState(80);

  // Calculate actual episode height from DOM
  useEffect(() => {
    const calculateEpisodeHeight = () => {
      const firstEpisodeKey = Object.keys(episodeRefs.current)[0];
      const firstEpisodeElement = episodeRefs.current[firstEpisodeKey];

      if (firstEpisodeElement) {
        const actualHeight = firstEpisodeElement.offsetHeight;
        setEpisodeHeight(actualHeight);
      } else {
        // Fallback to responsive values
        setEpisodeHeight(isMobile ? 83 : 80);
      }
    };

    // Calculate on mount and when episodes change
    if (dataEspisodes.length > 0) {
      setTimeout(calculateEpisodeHeight, 100);
    }

    // Recalculate on window resize
    window.addEventListener('resize', calculateEpisodeHeight);
    return () => window.removeEventListener('resize', calculateEpisodeHeight);
  }, [dataEspisodes, isMobile, isFullscreen, position]);

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(deviceWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, [deviceWidth]);

  // Reset states when fullscreen mode changes
  useEffect(() => {
    // Reset manual page change flag when switching between fullscreen modes
    setIsManualPageChange(false);

    // Force recalculation of episode height after a delay when entering fullscreen
    if (isFullscreen && position === 'fullscreen') {
      const timeoutId = setTimeout(() => {
        const firstEpisodeKey = Object.keys(episodeRefs.current)[0];
        const firstEpisodeElement = episodeRefs.current[firstEpisodeKey];

        if (firstEpisodeElement) {
          const actualHeight = firstEpisodeElement.offsetHeight;
          setEpisodeHeight(actualHeight);
        }
      }, 200); // Longer delay to ensure DOM is updated

      return () => clearTimeout(timeoutId);
    }
  }, [isFullscreen, position]);

  // Handle when fullscreen episode list becomes visible
  useEffect(() => {
    if (isFullscreen && position === 'fullscreen' && openEpisodesFullscreen) {
      // Reset states and recalculate when the episode list becomes visible
      setIsManualPageChange(false);

      const timeoutId = setTimeout(() => {
        // Force recalculation of episode height when component becomes visible
        const firstEpisodeKey = Object.keys(episodeRefs.current)[0];
        const firstEpisodeElement = episodeRefs.current[firstEpisodeKey];

        if (firstEpisodeElement) {
          const actualHeight = firstEpisodeElement.offsetHeight;
          setEpisodeHeight(actualHeight);
        }

        // If there's a current episode, update the pagination to show the correct page
        if (currentEpisode && dataEspisodes.length > 0) {
          const episodeIndex = dataEspisodes.findIndex(
            (ep) =>
              ep.id === currentEpisode.id ||
              ep.real_episode_id === currentEpisode.real_episode_id,
          );

          if (episodeIndex !== -1) {
            const pageForEpisode = Math.floor(episodeIndex / itemsPerPage) + 1;
            setCurrentPage(pageForEpisode);
          }
        }
      }, 300); // Even longer delay for visibility transition

      return () => clearTimeout(timeoutId);
    }
  }, [
    openEpisodesFullscreen,
    isFullscreen,
    position,
    currentEpisode,
    dataEspisodes,
    itemsPerPage,
  ]);

  // Auto scroll to current episode on mount
  useEffect(() => {
    if (currentEpisode && dataEspisodes.length > 0) {
      const episodeIndex = dataEspisodes.findIndex(
        (ep) =>
          ep.id === currentEpisode.id ||
          ep.real_episode_id === currentEpisode.real_episode_id,
      );

      if (episodeIndex !== -1) {
        // Update current page based on episode position
        const pageForEpisode = Math.floor(episodeIndex / itemsPerPage) + 1;
        setCurrentPage(pageForEpisode);

        // Scroll to episode within the list container only
        setTimeout(() => {
          if (listRef.current) {
            const container = listRef.current;
            const containerHeight = container.clientHeight;

            // Calculate scroll position using episodeIndex and episodeHeight (mobile-aware)
            // Account for gap-2 (8px) between episodes
            const gapSize = 24;
            const elementTop = episodeIndex * (episodeHeight + gapSize);

            // Calculate scroll position to center the element perfectly
            // Add small offset to compensate for container padding and spacing
            const scrollToPosition =
              elementTop - (containerHeight - episodeHeight) / 2;

            // Scroll within the container only
            container.scrollTo({
              top: Math.max(0, scrollToPosition),
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpisode, dataEspisodes, itemsPerPage]);

  // Scroll listener to update active tab
  const handleScroll = useCallback(
    (event: Event) => {
      // Prevent scroll event from bubbling up to parent containers
      event.stopPropagation();

      if (!listRef.current || isManualPageChange) return;

      const container = listRef.current;
      const containerTop = container.scrollTop;

      // Calculate which episode is fully visible at the top
      // Account for gap-2 (24px) between episodes like in auto scroll
      const gapSize = isMobile ? -20 : -25;
      const fullyVisibleEpisodeIndex = Math.floor(
        containerTop / (episodeHeight + gapSize),
      );

      // Determine which page should be active based on the first episode of each page being fully visible
      let newPage = 1; // Default to first page

      // Check each page to see if its first episode is visible
      for (let page = 1; page <= totalPages; page++) {
        const pageStartIndex = (page - 1) * itemsPerPage;
        // Only activate this page if we've scrolled to or past its first episode

        if (fullyVisibleEpisodeIndex >= pageStartIndex) {
          newPage = page;
        }
      }

      if (newPage !== currentPage && newPage <= totalPages && newPage >= 1) {
        setCurrentPage(newPage);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, totalPages, itemsPerPage, episodeHeight, isManualPageChange],
  );

  // Set up scroll listener
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    // Add a small delay when in fullscreen mode to ensure DOM is ready
    const setupScrollListener = () => {
      container.addEventListener('scroll', handleScroll);
    };

    if (isFullscreen && position === 'fullscreen') {
      // Delay for fullscreen mode to ensure proper DOM setup
      const timeoutId = setTimeout(setupScrollListener, 100);
      return () => {
        clearTimeout(timeoutId);
        container.removeEventListener('scroll', handleScroll);
      };
    } else {
      // Immediate setup for normal mode
      setupScrollListener();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, isFullscreen, position]);

  // Auto-scroll pagination tabs when current page changes
  useEffect(() => {
    if (!emblaApi || isManualPageChange) return;

    // Calculate which tab index should be visible for the current page
    const targetTabIndex = currentPage - 1;
    
    // Get current visible range of the carousel
    const slides = emblaApi.slideNodes();
    const slidesInView = emblaApi.slidesInView();
    
    // Check if the target tab is already visible
    const isTargetVisible = slidesInView.includes(targetTabIndex);
    
    if (!isTargetVisible && slides.length > 0) {
      // Scroll to show the target tab
      emblaApi.scrollTo(targetTabIndex);
    }
  }, [currentPage, emblaApi, isManualPageChange]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      if (!emblaApi) return;
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi]);

  const scrollPrev = () => {
    if (!emblaApi) return;
    emblaApi.scrollTo(Math.max(emblaApi.selectedScrollSnap() - 3, 0));
  };
  const scrollNext = () => {
    if (!emblaApi) return;
    emblaApi.scrollTo(
      Math.min(
        emblaApi.selectedScrollSnap() + 3,
        emblaApi.scrollSnapList().length - 1,
      ),
    );
  };

  // Scroll to specific section when tab is clicked
  const scrollToSection = useCallback(
    (pageNumber: number) => {
      if (!listRef.current) return;

      const startIndex = (pageNumber - 1) * itemsPerPage;

      // Get the actual element to scroll to for more accurate positioning
      const targetEpisodeKey = Object.keys(episodeRefs.current)[startIndex];
      const targetElement = episodeRefs.current[targetEpisodeKey];

      if (targetElement) {
        // Use the actual element position for more accurate scrolling
        const containerRect = listRef.current.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const scrollTop =
          listRef.current.scrollTop + (elementRect.top - containerRect.top);

        listRef.current.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      } else {
        // Fallback to calculated position
        const scrollTop = startIndex * episodeHeight;
        listRef.current.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    },
    [itemsPerPage, episodeHeight],
  );

  const rows = useMemo(() => {
    if (isFullscreen) {
      return dataEspisodes?.length > 15
        ? 'grid-rows-[133px_1fr]'
        : 'grid-rows-[86px_1fr]';
    }
    return dataEspisodes?.length > 15
      ? 'grid-rows-[100px_1fr]'
      : 'grid-rows-[56px_1fr]';
  }, [dataEspisodes, isFullscreen]);

  return (
    <div
      className={`episode-list border border-charleston-green overflow-hidden rounded-[16px] ${
        position !== 'bottom' ? 'h-0 min-h-full grid w-[416px]' : ''
      } ${rows} ${
        isFullscreen && position === 'fullscreen'
          ? '!w-full bg-smoky-black rounded-none'
          : ''
      }`}
    >
      <div
        className={`flex flex-col gap-[16px] bg-eerie-black border-b border-charleston-green p-[24px] ${
          isMobile
            ? `pl-[24px] pt-[32px]`
            : isFullscreen
            ? `pt-[32px] md:w-[520px]`
            : 'xl:w-[416px]'
        } ${
          position === 'default' &&
          dataChannel?.episodes &&
          dataChannel?.episodes?.length < 16
            ? '!py-0 justify-center'
            : ''
        }`}
        style={
          isMobile
            ? isFullscreen
              ? { width: deviceWidth }
              : { width: deviceWidth - 32 }
            : undefined
        }
      >
        <span className="text-[16px] font-[500] tablet:font-[600] tablet:text-[18px]">
          Danh sách phát
        </span>

        {/* PAGINATION CONTROL */}
        {dataEspisodes?.length > 15 ? (
          <div
            className={`relative mb-2 ${
              isFullscreen && position === 'fullscreen'
                ? 'w-full'
                : 'xl:w-[376px]'
            }`}
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-[16px] md:gap-[24px] ">
                {Array.from({ length: totalPages }, (_, i) => {
                  const start = i * itemsPerPage + 1;
                  const end = Math.min(
                    (i + 1) * itemsPerPage,
                    dataEspisodes.length,
                  );
                  return (
                    <button
                      key={i}
                      className={`whitespace-nowrap px-[8px] py-[2px] select-none text-[14px] tablet:text-[16px] font-[500] tablet:font-[600] rounded-[6px] text-center cursor-pointer
                        ${
                          currentPage === i + 1
                            ? 'bg-charleston-green text-white-smoke'
                            : 'text-spanish-gray'
                        } ${currentPage === i + 1 ? '' : 'hover:text-fpl'}`}
                      onClick={() => {
                        setIsManualPageChange(true);
                        setCurrentPage(i + 1);
                        scrollToSection(i + 1);
                        // Reset manual flag after scroll completes
                        setTimeout(() => setIsManualPageChange(false), 1000);
                      }}
                    >
                      {start}-{end}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NÚT ĐIỀU HƯỚNG */}
            {prevBtnEnabled && (
              <button
                onClick={scrollPrev}
                className="flex items-center absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer w-[46px] h-[25px]"
                style={{
                  background:
                    'linear-gradient(to left, rgba(27, 26, 25, 0) 0%, rgba(27, 26, 25, 0.8) 50%, rgba(27, 26, 25, 1) 100%)',
                }}
              >
                <img
                  src="/images/bnk_arrow_right.png"
                  alt="right"
                  className="w-[24px] h-[24px] rotate-180"
                  width={24}
                  height={24}
                />
              </button>
            )}
            {nextBtnEnabled && (
              <button
                onClick={scrollNext}
                className="flex justify-end absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer w-[46px] h-[25px]"
                style={{
                  background:
                    'linear-gradient(to right, rgba(27, 26, 25, 0) 0%, rgba(27, 26, 25, 0.8) 50%, rgba(27, 26, 25, 1) 100%)',
                }}
              >
                <img
                  src="/images/bnk_arrow_right.png"
                  alt="right"
                  className="w-[24px] h-[24px]"
                  width={24}
                  height={24}
                />
              </button>
            )}
          </div>
        ) : (
          ''
        )}
      </div>

      {/* DANH SÁCH VIDEO */}
      <div
        ref={listRef}
        className={`flex flex-col  overflow-auto ${
          styles.espisode_content
        } w-full ${position === 'bottom' ? 'h-[500px]' : 'h-full'}`}
      >
        {dataEspisodes.map(
          (episode: Episode | PlayListVideo, index: number) => (
            <div
              key={`${index}-${episode?.real_episode_id}`}
              ref={(el) => {
                episodeRefs.current[
                  episode?.id || episode?.real_episode_id || ''
                ] = el;
              }}
            >
              <EpisodeItem episode={episode as Episode} />
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default ListEspisodeComponent;
