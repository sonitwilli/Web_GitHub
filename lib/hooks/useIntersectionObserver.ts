import { useEffect, useRef, useState } from "react";

interface Props {
  threshold?: number;
}

export const useIntersectionObserver = ({ threshold }: Props) => {
  const targetElement = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: threshold || 0, // Trigger when 10% of the element is visible
        rootMargin: "0px",
      }
    );

    if (targetElement.current) {
      observer.observe(targetElement.current);
    }

    return () => {
      if (targetElement.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(targetElement.current);
      }
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isInViewport, targetElement };
};
