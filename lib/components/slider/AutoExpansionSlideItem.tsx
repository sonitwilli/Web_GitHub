import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { scaleImageUrl } from '@/lib/utils/methods';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import BlockItemMetaData from '../blocks/BlockItemMetaData';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import Hls from 'hls.js';
import { MdOutlineVolumeOff, MdOutlineVolumeUp } from 'react-icons/md';
import {
  changeIsMutedTrailerPlayer,
} from '@/lib/store/slices/appSlice';
import { BlockContext } from './embla/block-slider/EmblaBlockSlider';
import PosterOverlays from '../overlays/PosterOverlays';
import { PosterOverlayItem } from '@/lib/utils/posterOverlays/types';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  index?: number;
}

export default function AutoExpansionSlideItem({ slide }: Props) {
  const { width } = useScreenSize();
  const blockCtx = useContext(BlockContext);
  const dispatch = useAppDispatch();
  const { isMutedTrailerPlayer } = useAppSelector((s) => s.app);
  const { isInViewport, targetElement } = useIntersectionObserver({
    threshold: 0.3,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Hls | null>(null);
  const thumbnail = useMemo(() => {
    return scaleImageUrl({
      imageUrl:
        slide?.image?.landscape ||
        slide?.image?.landscape_title ||
        '/images/default-poster-horizontal.png',
      width: 650,
    });
  }, [slide]);

  const [isHover, setIsHover] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);

  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const handlePosterOverlays = useCallback((positionRibbons: string[]) => {
    setPosterOverlaysReady(positionRibbons);
  }, []);

  const playVideo = () => {
    if (!videoRef?.current) {
      return;
    }
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (videoRef.current) {
            if (isMutedTrailerPlayer) {
              videoRef.current.muted = true;
            } else {
              videoRef.current.muted = false;
            }
          }
        })
        .catch(() => {
          if (videoRef?.current) {
            videoRef.current.muted = true;
            videoRef.current
              .play()
              .then(() => {})
              .catch(() => {});
          }
        })
        .finally(() => {});
    }
  };

  const initHls = () => {
    if (!videoRef.current || !slide?.trailer_info?.url) return;
    pauseOtherPlayers();
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(slide?.trailer_info?.url || '');
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playVideo();
      });
      playerRef.current = hls;
      if (width < 1280) {
        window.autoExpansionPlayer = hls;
      }
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = slide?.trailer_info?.url || '';
      videoRef.current.addEventListener('loadedmetadata', () => {
        playVideo();
      });
    } else {
    }
  };

  const pauseOtherPlayers = () => {
    if (!window.autoExpansionPlayer) {
      return;
    }
    try {
      const v = window.autoExpansionPlayer?.media;
      if (v) {
        v.pause();
      }
      const videos = document.querySelectorAll('.autoexpansionvideos');
      if (videos?.length) {
        videos.forEach((v) => {
          (v as HTMLVideoElement).pause();
        });
      }
    } catch {}
  };

  useEffect(() => {
    if (width >= 1280) {
      if (isHover) {
        pauseOtherPlayers();
        if (playerRef.current) {
          if (videoRef?.current) {
            videoRef.current.play();
          }
        } else {
          initHls();
        }
      } else {
        if (playerRef.current) {
          if (videoRef?.current) {
            videoRef.current.pause();
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHover]);

  useEffect(() => {
    if (width < 1280) {
      if (showPlayer) {
        pauseOtherPlayers();
        if (playerRef.current) {
          if (videoRef?.current) {
            videoRef.current.play();
          }
        } else {
          initHls();
        }
      } else {
        if (playerRef.current) {
          if (videoRef?.current) {
            videoRef.current.pause();
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPlayer]);

  const handleMouseEnter = () => {
    if (width < 1280 || !slide?.trailer_info?.url) {
      return;
    }
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    if (width < 1280 || !slide?.trailer_info?.url) {
      return;
    }
    if (videoRef?.current) {
      videoRef.current.pause();
    }
    setIsHover(false);
  };

  // mute/ muted

  useEffect(() => {
    if (isMutedTrailerPlayer) {
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    } else {
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
    }
  }, [isMutedTrailerPlayer, videoRef]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const [setIsSub] = useState(false);

  useEffect(() => {
    if (slide?.is_subscribed === '1') {
      setIsSub(true);
    }
  }, [slide]);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const positionLabelsStatus = {
    BL: true,
    BR: true,
    BC: true,
  };

  const handleErrorLoadImage = () => {
    if (imgRef?.current) {
      imgRef.current.src = '/images/default-poster-horizontal.png';
    }
  };
  const handlePlaying = () => {
    setIsPlaying(true);
    setIsPaused(false);
  };
  const handlePaused = () => {
    setIsPlaying(false);
    setIsPaused(true);
  };

  const clickPlay = () => {
    try {
      pauseOtherPlayers();
      setShowPlayer(true);
      if (playerRef.current) {
        if (videoRef?.current) {
          videoRef.current.play();
        }
      } else {
        initHls();
      }
    } catch {}
  };

  useEffect(() => {
    if (!isInViewport) {
      pauseOtherPlayers();
    }
  }, [isInViewport]);
  return (
    <div
      className={`w-full rounded-[16px] ${
        posterOverlaysReady.includes('top-ribbon')
          ? 'overflow-visible mt-[3px]'
          : posterOverlaysReady.includes('mid-ribbon')
          ? 'overflow-visible ml-[3px] mr-[3px]'
          : posterOverlaysReady.includes('bottom-ribbon')
          ? 'overflow-visible mb-[3px]'
          : 'overflow-hidden'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={targetElement}
    >
      <div className="relative trailer-player-container">
        <div>
          <img
            ref={imgRef}
            src={thumbnail}
            alt={slide?.title_vie || slide?.title}
            className={`w-full rounded-[16px] aspect-[16/9] ${
              isPlaying ? 'opacity-0 -z-[10]' : ''
            }`}
            onLoad={() => {
              setTimeout(() => {
                if (blockCtx?.changeImageHeight) {
                  blockCtx.changeImageHeight(
                    imgRef?.current?.scrollHeight || 0,
                  );
                }
              }, 200);
            }}
            onError={handleErrorLoadImage}
          />
          <img
            src="/images/mask_auto_expand.webp"
            alt="overlay background"
            className="hidden tablet:block absolute left-0 bottom-0 w-[101%] h-1/2 z-[1] translate-y-[2px]"
          />
          {!(isHover || isPlaying) && (
            <div className="absolute left-[8px] bottom-[8px] xl:left-[25px] xl:bottom-[35px] w-full z-[2]">
              {slide?.image?.title ? (
                <img
                  src={slide?.image?.title}
                  alt={slide?.title_vie || slide?.title}
                  className="xl:max-h-[60px] max-w-[293px] block mb-[8px]"
                />
              ) : (
                <p className="line-clamp-1 mb-[8px] max-w-full">
                  {slide?.title_vie || slide?.title}
                </p>
              )}
              <div className="mt-[8px]">
                <BlockItemMetaData slide={slide} />
              </div>
              {/* {slide?.detail?.short_description ? (
                <p className="font-[500] leading-[130%] tracking-[0.28px] text-[12px] md:text-[14px] text-white-smoke mt-[16px]">
                  {slide?.detail?.short_description}
                </p>
              ) : (
                ''
              )} */}
            </div>
          )}
          {/* Poster Overlays Area */}
          {!(isHover || isPlaying) && slide?.poster_overlays && (
            <PosterOverlays
              posterOverlays={slide?.poster_overlays as PosterOverlayItem[]}
              blockType={'new_vod_detail'}
              positionLabelsStatus={[positionLabelsStatus]}
              onHandlePosterOverlays={handlePosterOverlays}
            />
          )}
        </div>
        {(isHover || isPlaying) && slide?.trailer_info?.url && (
          <div className="absolute left-[24px] bottom-[32px] z-[1]">
            <button
              aria-label="volume"
              className="hover:cursor-pointer"
              onClick={() => {
                dispatch(changeIsMutedTrailerPlayer(!isMutedTrailerPlayer));
              }}
            >
              {isMutedTrailerPlayer ? (
                <MdOutlineVolumeOff size={24} />
              ) : (
                <MdOutlineVolumeUp size={24} />
              )}
            </button>
          </div>
        )}

        {slide?.trailer_info?.url ? (
          <div
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${
              isHover || isPlaying ? 'flex' : 'hidden pointer-events-none'
            }`}
            ref={videoContainerRef}
            onClick={() => handlePaused()}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              className="autoexpansionvideos w-full max-h-full h-full"
              loop
              onPlaying={handlePlaying}
              onPause={handlePaused}
            ></video>
          </div>
        ) : (
          ''
        )}

        {/* overlay mobile */}
        {slide?.trailer_info?.url && isPaused ? (
          <div className="absolute z-[2] xl:hidden w-full h-full left-0 top-0 bg-black-01 flex items-center justify-center">
            <img
              src="/images/play_mobile.png"
              alt="play"
              className="w-[48px] h-[48px] hover:cursor-pointer"
              onClick={clickPlay}
            />
          </div>
        ) : (
          ''
        )}
      </div>
      {/* <div className="mt-2 px-1">
        <p className="font-[600] text-[18px] leading-[130%] tracking-[2%] text-white-smoke line-clamp-3 overflow-hidden">
          {slide?.title_vie || slide?.title}
        </p>
      </div> */}
    </div>
  );
}
