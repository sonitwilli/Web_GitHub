/* eslint-disable jsx-a11y/alt-text */

import { useVodPageContext } from '../context/VodPageContext';
import styles from './NextEpisode.module.css';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { BOOLEAN_TEXTS, HISTORY_TEXT } from '@/lib/constant/texts';
import { usePlayerPageContext } from '../context/PlayerPageContext';

export default function NextEpispode() {
  const router = useRouter();

  const { nextEpisode, routerChapterId } = useVodPageContext();
  const { streamType, nextPlaylistVideo } = usePlayerPageContext();
  const click = useCallback(() => {
    const slugs = router?.query.slug;
    if (streamType === 'playlist') {
      if (Array.isArray(slugs) && slugs[0]) {
        const baseSlug = slugs[0];
        const nextVideoUrl = `${baseSlug}/${nextPlaylistVideo?.id}`;
        router.push(`/playlist/${nextVideoUrl}`);
      }
    } else if (slugs?.length && typeof routerChapterId !== 'undefined') {
      const link = `/xem-video/${slugs[0]}/tap-${Number(routerChapterId) + 2}?${
        HISTORY_TEXT.BOOK_MARK
      }=${BOOLEAN_TEXTS.FALSE}`;
      router.push(link);
    }
  }, [router, routerChapterId, streamType, nextPlaylistVideo]);

  return (
    <div
      className={`c-control-button c-control-button-next-episode ${styles.container}`}
    >
      <div onClick={click}>
        <img
          src="/images/player/skip_next.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      {nextEpisode ? (
        <div
          className={`absolute left-1/2 bottom-[calc(100%_+_28px)] -translate-x-[188px] bg-eerie-black-09 rounded-[12px] p-[16px] ease-out duration-300 opacity-0 -z-[1] ${styles.content} pointer-events-none`}
        >
          <div className="text-white-smoke text-[16px] leading-[130%] tracking-[0.32px] whitespace-nowrap pb-[12px] border-b border-black-olive">
            Tập tiếp theo
          </div>
          <div className="grid grid-cols-[184px_242px] gap-[16px] pt-[16px]">
            <div className="relative">
              <img
                src={nextEpisode?.thumb}
                alt={nextEpisode?.title}
                className="w-full rounded-[8px]"
              />
              {nextEpisode?.duration_s ? (
                <div className="absolute bottom-[4px] right-[4px] bg-smoky-black-07 rounded-[6px] px-[4px] py-[2px] text-white-smoke text-[14px] leading-[150%] tracking-[0.28px]">
                  {nextEpisode?.duration_s}
                </div>
              ) : (
                ''
              )}
            </div>
            <div>
              {nextEpisode?.title ? (
                <div className="mb-[4px] font-[500] text-[18px] w-full leading-[130%] tracking-[0.36px] line-clamp-2 text-white">
                  {nextEpisode?.title}
                </div>
              ) : (
                ''
              )}
              {nextEpisode?.description ? (
                <div className="w-full text-[16px] leading-[130%] tracking-[0.32px] line-clamp-3 text-silver-chalice">
                  {nextEpisode?.description}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      ) : nextPlaylistVideo ? (
        <div
          className={`absolute left-1/2 bottom-[calc(100%_+_28px)] -translate-x-[188px] bg-eerie-black-09 rounded-[12px] p-[16px] ease-out duration-300 opacity-0 -z-[1] ${styles.content} pointer-events-none`}
        >
          <div className="text-white-smoke text-[16px] leading-[130%] tracking-[0.32px] whitespace-nowrap pb-[12px] border-b border-black-olive">
            Tập tiếp theo
          </div>
          <div className="grid grid-cols-[184px_242px] gap-[16px] pt-[16px]">
            <div className="relative">
              <img
                src={nextPlaylistVideo?.landscape}
                alt={nextPlaylistVideo?.title}
                className="w-full rounded-[8px]"
              />
              {nextPlaylistVideo?.duration_s ? (
                <div className="absolute bottom-[4px] right-[4px] bg-smoky-black-07 rounded-[6px] px-[4px] py-[2px] text-white-smoke text-[14px] leading-[150%] tracking-[0.28px]">
                  {nextPlaylistVideo?.duration_s}
                </div>
              ) : (
                ''
              )}
            </div>
            <div>
              {nextPlaylistVideo?.title ? (
                <div className="mb-[4px] font-[500] text-[18px] w-full leading-[130%] tracking-[0.36px] line-clamp-2 text-white">
                  {nextPlaylistVideo?.title}
                </div>
              ) : (
                ''
              )}
              {nextPlaylistVideo?.description ? (
                <div className="w-full text-[16px] leading-[130%] tracking-[0.32px] line-clamp-3 text-silver-chalice">
                  {nextPlaylistVideo?.description}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
