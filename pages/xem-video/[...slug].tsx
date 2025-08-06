import { getVodDetail, getVodHistory } from '@/lib/api/vod';
import PlayerPageContextWrapper from '@/lib/components/player/context/PlayerPageContextWrapper';
import { VodPageContextProvider } from '@/lib/components/player/context/VodPageContext';
import WatchVideoComponent from '@/lib/components/watch-video/WatchVideoComponent';
import { ROUTE_PATH_NAMES } from '@/lib/constant/texts';
import { SOURCE_PROVIDER } from '@/lib/constant/texts';
import DefaultLayout from '@/lib/layouts/Default';
import { changeHistoryData } from '@/lib/store/slices/vodSlice';
import { createSeoPropsFromVodData } from '@/lib/utils/seo';
import { SeoProps } from '@/lib/components/seo/SeoHead';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

function VodPageContent() {
  return (
    <DefaultLayout>
      <WatchVideoComponent />
    </DefaultLayout>
  );
}

export default function VodPage() {
  const router = useRouter();
  const [fetchHistoryDone, setFetchHistoryDone] = useState(false);
  const dispatch = useDispatch();
  const fetchHistory = async () => {
    try {
      const slugs = router?.query?.slug;
      let chapterId = '-1';
      if (Array.isArray(slugs) && slugs[1]) {
        const x = slugs[1].split('-').pop();
        if (typeof x !== 'undefined' && Number(x) >= 1) {
          chapterId = String(Number(x) - 1);
        }
      }
      const rawId = Array.isArray(slugs) ? slugs[0] : slugs;
      const videoId = rawId?.split('-').pop();
      const history = await getVodHistory({
        vodId: videoId || '',
        chapterId,
      });
      dispatch(changeHistoryData(history?.data));
      // Deeplink không có /tap-n: có check history và bookmark -
      // https://jira.fptplay.net/browse/WEB-1826
      // route ko có /tap-n thì redirect
      if (
        slugs &&
        !slugs[1] &&
        chapterId === '-1' &&
        Number(history?.data?.chapter_id) > 0 &&
        Array.isArray(slugs)
      ) {
        const basePath = slugs?.join('/');
        const episodeNumber = Number(history?.data?.chapter_id) + 1;
        await router.push(`/xem-video/${basePath}/tap-${episodeNumber}`);
      } else {
        setFetchHistoryDone(true);
      }
    } catch {
      setFetchHistoryDone(true);
    } finally {
      setFetchHistoryDone(true);
    }
  };

  const fetchPlaylistHistory = async () => {
    try {
      const slugs = router?.query?.slug;
      const rawId = Array.isArray(slugs) ? slugs[0] : slugs;
      const videoId = rawId?.split('-').pop();
      const chapterId = '-1';

      const history = await getVodHistory({
        vodId: videoId || '',
        chapterId,
      });

      if (history && history?.data?.movie_id !== videoId) {
        const episodeHistory = history?.data?.movie_id;
        const targetPath = `/playlist/${videoId}/${episodeHistory || ''}`;
        await router.push(targetPath);
        setFetchHistoryDone(true);
      } else {
        setFetchHistoryDone(true);
      }
    } catch {
      setFetchHistoryDone(true);
    } finally {
      setFetchHistoryDone(true);
    }
  };

  useEffect(() => {
    if (router?.isReady) {
      if (router?.pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)) {
        fetchPlaylistHistory();
      } else {
        fetchHistory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  if (!fetchHistoryDone) {
    return null;
  }

  return (
    <PlayerPageContextWrapper>
      <VodPageContextProvider>
        <VodPageContent />
      </VodPageContextProvider>
    </PlayerPageContextWrapper>
  );
}

// Create fallback SEO props for video pages
const createFallbackSeoProps = (slug?: string, pathname?: string) => {
  return createSeoPropsFromVodData(
    null,
    slug || pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)
      ? 'fpt-play-playlist'
      : 'fpt-play-video',
    pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)
      ? 'FPT Play - Xem playlist online'
      : 'FPT Play - Xem video online',
    pathname?.includes(ROUTE_PATH_NAMES.PLAYLIST)
      ? 'Xem playlist video chất lượng cao trên FPT Play'
      : 'Xem video chất lượng cao trên FPT Play',
  );
};

export const getServerSideProps = (async ({ params, resolvedUrl }) => {
  let vodId = '';
  const slugs = params?.slug || [];

  if (slugs && slugs?.length) {
    vodId = slugs[0].split('-')?.pop() || '';
  }

  const isGlPage = resolvedUrl?.includes(SOURCE_PROVIDER.GALAXY_PLAY);
  if (isGlPage) {
    const fallbackSeoProps = createSeoPropsFromVodData(
      null,
      vodId || 'galaxy-play',
      'FPT Play - Xem video online',
      'Xem video chất lượng cao trên FPT Play',
    );
    return { props: { key: new Date().getTime(), seoProps: fallbackSeoProps } };
  }
  if (vodId) {
    try {
      const channelRes = await getVodDetail({
        vodId: vodId || '',
      });

      const vodSeoData = channelRes?.data?.data?.seo;
      const vodTitle = channelRes?.data?.data?.title;
      const vodDescription = channelRes?.data?.data?.description;
      const vodImage = channelRes?.data?.data?.image?.landscape_title;

      const seoProps = createSeoPropsFromVodData(
        vodSeoData,
        slugs[0],
        vodTitle ? vodTitle : undefined,
        vodDescription || undefined,
        vodImage,
      );

      if (
        channelRes?.data?.data?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
      ) {
        const link = `/galaxy-play/${resolvedUrl}`;
        return {
          redirect: {
            destination: link,
            permanent: false,
          },
          props: { key: new Date().getTime(), seoProps },
        };
      } else {
        return { props: { key: new Date().getTime(), seoProps } };
      }
    } catch {
      const { pathname } = useRouter();
      const fallbackSeoProps = createFallbackSeoProps(vodId, pathname);
      return {
        props: { key: new Date().getTime(), seoProps: fallbackSeoProps },
      };
    }
  } else {
    const fallbackSeoProps = createFallbackSeoProps();
    return { props: { key: new Date().getTime(), seoProps: fallbackSeoProps } };
  }
}) satisfies GetServerSideProps<{ key: number; seoProps?: SeoProps }>;
