import { useRef, useEffect } from 'react';

export function useHorizontalScrollDrag() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDown.current = false;
  };

  useEffect(() => {
    const handleWindowMouseUp = () => {
      isDown.current = false;
    };
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  return {
    containerRef,
    eventHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseLeave: onMouseUpOrLeave,
      onMouseUp: onMouseUpOrLeave,
    },
  };
}
