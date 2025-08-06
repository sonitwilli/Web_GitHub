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
  const fallbackIcon = '/images/logo/logo-fptplay-mini.png';
  const [imgSrc, setImgSrc] = useState(icon);

  return (
    <div className={`flex flex-col p-4 w-full gap-2 ${styleData}`} role="alert">
      <div className="flex items-center gap-2 text-white font-semibold text-[20px] leading-[150%] tracking-normal">
        {customIcon ? (
          <div
            className="shrink-0"
            style={{ width: iconSize, height: iconSize }}
          >
            {customIcon}
          </div>
        ) : (
          <Image
            src={imgSrc}
            alt="icon"
            width={iconSize}
            height={iconSize}
            className="object-contain shrink-0"
            unoptimized
            onError={() => setImgSrc(fallbackIcon)}
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
