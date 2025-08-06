import { useEffect, useState } from 'react';
import { SELECTED_PLAYBACK_SPEED } from '@/lib/constant/texts';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { getCurrentVideoElement } from '@/utils/common/getCurrentVideoElement';

export default function usePlaybackSpeed() {
  const { isMetaDataLoaded, dataChannel } = usePlayerPageContext();
  const [speed, setSpeed] = useState(1.0);

  // Load speed from sessionStorage when mount or content_type changes
  useEffect(() => {
    if (dataChannel?.tracking?.content_type === 'vod') {
      const saved = parseFloat(
        sessionStorage.getItem(SELECTED_PLAYBACK_SPEED) || '1',
      );
      setSpeed(saved);
    }
  }, [dataChannel?.tracking?.content_type]);

  // Set playbackRate logic: mobile/tablet (width < 768) only depend on speed, desktop keep current logic
  useEffect(() => {
    const video = getCurrentVideoElement();
    if (video) {
      video.playbackRate = speed;
    }
  }, [speed, isMetaDataLoaded]);

  // Update speed and set playbackRate immediately
  const updateSpeed = (value: number, onUpdated?: () => void) => {
    setSpeed(value);
    sessionStorage.setItem(SELECTED_PLAYBACK_SPEED, value.toString());
    const video = getCurrentVideoElement();
    if (video) {
      video.playbackRate = value;
    }
    if (onUpdated) onUpdated();
  };

  return {
    speed,
    updateSpeed,
  };
}
