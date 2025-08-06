import { MaturityRating as BaseMaturityRating } from '@/lib/api/vod';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './LimitAgeOverlay.module.css';
import useScreenSize from '@/lib/hooks/useScreenSize';

// Extend MaturityRating to allow duration
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
  // Default: TL
  const top = isMobile ? 'top-[12px]' : isTablet ? 'top-[32px]' : 'top-[48px]';
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
    ? 'bottom-[12px]'
    : isTablet
    ? 'bottom-[32px]'
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
  currentTime,
  duration,
}: Props) {
  const position = maturityRating?.position || 'TL';
  const showDuration = maturityRating?.duration || 10; // seconds
  const hasValue = !!maturityRating?.value;
  const hasAdvisories = !!maturityRating?.advisories;

  // Show at start, W2, W3
  const W2 = 1201;
  const W3 = Math.round(1200 + ((duration - 1200) * 2) / 3);

  const [visible, setVisible] = useState(false);
  const [hideAdvisories, setHideAdvisories] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [countdown, setCountdown] = useState(showDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const overlayHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { width } = useScreenSize();
  // Check if user is mobile
  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

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

  // Reset overlay when currentTime hits W1/W2/W3
  useEffect(() => {
    let show = false;
    if (currentTime >= 1 && currentTime < 2) show = true;
    if (
      (currentTime === W2 && duration > 1200) ||
      (currentTime === W3 && duration > 1800)
    )
      show = true;
    if (show) {
      setVisible(true);
      setIsHiding(false);
      setHideAdvisories(false);
      setCountdown(showDuration);
    }
  }, [currentTime, duration, W2, W3, showDuration]);

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

  if (!maturityRating || !hasValue || !visible) return null;

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
  const widthClass = '40vw';

  return (
    <div
      className={`absolute ${posClass} ${widthClass} select-none z-1 ${fadeInAnim} ${fadeOutAnim}`}
      onClick={handleClick}
      aria-label="Giới hạn độ tuổi"
    >
      <div
        className={`relative flex ${justify} items-center h-full px-2 xl:px-4 py-2`}
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
  );
}
