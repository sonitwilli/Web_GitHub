import React, { createContext, useContext, useEffect, useState } from 'react';
import useNetworkStatus from '@/lib/hooks/useNetworkStatus';
import { useRouter } from 'next/router';
import { showToast } from '@/lib/utils/globalToast';
import NoInternetIcon from '@/lib/components/icons/NoInternetIcon';
import ConnectInternetIcon from '@/lib/components/icons/ConnectInternetIcon';

interface NetworkContextType {
  isOnline: boolean;
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isOffline: false,
});

export const useNetwork = () => useContext(NetworkContext);

interface Props {
  children: React.ReactNode;
}

const NetworkProvider: React.FC<Props> = ({ children }) => {
  const { isOnline, isOffline } = useNetworkStatus();
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState(router.asPath);

  // Prevent routing when offline
  useEffect(() => {
    if (isOffline) {
      const handleRouteChangeStart = (url: string) => {
        // Prevent navigation if offline
        if (router.asPath !== url) {
          // Show toast khi user cố navigate
          showToast({
            title: 'Không có kết nối mạng',
            customIcon: <NoInternetIcon />,
            timeout: 3000,
          });

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
          // Show toast khi user dùng back/forward
          showToast({
            title: 'Không có kết nối mạng',
            customIcon: <NoInternetIcon />,
            timeout: 3000,
          });
          return false;
        }
        return true;
      };

      // Handle click events on all link elements when offline
      const handleLinkClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a, [href]') as HTMLAnchorElement;

        if (link && link.href && link.href !== window.location.href) {
          event.preventDefault();
          event.stopPropagation();
          // Show toast khi user click link
          showToast({
            title: 'Không có kết nối mạng',
            customIcon: <NoInternetIcon />,
            timeout: 3000,
          });
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
    }
  }, [isOnline, isOffline, hasShownOfflineToast, router.asPath]);

  return (
    <NetworkContext.Provider value={{ isOnline, isOffline }}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
