import { Episode } from '@/lib/api/vod';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useVodPageContext } from '../player/context/VodPageContext';
import CustomImage from '../common/CustomImage';
import { scalePosterOverlayUrl, scaleImageUrl } from '@/lib/utils/methods';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useAppSelector } from '@/lib/store';

type PropsEspisodes = {
  episode?: Episode;
};

const EpisodeItem = (props: PropsEspisodes) => {
  const { routerChapterId, chapterList } = useVodPageContext();
  const { dataChannel } = usePlayerPageContext();
  const router = useRouter();
  const { episode = {} } = props;
  const [isImageError, setIsImageError] = useState(false);
  const { isFullscreen } = useAppSelector((s) => s.player);

  const link = useMemo(() => {
    const { slug } = router.query;
    if (!slug) {
      return '';
    }
    if (episode?.tracking?.content_type === 'vod_playlist') {
      return `${slug[0]}/${episode?.id}`;
    }
    const x = `${slug[0]}/tap-${Number(episode?.id || 0) + 1}`;
    return x;
  }, [episode, router.query]);

  const isIsSelected = useMemo(() => {
    if (typeof episode?.id === 'undefined') {
      return false;
    }
    const cur = Number(routerChapterId);

    if (episode?.tracking?.content_type === 'vod_playlist') {
      if (router.query?.slug?.[1] === episode?.id) {
        return true;
      } else if (dataChannel?._id === episode?.id) {
        return true;
      }
    }

    return cur === Number(episode?.id);
  }, [episode, routerChapterId, router.query, dataChannel]);

  const watchingItem = useMemo(() => {
    return chapterList?.items?.find((x) => x.chapter_id == episode.id);
  }, [episode, chapterList]);

  return (
    <Link
      href={link}
      className={`min-h-[96px] flex gap-4 px-4 py-3 hover:bg-white/3 cursor-pointer ${
        isIsSelected ? 'bg-white/3' : ''
      } ${isFullscreen ? 'px-[24px] py-[16px]' : ''}`}
    >
      <div className="rounded-[8px] overflow-hidden w-[128px] relative min-w-[128px]">
        <CustomImage
          src={
            scaleImageUrl({
              imageUrl: episode?.thumb || episode?.landscape,
              width: 128,
            })
          }
          containerClassName="w-full"
          imageRatio="pb-[56.25%]"
          alt={episode.thumb || episode.landscape}
          placeHolder="/images/player_page_placeholder.png"
          className="rounded-[8px]"
        />
        {isIsSelected ? (
          <img
            src="/images/active_channel.gif"
            alt="active"
            className="absolute bottom-[4px] right-[4px]"
            width={24}
            height={24}
          />
        ) : (
          <div
            className="absolute flex items-center py-[2px] px-[4px] justify-center text-[12px]
                bottom-[4px] right-[4px] bg-black/40 rounded-[6px] font-semibold"
          >
            {episode.duration_s}
          </div>
        )}

        {episode?.is_vip && episode?.ribbon_episode && (
          <div className="absolute top-[4px] left-[4px] h-[15px] flex items-center">
            <img
              src={scalePosterOverlayUrl({
                imageUrl: episode.ribbon_episode,
                height: 15,
              })}
              alt="ribbon_episode"
              className={isImageError ? 'hidden' : 'h-full object-contain'}
              onError={() => setIsImageError(true)}
            />
          </div>
        )}

        {watchingItem?.duration && watchingItem?.timeplayed && (
          <div className="absolute w-full bg-white-04 h-[2px] left-0 bottom-0">
            <div
              className="absolute w-full bg-fpl h-[2px] left-0 bottom-0"
              style={{
                width: `${
                  (watchingItem?.timeplayed / watchingItem?.duration) * 100
                }%`,
              }}
            ></div>
          </div>
        )}
      </div>
      <div className={`flex flex-col justify-center`}>
        <p className="text-base font-semibold line-clamp-2 w-full">
          {episode.title}
        </p>
        {episode?.description && (
          <p className="text-[14px] 2xl:text-base text-spanish-gray line-clamp-1 w-full mt-[8px]">
            {episode.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default EpisodeItem;
