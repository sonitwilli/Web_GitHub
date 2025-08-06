import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { getUserAgent } from '@/lib/utils/methods';
import Image from 'next/image';

interface DownloadAppProps {
  className?: string;
}

interface WindowWithGtag extends Window {
  gtag?: (
    command: string,
    action: string,
    params: Record<string, unknown>,
  ) => void;
}

export default function DownloadApp({ className }: DownloadAppProps) {
  const router = useRouter();
  const [dynamicLink, setDynamicLink] = useState({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/ung-dung/download`,
    text: 'Tải xuống',
  });

  // Ẩn ở một số trang đặc biệt
  const shouldHide = router.pathname.includes('/minigame/vong-quay-may-man');

  // Lấy dynamic link từ API
  const getDynamicLink = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const userAgentInfo = getUserAgent();
    const deviceType = userAgentInfo.device?.type;

    // Chỉ lấy dynamic link cho mobile/tablet
    if (deviceType !== 'mobile' && deviceType !== 'tablet') return;

    setDynamicLink({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/ung-dung/download`,
      text: 'Tải xuống',
    });
  }, []);

  // Gọi API khi component mount
  useEffect(() => {
    getDynamicLink();
  }, [getDynamicLink]);

  // Track click event
  const handleDownloadClick = useCallback(() => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
      (window as WindowWithGtag).gtag!('event', 'click', {
        event_category: 'ui',
        event_action: 'click',
        event_label: 'Mo ung dung Mobile',
      });
    }
  }, []);

  if (shouldHide) return null;

  return (
    <div
      className={`fixed bottom-[16px] left-0 w-[92%] ml-[4%] z-[2] bg-black-olive-404040 rounded-[8px] flex flex-row items-center py-[12px] px-[14px] gap-[8px] h-[64px]  ${
        className || ''
      }`}
    >
      <div className="flex flex-row items-center gap-[16px] w-full">
        {/* Logo */}
        <div className="w-[32px] h-[32px] flex-none order-0 flex-grow-0 relative">
          <Image
            src="/images/logo/logo-fptplay-mini.png"
            alt="logo"
            width={32}
            height={32}
            unoptimized
            className="object-contain shrink-0"
            priority
            loading="eager"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center gap-[2px] flex-1 order-1 flex-grow-1">
          <p className="w-auto font-[500] text-[14px] leading-[130%] tracking-[0.02em] text-white-smoke m-0">
            FPT Play - Thể thao, Phim, TV Giải trí số 1 Việt Nam
          </p>
        </div>

        {/* Button */}
        <a
          href={dynamicLink.url}
          className="cursor-pointer flex flex-row justify-center items-center p-[8px_12px] gap-[4px] w-[89px] h-[34px] bg-gradient-to-br from-portland-orange to-lust rounded-[104px] flex-none order-1 flex-grow-0 text-decoration-none transition-all duration-[200ms] ease-in-out hover:transform hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(254,89,42,0.3)] active:transform active:translate-y-0"
          onClick={handleDownloadClick}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="w-[65px] h-[18px] font-[600] text-[14px] leading-[130%] tracking-[0.02em] text-white-smoke flex-none order-0 self-stretch flex-grow-0">
            {dynamicLink.text}
          </span>
        </a>
      </div>
    </div>
  );
}
