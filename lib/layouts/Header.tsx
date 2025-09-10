/* eslint-disable @next/next/no-html-link-for-pages */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { MenuItem } from '@/lib/api/menu';
import Link from 'next/link';
import Notification from '@/lib/components/notification';
import {
  PACKAGE,
  PROFILE_TYPES,
  ROUTE_PATH_NAMES,
  TYPE_PR,
  USER,
} from '@/lib/constant/texts';
import MenuMore from '@/lib/components/header/MenuMore';
import MobileMenu from '@/lib/components/header/MobileMenu';
import { AppContext } from '@/lib/components/container/AppContainer';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { useDispatch } from 'react-redux';
import useScroll from '@/lib/hooks/useScroll';
import { IoMdCard } from 'react-icons/io';
import DownloadApp from '../components/download/DownloadApp';
import { checkActive, loadJsScript } from '../utils/methods';
import { useAppDispatch, useAppSelector } from '../store';
import useMenu from '../hooks/useMenu';
import { ACCOUNT } from '@/lib/constant/texts';
import { saveProfile } from '@/lib/utils/profile';
import dynamic from 'next/dynamic';
import { setCurrentProfile, setProfiles } from '../store/slices/multiProfiles';
import { Profile, UserInfoResponseType } from '../api/user';
import { trackingEnterFuncLog16 } from '@/lib/tracking/trackingCommon';
import HeaderAds from '@/lib/components/ads/HeaderAds';
import { HomepageBannerAds } from '@/lib/components/ads';
import { useNetwork } from '../components/contexts/NetworkProvider';
import { IoSearch } from 'react-icons/io5';
import { getCookie } from 'cookies-next';
import { changeUserInfo } from '../store/slices/userSlice';
import { useProfileList } from '../hooks/useProfileList';

interface HeaderContextType {
  menus?: MenuItem[];
  activeMenu?: MenuItem | null | undefined;
  openMobileMenu?: boolean;
  setOpenMobileMenu?: (v: boolean) => void;
}

const UserDropdownMenu = dynamic(
  () => import('../components/header/ProfileDropdown'),
  {
    ssr: false,
  },
);
export const HeaderContext = createContext<HeaderContextType>({});

const defaultMenu: MenuItem[] = [
  {
    background_image: '',
    is_display_logo: '0',
    logo: '',
    logo_focus: '',
    menu_type: 'main',
    name: 'Trang chủ',
    page_id: 'home',
    reload: '3600',
  },
  {
    background_image: '',
    is_display_logo: '0',
    logo: '',
    logo_focus: '',
    menu_type: 'main',
    name: 'Truyền hình',
    page_id: 'channel',
    reload: '3600',
  },
  {
    background_image: '',
    is_display_logo: '0',
    logo: '',
    logo_focus: '',
    menu_type: 'main',
    name: 'Phim bộ',
    page_id: 'series',
    reload: '0',
  },
  {
    background_image: '',
    is_display_logo: '1',
    logo: '',
    logo_focus: '',
    menu_type: 'main',
    name: 'Thể thao',
    page_id: 'sport',
    reload: '0',
  },
  {
    background_image: '',
    is_display_logo: '0',
    logo: '',
    logo_focus: '',
    menu_type: 'main',
    name: 'Anime',
    page_id: 'anime',
    reload: '0',
  },
];

