/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo, useState } from 'react';
import useModalToggle from '@/lib/hooks/useModalToggle';
import dynamic from 'next/dynamic';
import VodRating from '../rating/VodRating';
import ShareReaction from '../reaction/ShareReaction';
import useReaction from '@/lib/hooks/useReaction';
import LikeReaction from '../reaction/LikeReaction';
import HandleLongText from '../actor/HandleLongText';
import { ChannelDetailType } from '@/lib/api/channel';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Top10 from './Top10';
import LiveChat from '../livechat/LiveChat';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import ListEspisodeComponent from './ListEspisodeComponent';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import Categories from './Categories';
import { EpisodeTypeEnum } from '@/lib/api/vod';
import { fetchRatingData, RatingData } from '@/lib/api/video';

const RatingStar = dynamic(() => import('./RatingStart'), {
  ssr: false,
});

const ModalShare = dynamic(() => import('../modal/ModalShare'), {
  ssr: false,
});

const BlockLazyItem = dynamic(() => import('../blocks/BlockLazyItem'), {
  ssr: false,
});

export type HighlightedInfo = {
  count?: string;
  bg_color?: string;
  type?: 'image' | 'rating';
  avg_rate?: string;
  icon?: string;
  content?: string;
};

type PropsVideo = {
  dataVideo?: ChannelDetailType;
};

const desiredOrder = [
  'Diễn viên & Đạo diễn',
  'Trailer - Clip hậu trường',
  'Nội dung liên quan',
];

