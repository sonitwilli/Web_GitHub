/* eslint-disable @next/next/no-css-tags */
import { VideoSeekSlider } from 'react-video-seek-slider';
import 'react-video-seek-slider/styles.css';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { VIDEO_ID } from '@/lib/constant/texts';
import Head from 'next/head';
import React from 'react';
import axios from 'axios';
import { saveSeekEvent } from '@/lib/utils/seekTracking';
// import ThumbNails from '@/lib/utils/thumbNails';
// import { userAgentInfo } from '@/lib/utils/ua';

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
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (video) {
      const oldTime = video.currentTime;
      const newTime = v / 1000;

      if (setVideoCurrentTime) {
        setVideoCurrentTime(newTime);
      }
      video.currentTime = newTime;

      // Track seek event if there's a significant time change
      if (Math.abs(newTime - oldTime) > 1) {
        saveSeekEvent({
          timestamp: Date.now(),
          direction: 'seekbar',
          method: 'seekbar',
        });
      }
    }
  };

  // Thumbnail preview state
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [thumbCrop, setThumbCrop] = React.useState<{
    w: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);
  const seekBarRef = React.useRef<HTMLDivElement>(null);

  // Parse VTT file and get cues
  const [cues, setCues] = React.useState<CueType[]>([]);
  React.useEffect(() => {
    if (dataStream?.timeline_img) {
      // Fetch and parse VTT
      axios
        .get(dataStream.timeline_img)
        .then((data) => {
          try {
            const items = data.data.split('\n\r');
            const newItems = items[0].split('\n\n');
            newItems.shift();
            const parsedCues: CueType[] = [];
            const convertHoursToSeconds = (time: string[]) => {
              return parseInt(
                String(
                  Number(time[0]) * 3600 +
                    Number(time[1]) * 60 +
                    Math.floor(Number(time[2])),
                ),
              );
            };
            newItems.forEach((item: string) => {
              const infoTrack = item.split('\n');
              if (infoTrack.length < 3) return;
              const cue: CueType = {
                url: infoTrack[2],
                startTime: convertHoursToSeconds(
                  infoTrack[1].split('-->')[0].trim().split(':'),
                ),
                endTime: convertHoursToSeconds(
                  infoTrack[1].split('-->')[1].trim().split(':'),
                ),
                label: infoTrack[0],
              };
              parsedCues.push(cue);
            });
            setCues(parsedCues);
          } catch {
            setCues([]);
          }
        })
        .catch(() => setCues([]));
    } else {
      setCues([]);
    }
  }, [dataStream?.timeline_img]);

  // Parse VTT image link for cropping (xywh)
  function parseImageLink(imgLocation: string, url: string) {
    const hashIndex = imgLocation.indexOf('#');
    if (hashIndex === -1) {
      return { src: imgLocation, w: 0, h: 0, x: 0, y: 0 };
    }
    const src = imgLocation.substring(0, hashIndex);
    const hashString = imgLocation.substring(hashIndex + 1);
    if (hashString.substring(0, 5) !== 'xywh=') {
      return {
        src: url.replace(url.substr(url.lastIndexOf('/') + 1), src),
        w: 0,
        h: 0,
        x: 0,
        y: 0,
      };
    }
    const data = hashString.substring(5).split(',');
    return {
      src: url.replace(url.substr(url.lastIndexOf('/') + 1), src),
      w: parseInt(data[2]),
      h: parseInt(data[3]),
      x: parseInt(data[0]),
      y: parseInt(data[1]),
    };
  }

  // Mouse move handler for seek bar
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle preview on desktop (non-touch devices)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const seekBar = seekBarRef.current;
    if (!seekBar || !videoDuration) return;
    const rect = seekBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * videoDuration;
    setHoverTime(time);
    // Find cue for this time
    let found = null;
    for (const cue of cues) {
      if (
        cue.startTime &&
        cue.endTime &&
        cue.startTime <= time &&
        cue.endTime >= time
      ) {
        found = cue;
        break;
      }
    }
    if (found?.url) {
      const parsed = parseImageLink(found.url, dataStream?.timeline_img || '');
      setThumbnailUrl(parsed.src);
      setThumbCrop({ w: parsed.w, h: parsed.h, x: parsed.x, y: parsed.y });
    } else {
      setThumbnailUrl(null);
      setThumbCrop(null);
    }
  };
  const handleMouseLeave = () => {
    setHoverTime(null);
    setThumbnailUrl(null);
    setThumbCrop(null);
  };
  const handleMouseDown = () => {
    // set time start
    console.log('handleMouseDown seekbar');
  };

  return (
    <div
      className="seek-bar-nvm"
      ref={seekBarRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      style={{ position: 'relative' }}
    >
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
      {hoverTime !== null &&
        thumbnailUrl &&
        thumbCrop &&
        (() => {
          const seekBarWidth = seekBarRef.current?.offsetWidth || 0;
          const thumbnailWidth = thumbCrop.w * 0.7; // Use scaled width for positioning
          const hoverPercent = (hoverTime / (videoDuration || 1)) * 100;
          const hoverPixels = (hoverPercent / 100) * seekBarWidth;

          // Calculate left position ensuring thumbnail stays within bounds
          let leftPosition = hoverPixels - thumbnailWidth / 2;

          // Ensure thumbnail doesn't go beyond left edge
          if (leftPosition < 0) {
            leftPosition = 0;
          }

          // Ensure thumbnail doesn't go beyond right edge
          if (leftPosition + thumbnailWidth > seekBarWidth) {
            leftPosition = seekBarWidth - thumbnailWidth;
          }

          return (
            <div
              className="absolute"
              style={{
                left: `${leftPosition}px`,
                top: -thumbCrop.h * 0.7 - 30,
                width: thumbCrop.w * 0.7,
                height: thumbCrop.h * 0.7,
                overflow: 'hidden',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                border: '1px solid #eee',
                background: '#222',
              }}
            >
              <img
                src={thumbnailUrl}
                alt="thumbnail"
                style={{
                  position: 'absolute',
                  left: -thumbCrop.x * 0.7,
                  top: -thumbCrop.y * 0.7,
                  width: undefined,
                  height: undefined,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: 'scale(0.7)',
                  transformOrigin: 'top left',
                }}
              />
            </div>
          );
        })()}
    </div>
  );
}
