import React from 'react';
import { useAppSelector } from '@/lib/store';

const BottomBannerAds: React.FC = () => {
  const { adsLoaded } = useAppSelector((state) => state.app);

  if (!adsLoaded) return null;

  return (
    <div className="f-container adsplay-placement ads_bottom_banner">
      <ins
        className="adsplay-placement adsplay-placement-relative"
        data-aplpm="115-115"
      />
    </div>
  );
};

export default BottomBannerAds;
