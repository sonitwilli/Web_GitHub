'use client';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BlockContext } from './embla/block-slider/EmblaBlockSlider';
import { LibraryContext } from './embla/block-slider/LibrarySlide';
import {
  BlockItemType,
  BlockSlideItemType,
  PageMetaType,
} from '@/lib/api/blocks';
import useScreenSize from '@/lib/hooks/useScreenSize';

export type SlideDirectionType = 'top' | 'vertical' | 'horizontal' | 'circle';

interface Props {
  imageUrl?: string;
  type?: SlideDirectionType;
  imageClassName?: string;
  imageAlt?: string;
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  index?: number;
  metaBlock?: PageMetaType;
  blockDirection?: SlideDirectionType;
  imageRadius?: string;
  isChannel?: boolean;
  imageRatio?: string;
}

export default function HandleImage({
  imageUrl,
  type,
  imageAlt,
  imageClassName,
  blockDirection,
  block,
  imageRadius,
  isChannel,
  imageRatio,
}: Props) {
  const { width } = useScreenSize();
  const blockCtx = useContext(BlockContext);
  const libraryCtx = useContext(LibraryContext);
  const imageRounded = useMemo(() => {
    // if page meta or block type indicates famous people, force circular images
    if (block?.type === 'famous_people') {
      return 'rounded-full';
    }
    if (typeof imageRadius === 'undefined') {
      return 'rounded-[16px]';
    } else {
      return imageRadius;
    }
  }, [imageRadius]);
  const placeHolder = useMemo(() => {
    if (isChannel) {
      return '/images/placeholder_channel.png';
    } else if (type === 'top') {
      if (width < 768) {
        return '/images/default-poster-vertical.jpg';
      }
      return '/images/poster.webp';
    } else if (type === 'horizontal') {
      return '/images/default-poster-horizontal.png';
    } else if (type === 'circle') {
      return '/images/user-avatar.png';
    } else {
      return '/images/default-poster-vertical.jpg';
    }
  }, [type, isChannel, width]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const plhdRef = useRef<HTMLImageElement>(null);
  const animationFrameId = useRef(0);

  useEffect(() => {
    setIsError(false);
    setIsLoaded(false);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  useEffect(() => {
    let t = undefined;
    if (isLoaded) {
      t = setTimeout(() => {
        if (blockCtx?.changeImageHeight && imgRef?.current?.scrollHeight) {
          blockCtx.changeImageHeight(imgRef?.current?.scrollHeight);
        }

        if (libraryCtx?.changeImageHeight && imgRef?.current?.scrollHeight) {
          libraryCtx.changeImageHeight(imgRef?.current?.scrollHeight);
        }
      }, 200);
    }

    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);
  return (
    <div
      className={`nvm nvm-image ${imageRounded} h-0 w-full relative overflow-hidden ${
        imageRatio
          ? imageRatio
          // force square container for famous_people to avoid ellipse
          : block?.type === 'famous_people'
          ? 'pb-[100%] aspect-square mt-2'
          : block?.block_type === 'numeric_rank'
          ? 'pb-[150%]'
          : block?.block_type === 'new_vod_detail'
          ? 'pb-[calc(608_/_1080_*_100%)]'
          : blockDirection === 'horizontal'
          ? 'pb-[56.25%]'
          : blockDirection === 'circle'
          ? 'pb-[100%] !overflow-visible'
          : isChannel
          ? 'pb-[calc(113_/_200_*_100%)]'
          : 'pb-[150%]'
      }`}
    >
      <img
        ref={imgRef}
        src={imageUrl || ''}
        alt={imageAlt || ''}
        className={`${imageClassName} ${
          isError
            ? 'hidden'
            : isLoaded
            ? 'inline absolute w-full h-full top-0 left-0 object-cover'
            : '!max-w-0 !max-h-0'
        } ${
          block?.block_type === 'participant'
            ? 'ease-out duration-300 rounded-full'
            : ''
        }`}
        onLoad={() => {
          animationFrameId.current = requestAnimationFrame(() => {
            setTimeout(() => {
              setIsLoaded(true);
            }, 0);
          });
        }}
        onError={() => setIsError(true)}
        loading="lazy"
      />
      <img
        ref={plhdRef}
        src={placeHolder}
        alt="image placeholder"
        className={`w-full rounded-[8px] ${isLoaded ? 'hidden w-0 h-0' : ''}`}
        original-url={imageUrl}
      />
    </div>
  );
}
