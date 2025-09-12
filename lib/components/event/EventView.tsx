import dynamic from 'next/dynamic';
import useModalToggle from '@/lib/hooks/useModalToggle';
import { EventDetailExtended } from './EventContainer';
import LiveChat from '../livechat/LiveChat';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import PlayerPlaceholder from '../player/core/PlayerPlaceholder';
import RequirePurchase from '../player/core/RequirePurchase';
import PlayerWrapper from '../player/core/PlayerWrapper';
import ShakaPlayer from '../player/shaka/ShakaPlayer';
import HlsPlayer from '../player/hls/HlsPlayer';
import EventLiveStatus from './EventLiveStatus';
import CountdownTimer from './EventCountdownTimer';
import PlayerEndedLive from '../player/core/PlayerEndedLive';
import { useEffect, useMemo, useState, useRef } from 'react';
import { VIDEO_ID } from '@/lib/constant/texts';
import { MaturityRating } from '@/lib/api/vod';
import { useAppSelector } from '@/lib/store';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import { useDownloadBarControl } from '@/lib/hooks/useDownloadBarControl';
import useCodec from '@/lib/hooks/useCodec';
import React from 'react';
import { isArray } from 'lodash';

const ShareReaction = dynamic(() => import('../reaction/ShareReaction'), {
  ssr: false,
});
const ModalShare = dynamic(() => import('../modal/ModalShare'), { ssr: false });
const PageBlocks = dynamic(() => import('../blocks/PageBlocks'), {
  ssr: false,
});

const LimitAgeOverlay = dynamic(
  () => import('../player/core/LimitAgeOverlay'),
  {
    ssr: false,
  },
);

type Props = {
  dataEvent?: EventDetailExtended;
  eventId?: string;
  type?: 'event' | 'premier';
};

