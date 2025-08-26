'use client';
import Image from 'next/image';
import React, { useState } from 'react';

interface Props {
  title?: string;
  desc?: string;
  icon?: string;
  iconSize?: number;
  styleData?: string;
  customIcon?: React.ReactNode;
}

export default function ToastReport({
  title = '',
  desc = '',
  icon = '/images/logo/logo-fptplay-mini.png',
  iconSize = 40,
  styleData = 'rounded-[16px] backdrop-blur-sm bg-charleston-green',
  customIcon,
}: Props) {
  const [imgSrc] = useState(icon);
  const [imgError, setImgError] = useState(false);

  const InlineFallbackIcon = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.8167 0C18.3761 0 15.4598 0.106289 14.0193 0.283437C5.83258 1.27546 1.30003 3.4721 0.281088 14.2073C0.281088 14.2073 0 17.6085 0 20.7617C0 23.5961 0.281088 25.7927 0.281088 25.7927C1.2649 36.5279 5.79744 38.7245 14.0193 39.7166C15.4247 39.8937 18.3761 39.9646 19.8167 39.9646C21.2573 39.9646 24.2087 39.8583 25.6142 39.7166C33.8008 38.7245 38.3334 36.4925 39.3523 25.7927C39.3523 25.7927 39.6334 23.9504 39.6334 20.2657C39.6334 16.1205 39.3523 14.1718 39.3523 14.1718C38.3685 3.4721 33.836 1.27546 25.6493 0.283437C24.2087 0.106289 21.2924 0 19.8167 0Z"
        fill="#FF6500"
      />
      <path
        d="M28.7423 18.2122L15.0744 10.2406C13.6689 9.4257 11.9121 10.4532 11.9121 12.0829V28.0617C11.9121 29.6914 13.6689 30.7189 15.0744 29.904L28.7423 21.8969C30.1477 21.082 30.1477 19.0271 28.7423 18.2122Z"
        fill="white"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col p-3 sm:p-4 w-full gap-2 ${styleData}`}
      role="alert"
    >
      <div className="flex items-center gap-2 text-white font-semibold text-[16px] sm:text-[20px] leading-[150%] tracking-normal">
        {customIcon ? (
          <div
            className="shrink-0"
            style={{ width: iconSize, height: iconSize }}
          >
            {customIcon}
          </div>
        ) : imgError ? (
          <InlineFallbackIcon />
        ) : (
          <Image
            src={imgSrc}
            alt="icon"
            width={iconSize}
            height={iconSize}
            className="object-contain shrink-0"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}
        <span>{title}</span>
      </div>
      {desc && (
        <div className="text-white text-[14px] font-normal leading-[150%] tracking-normal">
          {desc}
        </div>
      )}
    </div>
  );
}
