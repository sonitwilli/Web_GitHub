import React from 'react';
import { useAppSelector } from '@/lib/store';

const HomepageBannerAds: React.FC = () => {
  const { adsLoaded } = useAppSelector((state) => state.app);

  if (!adsLoaded) return null;

  return (
    <div className="ads" id="adsplay-banner-homapage">
      <ins
        data-aplpm="11320103-11320203"
        className="adsplay-placement adsplay-placement-fixed"
        style={{
          border: '0px',
          position: 'fixed',
          bottom: '0px',
          right: '0px',
          width: 0,
          height: 0,
        }}
      />
    </div>
  );
};

export default HomepageBannerAds;
