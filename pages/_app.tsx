import { Provider, useDispatch, useSelector } from 'react-redux';
import '@/lib/styles/global.css';
import type { AppProps } from 'next/app';
import { RootState, store } from '@/lib/store';
import AppContainer from '@/lib/components/container/AppContainer';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageLoading from '@/lib/components/loading/page-loading';
import { DEVICE_ID, TAB_ID } from '@/lib/constant/texts';
import { generateId } from '@/lib/utils/methods';
import LoginModal from '@/lib/components/login/LoginModal';
import { closeLoginModal } from '@/lib/store/slices/loginSlice';
import { ToastProvider } from '@/lib/components/toast/ToastProvider';
import { NetworkProvider } from '@/lib/components/contexts';
import dynamic from 'next/dynamic';
import { setAppNameAppId } from '@/lib/utils/trackingDefaultMethods';
import SeoHead, {
  SeoProps,
  createDefaultSeoProps,
} from '@/lib/components/seo/SeoHead';
import {
  trackingCodecDeviceInformationLog31,
  trackingStartApplication,
} from '@/lib/tracking/trackingCommon';
import { trackingChangeModuleLog18 } from '@/lib/tracking/trackingHome';
import { trackingAccessLog50 } from '@/lib/tracking/trackingModule';
import { trackingStopMovieLog52 } from '@/lib/hooks/useTrackingPlayback';
import { trackingStopLiveShowLog172 } from '@/lib/hooks/useTrackingEvent';
import {
  trackingStopChannelLog42,
  trackingStopTimeshiftLog44,
} from '@/lib/hooks/useTrackingIPTV';

const AppModal = dynamic(() => import('@/lib/components/modal/AppModal'), {
  ssr: false,
});
export interface RouteInfo {
  path: string;
  params: Record<string, string | string[] | undefined>;
  hash: string;
  full: string;
}

interface AppPropsWithSeo extends AppProps {
  pageProps: AppProps['pageProps'] & {
    seoProps?: SeoProps;
  };
}

export default function App({ Component, pageProps }: AppPropsWithSeo) {
  const [loading, setLoading] = useState(false);
  const [routeFrom, setRouteFrom] = useState<RouteInfo | undefined>(undefined);
  const router = useRouter();

  // Use page-specific SEO props if available, otherwise use defaults
  const seoProps =
    pageProps.seoProps ||
    createDefaultSeoProps({
      title: 'FPT Play: Xem Không Giới Hạn Phim, Show, Anime, TV, Thể Thao',
      description:
        'Xem không giới hạn kho phim, anime đặc sắc, show đỉnh độc quyền, thể thao 24 giờ và các chương trình truyền hình trực tuyến mọi lúc mọi nơi.',
      url: 'https://fptplay.vn',
    });

  const checkDeviceId = () => {
    const deviceId = localStorage.getItem(DEVICE_ID);
    const tabId = sessionStorage.getItem(TAB_ID);
    if (!deviceId) {
      const newDeviceId = generateId();
      localStorage.setItem(DEVICE_ID, newDeviceId);
    }
    if (!tabId) {
      sessionStorage.setItem(TAB_ID, String(new Date().getTime()));
    }
  };

  useLayoutEffect(() => {
    checkDeviceId();
    trackingStartApplication();
    trackingCodecDeviceInformationLog31();
    const currentRoute: RouteInfo = {
      path: router.asPath,
      params: router.query,
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      full: typeof window !== 'undefined' ? window.location.href : '',
    };
    setAppNameAppId(currentRoute, currentRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      const newRouteFrom: RouteInfo = {
        path: router.asPath,
        params: router.query,
        hash: typeof window !== 'undefined' ? window.location.hash : '',
        full: typeof window !== 'undefined' ? window.location.href : '',
      };
      setRouteFrom(newRouteFrom);
    };
    const handleStop = () => {
      setLoading(false);
      const newRouteTo: RouteInfo = {
        path: router.asPath,
        params: router.query,
        hash: typeof window !== 'undefined' ? window.location.hash : '',
        full: typeof window !== 'undefined' ? window.location.href : '',
      };
      if (routeFrom) {
        setAppNameAppId(newRouteTo, routeFrom);
        const vodPage = ['xem-video', 'playlist'];
        const eventPage = ['su-kien', 'cong-chieu'];
        const channelPage = ['xem-truyen-hinh'];
        const timeshiftPage = channelPage && routeFrom.params.timeshift_id;
        const isPageMatching = vodPage.some((keyword) =>
          routeFrom.full.includes(keyword),
        );
        if (routeFrom.path !== newRouteTo.path && isPageMatching) {
          // Gọi log Stop khi chuyển trang từ player page
          // vod gửi log 52, event gửi log 172, channel gửi log 42, timeshift gửi log 44
          if (vodPage.some((keyword) => routeFrom.full.includes(keyword))) {
            trackingStopMovieLog52();
          } else if (
            eventPage.some((keyword) => routeFrom.full.includes(keyword))
          ) {
            trackingStopLiveShowLog172();
          } else if (timeshiftPage) {
            trackingStopTimeshiftLog44();
          } else if (
            channelPage.some((keyword) => routeFrom.full.includes(keyword))
          ) {
            trackingStopChannelLog42();
          }
        }
      }
      trackingChangeModuleLog18();
      trackingAccessLog50();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function LoginModalWrapper() {
    const visible = useSelector((state: RootState) => state.loginSlice.visible);
    const dispatch = useDispatch();

    return (
      <LoginModal
        visible={visible}
        onClose={() => dispatch(closeLoginModal())}
      />
    );
  }
  return (
    <Provider store={store}>
      <SeoHead seo={seoProps} />
      <NetworkProvider>
        <AppContainer>
          <ToastProvider>
            {loading && <PageLoading />}
            <Component {...pageProps} key={pageProps.key} />
            <LoginModalWrapper /> {/* 👈 luôn tồn tại ở mọi trang */}
            <AppModal />
          </ToastProvider>
        </AppContainer>
      </NetworkProvider>
    </Provider>
  );
}
