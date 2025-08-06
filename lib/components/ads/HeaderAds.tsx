import React from 'react';
import { useAppSelector } from '@/lib/store';
import useScroll from '@/lib/hooks/useScroll';

const HeaderAds: React.FC = () => {
  const { adsLoaded } = useAppSelector((state) => state.app);
  const { scrollDistance } = useScroll();

  // Hide when scrolling with smooth height collapse
  const isScrolling = scrollDistance > 0;

  if (!adsLoaded) return null;

  return (
    <div
      className="block w-full ads_masthead_banner overflow-hidden transition-[max-height] duration-450 ease-out"
      style={{
        maxHeight: isScrolling ? '0px' : '300px', // Set reasonable max height for ads
      }}
    >
      <ins
        className="adsplay-placement adsplay-placement-relative"
        data-aplpm="105-111"
      />
    </div>
  );
};

export default HeaderAds;
