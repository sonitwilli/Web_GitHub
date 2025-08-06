import { scaleImageUrl, viToEn } from '@/lib/utils/methods';
import CustomImage from '../common/CustomImage';
import { BlockSlideItemType } from '@/lib/api/blocks';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { hexToRgbA } from '@/lib/utils/color';
import PosterOverlays from '../overlays/PosterOverlays';
import { PosterOverlayItem } from '@/lib/utils/posterOverlays/types';

interface Props {
  movie?: BlockSlideItemType;
  index?: number;
}

export default function Top10Item({ movie, index }: Props) {
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);

  const metaDataText = useMemo(() => {
    return movie?.detail?.meta_data?.join('  •  ');
  }, [movie]);

  const linearGradient = useMemo(() => {
    if (!movie?.bg_color) {
      return '';
    }
    return `linear-gradient(to left, ${hexToRgbA(
      movie?.bg_color || '',
      '0',
    )} 0%, ${hexToRgbA(movie?.bg_color || '', '1')} 100%`;
  }, [movie?.bg_color]);

  const positionLabelsStatus = {};

  const handlePosterOverlays = useCallback((positionRibbons: string[]) => {
    setPosterOverlaysReady(positionRibbons);
  }, []);

  return (
    <Link
      href={`/xem-video/${viToEn(movie?.title_vie || movie?.title || '')}-${
        movie?.id
      }`}
      key={movie?.id}
      className="flex items-stretch gap-[16px] cursor-pointer ease-out duration-300 hover:bg-eerie-black rounded-[12px]"
    >
      {/* Thumbnail with ranking number */}
      <div
        className={`relative w-[200px] rounded-[12px] overflow-hidden ${
          posterOverlaysReady.includes('top-ribbon')
            ? 'overflow-visible mt-[3px]'
            : posterOverlaysReady.includes('mid-ribbon')
            ? 'overflow-visible ml-[3px] mr-[3px]'
            : posterOverlaysReady.includes('bottom-ribbon')
            ? 'overflow-visible mb-[3px]'
            : 'overflow-hidden'
        }`}
      >
        <div className="">
          <CustomImage
            src={scaleImageUrl({
              imageUrl:
                movie?.image?.landscape_title || movie?.image?.landscape,
              width: 150,
            })}
            containerClassName="w-full"
            imageRatio="pb-[56.25%]"
            alt={movie?.title}
            placeHolder="/images/player_page_placeholder.png"
            className="rounded-[12px]"
          />
        </div>
        {/* Ranking number overlay */}

        <div
          className="absolute w-1/2 left-0 top-0 h-full bg-gradient-to-l z-[1]"
          style={{
            background: `${linearGradient}`,
          }}
        ></div>
        {/* Poster Overlays Area */}
        {movie?.poster_overlays && (
          <PosterOverlays
            posterOverlays={movie?.poster_overlays as PosterOverlayItem[]}
            blockType={'top_10_detail_vod'}
            positionLabelsStatus={[positionLabelsStatus]}
            onHandlePosterOverlays={handlePosterOverlays}
          />
        )}
        <div className="absolute left-0 bottom-[6px] z-[2]">
          <img
            src={`/images/top-10/${(index || 0) + 1}.png`}
            alt={movie?.title_vie}
            width={54}
            height={44}
          />
        </div>
      </div>

      {/* Movie Info */}
      <div className="flex-1 min-w-0 pr-[16px] flex flex-col justify-center">
        <h3 className="text-white-smoke font-[500] text-[16px] leading-[150%] tracking-[0.32px] mb-[8px] w-full line-clamp-2">
          {movie?.title}
        </h3>
        <p
          className="text-spanish-gray text-[16px] leading-[150%] tracking-[0.32px]"
          dangerouslySetInnerHTML={{
            __html: metaDataText || '',
          }}
        ></p>
      </div>
    </Link>
  );
}
