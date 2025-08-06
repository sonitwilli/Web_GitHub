import Footer from './Footer';
import Header from './HeaderAccount';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PreventKidModal from '@/lib/components/modal/PreventKidModal';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

import dynamic from 'next/dynamic';
import { AppContext } from '@/lib/components/container/AppContainer';
import { useNetwork } from '../components/contexts/NetworkProvider';
import NetworkError from '../components/error/NetworkError';

const AppModal = dynamic(() => import('@/lib/components/modal/AppModal'), {
  ssr: false,
});

interface Props {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: Props) {
  const { info } = useAppSelector((state) => state.user);
  const router = useRouter();
  const queryTab =
    typeof router?.query?.tab === 'string' ? router.query.tab : undefined;
  const dispatch = useAppDispatch();

  const appCtx = useContext(AppContext);
  const { checkLoginComplete } = appCtx;
  const [isRouting, setIsRouting] = useState(false);
  const { hasBlockedRoute } = useNetwork();

  // Track routing state để tránh popup hiện khi đang routing
  useEffect(() => {
    const handleRouteChangeStart = () => setIsRouting(true);
    const handleRouteChangeComplete = () => setIsRouting(false);
    const handleRouteChangeError = () => setIsRouting(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  useEffect(() => {
    if (router.isReady) {
      if (router.pathname.includes('/tai-khoan')) {
        document.body.removeAttribute('style');
      }
    }
  }, [router.pathname, router?.isReady]);

  useEffect(() => {
    if (!router.isReady || !checkLoginComplete || isRouting) return;

    // Không hiện popup khi đang routing tới trang chủ
    if (router.pathname === '/' || router.pathname === '/index') return;

    // Thêm delay để đảm bảo page đã load xong trước khi check login
    const timer = setTimeout(() => {
      if (
        (info?.user_id_str === '' || !info?.user_id_str) &&
        router.pathname.includes('/tai-khoan') &&
        router.isReady &&
        !isRouting
      ) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
    }, 200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    info?.user_id_str,
    router.pathname,
    router.isReady,
    queryTab,
    checkLoginComplete,
    isRouting,
  ]);

  useEffect(() => {
    if (hasBlockedRoute) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [hasBlockedRoute]);

  if (hasBlockedRoute) {
    return <NetworkError />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        {children}
        <PreventKidModal />
        <AppModal />
      </main>
      <Footer />
    </div>
  );
}
