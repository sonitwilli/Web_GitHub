import useScroll from '@/lib/hooks/useScroll';
import Footer from './Footer';
import Header, { HeaderContext } from './Header';
import dynamic from 'next/dynamic';
import useScreenSize from '../hooks/useScreenSize';
import { useContext, useEffect, useMemo, useState } from 'react';
import useFirebase from '../hooks/useFirebase';
import ScrollTop from '../components/buttons/ScrollTop';
import { AppContext } from '../components/container/AppContainer';
import { subscribeFirebaseNoti } from '../utils/firebaseNotiManager';
import { useAppSelector } from '../store';
import { DetailMessageItem } from '../plugins/firebase';
import PreventKidModal from '@/lib/components/modal/PreventKidModal';
import { useRouter } from 'next/router';
import SideTagButton from '@/lib/components/buttons/SideTagButton';
import { useNetwork } from '@/lib/components/contexts';
import { NetworkError } from '@/lib/components/error';
import OrientationChangePopup from '@/lib/components/overlay/OrientationChangePopup';
// import { getUserAgent } from '../utils/methods';
import MonitorLayout from './MonitorLayout';

const Viewport = dynamic(() => import('../components/debug/Viewport'), {
  ssr: false,
});
const BlockHoverItem = dynamic(
  () => import('../components/blocks/BlockHoverItem'),
  {
    ssr: false,
  },
);

const NotificationPopup = dynamic(
  () => import('../components/notification/NotificationPopup'),
  {
    ssr: false,
  },
);

const DownloadAppControlBar = dynamic(
  () => import('@/lib/components/download/DownloadAppControlBar'),
  { ssr: false },
);

interface Props {
  children: React.ReactNode;
}

function DefaultLayoutContent({ children }: Props) {
  const router = useRouter();
  useFirebase();
  const { notiData } = useAppSelector((state) => state.firebase);
  const [detailNoti, setDetailNoti] = useState<DetailMessageItem | null>(null);
  const { hasBlockedRoute } = useNetwork();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  // Chỉ hiện ở Mobile và Tablet
  // const isMobileOrTablet = useMemo(() => {
  //   if (typeof window === 'undefined') return false;
  //   const userAgentInfo = getUserAgent();
  //   const deviceType = userAgentInfo.device?.type;
  //   const osName = userAgentInfo.os?.name?.toLowerCase();

  //   // Check device type first
  //   if (deviceType === 'mobile' || deviceType === 'tablet') {
  //     return true;
  //   }

  //   // Fallback check for iOS/Android OS on desktop (for testing)
  //   if (osName === 'ios' || osName === 'android') {
  //     return true;
  //   }

  //   return false;
  // }, []);

  useEffect(() => {
    if (notiData && notiData.length > 0) {
      subscribeFirebaseNoti(notiData, (newNoti) => {
        setDetailNoti(null);
        setTimeout(() => setDetailNoti(newNoti), 50);
      });
    }
  }, [notiData]);

  useEffect(() => {
    if (hasBlockedRoute) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [hasBlockedRoute]);

  const { scrollDistance } = useScroll();
  const { width } = useScreenSize();
  const appCtx = useContext(AppContext);
  const { hoveredBlock: block, hoveredSlide: slide, menus } = appCtx;

  const isPageNotMinHeight = useMemo(() => {
    if (router.isReady) {
      return (
        router.pathname.includes('/xem-truyen-hinh/') ||
        router.pathname.includes('/playlist/') ||
        router.pathname.includes('/su-kien/') ||
        router.pathname.includes('/cong-chieu/') ||
        router.pathname.includes('/404') ||
        router.pathname.includes('/tim-kiem')
      );
    } else {
      return false;
    }
  }, [router.pathname, router.isReady]);

  const isMinHeightScreen = useMemo(() => {
    return !isPageNotMinHeight;
  }, [isPageNotMinHeight]);

  return (
    <HeaderContext.Provider
      value={{
        menus,
        activeMenu: undefined,
        openMobileMenu,
        setOpenMobileMenu,
      }}
    >
      <Viewport />
      <Header />
      <main className={`${isMinHeightScreen ? 'min-h-screen' : ''}`}>
        {children}

        {detailNoti && (detailNoti.title || detailNoti.body) && (
          <NotificationPopup
            title={detailNoti.title}
            body={detailNoti.body}
            image={detailNoti.image}
            url={detailNoti.url}
            message_id={detailNoti.message_id}
          />
        )}

        {width >= 1280 ? (
          <div className={`${block?.id && slide?.id ? '' : 'hidden'}`}>
            <div>
              <BlockHoverItem block={block} slide={slide} index={0} />
            </div>
          </div>
        ) : null}

        {scrollDistance > 0 && !hasBlockedRoute && <ScrollTop />}
        <PreventKidModal />
        <DownloadAppControlBar />
        <OrientationChangePopup />
      </main>
      <Footer />
      <SideTagButton />

      {/* Network Error Overlay */}
      {hasBlockedRoute && (
        <>
          <NetworkError />
        </>
      )}
    </HeaderContext.Provider>
  );
}

export default function DefaultLayout({ children }: Props) {
  const router = useRouter();

  // Use MonitorLayout for monitor pages
  if (router.pathname.includes('/monitor')) {
    return <MonitorLayout>{children}</MonitorLayout>;
  }

  return <DefaultLayoutContent>{children}</DefaultLayoutContent>;
}