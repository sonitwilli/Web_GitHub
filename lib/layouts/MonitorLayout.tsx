import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import LoginModal from '../components/login/LoginModal';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoginModal } from '../store/slices/loginSlice';
import { RootState } from '../store';
interface MonitorLayoutProps {
  children: React.ReactNode;
}

const MonitorLayout: React.FC<MonitorLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isErrorLocation, setIsErrorLocation] = useState(false);
  const [renderChild, setRenderChild] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const previousPathRef = useRef<string>('');
  const dispatch = useDispatch();
  const visible = useSelector((state: RootState) => state.loginSlice.visible);
  // Computed values

  const config =
    typeof window !== 'undefined' && localStorage.getItem('config')
      ? JSON.parse(localStorage.getItem('config') || '{}')
      : null;

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'previous-path-for-tracking',
          previousPathRef.current,
        );
        previousPathRef.current = router.asPath;
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Handle error location modal
  useEffect(() => {
    const errorLocationEle = document.getElementById('modal-error-location');
    if (isErrorLocation) {
      errorLocationEle?.setAttribute('style', 'display: flex');
    } else {
      errorLocationEle?.setAttribute('style', 'display: none');
    }
  }, [isErrorLocation]);

  // Check menu config
  const checkMenuConfig = useCallback(() => {
    if (typeof window !== 'undefined') {
      const config = localStorage.getItem('config');
      if (!config) {
        localStorage.setItem('config', JSON.stringify({}));
      }
    }
  }, []);

  // Add magic input for some functionality
  const addInput = useCallback(() => {
    try {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.id = 'magicInput';
      div.style.opacity = '0';
      const input = document.createElement('input');
      input.type = 'text';
      if (document.body) {
        document.body.appendChild(div);
        div.appendChild(input);
      }
    } catch (error) {
      console.error('Error adding magic input:', error);
    }
  }, []);

  // Handle user authentication and token
  const handleAuthentication = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        localStorage.setItem('user', JSON.stringify({}));
        setRenderChild(true);
      } catch {
        if (typeof window !== 'undefined' && navigator.onLine) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setRenderChild(true);
        }
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setRenderChild(true);
    }
  }, []);

  // Initialize tracking and device IDs
  const initializeTracking = useCallback(() => {
    let deviceId = localStorage.getItem('deviceId');
    let tabId = sessionStorage.getItem('tabId');
    const platform = localStorage.getItem('platform') ?? 'web-playfpt';

    if (window.name !== 'exist') {
      window.name = 'exist';
      sessionStorage.removeItem('tabId');
    }

    if (!deviceId) {
      deviceId =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', deviceId);
    }

    if (!tabId) {
      tabId = new Date().getTime().toString();
      sessionStorage.setItem('tabId', tabId);
    }

    localStorage.setItem('platform', platform);
  }, []);

  // Handle resize
  const handleResize = useCallback(() => {
    // Auto resize logic here
    console.log('Handle resize');
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsMounted(true);

    const initializeApp = async () => {
      checkMenuConfig();

      // Handle token from URL
      if (router.query.token) {
        const newToken = router.query.token as string;
        if (newToken.includes('Bearer')) {
          const token = newToken.split('Bearer')[1].trim();
          localStorage.setItem('token', token);
          sessionStorage.setItem('token', token);

          // Remove token from URL
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { token: _token, ...query } = router.query;
          router.replace({
            pathname: router.pathname,
            query,
          });
        }
      }

      await handleAuthentication();

      // Handle location error
      if (config && config?.is_vn === '0') {
        setIsErrorLocation(true);
      }

      initializeTracking();
      addInput();

      // Set up event listeners
      const debouncedResize = _.debounce(handleResize, 500);
      window.addEventListener('resize', debouncedResize);

      return () => {
        window.removeEventListener('resize', debouncedResize);
      };
    };

    initializeApp();
  }, [
    checkMenuConfig,
    handleAuthentication,
    initializeTracking,
    addInput,
    handleResize,
    router,
    config,
  ]);

  if (!isMounted || !renderChild) {
    return (
      <div className="loading-wrapper min-h-screen bg-smoky-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="monitor-layout">
      {/* Main Content */}
      <div className="app min-h-[60vh] bg-smoky-black">
        <div id="content" className="bg-smoky-black">
          {children}
        </div>
      </div>

      {/* Error Location Modal */}
      <div
        id="modal-error-location"
        className="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50"
        style={{ display: 'none' }}
      >
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">
            Vị trí không được hỗ trợ
          </h3>
          <p className="text-gray-600 mb-4">
            Dịch vụ này chỉ khả dụng tại Việt Nam.
          </p>
          <button
            className="bg-fpl text-white px-4 py-2 rounded hover:bg-opacity-80"
            onClick={() => setIsErrorLocation(false)}
          >
            Đóng
          </button>
        </div>
      </div>

      <LoginModal
        visible={visible}
        onClose={() => dispatch(closeLoginModal())}
      />
    </div>
  );
};

export default MonitorLayout;
