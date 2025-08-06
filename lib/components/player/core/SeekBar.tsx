/* eslint-disable @next/next/no-css-tags */
import { VideoSeekSlider } from 'react-video-seek-slider';
import 'react-video-seek-slider/styles.css';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { VIDEO_ID } from '@/lib/constant/texts';
import Head from 'next/head';
import { useEffect } from 'react';
import ThumbNails from '@/lib/utils/thumbNails';
import { userAgentInfo } from '@/lib/utils/ua';

interface ThumbnailType {
  src?: string;
  w?: number;
  h?: number;
  x?: number;
  y?: number;
}

export interface CueType {
  url?: string;
  startTime?: number;
  endTime?: number;
  label?: string;
  thumbnail?: ThumbnailType;
}

export default function SeekBar() {
  const {
    videoCurrentTime,
    videoDuration,
    setVideoCurrentTime,
    bufferedTime,
    dataStream,
  } = usePlayerPageContext();
  const change = (v: number) => {
    if (setVideoCurrentTime) {
      setVideoCurrentTime(v / 1000);
    }
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      video.currentTime = v / 1000;
    }
  };

  useEffect(() => {
    const device = userAgentInfo();
    if ((device?.isWindows || device?.isMacOS) && dataStream?.timeline_img) {
      const seekBar = document.querySelector(
        '.seek-bar-nvm .ui-video-seek-slider .main',
      );
      if (seekBar) {
        new ThumbNails(seekBar, dataStream?.timeline_img);
      }
    }
  }, [dataStream?.timeline_img]);

  return (
    <div className="seek-bar-nvm">
      <Head>
        <link rel="stylesheet" href="/css/player/seek.css" />
        <link rel="stylesheet" href="/css/player/thumbnails.css" />
      </Head>
      <VideoSeekSlider
        max={(videoDuration || 0) * 1000}
        currentTime={(videoCurrentTime || 0) * 1000}
        bufferTime={(bufferedTime || 0) * 1000}
        onChange={change}
        secondsPrefix="0:"
        minutesPrefix="0:"
      />
    </div>
  );
}
