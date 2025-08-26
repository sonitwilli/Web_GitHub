import { useCallback, useEffect, useRef } from 'react';
import { usePlayerPageContext } from '@/lib/components/player/context/PlayerPageContext';
import {
  MUTE_VOLUME_PLAYER,
  VIDEO_ID,
  VOLUME_PLAYER,
} from '@/lib/constant/texts';
import { saveSeekEvent } from '@/lib/utils/seekTracking';

// Keyboard shortcuts configuration
const KEYBOARD_SHORTCUTS = {
  SPACE: ' ',
  K: 'k',
  M: 'm',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
} as const;

// Stream type support matrix
const STREAM_TYPE_SUPPORT = {
  ALL: ['vod', 'playlist', 'channel', 'event', 'premiere'],
  SEEK: ['vod', 'playlist'],
} as const;

// Volume adjustment step
const VOLUME_STEP = 0.05;
const SEEK_STEP = 10;

export function useKeyboardControls() {
  const { isPlaySuccess, streamType } = usePlayerPageContext();
  const eventListenerRef = useRef<((event: KeyboardEvent) => void) | null>(
    null,
  );

  // Helper functions
  const getVideoElement = useCallback(() => {
    return document.getElementById(VIDEO_ID) as HTMLVideoElement;
  }, []);

  const isInputElement = useCallback((target: HTMLElement) => {
    return ['INPUT', 'TEXTAREA'].includes(target?.tagName);
  }, []);

  const isSupportedStreamType = useCallback((type: string) => {
    return STREAM_TYPE_SUPPORT.ALL.includes(
      type as (typeof STREAM_TYPE_SUPPORT.ALL)[number],
    );
  }, []);

  const canSeek = useCallback((type: string) => {
    return STREAM_TYPE_SUPPORT.SEEK.includes(
      type as (typeof STREAM_TYPE_SUPPORT.SEEK)[number],
    );
  }, []);

  const handlePlayPause = useCallback((video: HTMLVideoElement) => {
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const handleMuteToggle = useCallback((video: HTMLVideoElement) => {
    video.muted = !video.muted;
    const muteValue = video.muted ? 'true' : 'false';
    localStorage.setItem(MUTE_VOLUME_PLAYER, muteValue);
    video.dispatchEvent(new Event('volumechange'));
  }, []);

  const handleVolumeChange = useCallback(
    (video: HTMLVideoElement, delta: number) => {
      const newVolume = Math.min(Math.max(video.volume + delta, 0), 1);
      video.volume = newVolume;

      if (newVolume === 0) {
        video.muted = true;
        localStorage.setItem(MUTE_VOLUME_PLAYER, 'true');
      } else {
        video.muted = false;
        localStorage.setItem(MUTE_VOLUME_PLAYER, 'false');
      }

      localStorage.setItem(VOLUME_PLAYER, newVolume.toString());
      video.dispatchEvent(new Event('volumechange'));
    },
    [],
  );

  const handleSeek = useCallback((video: HTMLVideoElement, seconds: number) => {
    const newTime = Math.max(video.currentTime + seconds, 0);
    video.currentTime = newTime;

    if (video.paused) {
      video.play().catch(() => {});
    }

    // Track seek event
    saveSeekEvent({
      timestamp: Date.now(),
      direction: seconds > 0 ? 'forward' : 'backward',
      method: 'keyboard',
    });
  }, []);

  const handleNavigation = useCallback(
    (video: HTMLVideoElement, key: string) => {
      const oldTime = video.currentTime;
      const percentage = key === '0' ? 0 : parseInt(key) / 10;
      const newTime = video.duration * percentage;
      video.currentTime = newTime;

      // Track seek event for navigation
      saveSeekEvent({
        timestamp: Date.now(),
        direction: newTime > oldTime ? 'forward' : 'backward',
        method: 'keyboard',
      });
    },
    [],
  );

  const handleKeyboardShortcut = useCallback(
    (event: KeyboardEvent) => {
      // Prevent multiple executions
      if (event.defaultPrevented) return;

      const video = getVideoElement();
      if (!video || !isPlaySuccess || !streamType) return;

      const target = event.target as HTMLElement;
      if (isInputElement(target)) return;

      if (!isSupportedStreamType(streamType)) return;

      const { key } = event;

      // Play/Pause controls
      if (key === KEYBOARD_SHORTCUTS.SPACE || key === KEYBOARD_SHORTCUTS.K) {
        event.preventDefault();
        event.stopPropagation();
        handlePlayPause(video);
        return;
      }

      // Mute/Unmute control
      if (key === KEYBOARD_SHORTCUTS.M) {
        event.preventDefault();
        event.stopPropagation();
        handleMuteToggle(video);
        return;
      }

      // Volume controls
      if (key === KEYBOARD_SHORTCUTS.ARROW_UP) {
        event.preventDefault();
        event.stopPropagation();
        handleVolumeChange(video, VOLUME_STEP);
        return;
      }

      if (key === KEYBOARD_SHORTCUTS.ARROW_DOWN) {
        event.preventDefault();
        event.stopPropagation();
        handleVolumeChange(video, -VOLUME_STEP);
        return;
      }

      // Seek controls (only for VOD and Playlist)
      if (canSeek(streamType)) {
        if (key === KEYBOARD_SHORTCUTS.ARROW_LEFT) {
          event.preventDefault();
          event.stopPropagation();
          handleSeek(video, -SEEK_STEP);
          return;
        }

        if (key === KEYBOARD_SHORTCUTS.ARROW_RIGHT) {
          event.preventDefault();
          event.stopPropagation();
          handleSeek(video, SEEK_STEP);
          return;
        }

        // Number navigation
        if (/^[0-9]$/.test(key)) {
          event.preventDefault();
          event.stopPropagation();
          handleNavigation(video, key);
          return;
        }
      }
    },
    [
      getVideoElement,
      isInputElement,
      isSupportedStreamType,
      canSeek,
      handlePlayPause,
      handleMuteToggle,
      handleVolumeChange,
      handleSeek,
      handleNavigation,
      isPlaySuccess,
      streamType,
    ],
  );

  useEffect(() => {
    // Remove existing listener if any
    if (eventListenerRef.current) {
      document.removeEventListener('keydown', eventListenerRef.current, true);
    }

    // Add new listener
    eventListenerRef.current = handleKeyboardShortcut;
    document.addEventListener('keydown', handleKeyboardShortcut, true);

    return () => {
      if (eventListenerRef.current) {
        document.removeEventListener('keydown', eventListenerRef.current, true);
        eventListenerRef.current = null;
      }
    };
  }, [handleKeyboardShortcut]);
}
