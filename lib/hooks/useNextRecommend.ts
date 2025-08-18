/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { useVodPageContext } from '../components/player/context/VodPageContext';
import { viToEn } from '../utils/methods';
import { BlockSlideItemType } from '../api/blocks';
import { PosterOverlayItem } from '../utils/posterOverlays/types';
import {
  NEXT_RECOMMEND_COUNTDOWN_SECONDS,
  // NEXT_RECOMMEND_SESSION_KEYS, // TODO: Use when tracking is implemented
} from '../constant/texts';
import { getNextVideos } from '../api/vod';
import { getNextVideos as getPlaylistNextVideos } from '../api/playlist';

// Extended interface for API response data
interface ExtendedBlockSlideItemType extends BlockSlideItemType {
  meta_data?: string[];
  detail?: {
    priority_tag?: string;
    meta_data?: string[];
    description?: string;
    country?: string;
    duration_s?: string;
    release?: string;
    category?: string;
    people?: string[];
    price?: string;
    app_force_update?: string;
    duration_i?: string;
    age_rating?: string;
    short_description?: string;
    app_upgrade_file?: string;
    app_latest_version?: string;
  };
}

export interface NextRecommendData {
  _id?: string;
  id?: string;
  title?: string;
  title_vie?: string;
  image?: {
    landscape_title?: string;
    landscape?: string;
  };
  detail?: {
    priority_tag?: string;
    meta_data?: string[];
    description?: string;
    country?: string;
    duration_s?: string;
    release?: string;
  };
  is_trailer?: string;
  type?: string;
  id_trailer?: string;
  poster_overlays?: PosterOverlayItem[];
}

interface UseNextRecommendReturn {
  isVisible: boolean;
  countdown: number;
  recommendData: NextRecommendData | null;
  onWatchNow: () => void;
  onWatchTrailer: () => void;
  onClose: () => void;
}

