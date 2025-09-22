import { useEffect, useRef, useState } from 'react';

interface UseElementObserverOptions {
  /**
   * CSS selector để tìm element
   */
  selector: string;
  /**
   * Callback được gọi khi element xuất hiện
   */
  onElementAppear?: (element: Element) => void;
  /**
   * Callback được gọi khi element biến mất
   */
  onElementDisappear?: (element: Element) => void;
  /**
   * Root element để observe (mặc định là document)
   */
  root?: Element | null;
  /**
   * Margin cho intersection observer
   */
  rootMargin?: string;
  /**
   * Threshold cho intersection observer
   */
  threshold?: number | number[];
  /**
   * Có nên observe liên tục hay chỉ một lần
   */
  once?: boolean;
}

interface UseElementObserverReturn {
  /**
   * Element hiện tại đang được observe
   */
  element: Element | null;
  /**
   * Element có đang visible không
   */
  isVisible: boolean;
  /**
   * Ref để attach vào element cần observe
   */
  ref: React.RefObject<HTMLElement | null>;
}

/**
 * Hook để lắng nghe khi element xuất hiện/biến mất trong viewport
 * @param options - Các tùy chọn cho observer
 * @returns Object chứa element, isVisible và ref
 */
export const useElementObserver = (
  options: UseElementObserverOptions,
): UseElementObserverReturn => {
  const {
    selector,
    onElementAppear,
    onElementDisappear,
    root = null,
    rootMargin = '0px',
    threshold = 0,
    once = false,
  } = options;

  const [element, setElement] = useState<Element | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Tạo intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const targetElement = entry.target;

          if (entry.isIntersecting) {
            setIsVisible(true);
            setElement(targetElement);
            onElementAppear?.(targetElement);

            // Nếu chỉ observe một lần thì disconnect
            if (once) {
              observerRef.current?.unobserve(targetElement);
            }
          } else {
            setIsVisible(false);
            onElementDisappear?.(targetElement);
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    // Tìm element theo selector
    const findAndObserveElement = () => {
      const targetElement = document.querySelector(selector);
      if (targetElement && observerRef.current) {
        observerRef.current.observe(targetElement);
        setElement(targetElement);
      }
    };

    // Observe element ngay lập tức nếu đã tồn tại
    findAndObserveElement();

    // Nếu element chưa tồn tại, sử dụng MutationObserver để lắng nghe DOM changes
    const mutationObserver = new MutationObserver(() => {
      const targetElement = document.querySelector(selector);
      if (targetElement && observerRef.current && !element) {
        observerRef.current.observe(targetElement);
        setElement(targetElement);
      }
    });

    // Bắt đầu observe DOM changes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, [
    selector,
    onElementAppear,
    onElementDisappear,
    root,
    rootMargin,
    threshold,
    once,
    element,
  ]);

  return {
    element,
    isVisible,
    ref,
  };
};

/**
 * Hook đơn giản để lắng nghe khi element có class cụ thể xuất hiện
 * @param className - Class name của element cần lắng nghe
 * @param onAppear - Callback khi element xuất hiện
 * @param onDisappear - Callback khi element biến mất
 * @returns Object chứa element và isVisible
 */
export const useClassObserver = (
  className: string,
  onAppear?: (element: Element) => void,
  onDisappear?: (element: Element) => void,
) => {
  return useElementObserver({
    selector: `.${className}`,
    onElementAppear: onAppear,
    onElementDisappear: onDisappear,
  });
};

export default useElementObserver;
