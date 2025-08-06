import { useRef, useEffect } from 'react';

export function useRatioElement() {
  const observeElement = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const checkRatio = () => {
    if (!observeElement.current) return;
    const el = observeElement.current;
    const resizeObserver = new ResizeObserver(() => {
      const height = el.offsetHeight;
      const width = (16 / 9) * height;
      el.style.width = `${width}px`;
    });
    resizeObserver.observe(el);
    resizeObserverRef.current = resizeObserver;
  };

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [observeElement]);

  return { observeElement, checkRatio };
}
