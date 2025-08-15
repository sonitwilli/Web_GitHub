import React from 'react';
import { useRouter } from 'next/router';
import { ROUTE_PATH_NAMES } from '@/lib/constant/texts';
import { useAppSelector } from '@/lib/store';
import { useAppDispatch } from '@/lib/store';
import { changeIsHeaderAdsClosed } from '@/lib/store/slices/appSlice';
import useScroll from '@/lib/hooks/useScroll';
import { IoIosCloseCircleOutline } from 'react-icons/io';

const HeaderAds: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { adsLoaded } = useAppSelector((state) => state.app);
  const { isHeaderAdsClosed } = useAppSelector((state) => state.app);
  const { scrollDistance } = useScroll();

  // Hide when scrolling with smooth height collapse
  const currentPath =
    typeof window !== 'undefined'
      ? window.location.pathname
      : router.asPath || router.pathname || '';
  const isPathInRouteNames = Object.values(ROUTE_PATH_NAMES).some((segment) =>
    currentPath.includes(segment),
  );
  const isScrolling = !isPathInRouteNames && scrollDistance > 0;

  // Hide when ads not loaded or explicitly closed. Treat null as closed by default
  if (!adsLoaded || isHeaderAdsClosed !== false) return null;

  return (
    <div
      className="relative block w-full ads_masthead_banner overflow-hidden transition-[max-height] duration-450 ease-out"
      style={{
        maxHeight: isScrolling ? '0px' : '300px', // Set reasonable max height for ads
      }}
    >
      {isPathInRouteNames && (
        <button
          type="button"
          aria-label="Đóng quảng cáo"
          className="absolute cursor-pointer top-4 right-4 z-10 text-white/80 hover:text-white focus:outline-none"
          onClick={() => dispatch(changeIsHeaderAdsClosed(true))}
        >
          <IoIosCloseCircleOutline size={24} />
        </button>
      )}
      <ins
        className="adsplay-placement adsplay-placement-relative"
        data-aplpm="105-111"
      />
    </div>
  );
};

export default HeaderAds;
