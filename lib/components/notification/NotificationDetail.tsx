import { useEffect, useMemo, useRef, useState } from 'react';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { InboxDetailItem } from '../../api/notification';
import styles from './DropdownNoti.module.css';
import { usePreventOuterScroll } from '@/lib/hooks/usePreventOuterScroll';
import Image from 'next/image';

interface Props {
  data: InboxDetailItem;
  onClose: () => void;
}

function formatTime(createdAt: string): string {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diff = Math.floor((now - created) / 1000);

  if (diff < 60) return 'Vài giây trước';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} tuần trước`;
  return `${Math.floor(diff / 2592000)} tháng trước`;
}

export default function NotificationDetail({ data }: Props) {
  const detailRef = useRef<HTMLDivElement>(null);
  usePreventOuterScroll(detailRef);

  const timeText = useMemo(
    () => formatTime(data.created_at || ''),
    [data.created_at],
  );

  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (detailRef.current) {
        setHasScroll(
          detailRef.current.scrollHeight > detailRef.current.clientHeight,
        );
      }
    };
    checkScroll();
    // Recheck on window resize
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [data]);

  return (
    <div className="flex flex-col w-full h-full relative">
      <div
        ref={detailRef}
        className={`flex flex-col overflow-y-auto p-6 gap-4 ${
          styles.scrollBar
        } ${hasScroll ? 'pb-16' : ''}`}
      >
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="text-[18px] tablet:text-xl font-semibold text-white-smoke line-clamp-2 mb-2">
              {data.title}
            </h3>
            <p className="text-[14px] text-spanish-gray">{timeText}</p>
          </div>
          <div className="w-[36px] h-[36px] flex-shrink-0">
            <Image
              src={data.category_icon || '/images/default_icon_noti.png'}
              alt="icon"
              width={36}
              height={36}
              className="rounded-full"
              unoptimized
            />
          </div>
        </div>

        {data.image && (
          <img
            src={data.image}
            alt="Notification Detail"
            className="w-full h-full aspect-[16/9] rounded-lg pointer-events-none select-none"
          />
        )}

        <p className="text-[16px] text-white-smoke">{data.body}</p>
      </div>

      {data.url && !hasScroll && (
        <div
          onClick={() => window.open(data.url, '_blank')}
          className="p-4 flex justify-end items-center cursor-pointer group"
        >
          <span className="text-sm text-white-smoke group-hover:text-fpl transition mr-2">
            Xem ngay
          </span>
          <MdOutlineKeyboardArrowRight
            size={24}
            className="group-hover:text-fpl transition"
          />
        </div>
      )}

      {data.url && hasScroll && (
        <div
          onClick={() => window.open(data.url, '_blank')}
          className="absolute z-1 bottom-[7.5%] right-[0px] w-full h-[60px] flex justify-end items-center cursor-pointer group"
          style={{
            background:
              'linear-gradient(0deg, #0D0D0C 0%, rgba(13, 13, 12, 0.65) 70.26%, rgba(13, 13, 12, 0) 100%)',
          }}
        >
          <div className="flex items-center pr-4">
            <span className="text-sm text-white-smoke group-hover:text-fpl transition mr-2">
              Xem ngay
            </span>
            <MdOutlineKeyboardArrowRight
              size={24}
              className="group-hover:text-fpl transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
