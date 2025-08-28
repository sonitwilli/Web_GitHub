import { useEffect, useState } from 'react';
import { getUserAgent } from '@/lib/utils/methods';

type Orientation = 'portrait' | 'landscape';

type Options = {
  /** If true, the popup starts open */
  initialOpen?: boolean;
};

export default function useOrientationPopup(options: Options = {}) {
  // UA-based detection decides mobile vs tablet/desktop; no width option needed.
  const getInitial = (): Orientation =>
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight
      ? 'landscape'
      : 'portrait';

  const [orientation, setOrientation] = useState<Orientation>(getInitial);
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const now = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    // Use UA to determine if device is mobile (not tablet/desktop)
    try {
      const ua = getUserAgent();
      const isMobile = ua?.device?.type === 'mobile';
      return isMobile && now === 'landscape';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let last = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    const onResize = () => {
      const now = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      if (now !== last) {
        last = now;
        setOrientation(now as Orientation);
        // open only when in landscape on mobile devices (UA-based)
        try {
          const ua = getUserAgent();
          const isMobile = ua?.device?.type === 'mobile';
          setOpen(isMobile && now === 'landscape');
        } catch {
          setOpen(false);
        }
      } else {
        // if width changed but orientation same, re-evaluate open using UA
        try {
          const ua = getUserAgent();
          const isMobile = ua?.device?.type === 'mobile';
          setOpen(isMobile && now === 'landscape');
        } catch {
          setOpen(false);
        }
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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