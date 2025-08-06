import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { createLink, scaleImageUrl } from '@/lib/utils/methods';
import HandleImage from './HandleImage';
import { useEffect, useMemo, useState } from 'react';
import styles from './TopSlideItem.module.css';
import useEvent from '@/lib/hooks/useEvent';
import { FaCaretDown } from 'react-icons/fa';
import VodActionButtons from '../vod/VodActionButtons';
import VodMetaData from '../vod/VodMetaData';
import VodHighlightInfo from '../vod/VodHighlightInfo';
import BlockPlayer, {
  BlockPlayerTypes,
} from '@/lib/components/player/hls/BlockPlayer';
import useBlockPlayer from '@/lib/hooks/useBlockPlayer';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeIsMutedTrailerPlayer } from '@/lib/store/slices/appSlice';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  isInview?: boolean;
}

export default function TopSlideItem({ slide, block, isInview }: Props) {
  const {
    checkLive,
    checkDataLive,
    preSecond,
    nextSecond,
    preMin,
    nextMin,
    isShowLiveLabel,
  } = useEvent({ slide, block });
  const { viewportType } = useScreenSize();
  const {
    isStartPlayTrailer,
    setIsStartPlayTrailer,
    isPlaySuccess,
    setIsPlaySuccess,
  } = useBlockPlayer();
  const { isMutedTrailerPlayer } = useAppSelector((s) => s.app);
  const dispatch = useAppDispatch();
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
    return createLink({ data: slide || {}, type: block?.type || '' }) || '/';
  }, [slide, block]);

  const isValidCountdown = useMemo(() => {
    return (
      (preSecond || preSecond || nextSecond || nextMin) &&
      typeof preSecond !== 'undefined' &&
      typeof nextSecond !== 'undefined' &&
      typeof preMin !== 'undefined' &&
      typeof nextMin !== 'undefined'
    );
  }, [preSecond, nextSecond, preMin, nextMin]);

  const [isHoveredDescription, setIsHoveredDescription] = useState(false);

  useEffect(() => {
    if (!isInview) {
      setIsHoveredDescription(false);
    }
  }, [isInview]);

  useEffect(() => {
    let timeout = undefined;
    if (!isInview) {
      setIsPlaySuccess(false);
      setIsStartPlayTrailer(false);
    }
    if (isInview && slide?.trailer_info?.url) {
      timeout = setTimeout(() => {
        setIsStartPlayTrailer(true);
      }, 1500);
    }
    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInview, slide]);

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

  return (
    <div className="relative">
      <div
        className="relative w-full h-full"
        title={slide?.title_vie || slide?.title}
      >
        {isInview && slide?.trailer_info?.url && isStartPlayTrailer && (
          <div className="w-full h-full absolute top-0 left-0">
            <BlockPlayer
              url={slide?.trailer_info?.url}
              isMuted={isMutedTrailerPlayer}
              type={BlockPlayerTypes.top_slider}
              isStartPlay={isStartPlayTrailer}
              onError={() => setIsPlaySuccess(false)}
              onPlaySuccess={() => setIsPlaySuccess(true)}
              onEnded={() => {
                setIsPlaySuccess(false);
              }}
            />
            <img
              src="/images/top_slide_shadow3.png"
              alt="bg"
              className="w-full h-[101%] absolute bottom-0 left-0 translate-y-[5px]"
            />
          </div>
        )}
        <div
          className={`ease-out duration-1000 relative z-[1] ${
            isPlaySuccess ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <HandleImage
            imageAlt={slide?.title_vie || slide?.title || ''}
            imageClassName="w-full min-w-full max-w-full"
            imageUrl={scaleImageUrl({
              imageUrl:
                slide?.image?.landscape || slide?.image?.landscape_title,
            })}
            type="top"
            block={block}
            slide={slide}
            blockDirection="horizontal"
            imageRadius="rounded-0"
          />
          <img
            src="/images/top_slide_shadow3.png"
            alt="bg"
            className="w-full h-full absolute top-0 left-0"
          />
        </div>
      </div>
      {isInview && (
        <div
          onMouseLeave={() => setIsHoveredDescription(false)}
          className={`${styles.infoContainer} mb-[32px] tablet:mb-0 px-[16px] tablet:px-0 z-[1] tablet:absolute tablet:left-[24px] xl:left-[48px] tablet:right-[16px] bigscreen:left-[104px] tablet:bottom-[24px] tablet:w-1/2 xl:w-[632px] xl:bottom-[280px] 2xl:bottom-[380px]`}
        >
          {/* title image */}
          <div>
            <div className="w-full">
              {slide?.image?.title ? (
                <img
                  src={slide.image?.title || ''}
                  alt="title image"
                  className="max-w-full max-h-[74px] tablet:max-h-[48px] xl:max-h-[120px] xl:max-w-[632px] "
                />
              ) : (
                <p className="text-[24px] leading-[29px] font-[600] line-clamp-2 max-w-[632px]">
                  {slide?.title_vie || slide?.title}
                </p>
              )}
            </div>
          </div>
          <div className="mt-[16px]">
            {/* <VodRating /> */}
            <VodHighlightInfo slide={slide} block={block} />
          </div>
          {/* labels */}
          {((vodDetailHighlight && vodDetailHighlight?.length > 0) ||
            slide?.detail?.description) && (
            <div className="hidden sm:flex items-center gap-[2px] md:gap-[6px] mt-[8px]">
              {vodDetailHighlight && vodDetailHighlight?.length > 0 && (
                <VodMetaData metaData={vodDetailHighlight} type="top-slide" />
              )}
              {slide?.detail?.description && (
                <button
                  aria-label="show more"
                  className={`hidden xl:flex transition-all duration-300 ease-in w-[24px] h-[24px] rounded-full items-center justify-center bg-white-007 border border-white-016 ${
                    isHoveredDescription ? 'opacity-0' : 'opacity-100'
                  } ${
                    vodDetailHighlight && vodDetailHighlight?.length > 0
                      ? 'ml-[18px]'
                      : ''
                  }`}
                  onMouseEnter={() => setIsHoveredDescription(true)}
                >
                  <FaCaretDown size={16} />
                </button>
              )}
            </div>
          )}

          {/* Description */}
          {slide?.detail?.description && (
            <>
              {viewportType === VIEWPORT_TYPE.DESKTOP ? (
                <div
                  className={`mt-[8px] max-h-0 overflow-hidden transition-all duration-300 ease-in ${
                    isHoveredDescription ? 'max-h-[100px]' : ''
                  }`}
                >
                  <p
                    className={`font-[500] text-[18px] line-clamp-3 w-full text-shadow-top-slide`}
                  >
                    {slide?.detail?.description}
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    className={`mt-[8px] font-[500] text-[12px] tablet:text-[14px] leading-[130%] line-clamp-3 w-full text-shadow-top-slide`}
                  >
                    {slide?.detail?.description}
                  </p>
                </div>
              )}
            </>
          )}

          {isShowLiveLabel &&
            (checkLive && !isValidCountdown ? (
              <div className="mt-[12px] text-[14px] bg-jet px-[8px] py-[1px] w-fit rounded-[4px]">
                {checkLive}
              </div>
            ) : (
              <>
                {isValidCountdown && checkLive ? (
                  <div className="inline-flex items-center gap-[6px] mt-[12px]">
                    <div className={styles.countdown_container}>
                      <div
                        className={styles['move-number']}
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
                    <div className={styles.countdown_container}>
                      <div
                        className={styles['move-number']}
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
                  <div className="bg-vivid-red inline-block px-[8px] py-[1px] text-[14px] rounded-[4px] font-[500] mt-[12px]">
                    {slide?.label_event &&
                    slide?.label_event?.toUpperCase() === 'CÔNG CHIẾU'
                      ? 'Công chiếu'
                      : ''}

                    {slide?.label_event &&
                    slide?.label_event?.toUpperCase() === 'LIVE'
                      ? 'LIVE'
                      : ''}

                    {slide?.label_event &&
                    slide?.label_event?.toUpperCase() === 'ĐANG PHÁT'
                      ? 'Đang phát'
                      : ''}

                    {slide && !slide?.label_event ? 'LIVE' : ''}
                  </div>
                )}
              </>
            ))}

          <div className=" mt-[24px] tablet:mt-[32px] xl:mt-[40px]">
            <VodActionButtons
              block={block}
              slide={slide}
              type="top-slide"
              slideLink={slideLink}
              isMuted={isMutedTrailerPlayer}
              onClickVolume={() =>
                dispatch(changeIsMutedTrailerPlayer(!isMutedTrailerPlayer))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
