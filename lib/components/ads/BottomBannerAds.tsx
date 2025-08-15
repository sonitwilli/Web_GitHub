import React from 'react';
import { useAppSelector } from '@/lib/store';
import { ROUTE_PATH_NAMES } from '@/lib/constant/texts';
import { useRouter } from 'next/router';

const BottomBannerAds: React.FC = () => {
  const router = useRouter();
  const { adsLoaded } = useAppSelector((state) => state.app);
  const currentPath =
    typeof window !== 'undefined'
      ? window.location.pathname
      : router.asPath || router.pathname || '';
  const isPathInRouteNames = Object.values(ROUTE_PATH_NAMES).some((segment) =>
    currentPath.includes(segment),
  );

  if (!adsLoaded || isPathInRouteNames) return null;

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
