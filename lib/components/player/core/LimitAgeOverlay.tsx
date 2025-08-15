import { MaturityRating as BaseMaturityRating } from '@/lib/api/vod';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './LimitAgeOverlay.module.css';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { useAppSelector } from '@/lib/store';

// Extend với duration
interface MaturityRating extends BaseMaturityRating {
  duration?: number;
}

type Props = {
  maturityRating?: MaturityRating;
  videoRef: HTMLVideoElement | null;
  currentTime: number;
  duration: number;
};

function getPositionStyle(
  position: string,
  isTablet: boolean,
  isMobile: boolean,
) {
  // Mobile/tablet positioning
  const top = isMobile ? 'top-[16px]' : isTablet ? 'top-[24px]' : 'top-[48px]';
  const left = isMobile
    ? 'left-[16px]'
    : isTablet
    ? 'left-[32px]'
    : 'left-[48px]';
  const right = isMobile
    ? 'right-[16px]'
    : isTablet
    ? 'right-[32px]'
    : 'right-[48px]';
  const bottom = isMobile
    ? 'bottom-[16px]'
    : isTablet
    ? 'bottom-[24px]'
    : 'bottom-[48px]';

  switch (position) {
    case 'TL':
      return `${left} ${top}`;
    case 'TR':
      return `${right} ${top}`;
    case 'BL':
      return `${left} ${bottom}`;
    case 'BR':
      return `${right} ${bottom}`;
    default:
      return `${left} ${top}`;
  }
}

