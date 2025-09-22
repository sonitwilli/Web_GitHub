import React from 'react';
import { useAppSelector } from '@/lib/store';
import { useRouter } from 'next/router';
import { ROUTE_PATH_TOP_BANNER_ADS } from '@/lib/constant/texts';

const TopBannerAds: React.FC = () => {
  const { adsLoaded } = useAppSelector((state) => state.app);
  const router = useRouter();
  const currentPath =
    typeof window !== 'undefined'
      ? window.location.pathname
      : router.asPath || router.pathname || '';
  const isPathInRouteNames = Object.values(ROUTE_PATH_TOP_BANNER_ADS).some(
    (segment) => currentPath.includes(segment),
  );

  if (!adsLoaded || isPathInRouteNames) return null;

  return (
    <div className="f-container ads_top_banner mt-[40px] tablet:mt-[80px]">
      <ins
        data-aplpm="114-11030203"
        className="adsplay-placement adsplay-placement-relative"
      />
    </div>
  );
};

export default TopBannerAds;
