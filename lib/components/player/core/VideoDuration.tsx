import { VIDEO_ID } from '@/lib/constant/texts';
import { useEffect, useState } from 'react';

export default function VideoDuration() {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const videoElement = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!videoElement) {
      console.error('No video element found in the document');
      return;
    }
    const getFinite = (n: number) => (Number.isFinite(n) && !isNaN(n) ? n : 0);
    const clamp = (value: number, max: number) =>
      max > 0 ? Math.min(value, max) : value;

    const syncTimes = () => {
      const d = getFinite(videoElement.duration);
      const c = getFinite(videoElement.currentTime);
      setDuration(d);
      setCurrentTime(clamp(c, d));
    };
    const handleTimeUpdate = () => {
      const d = getFinite(videoElement.duration);
      const c = getFinite(videoElement.currentTime);
      setCurrentTime(clamp(c, d));
    };
    const handleMetadataLoaded = () => {
      const d = getFinite(videoElement.duration);
      const c = getFinite(videoElement.currentTime);
      setDuration(d);
      setCurrentTime(clamp(c, d));
    };
    const handleDurationChange = () => {
      const d = getFinite(videoElement.duration);
      setDuration(d);
      // Ensure current time never exceeds new duration
      setCurrentTime((prev) => clamp(prev, d));
    };
    const handleEnded = () => {
      const d = getFinite(videoElement.duration);
      setDuration(d);
      setCurrentTime(d);
    };

    if (videoElement.readyState >= 2) {
      syncTimes();
    }
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  const formatTime = (timeInSeconds: number): string => {
    if (!Number.isFinite(timeInSeconds) || isNaN(timeInSeconds)) return '00:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (hours > 0) {
      // h:mm:ss format
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    } else {
      // mm:ss format
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
  };

  return (
    <div className="c-control-button c-control-button-duration">
      <div className="video-time-display text-[14px] leading-[130%] tracking-[0.28px]">
        {formatTime(Math.min(currentTime, duration || currentTime))} /{' '}
        {formatTime(duration)}
      </div>
    </div>
  );
}