const InforVideoComponent = (props: PropsVideo) => {
  const { viewportType } = useScreenSize();
  const {
    isExpanded,
    dataChannel,
    streamType,
    dataPlaylist,
    currentPlaylistVideo,
  } = usePlayerPageContext();
  const { dataVideo } = props;
  const { showModalShare, setShowModalShare } = useModalToggle({});
  const slide = useMemo<BlockSlideItemType>(
    /*@ts-ignore*/
    () => {
      // Nếu đang ở playlist page, dùng thông tin playlist để follow (không phải tập hiện tại)
      if (streamType === 'playlist' && currentPlaylistVideo) {
        return {
          ...currentPlaylistVideo,
          highlight_id: currentPlaylistVideo?.id,
          // Giữ lại is_subscribed từ playlist data để follow playlist
          type: currentPlaylistVideo?.type ? currentPlaylistVideo?.type : 'vod',
        };
      }

      // Với các loại khác (VOD, channel, etc.), dùng dataVideo như cũ
      return {
        ...dataVideo,
        highlight_id: dataVideo?.id,
        type: dataVideo?.type ? dataVideo?.type : 'vod',
      };
    },
    [streamType, currentPlaylistVideo, dataVideo],
  );

  const [ratingInfo, setRatingInfo] = useState<RatingData | null>(null);
  const loadRating = async () => {
    const userRating = await fetchRatingData(
      dataVideo?._id || dataVideo?.id || '',
      dataVideo?.ref_id || '',
    );
    if (userRating) {
      setRatingInfo(userRating);
    }
  };
  useEffect(() => {
    if ((dataVideo?._id || dataVideo?.id) && dataVideo?.ref_id && !ratingInfo) {
      loadRating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVideo]);

  const { isLiked, handleReaction } = useReaction({ slide });
  const slideFromVod = {
    _id:
      streamType === 'playlist' && currentPlaylistVideo
        ? currentPlaylistVideo.id
        : dataVideo?._id ?? dataVideo?.id ?? '',
    // slug: currentEpisodeInfo?.slug ?? dataVideo?.slug ?? '',
    title:
      streamType === 'playlist' && currentPlaylistVideo?.title
        ? currentPlaylistVideo.title
        : dataVideo?.title ?? '',
    title_vie:
      streamType === 'playlist' && currentPlaylistVideo?.title
        ? currentPlaylistVideo.title
        : dataVideo?.title ?? '',
    description:
      streamType === 'playlist' && currentPlaylistVideo?.description
        ? currentPlaylistVideo.description
        : dataVideo?.description ?? '',
    detail: {
      description:
        streamType === 'playlist' && currentPlaylistVideo?.description
          ? currentPlaylistVideo.description
          : dataVideo?.description ?? '',
    },
  };

  const highlightInfo = useMemo(() => {
    return (
      dataVideo?.highlighted_info?.filter((item) => item?.type !== 'rating') ||
      []
    );
  }, [dataVideo]);

  const sortedBlocks = useMemo(() => {
    if (!dataVideo?.blocks) return [];

    return dataVideo.blocks.slice().sort((a, b) => {
      const indexA = desiredOrder.indexOf(a.name ?? '');
      const indexB = desiredOrder.indexOf(b.name ?? '');

      const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

      return safeIndexA - safeIndexB;
    });
  }, [dataVideo?.blocks]);

  const actorsBlock = useMemo(() => {
    if (
      !dataVideo?.actors_detail ||
      !dataVideo.actors_detail.length ||
      streamType !== 'playlist'
    )
      return null;
    // Map lại actors_detail sang đúng format participant object mẫu
    const mappedActors = dataVideo.actors_detail.map((actor) => {
      const a = actor as { _id?: string; avatar?: string; vie_name?: string };
      return {
        image: {
          portrait: a.avatar || '',
          landscape_title: '',
          portrait_mobile: '',
          landscape: '',
          title: '',
        },
        auto_profile: 'adaptive_bitrate',
        id: a._id || '',
        title: a.vie_name || '',
      };
    });
    return {
      id: 'actors_detail',
      name: 'Diễn viên & Đạo diễn',
      short_description: '',
      block_type: 'participant',
      type: 'famous_people',
      need_recommend: '0',
      background_image: {
        smarttv: '',
        mobile: '',
        web: '',
      },
      redirect: {
        text: 'Xem thêm',
        type: 'default',
        id: '0',
      },
      custom_data: '',
      data: mappedActors,
    };
  }, [dataVideo?.actors_detail, streamType]);

  const linkVideosBlock = useMemo(() => {
    if (
      !dataVideo?.link_videos ||
      !dataVideo.link_videos.length ||
      streamType !== 'playlist'
    )
      return null;
    return {
      id: 'link_videos',
      name: 'Các Season',
      short_description: '',
      block_type: 'horizontal_slider',
      type: 'season',
      need_recommend: '0',
      background_image: {
        smarttv: '',
        mobile: '',
        web: '',
      },
      redirect: {
        text: 'Xem thêm',
        type: 'default',
        id: '0',
      },
      custom_data: '',
      data: dataVideo.link_videos,
    };
  }, [dataVideo?.link_videos, streamType]);

  const relatedVideosBlock = useMemo(() => {
    if (
      !dataVideo?.related_videos ||
      !dataVideo.related_videos.length ||
      streamType !== 'playlist'
    )
      return null;
    return {
      id: 'related_videos',
      name: 'Nội dung liên quan',
      short_description: '',
      block_type: 'horizontal_slider',
      type: 'vod_related',
      need_recommend: '2',
      background_image: {
        smarttv: '',
        mobile: '',
        web: '',
      },
      redirect: {
        text: 'Xem thêm',
        type: 'default',
        id: '0',
      },
      custom_data: '',
      data: dataVideo.related_videos,
    };
  }, [dataVideo?.related_videos, streamType]);

  // Merge các block đặc biệt vào sortedBlocks
  const allBlocks = useMemo(() => {
    if (streamType === 'playlist') {
      const extras = [actorsBlock, linkVideosBlock, relatedVideosBlock].filter(
        Boolean,
      );

      return [...extras, ...sortedBlocks];
    } else {
      return [...sortedBlocks];
    }
  }, [
    actorsBlock,
    linkVideosBlock,
    relatedVideosBlock,
    streamType,
    sortedBlocks,
  ]);

  const router = useRouter();

  const id = useMemo(() => {
    const slugs = router?.query?.slug;
    let rawId: string | undefined = undefined;
    if (streamType === 'playlist') {
      rawId = Array.isArray(slugs) ? slugs[1] : slugs;
    } else {
      rawId = Array.isArray(slugs) ? slugs[0] : slugs;
    }
    const videoId = rawId?.split('-').pop();
    return videoId;
  }, [router, streamType]);
  // grid grid-cols-[1fr_minmax(416px,_24.3559%)]
  return (
    <div className="InforVideoComponent xl:flex">
      <div className="xl:pr-[80px] xl:w-[calc(100%-416px)]">
        <div className="mb-[16px] xl:mb-[24px]">
          <h1 className="text-white-smoke text-[18px] tablet:text-[20px] xl:text-[32px] font-[600] leading-[130%] tracking-[0.64px] line-clamp-2">
            {/* Hiển thị title của tập hiện tại (cho playlist) hoặc dataVideo (cho VOD) */}
            {streamType === 'playlist' && currentPlaylistVideo?.title
              ? currentPlaylistVideo.title
              : dataVideo?.title_vie}
          </h1>
          {dataVideo?.title_origin && (
            <h2 className="text-white-smoke text-[14px] tablet:text-[16px] xl:text-[18px] font-[500] leading-[130%] line-clamp-2 mt-[8px]">
              {dataVideo?.title_origin}
            </h2>
          )}
        </div>

        {/* Reaction buttons */}
        <div className="flex gap-4 items-center mb-[32px] xl:mb-[40px]">
          <LikeReaction isChannel isActive={isLiked} onClick={handleReaction} />

          <ShareReaction isChannel onClick={() => setShowModalShare(true)} />
        </div>

        {/* Hightligh info */}
        <div className="flex flex-col flex-wrap lg:flex-row lg:justify-between lg:items-center gap-[24px] mb-[24px]">
          <div className="flex gap-3 flex-wrap items-center">
            {highlightInfo?.map((item, index) => (
              <div className="h-[28px]" key={index}>
                <img
                  key={index}
                  /*@ts-ignore*/
                  src={item.content}
                  className=" h-full"
                  alt={`img-${index}`}
                />
              </div>
            ))}

            {ratingInfo && ratingInfo?.content?.[0] && (
              <VodRating
                /*@ts-ignore*/
                hightlightInfo={ratingInfo?.content?.[0]}
              />
            )}

            {ratingInfo && (
              <div className="flex items-center">
                <RatingStar
                  itemId={dataVideo?._id ?? dataVideo?.id ?? ''}
                  refId={dataVideo?.ref_id ?? ''}
                  appId={dataVideo?.app_id ?? ''}
                  totalStars={5}
                  ratingInfo={ratingInfo}
                  loadRating={() => loadRating()}
                />
              </div>
            )}
          </div>
        </div>

        <div className="meta_data mb-[16px] xl:mb-[24px] text-spanish-gray text-[14px] xl:text-[16px]">
          <div className="flex mb-[8px] xl:mb-[12px] gap-[6px] xl:gap-[8px]">
            {dataVideo?.meta_data?.map((meta, index) => (
              <div key={index} className="flex gap-[6px] xl:gap-[8px]">
                <span>{meta}</span>
                <span>
                  {index < (dataVideo.meta_data?.length ?? 0) - 1 && '•'}
                </span>
              </div>
            ))}
          </div>

          <div>{dataVideo?.maturity_rating?.advisories}</div>
        </div>

        {dataVideo?.short_description ? (
          <div className="max-w-full text-[18px] xl:text-[20px] mb-[16px] xl:mb-[24px]">
            <p>{dataVideo?.short_description}</p>
          </div>
        ) : (
          ''
        )}

        <HandleLongText
          text={dataVideo?.description}
          className="HandleLongText max-w-full mb-[16px] xl:mb-[24px]"
        />

        <div className="flex gap-2 text-spanish-gray text-[14px] xl:text-[16px] mb-[16px] xl:mb-[24px]">
          {dataVideo?.genres?.map((genre, index) => (
            <div key={index} className="flex gap-2">
              <span>{genre}</span>
              <span>{index < (dataVideo.genres?.length ?? 0) - 1 && '•'}</span>
            </div>
          ))}
        </div>

        {dataChannel?.category?.length ? (
          <div className="">
            <Categories />
          </div>
        ) : (
          ''
        )}

        {(viewportType !== VIEWPORT_TYPE.DESKTOP &&
          dataChannel?.episodes &&
          dataChannel?.episodes?.length > 1) ||
        (viewportType !== VIEWPORT_TYPE.DESKTOP &&
          dataPlaylist?.videos &&
          dataPlaylist?.videos?.length > 1) ||
        (viewportType !== VIEWPORT_TYPE.DESKTOP &&
          (dataChannel?.episode_type === EpisodeTypeEnum.SERIES ||
            dataChannel?.episode_type === EpisodeTypeEnum.SEASON) &&
          dataChannel?.episodes?.length) ? (
          <div className="ListEspisodeComponent mt-[48px]">
            <ListEspisodeComponent position="bottom" />
          </div>
        ) : (
          ''
        )}

        <div className="vod-details mt-[80px] flex flex-col gap-[56px] tablet:gap-[72px] xl:gap-[80px]">
          {allBlocks?.map((item, index) => (
            <BlockLazyItem
              block={item as BlockItemType}
              useContainer={false}
              key={index}
              isFirstBlock={index === 0}
              isLastBlock={index === (allBlocks?.length || 0) - 1}
            />
          ))}
        </div>

        {viewportType !== VIEWPORT_TYPE.DESKTOP && (
          <div className="mt-[56px] tablet:mt-[69px]">
            <Top10 />
          </div>
        )}

        {dataChannel?.is_comment === '1' && (
          <div className="mt-4">
            <LiveChat roomId={id || ''} type="vod" />
          </div>
        )}
      </div>

      {viewportType === VIEWPORT_TYPE.DESKTOP && (
        <div className="w-[416px] ml-auto flex-1">
          {isExpanded &&
          ((dataChannel?.episodes && dataChannel?.episodes?.length > 1) ||
            (dataPlaylist?.videos && dataPlaylist?.videos?.length > 1) ||
            ((dataChannel?.episode_type === EpisodeTypeEnum.SERIES ||
              dataChannel?.episode_type === EpisodeTypeEnum.SEASON) &&
              dataChannel?.episodes?.length &&
              dataChannel?.episodes?.length > 0)) ? (
            <div className="mb-[72px]">
              <ListEspisodeComponent position="bottom" />
            </div>
          ) : (
            ''
          )}
          <Top10 />
        </div>
      )}

      {showModalShare && (
        <ModalShare
          open={showModalShare}
          onClose={() => setShowModalShare(false)}
          block={{ type: 'vod' }}
          slide={slideFromVod}
          isUseRouteLink
        />
      )}
    </div>
  );
};

export default InforVideoComponent;
