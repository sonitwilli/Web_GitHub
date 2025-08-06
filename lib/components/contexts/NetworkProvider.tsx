import React, { createContext, useContext, useEffect, useState } from 'react';
import useNetworkStatus from '@/lib/hooks/useNetworkStatus';
import { useRouter } from 'next/router';
import { showToast } from '@/lib/utils/globalToast';
import NoInternetIcon from '@/lib/components/icons/NoInternetIcon';
import ConnectInternetIcon from '@/lib/components/icons/ConnectInternetIcon';

interface NetworkContextType {
  isOnline: boolean;
  isOffline: boolean;
  hasBlockedRoute: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isOffline: false,
  hasBlockedRoute: false,
});

export const useNetwork = () => useContext(NetworkContext);

interface Props {
  children: React.ReactNode;
}

const NetworkProvider: React.FC<Props> = ({ children }) => {
  const { isOnline, isOffline } = useNetworkStatus();
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);
  const [hasBlockedRoute, setHasBlockedRoute] = useState(false);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState(router.asPath);

  // Prevent routing when offline
  useEffect(() => {
    if (isOffline) {
      const handleRouteChangeStart = (url: string) => {
        // Prevent navigation if offline
        if (router.asPath !== url) {
          console.log('🚫 Network offline - blocking route:', url);
          setHasBlockedRoute(true);

          // Restore URL to current/original state
          setTimeout(() => {
            window.history.replaceState(null, '', currentUrl);
          }, 0);

          // Prevent the route change by throwing an error
          const error = new Error('Network offline - route blocked');
          error.name = 'RouteChangeError';
          router.events.emit('routeChangeError', error, url, {
            shallow: false,
          });
          throw error;
        }
      };

      const handleBeforePopState = () => {
        // Prevent browser back/forward when offline
        if (isOffline) {
          setHasBlockedRoute(true);
          return false;
        }
        return true;
      };

      // Handle click events on all link elements when offline
      const handleLinkClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a, [href]') as HTMLAnchorElement;

        if (link && link.href && link.href !== window.location.href) {
          console.log('🚫 Network offline - blocking link click:', link.href);
          event.preventDefault();
          event.stopPropagation();
          setHasBlockedRoute(true);
          return false;
        }
      };

      router.events.on('routeChangeStart', handleRouteChangeStart);
      router.beforePopState(handleBeforePopState);

      // Add global click listener for links
      document.addEventListener('click', handleLinkClick, true);

      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
        router.beforePopState(() => true);
        document.removeEventListener('click', handleLinkClick, true);
      };
    }
  }, [isOffline, router, currentUrl]);

  // Track URL changes when online
  useEffect(() => {
    if (isOnline) {
      const handleRouteChangeComplete = (url: string) => {
        setCurrentUrl(url);
      };

      router.events.on('routeChangeComplete', handleRouteChangeComplete);

      return () => {
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
      };
    }
  }, [isOnline, router]);

  // Handle network status changes
  useEffect(() => {
    // Check if current path contains megazone/summary-comment
    const isSummaryCommentPage = router.asPath.includes(
      'megazone/summary-comment',
    );

    if (isOffline) {
      if (!hasShownOfflineToast && !isSummaryCommentPage) {
        showToast({
          title: 'Mất kết nối mạng',
          customIcon: <NoInternetIcon />,
          timeout: 3000,
        });
        setHasShownOfflineToast(true);
      }
    } else if (isOnline) {
      if (hasShownOfflineToast && !isSummaryCommentPage) {
        showToast({
          title: 'Đã có kết nối mạng',
          customIcon: <ConnectInternetIcon />,
          timeout: 3000,
        });
        setHasShownOfflineToast(false);
      }
      // Reset blocked route status when back online
      console.log('✅ Network back online - hiding NetworkError');
      setHasBlockedRoute(false);
    }
  }, [isOnline, isOffline, hasShownOfflineToast, router.asPath]);

  return (
    <NetworkContext.Provider value={{ isOnline, isOffline, hasBlockedRoute }}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
