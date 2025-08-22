import {
  ChapterList,
  Episode,
  EpisodeTypeEnum,
  getTop10,
  getWatchingChapter,
} from '@/lib/api/vod';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePlayerPageContext } from './PlayerPageContext';
import { useRouter } from 'next/router';
import { BlockItemResponseType } from '@/lib/api/blocks';
import { saveSessionStorage } from '@/lib/utils/storage';
import { trackingStoreKey } from '@/lib/constant/tracking';

type ContextType = {
  currentEpisode?: Episode;
  episodeType?: EpisodeTypeEnum;
  episodeTypeName?: string;
  vodId?: string;
  routerChapterId?: string;
  isFinalEpisode?: boolean;
  nextEpisode?: Episode;
  openEpisodesFullscreen?: boolean;
  setOpenEpisodesFullscreen?: (v: boolean) => void;
  chapterList?: ChapterList;
  setChapterList?: (v: ChapterList) => void;
  top10Data?: BlockItemResponseType;
  setTop10Data?: (v: BlockItemResponseType) => void;
  fetchTop10Done?: boolean;
  setFetchTop10Done?: (v: boolean) => void;
};

const VodPageContext = createContext<ContextType | undefined>(undefined);

VodPageContext.displayName = 'VodPageContext';

export function useVodPageContext(): ContextType {
  const context = useContext(VodPageContext);
  if (!context) {
    return {};
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function VodPageContextProvider({ children }: Props) {
  const [top10Data, setTop10Data] = useState<BlockItemResponseType>({});
  const [openEpisodesFullscreen, setOpenEpisodesFullscreen] = useState(false);
  const [fetchTop10Done, setFetchTop10Done] = useState(false);
  const [chapterList, setChapterList] = useState<ChapterList>({});
  const router = useRouter();
  const { dataChannel } = usePlayerPageContext();

  const episodeType = useMemo(() => {
    if (!dataChannel) return undefined;
    return dataChannel?.episode_type;
  }, [dataChannel]);

  const episodeTypeName = useMemo(() => {
    if (!episodeType) return '';
    switch (episodeType) {
      case EpisodeTypeEnum.SINGLE:
        return 'single';
      case EpisodeTypeEnum.SERIES:
        return 'series';
      case EpisodeTypeEnum.SEASON:
        return 'season';
      default:
        return '';
    }
  }, [episodeType]);

  const vodId = useMemo(() => {
    try {
      const slugs = router?.query?.slug;
      const rawId = Array.isArray(slugs) ? slugs[0] : slugs;
      const videoId = rawId?.split('-').pop();
      return videoId;
    } catch {}
  }, [router]);

  useEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_VOD_ID,
          value: vodId,
        },
      ],
    });
  }, [vodId]);

  const routerChapterId = useMemo(() => {
    try {
      let chapterId = '0';
      const slugs = router?.query?.slug;
      if (Array.isArray(slugs) && slugs[1]) {
        const x = slugs[1].split('-').pop();
        if (typeof x !== 'undefined' && Number(x) >= 1) {
          chapterId = String(Number(x) - 1);
        }
      }
      return chapterId;
    } catch {}
  }, [router]);

  const currentEpisode = useMemo(() => {
    return dataChannel?.episodes?.find(
      (episode) => episode.id === routerChapterId,
    );
  }, [dataChannel, routerChapterId]);

  useEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.CURRENT_EPISODE,
          value: currentEpisode ? JSON.stringify(currentEpisode || {}) : '',
        },
      ],
    });
  }, [currentEpisode]);

  const isFinalEpisode = useMemo(() => {
    let isFinal = false;
    const index = Number(currentEpisode?.id);
    const length = dataChannel?.episodes?.length || 0;
    if (length > 0) {
      isFinal = length - 1 === index;
    }
    return (
      dataChannel?.episode_type === EpisodeTypeEnum.SINGLE ||
      currentEpisode?.is_latest === '1' ||
      isFinal
    );
  }, [dataChannel, currentEpisode]);
  useEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.IS_FINAL_EPISODE,
          value: isFinalEpisode ? '1' : '0',
        },
      ],
    });
  }, [isFinalEpisode]);

  const nextEpisode = useMemo(() => {
    return dataChannel?.episodes?.find(
      (x) => Number(x.id) === Number(routerChapterId) + 1,
    );
  }, [dataChannel, routerChapterId]);

  const getChapter = async () => {
    try {
      if (vodId) {
        if (router.pathname.includes('playlist')) {
          console.log('Get list bookmark Playlist')
        } else {
          const res = await getWatchingChapter({ vodId });
          setChapterList(res?.data?.chapter || {});
        }
      }
    } catch {}
  };

  const getTop10Data = async () => {
    try {
      if (dataChannel?.app_id) {
        const res = await getTop10({ pageSize: 10, vodDetail: dataChannel });
        setTop10Data(res?.data);
      }
    } catch {
      //
    } finally {
      setFetchTop10Done(true);
    }
  };
  useEffect(() => {
    if (vodId) {
      getTop10Data();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel?.app_id]);
  useEffect(() => {
    if (vodId) {
      const tk = localStorage.getItem('token');
      if (tk) {
        getChapter();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vodId]);

  return (
    <VodPageContext.Provider
      value={{
        episodeType,
        episodeTypeName,
        vodId,
        routerChapterId,
        currentEpisode,
        isFinalEpisode,
        nextEpisode,
        openEpisodesFullscreen,
        setOpenEpisodesFullscreen,
        chapterList,
        setChapterList,
        top10Data,
        setTop10Data,
        fetchTop10Done,
      }}
    >
      {children}
    </VodPageContext.Provider>
  );
}

VodPageContextProvider.displayName = 'VodPageContextProvider';
