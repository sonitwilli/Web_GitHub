import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import VodRating from '../rating/VodRating';
import { createLink, scaleImageUrl } from '@/lib/utils/methods';
import styles from './BlockHoverItem.module.css';
import VodActionButtons from '../vod/VodActionButtons';
import VodMetaData from '../vod/VodMetaData';
import { MdOutlineVolumeOff, MdOutlineVolumeUp } from 'react-icons/md';
import dynamic from 'next/dynamic';
import { changeIsMutedTrailerPlayer } from '@/lib/store/slices/appSlice';
import { AppContext } from '../container/AppContainer';
import { useRouter } from 'next/router';
import { BlockPlayerTypes } from '@/lib/components/player/hls/BlockPlayer';
import useBlock from '@/lib/hooks/useBlock';
import { MOUSE_CLIENT_X, MOUSE_CLIENT_Y } from '@/lib/constant/texts';
const BlockPlayerShaka = dynamic(
  () => import('@/lib/components/player/hls/BlockPlayerShaka'),
  {
    ssr: false,
  },
);
interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  index?: number;
  children?: React.ReactNode;
}

export default function BlockHoverItem({}: Props) {
  const appCtx = useContext(AppContext);
  const {
    hoveredBlock: block,
    hoveredSlide: slide,
    setHoveredBlock,
    setHoveredSlide,
  } = appCtx;
  const router = useRouter();
  const { isMutedTrailerPlayer } = useAppSelector((s) => s.app);
  const { blockIndex } = useBlock({ block });
  const dispatch = useAppDispatch();
  const slideLink = useMemo(() => {
    const result = createLink({
      data: slide || {},
      type: block?.type || '',
    });
    if (blockIndex > -1) {
      return `${result}?block_index=${blockIndex}`;
    }
    return result || '/';
  }, [slide, block, blockIndex]);
  const [isShowPlayer, setIsShowPlayer] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const vodDetailHighlight = useMemo(() => {
    const dataDetailHighlight = [];
    if (slide?.detail?.priority_tag) {
      dataDetailHighlight.push({
        data: slide.detail.priority_tag,
        color: true,
      });
    }
    if (slide?.detail?.meta_data?.length) {
      slide.detail.meta_data.forEach((element) => {
        dataDetailHighlight.push({
          data: element,
          color: false,
        });
      });
    }
    return dataDetailHighlight;
  }, [slide]);

  const handleOnMouseLeave = () => {
    const hoverItem = document.getElementById('hover_slide_card');
    if (hoverItem) {
      hoverItem.style.opacity = `0`;
      hoverItem.style.zIndex = `-1`;
      hoverItem.style.pointerEvents = `none`;
    }
    if (playerContainerRef.current)
      playerContainerRef.current.classList.remove('!scale-100');

    if (setHoveredBlock && setHoveredSlide) {
      setHoveredBlock({});
      setHoveredSlide({});
    }
    if (window.blockPlayer) {
      const video = window.blockPlayer?.getMediaElement();
      if (video) {
        video.pause();
      }
    }
  };

  const ratingInfo = useMemo(() => {
    return (
      slide?.highlighted_info?.filter((item) => item?.type === 'rating') || []
    );
  }, [slide]);

  const [playerKey, setPlayerKey] = useState(new Date().getTime());

  useEffect(() => {
    let timeoutZoom = undefined;
    let timeout = undefined;
    if (slide?.id) {
      setPlayerKey(new Date().getTime());
      setIsShowPlayer(false);
      if (playerContainerRef?.current) {
        timeoutZoom = setTimeout(() => {
          if (playerContainerRef.current)
            playerContainerRef.current.classList.add('!scale-100');
        }, 500);
      }
      if (slide?.trailer_info?.url) {
        timeout = setTimeout(() => {
          setIsShowPlayer(true);
        }, 1500);
      } else {
        setIsShowPlayer(false);
      }
    } else {
      if (playerContainerRef.current)
        playerContainerRef.current.classList.remove('!scale-100');
    }
    return () => {
      clearTimeout(timeoutZoom);
      clearTimeout(timeout);
    };
  }, [slide]);

  useEffect(() => {
    handleOnMouseLeave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = () => {
    try {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const mouseX = Number(sessionStorage.getItem(MOUSE_CLIENT_X));
        const mouseY = Number(sessionStorage.getItem(MOUSE_CLIENT_Y));
        const inside =
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom;
        if (!inside && window.blockPlayer) {
          const video =
            window.blockPlayer?.getMediaElement() as HTMLVideoElement;
          if (video) {
            video.pause();
          }
          handleOnMouseLeave();
        }
      }
    } catch {}
  };

  return (
    <div
      id="hover_slide_card"
      className={`${styles.hoveredItem} rounded-[16px] absolute top-[50%] left-[50%] w-[354px] shadow-2xs z-[-1] -translate-x-1/2 -translate-y-1/2 opacity-1`}
      onMouseLeave={handleOnMouseLeave}
      ref={cardRef}
    >
      <div
        ref={playerContainerRef}
        className="w-full absolute z-[1] top-0 left-0 ease-out duration-400 scale-0 bg-eerie-black rounded-[16px]"
        style={{
          boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="w-full relative">
          {isShowPlayer && (
            <div className="w-full absolute top-0 left-0 rounded-t-[16px] overflow-hidden h-[215px]">
              <BlockPlayerShaka
                url={slide?.trailer_info?.url}
                isMuted={isMutedTrailerPlayer}
                key={playerKey}
                loop
                type={BlockPlayerTypes.block_slider}
                onError={() => setIsShowPlayer(false)}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          )}
          <img
            key={playerKey}
            src={scaleImageUrl({
              imageUrl:
                slide?.image?.landscape || slide?.image?.landscape_title,
              width: 380,
              height: 214,
            })}
            alt={slide?.title_vie || slide?.title}
            className={`w-[354px] h-[199px] rounded-t-[16px] ${
              isShowPlayer ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {slide?.trailer_info?.url && (
            <button
              aria-label="volume"
              onClick={() => {
                dispatch(changeIsMutedTrailerPlayer(!isMutedTrailerPlayer));
              }}
              className="hover:cursor-pointer w-[40px] h-[40px] rounded-full bg-eerie-black absolute left-[24px] bottom-[16px] flex items-center justify-center"
            >
              {isMutedTrailerPlayer ? (
                <MdOutlineVolumeOff className="text-[24px]" />
              ) : (
                <MdOutlineVolumeUp className="text-[24px]" />
              )}
            </button>
          )}
        </div>

        <div className="bg-eerie-black p-[24px] rounded-b-[16px] block">
          <div className="mb-[24px]">
            <VodActionButtons
              block={block}
              slide={slide}
              slideLink={slideLink}
              type="hovered-slide"
            />
          </div>
          <p className="line-clamp-1 font-[600] text-[20px] mb-[8px] max-w-full">
            {slide?.title_vie || slide?.title}
          </p>

          {ratingInfo && ratingInfo?.length > 0 && (
            <div className="mb-[8px]">
              <VodRating hightlightInfo={ratingInfo[0]} type="hovered-slide" />
            </div>
          )}

          {vodDetailHighlight && vodDetailHighlight.length > 0 ? (
            <div className="flex items-center gap-[2px] md:gap-[6px] mb-[8px]">
              <VodMetaData metaData={vodDetailHighlight} type="hovered-slide" />
            </div>
          ) : (
            ''
          )}

          {slide?.detail?.short_description && (
            <p className="font-[400] line-clamp-3">
              {slide?.detail?.short_description}
            </p>
          )}
        </div>
      </div>

      <div className="w-full relative -z[1] opacity-0 pointer-events-none">
        <div className="w-full relative">
          <img
            key={playerKey}
            src={scaleImageUrl({
              imageUrl:
                slide?.image?.landscape || slide?.image?.landscape_title,
              width: 380,
              height: 214,
            })}
            alt={slide?.title_vie || slide?.title}
            className={`w-[380px] h-[214px] rounded-t-[16px] ease-out duration-2000`}
          />
          {slide?.trailer_info?.url && (
            <button
              aria-label="volume"
              onClick={() => {
                dispatch(changeIsMutedTrailerPlayer(!isMutedTrailerPlayer));
              }}
              className="hover:cursor-pointer w-[40px] h-[40px] rounded-full bg-eerie-black absolute left-[24px] bottom-[16px] flex items-center justify-center"
            >
              {isMutedTrailerPlayer ? (
                <MdOutlineVolumeOff className="text-[24px]" />
              ) : (
                <MdOutlineVolumeUp className="text-[24px]" />
              )}
            </button>
          )}
        </div>
        <div className="bg-eerie-black p-[24px] rounded-b-[16px] block">
          <div className="mb-[24px]">
            <VodActionButtons
              block={block}
              slide={slide}
              slideLink={slideLink}
              type="hovered-slide"
            />
          </div>
          <p className="line-clamp-1 font-[600] text-[20px] mb-[8px] max-w-full">
            {slide?.title_vie || slide?.title}
          </p>

          {ratingInfo && ratingInfo?.length > 0 && (
            <div className="mb-[8px]">
              <VodRating hightlightInfo={ratingInfo[0]} type="hovered-slide" />
            </div>
          )}

          {vodDetailHighlight && vodDetailHighlight.length > 0 ? (
            <div className="flex items-center gap-[2px] md:gap-[6px] mb-[8px]">
              <VodMetaData metaData={vodDetailHighlight} type="hovered-slide" />
            </div>
          ) : (
            ''
          )}

          {slide?.detail?.description && (
            <p className="font-[400] line-clamp-3">
              {slide?.detail?.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
