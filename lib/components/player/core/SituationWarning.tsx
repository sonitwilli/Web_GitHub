import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VIDEO_ID } from '@/lib/constant/texts';
import styles from './SituationWarning.module.css';
import { usePlayerPageContext } from '../context/PlayerPageContext';

// ================== INTERFACES ==================
export interface WarningData {
  from: number; // Start time in seconds
  to: number; // End time in seconds
  content: string; // HTML content string (supports HTML tags)
}

export interface SituationWarningProps {
  warningData: WarningData[];
  className?: string;
  countingWatchTime?: boolean;
  onHandleShowSituationWarning?: (val: boolean | null) => void;
}

// ================== MAIN COMPONENT ==================
const SituationWarning: React.FC<SituationWarningProps> = ({
  warningData = [],
  countingWatchTime = false,
  onHandleShowSituationWarning,
}) => {
  // ================== STATE MANAGEMENT ==================
  const [currentWarning, setCurrentWarning] = useState<WarningData | null>(
    null,
  );
  const [warningText, setWarningText] = useState<string | null>(null);
  const [isShowSituationWarning, setIsShowSituationWarning] =
    useState<boolean>(false);
  const [enableShowSituationWarning, setEnableShowSituationWarning] = useState<
    boolean | null
  >(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { isExpanded } = usePlayerPageContext();

  // ================== REFS FOR COUNTDOWN ==================
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const TIME_INTERVAL = 1000;

  const currentIndexRef = useRef<number>(0);
  const isShowSituationWarningRef = useRef<boolean>(false);
  const warningTextRef = useRef<string | null>(null);

  // ================== SYNC REFS WITH STATE ==================
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    isShowSituationWarningRef.current = isShowSituationWarning;
  }, [isShowSituationWarning]);
  useEffect(() => {
    warningTextRef.current = warningText;
  }, [warningText]);

  // ================== CORE FUNCTIONS ==================
  const startCountdown = useCallback(
    (data: WarningData[]) => {
      const videoElement = document.getElementById(
        VIDEO_ID,
      ) as HTMLVideoElement;

      if (!videoElement || !data.length) {
        return;
      }

      const countdown = () => {
        const currentIdx = currentIndexRef.current || 0;
        const currentTime = Math.round(videoElement.currentTime);
        const currentWarn = data[currentIdx];

        setCurrentWarning(currentWarn);

        if (
          currentWarn &&
          currentTime >= currentWarn.from &&
          currentTime <= currentWarn.to
        ) {
          if (
            !isShowSituationWarningRef.current ||
            warningTextRef.current !== currentWarn.content
          ) {
            setIsShowSituationWarning(true);
            setWarningText(currentWarn.content);
          }
        } else {
          setIsShowSituationWarning(false);
          let nextIndex = -1;

          if (currentWarn) {
            if (currentTime > currentWarn.from) {
              nextIndex = currentIdx + 1;
            } else if (currentTime < currentWarn.from) {
              nextIndex = currentIdx - 1;
            }
          }

          if (nextIndex < 0 || nextIndex >= data.length) {
            if (isShowSituationWarningRef.current) {
              setIsShowSituationWarning(false);
            }
          } else {
            setCurrentIndex(nextIndex);
          }
        }

        countdownTimeoutRef.current = setTimeout(countdown, TIME_INTERVAL);
      };

      countdown();
    },
    [TIME_INTERVAL],
  );

  const stopCountdown = useCallback(() => {
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
  }, []);

  // ================== EFFECTS ==================

  useEffect(() => {
    if (enableShowSituationWarning === true) {
      onHandleShowSituationWarning?.(true);
    } else if (enableShowSituationWarning === false) {
      onHandleShowSituationWarning?.(false);
    }
  }, [enableShowSituationWarning, onHandleShowSituationWarning]);

  useEffect(() => {
    if (isShowSituationWarning === true) {
      setEnableShowSituationWarning(true);
    } else if (isShowSituationWarning === false) {
      setEnableShowSituationWarning(false);
    }
  }, [isShowSituationWarning]);

  useEffect(() => {
    if (countingWatchTime === false) {
      stopCountdown();
    } else if (countingWatchTime === true) {
      if (warningData && warningData.length) {
        startCountdown(warningData);
      }
    }
  }, [countingWatchTime, warningData, startCountdown, stopCountdown]);

  useEffect(() => {
    if (warningData && warningData.length) {
      startCountdown(warningData);
    }
  }, [warningData, startCountdown]);

  // Component cleanup - automatically handles timeout cleanup
  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  // ================== RENDER CONDITIONS ==================

  if (
    !(
      isShowSituationWarning === true &&
      currentWarning &&
      currentWarning.content
    )
  ) {
    return null;
  }

  // ================== RENDER ==================
  return (
    <div
      className={`${
        isExpanded ? 'w-screen' : 'max-w-full'
      }  bottom-[70px] tablet:bottom-[111px] absolute left-1/2 transform -translate-x-1/2 z-[1] overflow-hidden flex justify-center items-center`}
    >
      <p
        className={`${
          isExpanded ? 'max-w-[65vw]' : 'w-fit break-words overflow-hidden'
        } font-medium text-[14px] tablet:text-base xl:text-[18px] leading-[130%] tracking-[0.02em] text-center text-white ${
          styles.situationWarningContent
        } text-shadow-[0px_0px_5px_rgba(0,0,0,0.8)]`}
        dangerouslySetInnerHTML={{
          __html: warningText || currentWarning.content,
        }}
      />
    </div>
  );
};

export default SituationWarning;
