import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { ChannelDetailType } from '../api/channel';
import { Episode } from '../api/vod';
import {
  IS_NEXT_MOVIE,
  IS_NEXT_TRAILER,
  IS_NEXT_FROM_PLAYER,
  ROUTE_PATH_NAMES,
  HISTORY_TEXT,
  BOOLEAN_TEXTS,
} from '../constant/texts';
import { viToEn } from '../utils/methods';
import { trackingNextMovieLog55 } from './useTrackingPlayback';

export type ContentType = 'vod' | 'channel' | 'event' | 'premiere' | 'playlist';

interface UseNextEpisodeNavigationProps {
  currentChannel?: ChannelDetailType;
  nextEpisode?: Episode;
  contentType?: ContentType;
  routerChapterId?: string;
}

interface UseNextEpisodeNavigationReturn {
  generateNextEpisodeUrl: () => string | null;
  navigateToNextEpisode: () => void;
  canNavigateNext: boolean;
}

export const useNextEpisodeNavigation = ({
  currentChannel,
  nextEpisode,
  contentType,
  routerChapterId,
}: UseNextEpisodeNavigationProps = {}): UseNextEpisodeNavigationReturn => {
  const router = useRouter();

  // Determine content type from current route if not provided
  const getContentType = useCallback((): ContentType => {
    if (contentType) return contentType;

    const { pathname } = router;
    if (pathname?.includes(ROUTE_PATH_NAMES.CHANNEL)) {
      return 'channel';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.VOD)) {
      return 'vod';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.EVENT)) {
      return 'event';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.PREMIERE)) {
      return 'premiere';
    }
    if (pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)) {
      return 'playlist';
    }
    return 'vod'; // default
  }, [contentType, router]);

  // Generate URL for next episode
  const generateNextEpisodeUrl = useCallback((): string | null => {
    const type = getContentType();

    switch (type) {
      case 'vod': {
        if (!nextEpisode || routerChapterId === undefined) return null;

        const slugs = router?.query?.slug;
        if (!slugs?.length) return null;

        if (router?.pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)) {
          if (!nextEpisode?.id) return null;

          // Playlist URL pattern: /playlist/{playlist-slug}/{video-id}
          const baseSlug = Array.isArray(slugs) ? slugs[0] : slugs;
          return `${ROUTE_PATH_NAMES.PLAYLIST}${baseSlug}/${nextEpisode.id}`;
        }

        // VOD URL pattern: /xem-video/{slug}/tap-{episode_number}
        const baseSlug = Array.isArray(slugs) ? slugs[0] : slugs;
        const nextEpisodeNumber = Number(routerChapterId) + 2; // +1 for next episode, +1 for 1-based indexing
        return `${ROUTE_PATH_NAMES.VOD}${baseSlug}/tap-${nextEpisodeNumber}`;
      }

      case 'channel': {
        if (!nextEpisode?.id) return null;
        // Live TV URL pattern: /xem-truyen-hinh/{id}
        return `${ROUTE_PATH_NAMES.CHANNEL}${nextEpisode.id}`;
      }

      case 'event': {
        if (!currentChannel?.title && !nextEpisode?.title) return null;
        const title = nextEpisode?.title || currentChannel?.title || '';
        const id = nextEpisode?.id || currentChannel?._id || currentChannel?.id;
        if (!id) return null;

        // Event URL pattern: /su-kien/{slug}-{id}
        const slug = viToEn(title);
        return `${ROUTE_PATH_NAMES.EVENT}${slug}-${id}`;
      }

      case 'premiere': {
        if (!currentChannel?.title && !nextEpisode?.title) return null;
        const title = nextEpisode?.title || currentChannel?.title || '';
        const id = nextEpisode?.id || currentChannel?._id || currentChannel?.id;
        if (!id) return null;

        // Premiere URL pattern: /cong-chieu/{slug}-{id}
        const slug = viToEn(title);
        return `${ROUTE_PATH_NAMES.PREMIERE}${slug}-${id}`;
      }

      case 'playlist': {
        if (!nextEpisode?.id) return null;

        const slugs = router?.query?.slug;
        if (!slugs?.length) return null;

        // Playlist URL pattern: /playlist/{playlist-slug}/{video-id}
        const baseSlug = Array.isArray(slugs) ? slugs[0] : slugs;
        return `${ROUTE_PATH_NAMES.PLAYLIST}${baseSlug}/${nextEpisode.id}`;
      }

      default:
        return null;
    }
  }, [getContentType, nextEpisode, routerChapterId, router, currentChannel]);

  // Check if navigation is possible
  const canNavigateNext = useCallback((): boolean => {
    const url = generateNextEpisodeUrl();
    return url !== null;
  }, [generateNextEpisodeUrl]);

  // Navigate to next episode
  const navigateToNextEpisode = useCallback(() => {
    // TODO: check duplicate navigateToNextEpisode run twice
    const url = generateNextEpisodeUrl();
    if (!url) return;

    // Set session storage for tracking
    if (typeof sessionStorage !== 'undefined') {
      // Check if next episode is trailer
      const episodeWithTrailer = nextEpisode as Episode & {
        is_trailer?: boolean | string;
      };

      if (
        episodeWithTrailer?.is_trailer === true ||
        episodeWithTrailer?.is_trailer === '1'
      ) {
        sessionStorage.setItem(IS_NEXT_TRAILER, 'NextTrailer');
      } else {
        sessionStorage.setItem(IS_NEXT_MOVIE, 'NextMovie');
      }
      sessionStorage.setItem(IS_NEXT_FROM_PLAYER, 'NextFromPlayer');
    }
    trackingNextMovieLog55();
    // Navigate to the next episode
    router.push(`${url}?${HISTORY_TEXT.BOOK_MARK}=${BOOLEAN_TEXTS.FALSE}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateNextEpisodeUrl]);

  return {
    generateNextEpisodeUrl,
    navigateToNextEpisode,
    canNavigateNext: canNavigateNext(),
  };
};

// Utility function to create navigation from episode data
export const createEpisodeNavigationUrl = (
  episode: Episode,
  channel: ChannelDetailType,
  type: ContentType = 'vod',
): string | null => {
  switch (type) {
    case 'vod': {
      if (!episode?.id || !channel?.id) return null;
      const title = channel.title || '';
      const slug = viToEn(title);
      const episodeNumber = Number(episode.id) + 1; // Convert to 1-based indexing
      return `${ROUTE_PATH_NAMES.VOD}${slug}-${channel.id}/tap-${episodeNumber}`;
    }

    case 'channel': {
      const id = episode.id || channel._id || channel.id;
      if (!id) return null;
      return `${ROUTE_PATH_NAMES.CHANNEL}${id}`;
    }

    case 'event': {
      const title = episode.title || channel.title || '';
      const id = episode.id || channel._id || channel.id;
      if (!id) return null;
      const slug = viToEn(title);
      return `${ROUTE_PATH_NAMES.EVENT}${slug}-${id}`;
    }

    case 'premiere': {
      const title = episode.title || channel.title || '';
      const id = episode.id || channel._id || channel.id;
      if (!id) return null;
      const slug = viToEn(title);
      return `${ROUTE_PATH_NAMES.PREMIERE}${slug}-${id}`;
    }

    case 'playlist': {
      const title = episode.title || channel.title || '';
      const id = episode.id || channel._id || channel.id;
      if (!id) return null;
      const slug = viToEn(title);
      return `${ROUTE_PATH_NAMES.PLAYLIST}${slug}-${id}`;
    }

    default:
      return null;
  }
};

export default useNextEpisodeNavigation;
