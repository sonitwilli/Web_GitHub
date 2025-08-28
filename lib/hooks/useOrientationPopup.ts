import { useEffect, useState } from 'react';

type Orientation = 'portrait' | 'landscape';

type Options = {
  /** Max width to consider as mobile/tablet (default 1024) */
  mobileMaxWidth?: number;
  /** If true, the popup starts open */
  initialOpen?: boolean;
};

export default function useOrientationPopup(options: Options = {}) {
  const { mobileMaxWidth = 1024} = options;
  const getInitial = (): Orientation =>
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight
      ? 'landscape'
      : 'portrait';

  const [orientation, setOrientation] = useState<Orientation>(getInitial);
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const now = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    return now === 'landscape' && window.innerWidth < mobileMaxWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let last = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    const onResize = () => {
      const now = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      if (now !== last) {
        last = now;
        setOrientation(now as Orientation);
        // open only when in landscape on mobile widths
        setOpen(now === 'landscape' && window.innerWidth < mobileMaxWidth);
      }
      // also update if width crosses mobile threshold
      else {
        // if width changed but orientation same, re-evaluate open
        setOpen(now === 'landscape' && window.innerWidth < mobileMaxWidth);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileMaxWidth]);

  const close = () => setOpen(false);

  // Lock scrolling when popup is open, restore when closed
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    const prevOverflow = el.style.overflow;
    const prevTouch = document.body.style.touchAction;
    if (open) {
      el.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      el.style.overflow = prevOverflow || '';
      document.body.style.touchAction = prevTouch || '';
    }
    return () => {
      // restore on unmount
      el.style.overflow = prevOverflow || '';
      document.body.style.touchAction = prevTouch || '';
    };
  }, [open]);

  return { orientation, open, close, setOpen } as const;
}