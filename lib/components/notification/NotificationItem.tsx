import Image from 'next/image';
import { InboxListItem } from '../../api/notification';
import { useMemo, useState } from 'react';
import { scaleImageUrl } from '@/lib/utils/methods';
import ReadMoreNoti from '../svg/ReadMoreNoti';
import ReadMoreNotiHover from '../svg/ReadMoreNotiHover';
import useScreenSize from '@/lib/hooks/useScreenSize';

interface Props {
  data: InboxListItem;
  onShowDetail: (item: InboxListItem) => void;
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

export default function NotificationItem({ data, onShowDetail }: Props) {
  const { width } = useScreenSize();
  const timeText = useMemo(
    () => formatTime(data.created_at || ''),
    [data.created_at],
  );

  const [isHovering, setIsHovering] = useState(false);

  const thumbSrc = useMemo(() => {
    const url = scaleImageUrl({
      imageUrl: data.image || '',
      width: 300,
      height: 0,
    });
    const cleanedUrl = (url || '/images/default_img_noti.png').trim();
    return cleanedUrl;
  }, [data.image]);

  // Check if user is mobile
  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  return (
    <div
      className="relative flex p-4 gap-4 bg-eerie-black hover:bg-charleston-green cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Icon */}
      <div className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center">
        <Image
          src={data.category_icon || '/images/default_icon_noti.png'}
          alt="icon"
          width={36}
          height={36}
          className="rounded-full"
          unoptimized
        />
        {data.status === 'unread' && (
          <span className="absolute top-0 right-0 w-[9px] h-[9px] rounded-full bg-gradient-to-r from-portland-orange to-lust border border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 w-0 flex-1">
        <h3
          className={`text-sm font-semibold line-clamp-1 ${
            data.status === 'unread' ? 'text-white' : 'text-spanish-gray'
          }`}
        >
          {data.title}
        </h3>
        <div className="relative">
          <p
            className={`text-sm line-clamp-2 break-all ${
              data.status === 'unread' ? 'text-white' : 'text-spanish-gray'
            }`}
          >
            {data.body}
          </p>
          {data.body && data.body.length >= 65 && (
            <span
              className="absolute bottom-0 right-0 z-1 flex items-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail(data);
              }}
            >
              {isHovering ? <ReadMoreNotiHover /> : <ReadMoreNoti />}
            </span>
          )}
        </div>
        <p className="text-xs text-spanish-gray">{timeText}</p>
      </div>

      {/* Thumbnail */}
      {thumbSrc && (
        <div className="h-[52px] w-[92px] tablet:h-[72px] tablet:w-[128px]  rounded-lg overflow-hidden shrink-0">
          <Image
            src={thumbSrc}
            alt="thumbnail"
            width={isMobile ? 92 : 128}
            height={isMobile ? 52 : 72}
            className="w-full h-full object-cover"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = '/images/default_img_noti.png';
            }}
          />
        </div>
      )}
    </div>
  );
}
