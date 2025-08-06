import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

export const SCREEN_SIZES = {
  TABLET: 768,
  DESKTOP: 1280,
};

export enum VIEWPORT_TYPE {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export default function useScreenSize() {
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(800);
  const viewportType = useMemo<VIEWPORT_TYPE>(() => {
    if (width > 1279) {
      return VIEWPORT_TYPE.DESKTOP;
    }
    if (width > 767) {
      return VIEWPORT_TYPE.TABLET;
    }
    return VIEWPORT_TYPE.MOBILE;
  }, [width]);

  const handleResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };
  useEffect(() => {
    const debouncedResize = debounce(handleResize, 150);

    debouncedResize();

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
    };
  });

  return { width, height, viewportType };
}
