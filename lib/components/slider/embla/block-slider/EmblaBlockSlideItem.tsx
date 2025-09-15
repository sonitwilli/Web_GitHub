import React, { useContext, useEffect, useMemo, useRef } from 'react';
import {
  BlockItemResponseType,
  BlockItemType,
  BlockSlideItemType,
  PageMetaType,
} from '@/lib/api/blocks';
import BlockSlideItem from '../../BlockSlideItem';
import { MOUSE_CLIENT_X, MOUSE_CLIENT_Y } from '@/lib/constant/texts';
import { AppContext } from '@/lib/components/container/AppContainer';
import { useRouter } from 'next/router';
import { NewVodContext } from '../new-vod-detail-slider/NewVodDetail';

type PropType = {
  slide?: BlockSlideItemType;
  block?: BlockItemType;
  index?: number;
  metaBlock?: PageMetaType;
  blockData?: BlockItemResponseType;
  isInview?: boolean;
};

const EmblaBlockSlideItem: React.FC<PropType> = (props) => {
  const { block, slide, index, metaBlock } = props;
  const appCtx = useContext(AppContext);
  const { selectedSlide } = useContext(NewVodContext);
  const { pathname } = useRouter();
  const isWatchVideoPage = pathname?.startsWith('/xem-video/');
  const isSearchingPage = pathname?.startsWith('/tim-kiem');
  const isValidBlockTypeForHoverCard = useMemo(() => {
    if (isWatchVideoPage) return false;
    if (
      !block?.block_type ||
      block?.block_type === 'participant' ||
      block.block_type === 'auto_expansion' ||
      block?.block_type === 'horizontal_slider_hyperlink' ||
      block.type === 'group_channel' ||
      block.type === 'app_category' ||
      block?.type === 'vod_related' ||
      block?.type === 'category' ||
      block?.id === 'channel'
    )
      return false;
    return block?.block_type !== 'new_vod_detail';
  }, [isWatchVideoPage, block?.block_type, block?.type, block?.id]);
  const slideRef = useRef<HTMLDivElement>(null);
  const slideChildRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const handleMouseEnter = () => {
    if (!isValidBlockTypeForHoverCard) {
      return;
    }

    if (isSearchingPage) return;

    if (appCtx?.setHoveredSlide && appCtx?.setHoveredBlock && slide && block) {
      const blockItem = { ...block, index };
      appCtx.setHoveredBlock(blockItem);
      appCtx.setHoveredSlide(slide);
    }
    timeRef.current = setTimeout(() => {
      if (slideRef.current) {
        const fContainer =
          document.querySelector<HTMLDivElement>('.f-container');
        let pl = 0;
        let pr = 0;
        if (fContainer) {
          const styles = window.getComputedStyle(fContainer);
          pl = parseFloat(styles.paddingLeft);
          pr = parseFloat(styles.paddingRight);
        }
        const clientX = localStorage.getItem(MOUSE_CLIENT_X)
          ? parseInt(localStorage.getItem(MOUSE_CLIENT_X) || '')
          : 0;
        const clientY = localStorage.getItem(MOUSE_CLIENT_Y)
          ? parseInt(localStorage.getItem(MOUSE_CLIENT_Y) || '')
          : 0;
        const rectA = slideRef.current.getBoundingClientRect();
        const isMouseInside: boolean =
          clientX >= rectA.left &&
          clientX <= rectA.right &&
          clientY >= rectA.top &&
          clientY <= rectA.bottom;

        if (!isMouseInside) {
          if (appCtx?.setHoveredSlide && appCtx?.setHoveredBlock) {
            appCtx.setHoveredBlock({});
            appCtx.setHoveredSlide({});
          }
          return;
        }

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const centerAX = rectA.left + rectA.width / 2 + scrollX;
        const centerAY = rectA.top + rectA.height / 2 + scrollY;
        const viewportWidth =
          window.innerWidth -
          (window.innerWidth - document.documentElement.clientWidth);
        const hoverItem = document.getElementById('hover_slide_card');

        if (hoverItem && slideChildRef.current) {
          const childRect = slideChildRef.current.getBoundingClientRect();
          const childRectToRight = Number(
            (viewportWidth - childRect.right).toFixed(0),
          );
          if (childRectToRight === pr) {
            hoverItem.style.left = `unset`;
            hoverItem.style.right = `${pr - 1}px`;
            hoverItem.classList.remove('-translate-x-1/2');
          } else if (childRect.left === pl) {
            hoverItem.style.left = `${pl - 1}px`;
            hoverItem.style.right = `unset`;
            hoverItem.classList.remove('-translate-x-1/2');
          } else {
            hoverItem.classList.add('-translate-x-1/2');
            hoverItem.style.right = `unset`;
            hoverItem.style.left = `${centerAX}px`;
          }
          hoverItem.style.top = `${centerAY}px`;
          hoverItem.style.opacity = `1`;
          hoverItem.style.zIndex = `1`;
          hoverItem.style.pointerEvents = `auto`;
        }
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
    };
  }, [slideRef, timeRef]);

  const getClassName = () => {
    if (!isWatchVideoPage && !isSearchingPage) return 'embla__slide';

    if (block?.block_type === 'participant') {
      // return index === 0 ? 'ml-5' : '';
      return 'embla__slide';
    }

    if (isWatchVideoPage) {
      // return `${
      //   index === 0 ? 'ml-6' : ''
      // } pt-2 pr-4 min-w-[272px] max-w-[272px] transition-all duration-300 hover:scale-105`;
      return 'embla__slide';
    }

    if (isSearchingPage) {
      return `flex-[0_0_51%] md:flex-[0_0_25%] xl:flex-[0_0_16.6667%] pt-2 pr-4 transition-all duration-300 relative hover:scale-105 hover:z-10`;
    }

    return 'embla__slide';
  };

  return (
    <div
      ref={slideRef}
      className={getClassName()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={slideChildRef}
        className={`nvm-${block?.block_type} ${
          block?.block_type === 'auto_expansion' &&
          slide?.id === selectedSlide?.id
            ? 'border-[1px] tablet:border-[2px] xl:border-[3px] border-white rounded-[12px]'
            : block?.block_type === 'auto_expansion' &&
              slide?.id !== selectedSlide?.id
            ? 'border-[1px] tablet:border-[2px] xl:border-[3px] border-transparent rounded-[12px]'
            : ''
        } ${block?.block_type === 'participant' ? '' : ''}`}
      >
        <BlockSlideItem
          block={block}
          slide={slide}
          index={index}
          metaBlock={metaBlock}
        />
      </div>
    </div>
  );
};

export default EmblaBlockSlideItem;