export const useNextRecommend = (): UseNextRecommendReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(NEXT_RECOMMEND_COUNTDOWN_SECONDS);
  const [apiRecommendData, setApiRecommendData] =
    useState<NextRecommendData | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const {
    streamType,
    isEndVideo,
    dataChannel,
    dataPlaylist,
    previewHandled,
    dataStream,
    videoCurrentTime,
  } = usePlayerPageContext();
  const { isFinalEpisode, vodId } = useVodPageContext();

  // Check if has end_content
  const hasEndContent = useMemo(() => {
    const dataStreamField = dataStream as { end_content?: number };
    return dataStreamField?.end_content && dataStreamField.end_content > 0;
  }, [dataStream]);

  // Check if current time has reached end_content
  const hasReachedEndContent = useMemo(() => {
    const dataStreamField = dataStream as { end_content?: number };
    const endContent = dataStreamField?.end_content;
    const currentTime = videoCurrentTime ?? 0;

    return endContent && currentTime >= endContent;
  }, [dataStream, videoCurrentTime]);

  // Reset cancelled state when URL changes (new episode)
  useEffect(() => {
    setIsCancelled(false);
  }, [router.asPath]);

  // Generate recommend data - ONLY from API, no fallback
  const recommendData = useMemo((): NextRecommendData | null => {
    // Only use API data from next_videos endpoint
    // If API has no data -> don't show NextRecommend
    if (apiRecommendData) {
      return apiRecommendData;
    }

    return null;
  }, [apiRecommendData]);

  // Fetch next videos from API - always fetch when component mounts since parent controls rendering
  useEffect(() => {
    const fetchNextVideos = async () => {
      if (!dataChannel) return;

      try {
        let res;

        // Check if this is a playlist
        if (streamType === 'playlist' && dataPlaylist?.data?.id) {
          // For playlists, use playlist API
          const structureId = dataChannel?.list_structure_id?.[0];
          res = await getPlaylistNextVideos(dataPlaylist.data.id, structureId);

          if (res.data?.data?.[0]) {
            const nextVideo = res.data.data[0];
            setApiRecommendData({
              _id: String(nextVideo.id || ''),
              id: String(nextVideo.id || ''),
              title: nextVideo.title,
              title_vie: nextVideo.title,
              image: {
                landscape_title: nextVideo.landscape,
                landscape: nextVideo.landscape,
              },
              detail: {
                priority_tag: nextVideo.priority_tag,
                meta_data: nextVideo.meta_data || [],
                description: '', // PlayListVideo doesn't have description
                country: '', // PlayListVideo doesn't have country
                duration_s: nextVideo.duration_s,
                release: '', // PlayListVideo doesn't have release
              },
              is_trailer: '', // PlayListVideo doesn't have is_trailer
              type: 'vod_playlist',
              id_trailer: '', // PlayListVideo doesn't have id_trailer
              poster_overlays: [],
            });
          }
        } else if (vodId) {
          // For VODs, use VOD API
          const structureId = dataChannel.structures?.[0];
          res = await getNextVideos({
            vodId,
            structureId,
            pageSize: 1,
            drm: 1,
            isPlaylist: 0,
          });

          if (res.data?.data?.[0]) {
            const nextVideo = res.data.data[0] as ExtendedBlockSlideItemType;
            setApiRecommendData({
              _id: String(nextVideo._id || nextVideo.id || ''),
              id: String(nextVideo.id || nextVideo._id || ''),
              title: nextVideo.title,
              title_vie: nextVideo.title_vie || nextVideo.title,
              image: {
                landscape_title: nextVideo.image?.landscape_title,
                landscape: nextVideo.image?.landscape,
              },
              detail: {
                priority_tag: nextVideo.detail?.priority_tag,
                meta_data:
                  nextVideo.detail?.meta_data || nextVideo.meta_data || [],
                description:
                  nextVideo.detail?.description || nextVideo.description,
                country: nextVideo.detail?.country,
                duration_s: nextVideo.detail?.duration_s,
                release: nextVideo.detail?.release,
              },
              is_trailer: nextVideo.is_trailer,
              type: nextVideo.type || 'vod',
              id_trailer: nextVideo.id_trailer,
              poster_overlays:
                (nextVideo.poster_overlays as PosterOverlayItem[]) || [],
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch next videos:', error);
      }
    };

    if (dataChannel) {
      fetchNextVideos();
    }
  }, [dataChannel, dataPlaylist, streamType, dataStream, vodId]);

  useEffect(() => {
    // For VODs: Only show for final episodes (isFinalEpisode = true)
    const shouldShowForVod =
      streamType === 'vod' &&
      isFinalEpisode && // Only show for final episode
      (hasReachedEndContent || (isEndVideo ?? 0) > 0);

    const shouldShow =
      shouldShowForVod &&
      recommendData &&
      recommendData.title &&
      (recommendData.id || recommendData._id) &&
      !isCancelled &&
      !previewHandled;

    if (shouldShow && !isVisible) {
      setIsVisible(true);
      setCountdown(NEXT_RECOMMEND_COUNTDOWN_SECONDS);
    } else if (isCancelled && isVisible) {
      setIsVisible(false);
    }
  }, [
    streamType,
    isEndVideo,
    recommendData,
    isCancelled,
    isVisible,
    previewHandled,
    isFinalEpisode,
    hasEndContent,
    hasReachedEndContent,
    dataPlaylist,
    router?.query?.slug,
  ]);

  // Auto redirect countdown
  useEffect(() => {
    if (isVisible && recommendData && countdown > 0 && !isCancelled) {
      countdownRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isVisible && recommendData && countdown === 0 && !isCancelled) {
      handleAutoRedirect();
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [isVisible, countdown, recommendData, isCancelled]);

  // Reset cancelled state when video resets or when video is still playing
  useEffect(() => {
    if ((isEndVideo ?? 0) === 0) {
      setIsCancelled(false);
    }
  }, [isEndVideo]);

  // Reset cancelled state when video ends (isEndVideo > 0)
  useEffect(() => {
    if ((isEndVideo ?? 0) > 0) {
      setIsCancelled(false);
    }
  }, [isEndVideo]);

  // Reset cancelled state when video is still playing and hasn't reached end_content
  useEffect(() => {
    const dataStreamField = dataStream as { end_content?: number };
    const endContent = dataStreamField?.end_content;
    const currentTime = videoCurrentTime ?? 0;

    // If video is still playing and hasn't reached end_content, reset cancelled state
    if (endContent && currentTime < endContent) {
      setIsCancelled(false);
    }
  }, [dataStream, videoCurrentTime]);

  // Helper functions
  const generateRecommendLink = (data: NextRecommendData): string => {
    if (!data || !data.title || !(data.id || data._id)) return '/';

    const title = data.title;
    const id = data.id || data._id;

    let linkNextRec: string;

    if (data.type === 'vod_playlist') {
      linkNextRec = `/playlist/${viToEn(title)}-${id}`;
    } else {
      linkNextRec = `/xem-video/${viToEn(title)}-${id}`;
    }

    return linkNextRec;
  };

  const generateTrailerLink = (data: NextRecommendData): string => {
    const { title_vie, title, _id, id_trailer } = data || {};

    if (!(_id && id_trailer && (title_vie || title))) {
      return '/';
    }

    const formattedTitle = viToEn(title_vie || title || '').replace(
      /\s+/g,
      '-',
    );
    const linkTrailer = `/xem-video/${formattedTitle}-${_id}/tap-${
      parseInt(id_trailer.toString()) + 1
    }`;

    return linkTrailer;
  };

  const handleAutoRedirect = () => {
    if (!recommendData) return;

    setIsCancelled(true);
    setIsVisible(false);

    const hasTrailer = recommendData.is_trailer === '1';

    // Logic auto-redirect:
    // - Nếu không có Trailer -> Auto Next qua phim chính ở dataRecommend
    // - Nếu có Trailer -> Auto Next qua Trailer
    const redirectUrl = hasTrailer
      ? generateTrailerLink(recommendData) // Có trailer: đi trailer
      : generateRecommendLink(recommendData); // Không có trailer: đi phim chính

    router.push(redirectUrl);
  };

  const onWatchNow = () => {
    if (!recommendData) return;

    setIsCancelled(true);
    setIsVisible(false);

    const redirectUrl = generateRecommendLink(recommendData);
    router.push(redirectUrl);
  };

  const onWatchTrailer = () => {
    if (!recommendData) return;

    setIsCancelled(true);
    setIsVisible(false);

    const redirectUrl = generateTrailerLink(recommendData);
    router.push(redirectUrl);
  };

  const onClose = () => {
    setIsCancelled(true);
    setIsVisible(false);
  };

  return {
    isVisible,
    countdown,
    recommendData,
    onWatchNow,
    onWatchTrailer,
    onClose,
  };
};
