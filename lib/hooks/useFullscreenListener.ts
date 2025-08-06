import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFullscreen } from '@/lib/store/slices/playerSlice';

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
}

function getFullscreenElement() {
  const doc = document as FullscreenDocument;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

const fullscreenChangeEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

export const useFullscreenListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Handler to check fullscreen on all browser
    const handleFullscreenChange = () => {
      if (document.visibilityState === 'visible') {
        const isFullscreen = !!getFullscreenElement();
        dispatch(setFullscreen(isFullscreen));
      }
    };

    // Handler for tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const isFullscreen = !!getFullscreenElement();
        dispatch(setFullscreen(isFullscreen));
      } else {
        // If tab is not active, set fullscreen to false (or keep previous?)
        dispatch(setFullscreen(false));
      }
    };

    if (document.visibilityState === 'visible') {
      fullscreenChangeEvents.forEach((event) =>
        document.addEventListener(event, handleFullscreenChange),
      );
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      fullscreenChangeEvents.forEach((event) =>
        document.removeEventListener(event, handleFullscreenChange),
      );
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);
};