export default function Header() {
  const headerContext = useContext(HeaderContext);
  const [localOpenMobileMenu] = useState(false);

  // Use context value if available, otherwise use local state
  const openMobileMenu = headerContext?.openMobileMenu ?? localOpenMobileMenu;
  const [shouldHideHeaderAds, setShouldHideHeaderAds] = useState(false);
  const { scrollDistance } = useScroll();
  const { updateActiveMenuItem, clickLinkItem } = useMenu();
  const router = useRouter();
  const { isOffline } = useNetwork();
  const { type, id } = router.query;
  const isCategoryPage = useMemo(() => {
    // Thêm những page cần tắt hiệu ứng transparent header
    // Chổ này sẽ xử lý như sau nha chị ơi, ứng với các trang sau sẽ mặc định menu bar có background đen, e đẫ cập nhật trong doc ạ.
    // Các trang có Menu đen gồm:
    // - Truyền hình
    // - Detail VOD
    // - Tìm kiếm
    // - Mua gói
    // - Tài khoản & Cài đặt
    const pages = [
      ACCOUNT,
      PACKAGE,
      'xem-truyen-hinh',
      'su-kien',
      'cong-chieu',
      'xem-video',
      'playlist',
      'dien-vien',
      'tim-kiem',
      'short-videos',
      'thong-tin',
      'release',
    ];
    const path = router.pathname;
    const isPageMatching = pages.some((keyword) => path.includes(keyword));
    if ((type && id) || isPageMatching || isOffline) {
      return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  const appCtx = useContext(AppContext);
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const { configs, menus } = appCtx;
  const { selectedMenuMoreItem } = useAppSelector((state) => state.app);

  const userInfo = useAppSelector((state) => state.user);
  const { profiles } = useAppSelector((state) => state.multiProfile);
  const [isTabMultiPrf, setIsTabMultiPrf] = useState<Profile | null | undefined>(null);

  const currentProfile = useMemo(() => {
    const userProfileId = userInfo?.info?.profile?.profile_id || isTabMultiPrf?.profile_id;
    return profiles.find((p) => p.profile_id === userProfileId);
  }, [profiles, userInfo, isTabMultiPrf]);
  // Fixed slot widths: 90px when unauthenticated (login text), 64px when avatar is present
  const [slotWidth, setSlotWidth] = useState<number>(90);

  // Update slot width based on authentication state: 90 when not authenticated, 64 when avatar present
  useEffect(() => {
    const target = userInfo && profiles.length && currentProfile ? 64 : 90;
    setSlotWidth(target);
  }, [userInfo, profiles.length, currentProfile]);
  const { adsLoaded } = useAppSelector((state) => state.app);
  const {fetchProfiles, profiles: profilesList} = useProfileList();
  

  // Load Ads script globally (moved from pages/index.tsx)
  useEffect(() => {
    if (router.isReady && process.env.NEXT_PUBLIC_API_ADS) {
      const timer = setTimeout(() => {
        loadJsScript({
          src: process.env.NEXT_PUBLIC_API_ADS!,
          id: 'ads-script',
          cb: () => {
            appDispatch({ type: 'app/changeAdsLoaded', payload: true });
          },
        });
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [router.isReady, appDispatch]);

  useEffect(() => {
    const localUser = localStorage.getItem(USER);
    if (!userInfo?.info?.profile?.profile_id && localUser) {
      dispatch(changeUserInfo(localUser as UserInfoResponseType));
      fetchProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(profilesList && profilesList.length > 0) {
      const localUser = localStorage.getItem(USER);
      const currPrfTemp = profilesList.find((p) => p.profile_id === (JSON.parse(localUser as string)?.user_id_str));
      dispatch(setProfiles(profilesList));
      setIsTabMultiPrf(currPrfTemp as Profile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilesList]);

  useEffect(() => {
    saveProfile({ profile: currentProfile as Profile });
    dispatch(setCurrentProfile(currentProfile as Profile));
  }, [currentProfile, dispatch]);

  useEffect(() => {
    // Check app_name in localStorage to determine if HeaderAds should be hidden
    const checkAppName = () => {
      if (typeof window !== 'undefined') {
        const appName = localStorage.getItem('app_name');
        const hideAdsApps = ['Truyền hình', 'Học tập', 'Thiếu nhi'];
        setShouldHideHeaderAds(hideAdsApps.includes(appName || ''));

        if (adsLoaded) {
          // Initialize ads safely with retries in case the global is not ready yet
          let attempts = 0;
          const tryInitAds = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const initFn = (window as any)?.InitAdsPlayBanner;
            if (typeof initFn === 'function') {
              try {
                setTimeout(() => {
                  initFn();
                }, 1000);
              } catch {}
            } else if (attempts < 10) {
              attempts += 1;
              setTimeout(tryInitAds, 300);
            }
          };
          tryInitAds();
        }
      }
    };

    // Initial check when router is ready
    if (router.isReady) {
      checkAppName();
    }

    // Listen for router events to detect when app_name might change
    const handleRouteComplete = () => {
      // Add a small delay to ensure app_name is set in localStorage
      setTimeout(checkAppName, 50);
    };

    if (router.isReady) {
      router.events.on('routeChangeComplete', handleRouteComplete);
    }

    return () => {
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router.isReady, router.events, adsLoaded]);

  // Listen initBanner once globally and store isExistedAds flag
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleInitBanner = () => {
      try {
        const currentPath = window.location.pathname;
        const isPathInRouteNames = Object.values(ROUTE_PATH_NAMES).some(
          (segment) => currentPath.includes(segment),
        );

        let existedAds = false;

        if (isPathInRouteNames) {
          // For pages with routes in ROUTE_PATH_NAMES, only check ins[data-aplpm="105-111"]
          const ins = document.querySelector('.ads_masthead_banner');
          existedAds = ins ? true : false;
        } else {
          // For other pages, check if TopBannerAds and BottomBannerAds components exist
          const topBannerAds = document.querySelector('.ads_top_banner');
          const bottomBannerAds = document.querySelector('.ads_bottom_banner');

          if (topBannerAds || bottomBannerAds) {
            // If components exist, then check the ins element
            const ins = document.querySelector('ins[data-aplpm="105-111"]');
            existedAds = ins ? true : false;
          }
        }

        appDispatch({ type: 'app/changeIsExistedAds', payload: existedAds });
      } catch {}
    };

    document.addEventListener('initBanner', handleInitBanner);
    return () => {
      document.removeEventListener('initBanner', handleInitBanner);
    };
  }, [appDispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      const isAtTop = window.scrollY <= 0;
      if (isAtTop) {
        try {
          const ins = document.querySelector('ins[data-aplpm="105-111"]');
          const existedAds = ins
            ? (ins as HTMLElement).children.length > 0
            : false;
          appDispatch({ type: 'app/changeIsExistedAds', payload: existedAds });
        } catch {
          appDispatch({ type: 'app/changeIsExistedAds', payload: false });
        }
      } else {
        appDispatch({ type: 'app/changeIsExistedAds', payload: false });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [appDispatch]);

  // Auto open header ads when an ad placement exists
  useEffect(() => {
    appDispatch({ type: 'app/changeIsHeaderAdsClosed', payload: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Thêm useEffect để check iOS version
  useEffect(() => {
    const checkIOSVersion = () => {
      const userAgent = navigator.userAgent;

      // Function để detect iPhone OS version
      function detectIPhoneVersion(userAgent: string): number | null {
        // Check for both old format (iPhone OS) and new format (OS) for iOS 13+
        let match = userAgent.match(/iPhone OS (\d+)_(\d+)_?(\d+)?/);

        if (!match) {
          // Try new format for iOS 13+ (OS 13_0_0)
          match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
        }

        if (match) {
          const major = parseInt(match[1]);
          const minor = parseInt(match[2]);
          const version = major * 100 + minor;
          return version;
        }

        return null;
      }

      const iphoneVersion = detectIPhoneVersion(userAgent);

      // Kiểm tra nếu là iPhone và version < 16
      if (iphoneVersion !== null && iphoneVersion < 1500) {
        // Hiển thị thông báo
        const confirmed = window.confirm(
          'Phiên bản hệ điều hành của thiết bị không hỗ trợ tính năng này. Vui lòng cập nhật lên iOS 15 để tiếp tục sử dụng. Nhấn OK để được hỗ trợ.',
        );

        if (confirmed) {
          // Redirect khi user click OK
          window.location.href = 'https://hotro.fptplay.vn';
        }
      }
    };

    // Chạy check ngay khi component mount
    checkIOSVersion();
  }, []);

  const desktopMenus = useMemo(() => {
    let result: MenuItem[] = [];

    if (
      typeof localStorage !== 'undefined' &&
      userInfo?.info?.profile?.profile_type === PROFILE_TYPES.KID_PROFILE
    ) {
      result = menus || [];
    } else if (configs?.number_item_of_menu_web && menus?.length) {
      const r = menus.slice(0, Number(configs?.number_item_of_menu_web));
      if (selectedMenuMoreItem) {
        result = r.concat([selectedMenuMoreItem]);
      } else {
        result = r;
      }
    } else {
      if (selectedMenuMoreItem) {
        result = defaultMenu.concat([selectedMenuMoreItem]);
      } else {
        result = defaultMenu;
      }
    }

    // Remove duplicates based on id or page_id
    const uniqueMenus = result.filter((menu, index, self) => {
      const menuId = menu.id || menu.page_id;
      return self.findIndex((m) => (m.id || m.page_id) === menuId) === index;
    });

    return uniqueMenus;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs, menus, selectedMenuMoreItem]);

  const desktopMenusMore = useMemo(() => {
    if (getCookie(TYPE_PR) === '2') {
      localStorage.removeItem('menuItem');
      return [];
    }
    if (configs?.number_item_of_menu_web && menus && menus?.length > 0) {
      const remainingMenus = menus.slice(
        Number(configs?.number_item_of_menu_web),
      );
      // Filter out items that already exist in desktopMenus
      const desktopMenuIds =
        desktopMenus?.map((menu) => menu.id || menu.page_id) || [];
      return remainingMenus.filter(
        (menu) => !desktopMenuIds.includes(menu.id || menu.page_id),
      );
    }
    return [];
  }, [configs, menus, desktopMenus]);

  // Clear stored active menu when navigating to home page
  useEffect(() => {
    if (router.pathname === '/' && typeof window !== 'undefined') {
      sessionStorage.removeItem('lastActiveMenu');
    }
  }, [router.pathname]);

  const activeMenu = useMemo(() => {
    if (!router?.isReady || !menus?.length) {
      return null;
    }
    const pathName = router.pathname;
    const { id } = router.query;

    // Get the last selected menu from sessionStorage
    const getStoredActiveMenu = () => {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('lastActiveMenu');
        return stored ? JSON.parse(stored) : null;
      }
      return null;
    };

    // Detect category from URL path for content pages
    const getCategoryFromPath = () => {
      // Extract the main path segment for switching
      const pathSegment = pathName?.split('/')[1];

      switch (pathSegment) {
        case 'xem-truyen-hinh':
          return menus.find(
            (item) => item.id === 'channel' || item.page_id === 'channel',
          );

        case 'xem-video':
        case 'dien-vien':
        case 'su-kien':
        case 'playlist':
        case 'short-videos':
        case 'tim-kiem':
        default:
          return getStoredActiveMenu();
      }
    };

    // Check if current page is a content page (not a main menu/category page)
    const isContentPage = () => {
      const contentPaths = [
        'xem-truyen-hinh',
        'su-kien',
        'cong-chieu',
        'xem-video',
        'playlist',
        'dien-vien',
        'tim-kiem',
        'short-videos',
        'thong-tin',
        'release',
      ];
      const pathSegment = pathName?.split('/')[1];
      return (
        contentPaths.includes(pathSegment) && !pathName?.includes('/trang/')
      );
    };

    let found;

    // Main routing logic
    switch (true) {
      case pathName === '/':
        found = menus.find(
          (item) => item.id === 'home' || item.id === 'home-kids',
        );
        break;

      case Boolean(id && pathName?.includes('/trang/')):
        found = menus.find((item) => item.id === id);
        break;

      case isContentPage():
        found = getCategoryFromPath();
        break;

      default:
        found = getStoredActiveMenu();
        break;
    }

    // Store the active menu when appropriate
    if (found && typeof window !== 'undefined') {
      const shouldStore =
        pathName === '/' ||
        (id && pathName?.includes('/trang/')) ||
        pathName?.includes('/xem-truyen-hinh/');

      if (shouldStore) {
        sessionStorage.setItem('lastActiveMenu', JSON.stringify(found));
      }
    }

    return found;
  }, [router, menus]);

  return (
    <>
      <header
        className={` fixed w-full left-0 top-0 h-[80px] z-[10] flex flex-col justify-center duration-800 bg-smoky-black tablet:bg-transparent ${
          scrollDistance > 300 || isCategoryPage ? '!bg-smoky-black' : ''
        } ${openMobileMenu ? '!bg-smoky-black' : ''}`}
      >
        <div className="f-container self-stretch flex items-center justify-between">
          <div className="flex items-center gap-[16px] 2xl:gap-[96px]">
            <div className="xl:hidden">
              <MobileMenu menus={menus} />
            </div>
            <a href="/" aria-label="Home page">
              <img
                src={configs?.image?.logo?.tv || '/images/logo.png'}
                alt="logo"
                className="w-[94px] h-auto min-w-[94px] tablet:w-[102px] tablet:min-w-[102px] xl:w-[120px] xl:min-w-[144px]"
              />
            </a>

            <div className="hidden xl:flex items-center gap-[12px] 2xl:gap-[32px]">
              {Array.isArray(desktopMenus) &&
                desktopMenus?.map((menu, index) => {
                  if (menu?.id) {
                    return (
                      <Link
                        key={`menu-item-${index}-${menu.id}`}
                        href={`/trang/${menu.id}`}
                        className={`text-primary-gray hover:text-fpl 2xl:text-[18px] font-[600] xl:max-w-[110px] xl:line-clamp-1 ${
                          menu.id === activeMenu?.id ? 'text-white' : ''
                        }`}
                        title={menu?.name}
                        prefetch={false}
                        onClick={(ev) => {
                          // Store the menu item in sessionStorage when clicked
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem(
                              'lastActiveMenu',
                              JSON.stringify(menu),
                            );
                          }
                          clickLinkItem({
                            menuItem: menu,
                            event: ev,
                            cb: () => {
                              updateActiveMenuItem({ menuItem: menu });
                            },
                          });
                        }}
                      >
                        {menu?.id !== 'home' &&
                        menu?.id !== 'home-kids' &&
                        menu?.logo &&
                        menu?.logo_focus &&
                        menu?.is_display_logo === '1' ? (
                          <img
                            src={
                              checkActive(`trang/${menu.page_id}`)
                                ? menu.logo_focus
                                : menu.logo
                            }
                            alt={menu?.name}
                            className="h-[20px]"
                          />
                        ) : (
                          menu.name
                        )}
                      </Link>
                    );
                  }
                })}
              {Array.isArray(desktopMenusMore) &&
              desktopMenusMore?.length > 0 ? (
                <MenuMore menus={desktopMenusMore} />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-[16px] xl:gap-[24px]">
            <div className="flex items-center gap-[24px]">
              <Link
                href="/tim-kiem"
                prefetch={false}
                aria-label="Search"
                title="search"
                onClick={() => trackingEnterFuncLog16('EnterSearch')}
              >
                <IoSearch className="fill-white h-[24px] w-[24px] hover:cursor-pointer hover:fill-fpl" />
              </Link>
              {currentProfile?.profile_type !== PROFILE_TYPES.KID_PROFILE && (
                <div className="tablet:block">
                  <Notification />
                </div>
              )}

              {currentProfile?.profile_type !== PROFILE_TYPES.KID_PROFILE && (
                <div className="hidden tablet:block">
                  <DownloadApp />
                </div>
              )}
            </div>
            <div className="flex items-center gap-[24px]">
              {currentProfile?.profile_type !== PROFILE_TYPES.KID_PROFILE && (
                <Link
                  href="/mua-goi"
                  prefetch={false}
                  aria-label="Purchase packages"
                  title="Purchase packages"
                  onClick={() => trackingEnterFuncLog16('EnterPayment')}
                >
                  <button className="fpl-bg font-[600] text-[14px] leading-[130%] tracking-[0.28px] rounded-[104px] hover:cursor-pointer flex items-center gap-[4px] px-[12px] py-[4px] tablet:px-[16px] tablet:py-[6px] tablet:text-[16px] xl:py-[10px]">
                    <span className="hidden tablet:inline">
                      <IoMdCard />
                    </span>
                    Mua gói
                  </button>
                </Link>
              )}

              {/* Desktop (xl+) fixed-width slot to avoid layout shift when avatar mounts */}
              <div className="hidden xl:flex items-center">
                <div
                  style={{ width: `${slotWidth}px` }}
                  className="flex items-center justify-end overflow-hidden"
                  aria-hidden={!(userInfo && profiles.length && currentProfile)}
                >
                  {userInfo && profiles.length && currentProfile ? (
                    <UserDropdownMenu
                      profiles={profiles}
                      currentProfile={currentProfile}
                    />
                  ) : (
                    // reserve space equal to login button / avatar area
                    <div className="w-[90px] h-[24px]" aria-hidden="true" />
                  )}
                </div>
              </div>

              {/* Mobile / tablet: show login button when user not present */}
              {!userInfo && (
                <button
                  className="text-white-smoke text-[18px] hover:cursor-pointer hover:text-fpl lg:hidden font-[600] leading-[130%] tracking-[0.36px] w-[90px]"
                  onClick={() => dispatch(openLoginModal())}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {!shouldHideHeaderAds && <HeaderAds />}
      <HomepageBannerAds />
    </>
  );
}
