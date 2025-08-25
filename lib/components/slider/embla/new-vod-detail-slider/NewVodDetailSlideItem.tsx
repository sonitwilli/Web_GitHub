import { BlockItemType, BlockSlideItemType } from "@/lib/api/blocks";
import { createLink, scaleImageUrl } from "@/lib/utils/methods";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import HandleImage from "../../HandleImage";
import VodHighlightInfo from "@/lib/components/vod/VodHighlightInfo";
import VodMetaData from "@/lib/components/vod/VodMetaData";
import VodActionButtons from "@/lib/components/vod/VodActionButtons";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import useBlockPlayer from "@/lib/hooks/useBlockPlayer";
import { changeIsMutedTrailerPlayer } from "@/lib/store/slices/appSlice";
import { BlockPlayerTypes } from "@/lib/components/player/hls/BlockPlayerShaka";
import PosterOverlays from "@/lib/components/overlays/PosterOverlays";
import { PosterOverlayItem } from "@/lib/utils/posterOverlays/types";
import { NewVodContext } from "./NewVodDetail";
import dynamic from "next/dynamic";
const BlockPlayerShaka = dynamic(
  () => import("@/lib/components/player/hls/BlockPlayerShaka"),
  {
    ssr: false,
  }
);
interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}

export default function NewVodDetailSlideItem({ slide, block }: Props) {
  const newVodCtx = useContext(NewVodContext);
  const dispatch = useAppDispatch();
  const { isMutedTrailerPlayer } = useAppSelector((s) => s.app);
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
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

  const slideLink = useMemo(() => {
    return createLink({ data: slide || {}, type: block?.type || "" }) || "/";
  }, [slide, block]);

  const generalOverlays = useMemo(() => {
    // poster_overlays may be an array of strings or PosterOverlayItem objects.
    const list = (slide?.poster_overlays as (PosterOverlayItem | string)[]) || [];
    if (!Array.isArray(list)) return [] as (PosterOverlayItem | string)[];
    return list.filter((item): item is PosterOverlayItem | string =>
      typeof item === 'string' ? true : !!(item && item.type === 'general_overlay')
    );
  }, [slide]);

  const filteredPosterOverlays = useMemo(() => {
    const list = (slide?.poster_overlays as PosterOverlayItem[]) || [];
    if (!Array.isArray(list)) return [] as PosterOverlayItem[];
    return list.filter((item): item is PosterOverlayItem => {
      if (typeof item === 'string') return false;
      const pos = (item.position || '').toLowerCase();
      // drop top-right
      if (['tr'].includes(pos)) return false;
      return true;
    });
  }, [slide]);

  useEffect(() => {
    let timeout = undefined;
    if (timeout) {
      clearTimeout(timeout);
      setShowPlayer(false);
    }
    if (slide?.trailer_info?.url) {
      timeout = setTimeout(() => {
        setShowPlayer(true);
      }, 1500);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [slide]);

  const { isStartPlayTrailer, isPlaySuccess, setIsPlaySuccess } =
    useBlockPlayer();

  useEffect(() => {
    setIsPlaySuccess(false);
    setShowPlayer(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newVodCtx?.selectedSlide]);

  const positionLabelsStatus = {
    mr: true,
    ml: true,
    bl: true,
    br: true,
    bc: true,
  };

  const handlePosterOverlays = useCallback((positionRibbons: string[]) => {
    setPosterOverlaysReady(positionRibbons);
  }, []);

  return (
    <div className="relative w-full lg:flex lg:justify-end">
      <div
        className={`relative w-full lg:w-[63%] h-full block ${
          posterOverlaysReady.includes("top-ribbon")
            ? "overflow-visible mt-[3px]"
            : posterOverlaysReady.includes("mid-ribbon")
            ? "overflow-visible ml-[3px] mr-[3px]"
            : posterOverlaysReady.includes("bottom-ribbon")
            ? "overflow-visible mb-[3px]"
            : "overflow-hidden"
        }`}
      >
        {slide?.trailer_info?.url && showPlayer && (
          <div className="w-full h-full absolute top-0 left-0">
            <BlockPlayerShaka
              url={slide?.trailer_info?.url}
              isMuted={isMutedTrailerPlayer}
              type={BlockPlayerTypes.auto_expansion}
              isStartPlay={isStartPlayTrailer}
              onError={() => setIsPlaySuccess(false)}
              onPlaySuccess={() => setIsPlaySuccess(true)}
              onEnded={() => setIsPlaySuccess(false)}
              block={block}
              slide={slide}
            />
            <img
              src="/images/new_vod_detail_mask.webp"
              alt="bg"
              className="w-full h-full absolute top-0 left-0"
            />
          </div>
        )}

        <div
          className={`ease-out duration-1000 relative z-[1] ${
            isPlaySuccess ? "opacity-0" : "opacity-100"
          }`}
        >
          <HandleImage
            imageAlt={slide?.title_vie || slide?.title || ""}
            imageClassName="w-full min-w-full max-w-full"
            imageUrl={scaleImageUrl({
              imageUrl:
                slide?.image?.landscape || slide?.image?.landscape_title,
            })}
            type="top"
            block={block}
            slide={slide}
            blockDirection="horizontal"
          />
          <img
            src="/images/new_vod_detail_mask.webp"
            alt="bg"
            className="w-full h-full absolute top-0 left-0"
          />
        </div>

        {filteredPosterOverlays && filteredPosterOverlays.length > 0 && (
          <PosterOverlays
            posterOverlays={filteredPosterOverlays}
            blockType={block?.block_type}
            positionLabelsStatus={[positionLabelsStatus]}
            onHandlePosterOverlays={handlePosterOverlays}
          />
        )}
      </div>
      <div className="xl:absolute xl:left-0 xl:bottom-[90px] lg:w-1/2 xl:w-[704px] z-[1] mt-[12px] tablet:mt-[16px] xl:mt-0">
        {/* title image */}
        <div title={slide?.title_vie || slide?.title}>
          <div>
            {slide?.image?.title ? (
              <img
                src={slide.image?.title || ""}
                alt="title image"
                className="max-w-full max-h-[64px] tablet:max-h-[80px] xl:max-h-[96px] xl:max-w-[632px]"
              />
            ) : (
              <p className="text-[24px] leading-[29px] font-[600] line-clamp-2">
                {slide?.title_vie || slide?.title}
              </p>
            )}
          </div>
        </div>
        <div className="mt-[16px] flex items-center gap-[12px]">
          {/* General Overlays */}
          {generalOverlays && generalOverlays.length > 0 && (
            <div className="flex items-center gap-[8px]">
              {generalOverlays.map((o, i) => {
                let src = '';
                if (typeof o === 'string') {
                  src = o;
                } else {
                  const item = o as PosterOverlayItem;
                  src = item?.url || item?.url_portrait || '';
                }
                if (!src) return null;
                return (
                  <div key={i} className="flex-shrink-0">
                    <img
                      src={src}
                      alt={slide?.title_vie || slide?.title || ''}
                      className="h-[28px]"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* VodHighlightInfo stays on the same line */}
          <div className="flex-1">
            <VodHighlightInfo slide={slide} block={block} />
          </div>
        </div>
        {/* labels */}
        {vodDetailHighlight && vodDetailHighlight?.length > 0 && (
          <div className="flex items-center gap-[2px] md:gap-[6px] mt-[12px] text-[11px] text-white-smoke !font-[400]">
            <VodMetaData metaData={vodDetailHighlight} type="top-slide" />
          </div>
        )}

        {/* Description */}
        {slide?.detail?.short_description && (
          <div className="hidden tablet:block">
            <p
              className={`mt-[16px] font-[500] text-[18px] line-clamp-3 w-full text-shadow-top-slide`}
            >
              {slide?.detail?.short_description}
            </p>
          </div>
        )}

        <div className="mt-[20px] tablet:mt-[32px] xl:mt-[40px]">
          <VodActionButtons
            block={block}
            slide={slide}
            type="top-slide"
            slideLink={slideLink}
            onClickVolume={() =>
              dispatch(changeIsMutedTrailerPlayer(!isMutedTrailerPlayer))
            }
            isMuted={isMutedTrailerPlayer}
          />
        </div>
      </div>
    </div>
  );
}
