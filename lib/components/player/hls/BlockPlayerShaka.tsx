/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { useAppDispatch } from '@/lib/store';
import { changeTimeStartBlockPlayer } from '@/lib/store/slices/blockSlice';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { TopSliderContext } from '../../slider/embla/top-slider/EmblaTopSlider';
import { NewVodContext } from '../../slider/embla/new-vod-detail-slider/NewVodDetail';
import { changeIsMutedTrailerPlayer } from '@/lib/store/slices/appSlice';

export enum BlockPlayerTypes {
  top_slider = 'top_slider',
  block_slider = 'block_slider',
  auto_expansion = 'auto_expansion',
}

interface Props {
  url?: string;
  isMuted?: boolean;
  loop?: boolean;
  type?: BlockPlayerTypes;
  onError?: (ev?: any) => void;
  isStartPlay?: boolean;
  onPlaySuccess?: () => void;
  onEnded?: () => void;
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  onTimeUpdate?: () => void;
}

const BlockPlayerShaka = ({
  url,
  isMuted,
  loop,
  type,
  onError,
  onPlaySuccess,
  onEnded,
  block,
  onTimeUpdate,
}: Props) => {
  const newVodCtx = useContext(NewVodContext);
  const topCtx = useContext(TopSliderContext);
  const { isInViewport: topSliderInViewport } = topCtx;
  const { isInViewport: newVodSliderInViewport } = newVodCtx;
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const playVideo = () => {
    if (videoRef.current) {
      const promise = videoRef.current.play();
      if (promise) {
        promise
          .then(() => {})
          .catch((e) => {
            console.log(e);
            if (videoRef.current) {
              videoRef.current.volume = 0;
              videoRef.current.muted = true;
              dispatch(changeIsMutedTrailerPlayer(true));
              videoRef.current
                .play()
                .then(() => {})
                .catch(() => {});
            }
          });
      }
    }
  };

  const initPlayer = () => {
    if (type === 'block_slider') {
      const hoverItem = document.getElementById('hover_slide_card');
      if (hoverItem) {
        const styles = getComputedStyle(hoverItem);
        if (styles.opacity === '0') {
          // khúc này hover card chưa xuất hiện thì ko play
          return;
        }
      }
    }

    initHls({ src: url || '' });
  };

  const initWindowPlayer = useCallback(
    (player: any) => {
      if (type === BlockPlayerTypes.top_slider) {
        window.topSliderPlayer = player;
      }
      if (type === BlockPlayerTypes.block_slider) {
        window.blockPlayer = player;
      }
      if (type === BlockPlayerTypes.auto_expansion) {
        window.newVodPlayer = player;
      }
    },
    [type],
  );
  const pausePlayer = useCallback(() => {
    let video: HTMLMediaElement | null = null;
    if (type === BlockPlayerTypes.top_slider) {
      if (window.topSliderPlayer) {
        video = window.topSliderPlayer?.getMediaElement();
      }
    }
    if (type === BlockPlayerTypes.block_slider) {
      if (window.blockPlayer) {
        video = window.blockPlayer?.getMediaElement();
      }
    }
    if (type === BlockPlayerTypes.auto_expansion) {
      if (window.newVodPlayer) {
        video = window.newVodPlayer?.getMediaElement();
      }
    }
    if (video) {
      video.pause();
    }
  }, [type]);

  const pauseTopPlayerWhenNotInViewport = useCallback(() => {
    if (type === BlockPlayerTypes.top_slider) {
      if (!topSliderInViewport && window.topSliderPlayer) {
        const video = window.topSliderPlayer?.getMediaElement();
        if (video) {
          video.pause();
        }
      }
    }
  }, [type, topSliderInViewport]);

  const pauseNewVodPlayerWhenNotInViewport = useCallback(() => {
    if (type === BlockPlayerTypes.auto_expansion) {
      if (!newVodSliderInViewport && window.newVodPlayer) {
        const video = window.newVodPlayer?.getMediaElement();
        if (video) {
          video.pause();
        }
      }
    }
  }, [type, newVodSliderInViewport]);

  useEffect(() => {
    pauseTopPlayerWhenNotInViewport();
  }, [topSliderInViewport, pauseTopPlayerWhenNotInViewport]);

  useEffect(() => {
    pauseNewVodPlayerWhenNotInViewport();
  }, [newVodSliderInViewport, pauseNewVodPlayerWhenNotInViewport]);

  const initHls = ({ src }: { src: string }) => {
    if (window.blockPlayerVideo) {
      window.blockPlayerVideo.pause();
    }
    pausePlayer();
    if (!videoRef.current) return;
    window.blockPlayerVideo = videoRef.current;
    if (type !== 'top_slider' || block?.block_type === 'auto_expansion') {
      dispatch(changeTimeStartBlockPlayer(new Date().getTime()));
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const shaka = require('shaka-player');
    const player = new shaka.Player(videoRef.current);
    playerRef.current = player;
    player.addEventListener('error', (event: any) => {
      console.log('--- BLOCK PLAYER ERROR', event);
      if (onError) {
        onError(event);
      }
    });
    initWindowPlayer(player);
    player.load(src).then(() => {
      playVideo();
    });
    // if (Hls.isSupported()) {
    //   hls = new Hls({
    //     enableWorker: true,
    //     lowLatencyMode: true,
    //   });
    //   hls.loadSource(src);
    //   hls.attachMedia(videoRef.current);
    //   hls.on(Hls.Events.ERROR, function (event, data) {
    //     console.log("--- BLOCK PLAYER ERROR", { event, data });
    //     if (onError) {
    //       onError(data);
    //     }
    //   });
    //   hls.on(Hls.Events.MANIFEST_PARSED, () => {
    //     playVideo();
    //   });
    //   playerRef.current = hls;
    //   initWindowPlayer(hls);
    // } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
    //   console.log("Browser not support HLS");
    //   videoRef.current.src = src;
    // } else {
    // }
  };

  useEffect(() => {
    if (url) {
      initPlayer();
    }

    return () => {
      destroyShaka();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destroyShaka = useCallback(() => {
    if (playerRef.current?.unload) {
      playerRef.current?.unload?.();
      playerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!videoRef?.current) {
      return;
    }

    if (isMuted) {
      videoRef.current.volume = 0;
      videoRef.current.muted = true;
    } else {
      videoRef.current.volume = 1;
      videoRef.current.muted = false;
    }
  }, [isMuted]);

  return (
    <>
      <div className="w-full h-full">
        <video
          ref={videoRef}
          className=" w-full h-auto"
          preload="auto"
          muted
          playsInline
          loop={loop}
          onPlaying={onPlaySuccess}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          poster="/images/default-poster-horizontal.png"
        />
      </div>
    </>
  );
};

export default BlockPlayerShaka;
