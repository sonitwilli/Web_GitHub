import { trackingStoreKey } from '../constant/tracking';

// Constants for better maintainability
const UTM_SESSION_EXPIRY_DAYS = 30;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// Types for better type safety
interface DeepLinkOptions {
  fullPath?: string;
  router?: {
    asPath?: string;
  };
}

// Helper functions for better organization and performance
const isUtmParameter = (key: string): boolean => key.startsWith('utm_');

const isFromNotification = (searchParams: URLSearchParams): boolean => {
  const fromParam = searchParams.get('from');
  return fromParam === 'Inbox' || fromParam === 'Notification';
};

const containsSpecifiedTerms = (searchParams: URLSearchParams): boolean => {
  const termsToCheck = [
    'masthead',
    'pause-ads',
    'brandskin',
    'logo',
    'welcome-screen',
  ];

  return Array.from(searchParams.entries()).some(([key, value]) =>
    termsToCheck.some((term) => key.includes(term) || value.includes(term)),
  );
};

const isUtmInApp = (searchParams: URLSearchParams): boolean => {
  return (
    isFromNotification(searchParams) || containsSpecifiedTerms(searchParams)
  );
};

const clearUtmData = (): void => {
  localStorage.removeItem(trackingStoreKey.UTM_IN_APP);
  localStorage.removeItem(trackingStoreKey.UTM_SESSION);
  localStorage.removeItem(trackingStoreKey.UTM_LINK);
  localStorage.removeItem('is_exist_tab');
};

const isSessionExpired = (sessionTimestamp: string): boolean => {
  const ageInDays =
    (Date.now() - new Date(sessionTimestamp).getTime()) / MILLISECONDS_PER_DAY;
  return ageInDays > UTM_SESSION_EXPIRY_DAYS;
};

const saveUtmData = (currentHref: string, isInApp: boolean): void => {
  const utmSession = new Date().toISOString();

  localStorage.setItem(trackingStoreKey.UTM_SESSION, utmSession);
  localStorage.setItem(trackingStoreKey.UTM_LINK, currentHref);
  localStorage.setItem(trackingStoreKey.UTM_IN_APP, isInApp ? '1' : '0');
  localStorage.setItem('is_exist_tab', 'true');
  sessionStorage.setItem('is_deep_link', 'true');
};

const hasUtmParameters = (searchParams: URLSearchParams): boolean => {
  return Array.from(searchParams.keys()).some(isUtmParameter);
};

const getCurrentHref = (options?: DeepLinkOptions): string => {
  if (options?.fullPath) {
    return `${window.location.origin}${options.fullPath}`;
  }

  if (options?.router?.asPath) {
    return `${window.location.origin}${options.router.asPath}`;
  }

  return window.location.href;
};

export const handleDeepLink = (options?: DeepLinkOptions): void => {
  // Ensure the function only runs in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Get current URL with fallback strategy
  const currentHref = getCurrentHref(options);

  // Extract query parameters efficiently
  const urlParts = currentHref.split('?');
  const searchParams =
    urlParts.length > 1
      ? new URLSearchParams(urlParts[1])
      : new URLSearchParams();

  // Early return if no UTM parameters
  if (!hasUtmParameters(searchParams)) {
    return;
  }

  const previousUtmSession = localStorage.getItem(trackingStoreKey.UTM_SESSION);
  const previousUtmLink = localStorage.getItem(trackingStoreKey.UTM_LINK);

  // Check if the stored session has exceeded the expiry period
  if (previousUtmSession && isSessionExpired(previousUtmSession)) {
    clearUtmData();
    return;
  }

  // Skip session initialization if currentHref and previousUtmLink are the same
  if (previousUtmLink === currentHref) {
    return;
  }

  // Handle UTM logic - save data only if we have UTM parameters
  const isInApp = isUtmInApp(searchParams);
  saveUtmData(currentHref, isInApp);
};
