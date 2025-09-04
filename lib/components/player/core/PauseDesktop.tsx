import { PAUSE_PLAYER_MANUAL, VIDEO_ID } from '@/lib/constant/texts';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { saveSessionStorage } from '@/lib/utils/storage';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import { useEffect, useRef, useState } from 'react';
import styles from './PauseDesktop.module.css';
export default function PauseDesktop() {
  const { isVideoPaused, isPauseClick, setIsPauseClick, isEndVideo } =
    usePlayerPageContext();
  const { viewportType } = useScreenSize();
  const [hiddenIcon, setHiddenIcon] = useState(true);
  const timeout1 = useRef<NodeJS.Timeout | null>(null);
  const timeout2 = useRef<NodeJS.Timeout | null>(null);
  const timeout3 = useRef<NodeJS.Timeout | null>(null);

  const clearTimeoutPause = () => {
    // if (timeout1?.current) {
    //   clearTimeout(timeout1.current);
    // }
    // if (timeout2?.current) {
    //   clearTimeout(timeout2.current);
    // }
    // if (timeout3?.current) {
    //   clearTimeout(timeout3.current);
    // }
  };

  useEffect(() => {
    clearTimeoutPause();
    if (isPauseClick) {
      timeout1.current = setTimeout(() => {
        setHiddenIcon(false);
      }, 100);
    } else {
      timeout2.current = setTimeout(() => {
        setHiddenIcon(true);
      }, 100);
    }

    if (isPauseClick) {
      timeout3.current = setTimeout(() => {
        if (setIsPauseClick) {
          setIsPauseClick(0);
        }
      }, 800);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPauseClick]);

  const click = () => {
    try {
      clearTimeoutPause();
      const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
      if (video) {
        if (isVideoPaused) {
          video.play();
        } else {
          video.pause();
          saveSessionStorage({
            data: [
              {
                key: PAUSE_PLAYER_MANUAL,
                value: 'true',
              },
            ],
          });
        }
      }
      // setHiddenIcon(true);
      if (setIsPauseClick) {
        setIsPauseClick(new Date().getTime());
      }
    } catch {}
  };
  if (viewportType === VIEWPORT_TYPE.MOBILE || hiddenIcon || isEndVideo)
    return null;

  return (
    <div
      onClick={click}
      className="PauseDesktop absolute z-[2] top-1/2 -translate-y-1/2 left-0 w-full flex items-center justify-center"
    >
      <div className={`hover:cursor-pointer ${hiddenIcon ? 'opacity-0' : ''}`}>
        {isVideoPaused ? (
          <img
            src="/images/pause_pc.png"
            alt="pause"
            width={88}
            height={88}
            className={styles.btn}
          />
        ) : (
          <img
            src="/images/play_pc.png"
            alt="play"
            width={88}
            height={88}
            className={styles.btn}
          />
        )}
      </div>
    </div>
  );
}
