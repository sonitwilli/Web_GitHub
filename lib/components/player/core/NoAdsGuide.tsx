import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from './NoAdsGuide.module.css';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { IS_NOT_RESET_PLAYING_SESSION } from '@/lib/constant/texts';

interface NoAdsData {
  btn?: string;
  text?: string;
  image?: string;
  deep_link?: string;
  background_color?: string;
}

interface NoAdsProps {
  data?: NoAdsData;
  onClose?: () => void;
  visible?: boolean;
}

const NoAds: React.FC<NoAdsProps> = ({ data, onClose, visible = false }) => {
  const router = useRouter();
  const noAdsData = data || {};

  const handleBuyPackage = useCallback(() => {
    // Hide the guide when user clicks the button
    onClose?.();

    if (noAdsData.deep_link) {
      // Navigate to purchase page
      localStorage.setItem(
        trackingStoreKey.BACK_LINK_PLAY,
        window.location.pathname,
      );
      sessionStorage.setItem(IS_NOT_RESET_PLAYING_SESSION, '1');
      // __________________________________________________________

      router.push(noAdsData.deep_link);
    }
  }, [noAdsData.deep_link, router, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`no-ads-guide absolute z-2 opacity-80 flex flex-row justify-center items-center pr-8 gap-6 rounded-xl max-w-[498px] h-16 bottom-[100px] right-4 md:right-8 md:w-[498px] ${
        !noAdsData.background_color ? styles.maskNoAds : ''
      }`}
      style={{
        background: noAdsData.background_color
          ? noAdsData.background_color
          : '',
      }}
    >
      {/* Main Content Frame */}
      <div className="flex flex-row items-center gap-4 w-full max-w-[359px] h-16 overflow-hidden rounded-xl">
        <div className="flex-none order-0 flex-grow-0 w-[80px] md:w-[111px] h-fit relative">
          <img
            src={noAdsData.image}
            alt="No Ads"
            className="w-full object-contain"
            onError={(e) =>
              (e.currentTarget.src = '/images/default-poster-vertical.jpg')
            }
            loading="lazy"
          />
        </div>

        {/* Description Section  */}
        <div className="flex-none order-1 flex-grow-0 w-full max-w-[232px] line-clamp-3 text-ellipsis overflow-hidden">
          <p className="text-white flex items-center w-full h-full font-medium text-xs md:text-sm leading-[100%]">
            {noAdsData.text}
          </p>
        </div>
      </div>

      {/* Button Section */}
      <div className="flex-none order-1 flex-grow-0 w-[70px] md:w-[83px] h-[34px]">
        <button
          onClick={handleBuyPackage}
          className="cursor-pointer flex flex-row justify-center items-center w-full h-[34px] bg-white-01 border border-white-06 rounded-lg text-white-087 text-center hover:bg-white-02 transition-colors px-2 md:px-4 py-2 box-border"
        >
          <span className="whitespace-nowrap font-medium text-xs md:text-sm leading-[130%]">
            {noAdsData.btn}
          </span>
        </button>
      </div>
    </div>
  );
};

export default NoAds;
