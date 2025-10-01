/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  BlockItemType,
  BlockSlideItemType,
  PageMetaType,
} from '@/lib/api/blocks';
import { createLink, thumbnailUrl, viToEn } from '@/lib/utils/methods';
import Link from 'next/link';
import HandleImage, { SlideDirectionType } from './HandleImage';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '../container/AppContainer';
import { FaPlay } from 'react-icons/fa';
import useEvent from '@/lib/hooks/useEvent';
import AutoExpansionSlideItem from './AutoExpansionSlideItem';
import { hexToRgbA } from '@/lib/utils/color';
import dynamic from 'next/dynamic';
import styles from './BlockSlideItem.module.css';
import topSlideStyles from './TopSlideItem.module.css';
import PosterOverlay from '../overlays/PosterOverlays';
import { PosterOverlayItem } from '@/lib/utils/posterOverlays/types';
import { NewVodContext } from './embla/new-vod-detail-slider/NewVodDetail';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import useBlock from '@/lib/hooks/useBlock';
import { trackingStoreKey } from '@/lib/constant/tracking';

const VodProgress = dynamic(() => import('../vod/VodProgress'), {
  ssr: false,
});

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  index?: number;
  metaBlock?: PageMetaType;
  styleTitle?: string;
}

export default function BlockSlideItem({
  block,
  slide,
  index,
  styleTitle = 'mt-[8px] mb-0 line-clamp-2 w-full text-[14px] md:text-[16px] font-[500] px-[4px]',
  metaBlock,
}: Props) {
  const { blockIndex } = useBlock({ block });
  const { dataChannel } = usePlayerPageContext();
  const newVodCtx = useContext(NewVodContext);
  const appCtx = useContext(AppContext);
  const {
    checkLive,
    checkDataLive,
    preSecond,
    nextSecond,
    preMin,
    nextMin,
    isShowLiveLabel,
  } = useEvent({
    block,
    slide,
  });
  const { configs } = appCtx;
  const router = useRouter();
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);

  // ----------- Handle Background Labels ------------

  // Background images from configs
  const isLiveBackground = useMemo(() => {
    return configs?.image?.bg_live || '/images/bg_live_default.png';
  }, [configs]);

  const isTimeEventBackground = useMemo(() => {
    return configs?.image?.bg_time_event || '/images/bg_time_event_default.png';
  }, [configs]);

  // -----------------------

  const hasTopRight = false; // custom lại nếu cần

  const hasBottomLeft = useMemo(() => {
    const isEventType = ['event', 'eventtv'].includes(block?.type || '');
    const isLiveTVAndMatchBlock =
      slide?.type === 'livetv' &&
      ['dang-phat-song', 'sap-phat-song'].includes(viToEn(block?.name || ''));
    const isNotHighlight =
      block?.block_type !== 'highlight' &&
      block?.block_type !== 'horizontal_highlight';
    return (isEventType || isLiveTVAndMatchBlock) && isNotHighlight;
  }, [slide, block]);

  const isOverlayPlaylist = useMemo(
    () =>
      slide?.type === 'vod_playlist' && slide?.playlist_total ? true : false,
    [slide],
  );

  const isValidCountdown = useMemo(() => {
    return (
      (preSecond || preSecond || nextSecond || nextMin) &&
      typeof preSecond !== 'undefined' &&
      typeof nextSecond !== 'undefined' &&
      typeof preMin !== 'undefined' &&
      typeof nextMin !== 'undefined'
    );
  }, [preSecond, nextSecond, preMin, nextMin]);

  // Tổng hợp positionLabelsStatus
  const positionLabelsStatus = useMemo(
    () => ({
      TR: Boolean(hasTopRight),
      BL: Boolean(hasBottomLeft || checkLive || isShowLiveLabel),
      BR: Boolean(isOverlayPlaylist),
    }),
    [hasTopRight, hasBottomLeft, checkLive, isShowLiveLabel, isOverlayPlaylist],
  );

  const handlePosterOverlays = useCallback((positionRibbons: string[]) => {
    setPosterOverlaysReady(positionRibbons);
  }, []);

  const blockDirection = useMemo<SlideDirectionType>(() => {
    if (metaBlock?.block_style) {
      if (metaBlock?.block_style === 'numeric_rank') {
        return 'vertical';
      }
      if (metaBlock?.block_style?.toUpperCase().includes('VERTICAL')) {
        return 'vertical';
      }
      return 'horizontal';
    }
    if (block?.block_type === 'numeric_rank') {
      return 'vertical';
    }
    if (block?.block_type?.toUpperCase().includes('VERTICAL')) {
      return 'vertical';
    }
    return 'horizontal';
  }, [block, metaBlock]);
  const slideLink = useMemo(() => {
    if (block?.type === 'trailer') {
      if (blockIndex > -1) {
        const result = `/xem-video/${viToEn(
          dataChannel?.title ||
            dataChannel?.title_vie ||
            dataChannel?.title_origin ||
            '',
        )}-${dataChannel?.id}/tap-${Number(slide?.id_trailer) + 1}`;
        return result?.includes('?') ? `${result}` : `${result}`;
      }
      return `/xem-video/${viToEn(
        dataChannel?.title ||
          dataChannel?.title_vie ||
          dataChannel?.title_origin ||
          '',
      )}-${dataChannel?.id}/tap-${Number(slide?.id_trailer) + 1}`;
    }
    const result = createLink({
      data: slide || {},
      type: block?.type || '',
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, block, dataChannel, blockIndex, index]);

  const linearGradient = useMemo(() => {
    if (!slide?.bg_color || block?.block_type !== 'numeric_rank') {
      return '';
    }
    return `linear-gradient(to bottom, ${hexToRgbA(
      slide?.bg_color || '',
      '0',
    )} 0%, ${hexToRgbA(slide?.bg_color || '', '1')} 45%, ${hexToRgbA(
      slide?.bg_color || '',
      '1',
    )} 100%`;
  }, [slide?.bg_color, block?.block_type]);

  useEffect(() => {
    checkDataLive();

    const interval = setInterval(() => {
      checkDataLive();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, block]);
  if (block?.block_type === 'new_vod_detail') {
    return (
      <AutoExpansionSlideItem
        block={block}
        slide={slide}
        index={(index || 0) + 1}
      />
    );
  }

  const handleItemClick = () => {
    console.log('--- TRACKING handleItemClick', block, slide);
    sessionStorage.setItem(
      trackingStoreKey.APP_MODULE_SCREEN,
      block?.block_type || metaBlock?.block_style || '',
    );
    sessionStorage.setItem(
      trackingStoreKey.APP_MODULE_SUBMENU_ID,
      block?.name || metaBlock?.name || '',
    );
    sessionStorage.setItem(
      trackingStoreKey.IS_RECOMMEND_ITEM,
      slide?.is_recommend ? '1' : '0',
    );

    if (block?.type === 'vod_related') {
      sessionStorage.setItem(trackingStoreKey.SCREEN_ITEM, 'Related');
    }
  };

  return (
    <div
    // className={`${
    //   block?.block_type === 'participant'
    //     ? 'w-[200px] flex justify-center h-[200px]'
    //     : ''
    // }`}
    >
      <Link
        prefetch={false}
        href={slideLink || '#'}
        title={slide?.title_vie || slide?.title}
        className={`relative block w-full  ${
          block?.type === 'vod_related' ||
          block?.type === 'famous_people' ||
          block?.type === 'vod_season' ||
          block?.type === 'trailer'
            ? 'ease-out duration-300  hover:scale-[1.05]'
            : ''
        }`}
        onClick={(ev) => {
          handleItemClick();
          if (block?.block_type === 'auto_expansion') {
            ev.preventDefault(); // Disable navigation
            if (newVodCtx?.setSelectedSlide) {
              newVodCtx.setSelectedSlide(slide || {});
            }
            return;
          }
        }}
      >
        <div
          className={`${
            block?.block_type === 'participant'
              ? 'w-full min-w-full max-w-full relative slide-image-container'
              : 'w-full min-w-full max-w-full relative slide-image-container'
          }`}
        >
          {block?.block_type !== 'participant' && (
            <div className="z-[1] absolute w-full h-full top-0 left-0 bg-black-01 ease-out duration-100 hover:bg-transparent rounded-[16px]"></div>
          )}
          <div
            className={`relative rounded-[12px] ${
              block?.block_type === 'participant'
                ? 'overflow-visible px-[27px] tablet:px-[30px] xl:px-[40px]'
                : `${
                    posterOverlaysReady.includes('top-ribbon')
                      ? 'overflow-visible mt-[3px]'
                      : posterOverlaysReady.includes('mid-ribbon')
                      ? 'overflow-visible ml-[3px] mr-[3px]'
                      : posterOverlaysReady.includes('bottom-ribbon')
                      ? 'overflow-visible mb-[3px]'
                      : 'overflow-hidden'
                  }`
            }`}
            id={`image-slide-${slide?.id}`}
          >
            <HandleImage
              imageAlt={slide?.title_vie || slide?.title || ''}
              imageClassName={`w-full`}
              imageUrl={thumbnailUrl({
                block: block || {},
                blockData: slide || {},
                metaBlock,
                urlRouterPath: router.asPath,
              })}
              type={
                block?.block_type === 'participant' ? 'circle' : blockDirection
              }
              block={block}
              metaBlock={metaBlock}
              slide={slide}
              blockDirection={
                block?.block_type === 'participant' ? 'circle' : blockDirection
              }
              imageRadius="rounded-[12px]"
            />

            {block?.type === 'trailer' && (
              <div className="absolute right-2 bottom-1 py-0.5 px-1 bg-black/40 rounded-[6px] text-[12px] text-white-smoke font-semibold">
                {slide?.detail?.duration_s}
              </div>
            )}

            {/* Poster Overlays Area */}
            {slide?.poster_overlays && (
              <PosterOverlay
                posterOverlays={slide?.poster_overlays as PosterOverlayItem[]}
                blockType={
                  block?.block_type &&
                  String(block?.block_type).trim() !== 'undefined'
                    ? block?.block_type
                    : 'feature_horizontal_slider'
                }
                positionLabelsStatus={[positionLabelsStatus]}
                onHandlePosterOverlays={handlePosterOverlays}
              />
            )}

            {/* Progress bar */}
            {slide?.time_watched && slide?.detail?.duration_i && (
              <div className="w-full absolute left-0 bottom-0 h-[6px] z-2">
                <VodProgress slide={slide} />
              </div>
            )}
          </div>

          {isOverlayPlaylist && (
            <div className="absolute h-[22px] w-fit bottom-[8px] right-[8px] text-[13px] font-[700] whitespace-nowrap overflow-hidden text-white-087">
              {/* Background image layer - chỉ phủ phần text + padding */}
              <div
                className="absolute inset-0"
                style={{
                  background: `url(${isTimeEventBackground}) no-repeat left center / auto 100%`,
                  borderTopRightRadius: '6.29px',
                  borderBottomRightRadius: '6.29px',
                  width: '100%',
                  height: '100%',
                }}
              />
              {/* Text layer - đảm bảo text luôn ở trên */}
              <span className="relative flex items-center justify-center gap-[3.14px] z-1 h-full px-[6.3px] py-[3.14px]">
                <img
                  src="/images/svg/icon_playlist.svg"
                  alt="icon_playlist"
                  className="w-[16px] h-[16px] object-contain"
                />
                <span>{slide?.playlist_total} videos</span>
              </span>
            </div>
          )}

          {block?.block_type !== 'participant' && (
            <div className="play-overlay absolute w-full h-full top-0 left-0 bg-black-transparent flex items-center justify-center opacity-0 duration-200 ease-in">
              <FaPlay size={24} />
            </div>
          )}

          {isShowLiveLabel &&
            (checkLive && !isValidCountdown ? (
              <div className="absolute flex items-center justify-center bottom-[8px] left-[8px] h-[22px] text-[12px] font-bold whitespace-nowrap px-[5px] py-[4px] text-white-087 overflow-hidden rounded-[6px]">
                {/* Background image layer - chỉ phủ phần text + padding */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `url(${isTimeEventBackground}) no-repeat left center / auto 100%`,
                    borderTopRightRadius: '6px',
                    borderBottomRightRadius: '6px',
                    width: '100%',
                    height: '100%',
                  }}
                />
                {/* Text layer - đảm bảo text luôn ở trên */}
                <span className="relative z-1">{checkLive}</span>
              </div>
            ) : (
              <>
                {isValidCountdown ? (
                  <div className="text-[12px] absolute bottom-[6px] left-[6px] inline-flex items-center gap-[6px]">
                    <div className={topSlideStyles.countdown_container}>
                      <div
                        className={topSlideStyles['move-number']}
                        key={`s-${preMin}-${nextMin}`}
                      >
                        <div className="flex items-center justify-center">
                          {preMin}
                        </div>
                        <div className="flex items-center justify-center">
                          {nextMin}
                        </div>
                      </div>
                    </div>
                    <span>:</span>
                    <div className={topSlideStyles.countdown_container}>
                      <div
                        className={topSlideStyles['move-number']}
                        key={`m-${preSecond}-${nextSecond}`}
                      >
                        <div className="flex items-center justify-center">
                          {preSecond}
                        </div>
                        <div className="flex items-center justify-center">
                          {nextSecond}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-[8px] left-[8px] rounded-[6px] font-semibold text-[12px] leading-[100%] text-white overflow-hidden">
                    {slide?.label_event ? (
                      <div className="h-[22px] w-fit flex items-center justify-center text-center whitespace-nowrap px-[5px] py-[4px] rounded-[6px] font-bold">
                        {/* Background image layer - chỉ phủ phần text + padding */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `url(${isLiveBackground}) no-repeat left center / auto 100%`,
                            borderTopRightRadius: '6px',
                            borderBottomRightRadius: '6px',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                        {/* Text layer - đảm bảo text luôn ở trên */}
                        <span className="relative z-1">
                          {slide?.label_event}
                        </span>
                      </div>
                    ) : checkLive ? (
                      <div className="h-[22px] w-fit flex items-center justify-center text-center leading-[100%] text-[12px] font-bold whitespace-nowrap px-[5px] py-[4px] text-white-087 overflow-hidden rounded-[6px]">
                        {/* Background image layer - chỉ phủ phần text + padding */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `url(${isTimeEventBackground}) no-repeat left center / auto 100%`,
                            borderTopRightRadius: '6px',
                            borderBottomRightRadius: '6px',
                            width: '100%',
                            height: '100%',
                          }}
                        />

                        {/* Text layer - đảm bảo text luôn ở trên */}
                        <span className="relative z-1">{checkLive}</span>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </>
            ))}
        </div>

        {block?.block_type === 'numeric_rank' ? (
          <div
            className={`flex flex-col justify-start items-start numeric_rank_overlay absolute w-full  bottom-0 left-0 rounded-[12px] px-[12px] xl:px-[24px] ${styles.numberContainer}`}
            style={{
              background: `${linearGradient}`,
            }}
          >
            <img
              /*@ts-ignore*/
              src={`/images/numeric/${index + 1}.png`}
              alt="index number"
              height={100}
              className="h-[44px] sm:h-[72px] xl:h-[72px]"
            />
            {block?.block_type === 'numeric_rank' && (
              <h3 className="line-clamp-2 w-full text-[16px] font-[500] mb-[8px] tablet:mt-[12px] xl:mt-[16px]">
                {slide?.title_vie || slide?.title}
              </h3>
            )}
          </div>
        ) : (
          ''
        )}
        {(block?.block_type !== 'numeric_rank' &&
          slide?.type !== 'livetv' &&
          slide?.type !== 'page' &&
          block?.block_type !== 'horizontal_slider_with_background' &&
          block?.block_type !== 'category' &&
          block?.block_type !== 'auto_expansion') ||
        router?.pathname.includes('/su-kien/') ? (
          <h3
            className={`${styleTitle} ${
              block?.block_type === 'participant'
                ? `!mt-2 text-center flex flex-col`
                : ''
            }  ${
              block?.block_type === 'numeric_rank'
                ? `absolute w-full px-[24px] !mt-0 ${styles.slideTitle}`
                : ''
            }`}
          >
            <span
              className={`${
                block?.block_type === 'participant' ? 'line-clamp-1' : ''
              }`}
            >
              {slide?.title_vie || slide?.title}
            </span>
          </h3>
        ) : (
          ''
        )}
      </Link>
    </div>
  );
}
