import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useVodPageContext } from '../player/context/VodPageContext';
import PlayerPlaceholder from '../player/core/PlayerPlaceholder';
import PlayerWrapper from '../player/core/PlayerWrapper';
import ShakaPlayer from '../player/shaka/ShakaPlayer';
import ListEspisodeComponent from './ListEspisodeComponent';
import InforVideoComponent from './InforVideoComponent';
import ErrorComponent from '../error/ErrorComponent';
import CustomImage from '../common/CustomImage';
import { scaleImageUrl } from '@/lib/utils/methods';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import RequirePurchaseVod from '../player/core/RequirePurchaseVod';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { VIDEO_ID } from '@/lib/constant/texts';
import { MaturityRating, EpisodeTypeEnum } from '@/lib/api/vod';
import { WarningData } from '../player/core/SituationWarning';
import { useSkipIntro } from '@/lib/hooks/useSkipIntro';
import { useAutoNextVideo } from '@/lib/hooks/useAutoNextVideo';
import { useWatchAndSkipCredit } from '@/lib/hooks/useWatchAndSkipCredit';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import { useRouter } from 'next/router';
import { setSituationWarningVisible } from '@/lib/hooks/useSituationWarningVisibility';

// Raw warning data from server (with string timestamps)
interface RawWarningData {
  from: string;
  to: string;
  content: string;
}

// Extended dataStream type with warning and skip intro data
interface DataStreamField {
  warning?: RawWarningData[];
  intro_from?: number;
  start_content?: number;
  end_content?: number;
}

const LimitAgeOverlay = dynamic(
  () => import('../player/core/LimitAgeOverlay'),
  {
    ssr: false,
  },
);

const SituationWarning = dynamic(
  () => import('../player/core/SituationWarning'),
  {
    ssr: false,
  },
);

const SkipIntro = dynamic(() => import('../player/core/SkipIntro'), {
  ssr: false,
});

const AutoNextVideo = dynamic(() => import('../player/core/AutoNextVideo'), {
  ssr: false,
});

const WatchAndSkipCredit = dynamic(
  () => import('../player/core/WatchAndSkipCredit'),
  {
    ssr: false,
  },
);

const NextRecommend = dynamic(() => import('../player/core/NextRecommend'), {
  ssr: false,
});

