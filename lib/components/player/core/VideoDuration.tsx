import { VIDEO_ID } from "@/lib/constant/texts";
import { useEffect, useState } from "react";

export default function VideoDuration() {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const videoElement = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!videoElement) {
      console.error("No video element found in the document");
      return;
    }
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    const handleMetadataLoaded = () => {
      setDuration(videoElement.duration);
    };
    if (videoElement.readyState >= 2) {
      setDuration(videoElement.duration);
      setCurrentTime(videoElement.currentTime);
    }
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleMetadataLoaded);
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleMetadataLoaded);
    };
  }, []);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (hours > 0) {
      // h:mm:ss format
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      // mm:ss format
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  };

  return (
    <div className="c-control-button c-control-button-duration">
      <div className="video-time-display text-[14px] leading-[130%] tracking-[0.28px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
