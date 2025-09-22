import React from 'react';
import { useAppSelector } from '@/lib/store';
import { useRouter } from 'next/router';
import { ROUTE_PATH_TOP_BANNER_ADS_VOD } from '@/lib/constant/texts';

const TopBannerAdsVod: React.FC = () => {
  const { adsLoaded } = useAppSelector((state) => state.app);
  const router = useRouter();
  const currentPath =
    typeof window !== 'undefined'
      ? window.location.pathname
      : router.asPath || router.pathname || '';
  const isPathInRouteNames = Object.values(ROUTE_PATH_TOP_BANNER_ADS_VOD).some(
    (segment) => currentPath.includes(segment),
  );

  if (!adsLoaded || isPathInRouteNames) return null;

  return (
    <div className="f-container ads_top_banner">
      <ins
        data-aplpm="118-120"
        className="adsplay-placement adsplay-placement-relative"
      />
    </div>
  );
};

export default TopBannerAdsVod;