const WatchVideoComponent = () => {
  const {
    isExpanded,
    dataChannel,
    dataStream,
    fetchChannelCompleted,
    requirePurchaseData,
    channelNotFound,
    notFoundError,
    showLoginPlayer,
    videoCurrentTime,
    videoDuration,
    previewHandled,
    dataPlaylist,
    videoHeight,
    queryEpisodeNotExist,
  } = usePlayerPageContext();
  const { viewportType } = useScreenSize();
  const router = useRouter();

  const { isFinalEpisode } = useVodPageContext();
  const { isHeaderAdsClosed } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [adsExist, setAdsExist] = useState(false);

  // State for warning data - only set once when first data arrives
  const [warningData, setWarningData] = useState<WarningData[]>([]);

  useEffect(() => {
    const el = document.getElementById(VIDEO_ID);
    if (el && el instanceof HTMLVideoElement) {
      videoRef.current = el;
    }
  }, []);

  useEffect(() => {
    const currentWarningData = (dataStream as DataStreamField)?.warning;

    if (
      warningData.length === 0 &&
      currentWarningData &&
      currentWarningData.length > 0
    ) {
      // Transform string values to numbers to match WarningData interface
      const transformedWarningData = currentWarningData
        .map(
          (warning: RawWarningData): WarningData => ({
            ...warning,
            from: Number(warning.from),
            to: Number(warning.to),
          }),
        )
        .sort((a, b) => a.from - b.from); // Sort by start time ascending

      setWarningData(transformedWarningData);
    }
  }, [dataStream, warningData.length]);

  // Skip intro hook using context
  const { isVisible: skipIntroVisible, skipIntro } = useSkipIntro(
    (dataStream as DataStreamField)?.start_content ?? 0,
    (dataStream as DataStreamField)?.intro_from ?? 0,
  );

  // Auto next video hook using context
  const { isVisible: autoNextVisible } = useAutoNextVideo();

  // Watch and skip credit hook using context
  const hasNextEpisode =
    dataChannel?.episodes && dataChannel.episodes.length > 1;
  const { watchCredit, skipToNext } = useWatchAndSkipCredit(
    (dataStream as DataStreamField)?.end_content ?? 0,
    hasNextEpisode,
    () => {},
  );

  // NextRecommend logic - only show for final episode or single movie
  const shouldShowNextRecommend = (() => {
    if (!dataChannel) return false;

    // For VOD content
    const isSingleMovie = dataChannel.episode_type === EpisodeTypeEnum.SINGLE;
    const isFinalEpisodeOfSeries =
      (dataChannel.episode_type === EpisodeTypeEnum.SERIES ||
        dataChannel.episode_type === EpisodeTypeEnum.SEASON) &&
      isFinalEpisode;

    // For playlist content - check if we're at the last video
    const isLastVideoOfPlaylist = (() => {
      if (!dataPlaylist?.videos || dataPlaylist.videos.length === 0)
        return false;

      const currentVideoId = router?.query?.slug?.[1]; // Get current video ID from URL
      if (!currentVideoId) return false;

      const currentVideoIndex = dataPlaylist.videos.findIndex(
        (video) => video.id === currentVideoId,
      );

      // If current video is the last one in the playlist
      return currentVideoIndex === dataPlaylist.videos.length - 1;
    })();

    // Check if has end_content for final episode
    const dataStreamField = dataStream as DataStreamField;
    const hasEndContent = Number(dataStreamField?.end_content ?? 0) > 0;
    const isFinalEpisodeWithEndContent = Boolean(
      isFinalEpisode && hasEndContent,
    );

    const result = Boolean(
      isSingleMovie ||
        isFinalEpisodeOfSeries ||
        isLastVideoOfPlaylist ||
        isFinalEpisodeWithEndContent,
    );

    return result;
  })();

  // WatchAndSkipCredit logic - only show when not final episode and has end_content
  const shouldShowWatchAndSkipCredit = (() => {
    if (!dataChannel || !dataChannel.episodes) return false;
    if (dataChannel.episodes.length === 1) return false;

    const dataStreamField = dataStream as DataStreamField;
    const hasEndContent = Number(dataStreamField?.end_content ?? 0) > 0;

    const result = Boolean(
      dataChannel.episodes.length > 1 &&
        !previewHandled &&
        !isFinalEpisode &&
        hasEndContent,
    );

    return result;
  })();

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

  return (
    <div
      className={`${
        isHeaderAdsClosed || isHeaderAdsClosed === null || !adsExist
          ? 'pt-[96px]'
          : 'pt-[16px]'
      }`}
    >
      {channelNotFound ? (
        <div className="f-container">
          <ErrorComponent
            message={notFoundError?.title}
            subMessage={notFoundError?.content}
          />
        </div>
      ) : (
        <>
          {/* Player */}
          <div
            className={`${
              isExpanded
                ? ''
                : viewportType === VIEWPORT_TYPE.DESKTOP
                ? 'f-container'
                : ''
            }`}
          >
            <div
              className={`h-full ${
                isExpanded ? '' : 'xl:grid xl:grid-cols-[1fr_432px]'
              }`}
            >
              {!fetchChannelCompleted ? (
                <div
                  className="w-full col-span-full"
                  style={{
                    height:
                      viewportType === VIEWPORT_TYPE.DESKTOP
                        ? `${
                            videoHeight && videoHeight > 0 ? videoHeight : ''
                          }px`
                        : '',
                  }}
                >
                  <PlayerPlaceholder />
                </div>
              ) : (
                <>
                  <div
                    className={`relative  ${isExpanded ? '' : ''} ${
                      showLoginPlayer &&
                      (!dataChannel?.episodes ||
                      dataChannel?.episodes?.length < 2
                        ? 'col-span-full !pr-0'
                        : '')
                    } ${
                      requirePurchaseData &&
                      (!dataChannel?.episodes ||
                      dataChannel?.episodes?.length < 2
                        ? 'col-span-full !pr-0'
                        : '')
                    } ${viewportType !== VIEWPORT_TYPE.DESKTOP ? '!pr-0' : ''}`}
                    style={{
                      height:
                        viewportType === VIEWPORT_TYPE.DESKTOP
                          ? `${
                              videoHeight && videoHeight > 0 ? videoHeight : ''
                            }px`
                          : '',
                    }}
                  >
                    {showLoginPlayer ? (
                      <div
                        className="relative"
                        style={{
                          height:
                            viewportType === VIEWPORT_TYPE.DESKTOP
                              ? `${
                                  videoHeight && videoHeight > 0
                                    ? videoHeight
                                    : ''
                                }px`
                              : '',
                        }}
                      >
                        <CustomImage
                          src={scaleImageUrl({
                            imageUrl:
                              dataChannel?.image?.landscape ||
                              dataChannel?.image?.landscape_title,
                          })}
                          alt={dataChannel?.name || dataChannel?.title}
                          placeHolder="/images/player_page_placeholder.png"
                          className="mx-auto max-h-full"
                        />
                        <button
                          aria-label="Play"
                          className="hover:cursor-pointer"
                          onClick={() => {
                            dispatch(
                              changeTimeOpenModalRequireLogin(
                                new Date().getTime(),
                              ),
                            );
                          }}
                        >
                          <img
                            src="/images/play_video.png"
                            alt="play video"
                            width={88}
                            height={88}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          />
                        </button>
                      </div>
                    ) : requirePurchaseData ? (
                      <div
                        className=" "
                        style={{
                          height:
                            viewportType === VIEWPORT_TYPE.DESKTOP
                              ? `${
                                  videoHeight && videoHeight > 0
                                    ? videoHeight
                                    : ''
                                }px`
                              : '',
                        }}
                      >
                        <RequirePurchaseVod />
                      </div>
                    ) : (
                      <PlayerWrapper>
                        {fetchChannelCompleted && (
                          <>
                            <ShakaPlayer
                              dataChannel={dataChannel}
                              dataStream={dataStream}
                              queryEpisodeNotExist={queryEpisodeNotExist}
                            />
                            <LimitAgeOverlay
                              maturityRating={
                                dataChannel?.maturity_rating as MaturityRating
                              }
                              videoRef={videoRef.current as HTMLVideoElement}
                              currentTime={videoCurrentTime ?? 0}
                              duration={videoDuration ?? 0}
                            />
                            {warningData && warningData.length > 0 && (
                              <SituationWarning
                                warningData={warningData}
                                onHandleShowSituationWarning={
                                  setSituationWarningVisible
                                }
                              />
                            )}
                            {skipIntroVisible && (
                              <SkipIntro
                                isVisible={skipIntroVisible}
                                onSkip={skipIntro}
                              />
                            )}
                            {autoNextVisible && !previewHandled && (
                              <AutoNextVideo isExpanded={isExpanded ?? false} />
                            )}
                            {shouldShowWatchAndSkipCredit &&
                              !previewHandled && (
                                <WatchAndSkipCredit
                                  endContent={
                                    (dataStream as DataStreamField)
                                      ?.end_content ?? 0
                                  }
                                  hasNextEpisode={hasNextEpisode}
                                  onWatchCredit={watchCredit}
                                  onPlayNext={skipToNext}
                                />
                              )}
                            {shouldShowNextRecommend && !previewHandled && (
                              <NextRecommend isExpanded={isExpanded ?? false} />
                            )}
                          </>
                        )}
                      </PlayerWrapper>
                    )}
                  </div>
                  {(viewportType === VIEWPORT_TYPE.DESKTOP &&
                    dataChannel?.episodes &&
                    dataChannel?.episodes?.length > 1) ||
                  (viewportType === VIEWPORT_TYPE.DESKTOP &&
                    (dataChannel?.episode_type === EpisodeTypeEnum.SERIES ||
                      dataChannel?.episode_type === EpisodeTypeEnum.SEASON)) ? (
                    <div
                      className={`w-full ${
                        isExpanded ? 'hidden' : 'pl-[16px]'
                      }`}
                    >
                      {Number(dataChannel?.episode_type) !== 0 && (
                        <ListEspisodeComponent position="default" />
                      )}
                    </div>
                  ) : dataPlaylist?.videos &&
                    dataPlaylist?.videos?.length > 0 ? (
                    <div
                      className={`w-full ${
                        isExpanded ? 'hidden' : 'pl-[16px]'
                      }`}
                    >
                      <ListEspisodeComponent position="default" />
                    </div>
                  ) : (
                    ''
                  )}
                </>
              )}
            </div>
          </div>

          <div className="f-container mt-[40px]">
            <InforVideoComponent dataVideo={dataChannel} />
          </div>
        </>
      )}
    </div>
  );
};

export default WatchVideoComponent;