export default function LimitAgeOverlay({
  maturityRating,
  videoRef,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentTime,
  duration,
}: Props) {
  const position = maturityRating?.position || 'TL';
  const showDuration = maturityRating?.duration || 10;
  const hasValue = !!maturityRating?.value;
  const hasAdvisories = !!maturityRating?.advisories;

  // Show at start, W2, W3
  const W2 = 1201;
  const W3 = Math.round(1200 + ((duration - 1200) * 2) / 3);

  const [visible, setVisible] = useState(false);
  const [hideAdvisories, setHideAdvisories] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [countdown, setCountdown] = useState(showDuration);
  const [isCalculating, setIsCalculating] = useState(true);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const overlayHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stagesShownRef = useRef<{ s1: boolean; s2: boolean; s3: boolean }>({
    s1: false,
    s2: false,
    s3: false,
  });

  const { width, height } = useScreenSize();
  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  // Context data
  const { realPlaySeconds, videoHeight } = usePlayerPageContext();
  const { isFullscreen } = useAppSelector((s) => s.player);

  // Width calculation
  const calculateVideoWidth = useMemo(() => {
    const aspectRatio = 16 / 9;

    if (isFullscreen) {
      // Fullscreen: sử dụng toàn bộ viewport
      const viewportHeight = height || 720;
      const viewportWidth = width || 1280;
      const widthFromHeight = viewportHeight * aspectRatio;

      return `${Math.min(widthFromHeight, viewportWidth)}px`;
    }

    // Mobile/Tablet: đơn giản hóa logic
    if (isMobile || isTablet) {
      // Sử dụng toàn bộ width viewport trừ margin
      const margin = isMobile ? 16 : 32; // margin mỗi bên
      const availableWidth = width - margin * 2;
      return `${availableWidth}px`;
    }

    // Desktop: tính từ videoHeight hoặc fallback
    if (videoHeight && videoHeight > 0) {
      const calculatedWidth = videoHeight * aspectRatio;
      const maxWidth = width - 96; // margin desktop
      return `${Math.min(calculatedWidth, maxWidth)}px`;
    }

    // Fallback desktop
    return `${width - 96}px`;
  }, [videoHeight, isMobile, isTablet, isFullscreen, width, height]);

  // Effect để theo dõi việc tính toán width - chỉ hiển thị khi đã sẵn sàng
  useEffect(() => {
    // Kiểm tra xem có đủ thông tin để tính toán width chính xác không
    const hasValidDimensions = width > 0 && height > 0;
    const hasVideoData = videoHeight && videoHeight > 0;
    const isResponsiveReady = isMobile || isTablet; // mobile/tablet không cần videoHeight

    const canShow =
      hasValidDimensions && (hasVideoData || isResponsiveReady || isFullscreen);

    if (canShow) {
      // Delay nhỏ để đảm bảo DOM đã render xong
      const timer = setTimeout(() => {
        setIsCalculating(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsCalculating(true);
    }
  }, [width, height, videoHeight, isFullscreen, isMobile, isTablet]);

  // Force show on mount - đảm bảo luôn hiển thị ít nhất 1 lần
  useEffect(() => {
    if (!isCalculating && !hasShownOnce && hasValue) {
      setVisible(true);
      setIsHiding(false);
      setHideAdvisories(false);
      setCountdown(showDuration);
      setHasShownOnce(true);
      stagesShownRef.current.s1 = true; // Mark as shown
    }
  }, [isCalculating, hasShownOnce, hasValue, showDuration]);

  // Recursive countdown effect
  useEffect(() => {
    if (!visible) return;
    if (hideAdvisories) return;
    if (countdown > 0) {
      timerRef.current = setTimeout(
        () => setCountdown((c: number) => c - 1),
        1000,
      );
    } else {
      setHideAdvisories(true);
      // 0.7s sau thì ẩn overlay
      hideTimerRef.current = setTimeout(() => {
        setIsHiding(true);
        overlayHideTimerRef.current = setTimeout(() => setVisible(false), 700);
      }, 700);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (overlayHideTimerRef.current)
        clearTimeout(overlayHideTimerRef.current);
    };
  }, [visible, countdown, hideAdvisories]);

  // Trigger overlay at different stages
  useEffect(() => {
    const played = Number(realPlaySeconds) || 0;
    let trigger = false;

    // Nếu chưa hiển thị lần nào và đã có thời gian phát
    if (!hasShownOnce && played > 0) {
      trigger = true;
      setHasShownOnce(true);
      stagesShownRef.current.s1 = true;
    }
    // Stage 1: >= 1s (nếu chưa hiển thị)
    else if (!stagesShownRef.current.s1 && played >= 1) {
      stagesShownRef.current.s1 = true;
      trigger = true;
    }
    // Stage 2: W2 for long videos
    else if (duration > 1200 && !stagesShownRef.current.s2 && played >= W2) {
      stagesShownRef.current.s2 = true;
      trigger = true;
    }
    // Stage 3: W3 for very long videos
    else if (duration > 1800 && !stagesShownRef.current.s3 && played >= W3) {
      stagesShownRef.current.s3 = true;
      trigger = true;
    }

    if (trigger) {
      setVisible(true);
      setIsHiding(false);
      setHideAdvisories(false);
      setCountdown(showDuration);
    }
  }, [realPlaySeconds, duration, W2, W3, showDuration, hasShownOnce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (overlayHideTimerRef.current)
        clearTimeout(overlayHideTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (videoRef) {
      if (videoRef.paused) videoRef.play();
      else videoRef.pause();
    }
  };

  if (!maturityRating || !hasValue || !visible || isCalculating) return null;

  const isLeft = position === 'TL' || position === 'BL';
  const posClass = getPositionStyle(position, isTablet, isMobile);

  // Animation classes from CSS module
  const fadeInAnim = isLeft ? styles.fadeInLeft : styles.fadeInRight;
  const fadeOutAnim = isHiding ? styles.fadeOut : '';

  // If advisories are present and visible, keep previous block layout
  const borderClass = isLeft
    ? 'border-l-4 pl-2 xl:pl-4'
    : 'border-r-4 pr-2 xl:pr-4';
  const alignItems = isLeft ? 'items-start' : 'items-end';
  const justify = isLeft ? 'justify-start' : 'justify-end';

  return (
    <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
      <div
        className="relative h-full mx-auto"
        style={{ width: calculateVideoWidth }}
      >
        <div
          className={`absolute ${posClass} select-none z-1 ${fadeInAnim} ${fadeOutAnim} pointer-events-auto max-w-[90%] ${
            isMobile ? 'max-w-[80%]' : ''
          }`}
          onClick={handleClick}
          aria-label="Giới hạn độ tuổi"
        >
          <div
            className={`relative flex ${justify} items-center h-full ${
              isMobile
                ? 'px-2 py-1'
                : isTablet
                ? 'px-3 py-2'
                : 'px-2 xl:px-4 py-2'
            }`}
          >
            <div className={`flex flex-col ${alignItems} w-fit`}>
              <div
                className={`font-bold text-white ${styles.textShadowValue} drop-shadow-md text-[14px] tablet:text-[16px] xl:text-[24px] leading-[130%] tracking-[0.02em]`}
              >
                <span className={`${borderClass} border-fpl block`}>
                  {maturityRating.value}
                </span>
              </div>
              {hasAdvisories && (
                <div
                  className={`text-white-smoke ${
                    styles.textShadowAdvisories
                  } drop-shadow-md max-w-xl ${
                    hideAdvisories ? styles.hideAdvisories : ''
                  }`}
                >
                  <p
                    className={`block overflow-hidden text-ellipsis line-clamp-2 ${borderClass} border-fpl text-[12px] tablet:text-[14px] xl:text-[16px] break-words m-0 p-0`}
                  >
                    {maturityRating.advisories}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
