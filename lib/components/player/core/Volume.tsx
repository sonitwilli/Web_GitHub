/* eslint-disable jsx-a11y/alt-text */

import type React from 'react';
import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from './Volume.module.css';
import {
  MUTE_VOLUME_PLAYER,
  VIDEO_ID,
  VOLUME_PLAYER,
} from '@/lib/constant/texts';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { store } from '@/lib/store';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { useKeyboardControls } from '@/lib/hooks/useKeyboardControls';
interface VolumeControlProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  initialVolume?: number;
  onChange?: (volume: number) => void;
  className?: string;
}

export default function Volume({}: VolumeControlProps) {
  const { width } = useScreenSize();
  const { isPlaySuccess } = usePlayerPageContext();
  const [isMuted, setIsMuted] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);

  // Enable keyboard controls for volume
  const isVideoPage =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('/xem-video');
  useKeyboardControls(isVideoPage);

  const handleChange = (value: number | number[]) => {
    try {
      setSliderValue(value as number);
      setIsMuted((value as number) === 0);
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        video.volume = value as number;
        if ((value as number) > 0) {
          video.muted = false;
          localStorage.setItem(MUTE_VOLUME_PLAYER, 'false');
        } else {
          localStorage.setItem(MUTE_VOLUME_PLAYER, 'true');
          video.muted = true;
        }
      }
    } catch {}
  };
  const toggleMute = () => {
    try {
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        const isMutedVideo = video.muted;
        if (isMutedVideo) {
          setIsMuted(false);
          setSliderValue(video.volume);
          localStorage.setItem(MUTE_VOLUME_PLAYER, 'false');
          video.muted = false;
        } else {
          setIsMuted(true);
          setSliderValue(0);
          localStorage.setItem(MUTE_VOLUME_PLAYER, 'true');
          video.muted = true;
        }
      }
    } catch {}
  };
  const checkVolumeOnStart = () => {
    try {
      const muted = localStorage.getItem(MUTE_VOLUME_PLAYER);
      if (muted === 'false') {
        const v = localStorage.getItem(VOLUME_PLAYER);

        const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
        if (v && video) {
          setIsMuted(false);
          setSliderValue(Number(v));
          video.volume = Number(v);
          video.muted = false;
        }
      }
    } catch {}
  };
  useEffect(() => {
    if (isPlaySuccess) {
      const { interacted } = store.getState().app;
      if (interacted) {
        checkVolumeOnStart();
      }
    }
  }, [isPlaySuccess]);

  // Listen for volume changes from keyboard controls
  useEffect(() => {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!video) return;

    const handleVolumeChange = () => {
      try {
        const isMutedVideo = video.muted;
        setIsMuted(isMutedVideo);
        if (!isMutedVideo) {
          setSliderValue(video.volume);
        } else {
          setSliderValue(0);
        }
      } catch {}
    };

    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isPlaySuccess]);

  return (
    <div
      className={`${styles.container} c-control-button c-control-button-volume relative flex flex-col items-center`}
    >
      {width >= 768 && (
        <div
          className={`${styles.slider} absolute bottom-[calc(100%_+_28px)] px-[13px] py-[20px] bg-eerie-black-09 rounded-[8px] transition-all duration-200 opacity-0 h-[132px]`}
        >
          <div className="h-full flex items-center justify-center">
            <Slider
              vertical
              min={0}
              max={1}
              step={0.01}
              value={sliderValue}
              onChange={handleChange}
              styles={{
                rail: {
                  backgroundColor: 'rgba(172, 172, 172, 0.6)',
                  width: '4px',
                },
                track: {
                  backgroundColor: 'white',
                  width: '4px',
                },
                handle: {
                  borderWidth: '0',
                  backgroundColor: 'white',
                  opacity: 1,
                  width: '14px',
                  height: '14px',
                  boxShadow: 'none',
                },
              }}
            />
          </div>
        </div>
      )}

      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="flex items-center justify-center hover:cursor-pointer"
      >
        <img
          src="/images/player/volume_off.png"
          className={`w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px] ${
            isMuted ? '' : 'hidden'
          }`}
        />
        <img
          src="/images/player/volume_up.png"
          className={`w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px] ${
            isMuted ? 'hidden' : ''
          }`}
        />
      </button>
    </div>
  );
}
