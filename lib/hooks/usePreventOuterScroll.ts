import { useEffect } from 'react';

// Extend HTMLElement interface to add lastTouchY property
declare global {
  interface HTMLElement {
    lastTouchY?: number;
  }
}

export function usePreventOuterScroll(
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;

      const isAtTop = scrollTop <= 0;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const touch = e.touches[0];
      const isAtTop = scrollTop <= 0;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      const isScrollingUp =
        e.cancelable && touch.clientY > (el.lastTouchY || 0);
      const isScrollingDown =
        e.cancelable && touch.clientY < (el.lastTouchY || 0);

      if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
        e.preventDefault();
      }

      el.lastTouchY = touch.clientY;
    };

    const onTouchStart = (e: TouchEvent) => {
      el.lastTouchY = e.touches[0].clientY;
    };

    const options = { passive: false } as AddEventListenerOptions;

    const timeout = setTimeout(() => {
      el.addEventListener('wheel', onWheel, options);
      el.addEventListener('touchstart', onTouchStart, options);
      el.addEventListener('touchmove', onTouchMove, options);
    }, 0);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [ref]);
}