const EventView = ({ dataEvent, eventId }: Props) => {
  const {
    isExpanded,
    fetchChannelCompleted,
    requirePurchaseData,
    isDrm,
    dataChannel,
    dataStream,
    isPrepareLive,
    setIsPrepareLive,
    isEndedLive,
    setIsEndedLive,
    videoCurrentTime,
    videoDuration,
    videoHeight,
    queryEpisodeNotExist,
  } = usePlayerPageContext();
  const { isVideoCodecNotSupported } = useCodec({
    dataChannel,
    dataStream,
    queryEpisodeNotExist,
  });
  const { showModalShare, setShowModalShare } = useModalToggle({});

  const [liveChatHeight, setLiveChatHeight] = useState<string>('');
  const hasScrolledToTopRef = useRef(false);
  const { hideBar } = useDownloadBarControl();
  const { isHeaderAdsClosed } = useAppSelector((state) => state.app);
  const [adsExist, setAdsExist] = useState(false);
  const isOpenLiveChat =
    useAppSelector((s) => s.player.isOpenLiveChat) || false;

  const isEndedLiveCountdown = useAppSelector(
    (s) => s.player.isEndedLiveCountdown,
  );

  // Handle responsive height calculation based on player-wrapper-play-success or player_wrapper DOM changes
  useEffect(() => {
    const updateHeight = () => {
      // Ưu tiên element có class "player-wrapper-play-success", fallback về id "player_wrapper"
      const playerWrapperSuccess = document.querySelector(
        '#player_wrapper video',
      ) as HTMLElement;
      const playerWrapper =
        playerWrapperSuccess || document.getElementById('player_wrapper');
      const isMobileView = window.innerWidth < 640; // tablet breakpoint
      const isTabletView = window.innerWidth < 1280;

      if (isMobileView && !isExpanded) {
        // Mobile: calculate height based on player_wrapper + 80px
        if (playerWrapper) {
          const playerHeight = playerWrapper.offsetHeight;
          const calculatedHeight = `calc(100svh - ${playerHeight + 95}px)`;
          setLiveChatHeight(calculatedHeight);
        } else {
          setLiveChatHeight('calc(100svh - 200px)'); // fallback
        }

        // Only disable scrolling if live chat is open on mobile
        if (isOpenLiveChat) {
          // Scroll to top trước khi disable scroll trên mobile (chỉ thực hiện một lần)
          if (!hasScrolledToTopRef.current) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            hasScrolledToTopRef.current = true;

            // Disable HTML scroll on mobile sau khi scroll
            setTimeout(() => {
              document.documentElement.style.height = '100svh';
              document.documentElement.style.overflow = 'hidden';
              document.body.style.height = '100svh';
              document.body.style.overflow = 'hidden';
            }, 300); // Delay để scroll animation hoàn thành
          } else {
            // Nếu đã scroll rồi thì chỉ disable scroll
            document.documentElement.style.height = '100svh';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.height = '100dvh';
            document.body.style.overflow = 'hidden';
          }
        } else {
          // Re-enable scroll when live chat is closed on mobile
          document.documentElement.style.height = 'auto';
          document.documentElement.style.overflow = '';
          document.body.style.height = 'auto';
          document.body.style.overflow = '';
          hasScrolledToTopRef.current = false;
        }
      } else if (isTabletView) {
        // Tablet and above: fixed 720px height
        setLiveChatHeight('720px');

        // Reset scroll flag khi về desktop để lần sau xuống mobile có thể scroll lại
        hasScrolledToTopRef.current = false;

        // Re-enable HTML scroll on tablet+
        document.documentElement.style.height = 'auto';
        document.documentElement.style.overflow = '';
        document.body.style.height = 'auto';
        document.body.style.overflow = '';
        document.body.style.overflow = '';
      }
      if (isMobileView || isTabletView) {
        if (isOpenLiveChat) {
          hideBar();
        }
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let currentObservedElement: Element | null = null;

    // Setup ResizeObserver cho element được ưu tiên
    const setupObserver = () => {
      // Ưu tiên element có class "player-wrapper-play-success"
      const playerWrapperSuccess = document.querySelector(
        '.player-wrapper-play-success',
      ) as HTMLElement;
      const playerWrapper =
        playerWrapperSuccess || document.getElementById('player_wrapper');

      // Nếu đã observe element này rồi thì không cần setup lại
      if (playerWrapper && playerWrapper === currentObservedElement) {
        return;
      }

      // Disconnect observer cũ nếu có
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (playerWrapper && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          // Debounce to avoid too many calculations
          setTimeout(updateHeight, 50);
        });
        resizeObserver.observe(playerWrapper);
        currentObservedElement = playerWrapper;
      }
    };

    // Setup MutationObserver để theo dõi khi class "player-wrapper-play-success" được thêm
    const setupMutationObserver = () => {
      if ('MutationObserver' in window) {
        mutationObserver = new MutationObserver((mutations) => {
          let shouldResetup = false;

          mutations.forEach((mutation) => {
            if (
              mutation.type === 'attributes' &&
              mutation.attributeName === 'class'
            ) {
              const target = mutation.target as Element;
              if (target.classList.contains('player-wrapper-play-success')) {
                shouldResetup = true;
              }
            }
            // Theo dõi cả khi có element mới được thêm với class này
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (
                    element.classList?.contains(
                      'player-wrapper-play-success',
                    ) ||
                    element.querySelector?.('.player-wrapper-play-success')
                  ) {
                    shouldResetup = true;
                  }
                }
              });
            }
          });

          if (shouldResetup) {
            setTimeout(() => {
              setupObserver();
              updateHeight();
            }, 100);
          }
        });

        // Observe cả document body để catch mọi thay đổi
        mutationObserver.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: ['class'],
        });
      }
    };

    // Initial setup with delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      updateHeight();
      setupObserver();
      setupMutationObserver();
    }, 100);

    // Listen for window resize events
    window.addEventListener('resize', updateHeight);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', updateHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      // Restore scroll when component unmounts
      document.documentElement.style.height = 'auto';
      document.documentElement.style.overflow = '';
      document.body.style.height = 'auto';
      document.body.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isExpanded, isOpenLiveChat, hideBar]); // Chỉ chạy một lần khi component mount

  // Memoize derived values
  const slideFromEvent = useMemo(
    () => ({
      _id: String(eventId ?? ''),
      title: dataEvent?.title ?? '',
      title_vie: dataEvent?.title ?? '',
      description: dataEvent?.description ?? '',
      type: dataEvent?.type,
      is_premier: dataEvent?.is_premier,
      detail: {
        description: dataEvent?.description ?? '',
      },
    }),
    [dataEvent, eventId],
  );

  const isEventPremier = useMemo(
    () =>
      String(dataEvent?.is_premier) === '1' &&
      String(dataEvent?.type) === 'event',
    [dataEvent],
  );
  const isEventFPTLive = useMemo(
    () =>
      String(dataEvent?.is_premier) === '0' &&
      String(dataEvent?.type) === 'event',
    [dataEvent],
  );
  const { isFullscreen } = useAppSelector((s) => s.player);

  useEffect(() => {
    if (isEndedLiveCountdown && (isEventPremier || isEventFPTLive)) {
      setIsEndedLive?.(true);
    }
  }, [isEndedLiveCountdown, isEventPremier, isEventFPTLive, setIsEndedLive]);

  // Extract LimitAgeOverlay rendering
  const renderLimitAgeOverlay = () =>
    isEventPremier && !isVideoCodecNotSupported ? (
      <LimitAgeOverlay
        maturityRating={dataChannel?.maturity_rating as MaturityRating}
        videoRef={
          typeof window !== 'undefined'
            ? (document.getElementById(VIDEO_ID) as HTMLVideoElement)
            : null
        }
        currentTime={videoCurrentTime ?? 0}
        duration={videoDuration ?? 0}
      />
    ) : null;

  const { viewportType } = useScreenSize();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleInitBanner = () => {
      try {
        const ins = document.querySelector('ins[data-aplpm="105-111"]');
        const existedAds = ins
          ? (ins as HTMLElement).children.length > 0
          : false;
        setAdsExist(existedAds);
      } catch {}
    };

    document.addEventListener('initBanner', handleInitBanner);
    return () => {
      document.removeEventListener('initBanner', handleInitBanner);
    };
  }, []);

  useEffect(() => {
    console.log('dataChannel', dataChannel);
  }, [dataChannel]);

  return (
    <>
      <div
        className={`${
          isHeaderAdsClosed || isHeaderAdsClosed === null || !adsExist
            ? 'mt-[96px]'
            : 'mt-4'
        } ${isExpanded ? '' : 'chat-container'}`}
      >
        <div
          className={`${
            isExpanded
              ? ''
              : 'tablet:flex tablet:flex-col mobile:gap-y-4 tablet:gap-y-8 xl:grid xl:grid-cols-[1fr_432px] mb-[16px] xl:mb-[24px] tablet:mb-[40px]'
          }`}
          style={{
            height:
              viewportType === VIEWPORT_TYPE.DESKTOP
                ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
                : '',
          }}
        >
          {!fetchChannelCompleted ? (
            <div
              className="w-full col-span-full"
              style={{
                height:
                  viewportType === VIEWPORT_TYPE.DESKTOP
                    ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
                    : '',
              }}
            >
              <PlayerPlaceholder />
            </div>
          ) : requirePurchaseData && !isPrepareLive ? (
            <div
              className="w-full col-span-full"
              style={{
                height:
                  viewportType === VIEWPORT_TYPE.DESKTOP
                    ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
                    : '',
              }}
            >
              <RequirePurchase />
            </div>
          ) : isPrepareLive ? (
            <div className="w-full col-span-full">
              <CountdownTimer
                startTime={parseInt(
                  dataEvent?.start_time || dataEvent?.begin_time || '0',
                  10,
                )}
                eventId={eventId}
                onEnd={() => setIsPrepareLive?.(false)}
                requirePurchaseData={requirePurchaseData}
              />
            </div>
          ) : (
            <>
              <div
                className={`relative ${isExpanded ? '' : 'xl:pr-[16px]'}`}
                style={{
                  height:
                    viewportType === VIEWPORT_TYPE.DESKTOP
                      ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
                      : '',
                }}
              >
                <PlayerWrapper eventId={eventId}>
                  {isEndedLive ? (
                    <div className="w-full col-span-full">
                      <PlayerEndedLive />
                    </div>
                  ) : (
                    fetchChannelCompleted && (
                      <>
                        {isDrm ? (
                          <>
                            <ShakaPlayer
                              queryEpisodeNotExist={queryEpisodeNotExist}
                              dataChannel={dataChannel}
                              dataStream={dataStream}
                            />
                            {renderLimitAgeOverlay()}
                          </>
                        ) : (
                          <>
                            <HlsPlayer
                              queryEpisodeNotExist={queryEpisodeNotExist}
                              dataChannel={dataChannel}
                              dataStream={dataStream}
                            />
                            {renderLimitAgeOverlay()}
                          </>
                        )}
                      </>
                    )
                  )}
                </PlayerWrapper>
              </div>
              {dataChannel?.comment &&
                dataChannel?.comment_type === 'realtime' &&
                !isFullscreen && (
                  <div
                    className={`ease-out duration-500 sm:mt-6 xl:mt-0 relative z-3 ${
                      !isExpanded ? '' : 'w-0 max-w-0 overflow-hidden h-0'
                    }`}
                    style={{
                      height: !isExpanded ? liveChatHeight : '0px',
                    }}
                  >
                    <LiveChat roomId={eventId || ''} type="event" />
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      <div className="f-container">
        <div className="py-6 w-full h-auto">
          <div className="xl:grid xl:grid-cols-[1fr_432px]">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
              <div className="flex flex-col">
                {dataChannel?.original_logo && dataChannel?.alias_name && (
                  <div className="flex items-center gap-[8px] mb-[16px">
                    <div className="bg-white-smoke rounded-full w-[40px] h-[40px] tablet:w-[48px] tablet:h-[48px] flex items-center justify-center px-[7px]">
                      <img
                        src={dataChannel?.original_logo}
                        alt={dataChannel?.alias_name}
                      />
                    </div>

                    <h3 className="font-[600] text-[18px] xl:text-[20px] leading-[130%] tracking-[0.4px] text-white-smoke">
                      {dataChannel?.alias_name}
                    </h3>
                  </div>
                )}

                <div className="text-[20px] tablet:text-[32px] font-semibold leading-[130%] mb-[16px] xl:mb-[24px] line-clamp-1 overflow-hidden text-ellipsis">
                  {dataEvent?.title}
                </div>

                <div className="mb-[32px] xl:mb-[40px]">
                  <ShareReaction
                    isChannel
                    onClick={() => setShowModalShare(true)}
                  />
                </div>

                {/* Meta Data & Maturity Rating */}
                {(() => {
                  const validMetaData = isArray(dataEvent?.meta_data)
                    ? dataEvent.meta_data.filter(
                        (item: string) =>
                          item && item !== '0' && item.trim() !== '',
                      )
                    : [];
                  const hasValidAdvisories =
                    dataEvent?.maturity_rating?.advisories &&
                    dataEvent.maturity_rating.advisories !== '0' &&
                    dataEvent.maturity_rating.advisories.trim() !== '';

                  if (validMetaData.length === 0 && !hasValidAdvisories) {
                    return null;
                  }

                  return (
                    <div className="mb-[24px]">
                      {/* Meta Data */}
                      {validMetaData.length > 0 && (
                        <div
                          className={`flex items-center ${
                            hasValidAdvisories ? 'mb-[16px]' : ''
                          }`}
                        >
                          {validMetaData.map((item: string, idx: number) => (
                            <React.Fragment key={idx}>
                              <span className="text-spanish-gray font-roboto font-medium text-base leading-[130%] tracking-[0.02em]">
                                {item}
                              </span>
                              {idx < validMetaData.length - 1 && (
                                <span className="text-spanish-gray font-medium flex-shrink-0">
                                  •
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                      {/* Limit Age */}
                      {hasValidAdvisories && (
                        <div className="d-flex items-center">
                          <span className="text-spanish-gray font-roboto font-medium text-base leading-[130%] tracking-[0.02em]">
                            {dataEvent?.maturity_rating?.advisories}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="text-[20px] font-semibold">
                  <EventLiveStatus dataEvent={dataEvent} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-base line-clamp-3 overflow-hidden text-ellipsis">
            {dataEvent?.description}
          </div>
        </div>
      </div>

      {dataEvent?.blocks && (
        <div className="tablet:mt-[40px] tablet:pb-20">
          <PageBlocks blocks={dataEvent.blocks} />
        </div>
      )}

      {showModalShare && (
        <ModalShare
          open={showModalShare}
          onClose={() => setShowModalShare(false)}
          block={{ type: 'highlight' }}
          slide={slideFromEvent}
          isUseRouteLink
        />
      )}
    </>
  );
};

export default EventView;
