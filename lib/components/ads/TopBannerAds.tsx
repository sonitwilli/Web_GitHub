import React from 'react';
import { useAppSelector } from '@/lib/store';

const TopBannerAds: React.FC = () => {
  const { adsLoaded } = useAppSelector((state) => state.app);

  if (!adsLoaded) return null;

  return (
    <div className="f-container ads_top_banner">
      <ins
        data-aplpm="114-11030203"
        className="adsplay-placement adsplay-placement-relative"
      />
    </div>
  );
};

export default TopBannerAds;
