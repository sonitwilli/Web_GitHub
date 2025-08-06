import { useEffect, useState, useRef } from 'react';
import LogoFPTPlayMini from '../svg/LogoFPTPlayMini';
import { scaleImageUrl } from '@/lib/utils/methods';
import styles from './NotificationPopup.module.css';
import { useNotification } from '@/lib/hooks/useNotification';

interface NotificationPopupProps {
  title?: string;
  body?: string;
  image?: string;
  url?: string;
  message_id?: string;
}

export default function NotificationPopup({
  title,
  body,
  image,
  url,
  message_id,
}: NotificationPopupProps) {
  const [visible, setVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { markRead } = useNotification();

  useEffect(() => {
    startTimer();
    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      closePopup();
    }, 5000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closePopup = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setVisible(false);
    }, 400);
  };

  const handleMouseEnter = () => {
    clearTimer();
  };

  const handleMouseLeave = () => {
    startTimer();
  };

  const handleClick = () => {
    if (url) {
      const separator = url.includes('?') ? '&' : '?';
      window.open(`${url}${separator}from=Notification`, '_blank');

      if (message_id) {
        markRead([message_id]);
      }

      closePopup();
    } else {
      return;
    }
  };

  if (!visible) return null;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`fixed select-none cursor-pointer top-[111px] right-4 tablet:top-[64px] xl:top-[120px] tablet:right-6 xl:right-10 w-[343px] tablet:w-[480px] ${
        image ? 'h-[108px]' : 'h-[122px]'
      } p-4 bg-charleston-green border border-black-olive rounded-2xl shadow-lg z-[9999]
      ${isLeaving ? styles.toastLeave : styles.toastOpen}`}
    >
      {image ? (
        <div className="flex flex-row space-x-2">
          <img
            src={scaleImageUrl({ imageUrl: image, width: 300 })}
            alt="notification"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/images/default_icon_noti.png';
            }}
            className="w-32 h-18 rounded-lg object-cover bg-black"
          />
          <div className="flex flex-col w-[312px] space-y-1">
            <div className="font-semibold text-lg leading-[130%] tracking-wide text-white-smoke truncate">
              {title}
            </div>
            <div className="text-sm leading-[130%] tracking-wide text-white-smoke line-clamp-2">
              {body}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full h-full">
          <div className="flex flex-row items-center gap-4 w-full h-10">
            <div className="w-[39.63px] h-[39.63px] rounded-full flex items-center justify-center">
              <LogoFPTPlayMini />
            </div>
            <div className="font-semibold text-[20px] leading-[130%] tracking-[0.02em] text-white-smoke truncate">
              {title}
            </div>
          </div>
          <div className="text-sm leading-[130%] tracking-[0.02em] text-white-smoke line-clamp-2">
            {body}
          </div>
        </div>
      )}
    </div>
  );
}
