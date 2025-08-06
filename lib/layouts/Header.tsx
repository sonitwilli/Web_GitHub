/* eslint-disable @next/next/no-html-link-for-pages */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { MenuItem } from '@/lib/api/menu';
import Link from 'next/link';
import Notification from '@/lib/components/notification';
import { PACKAGE, PROFILE_TYPES, TYPE_PR } from '@/lib/constant/texts';
import MenuMore from '@/lib/components/header/MenuMore';
import MobileMenu from '@/lib/components/header/MobileMenu';
import { AppContext } from '@/lib/components/container/AppContainer';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { useDispatch } from 'react-redux';
import useScroll from '@/lib/hooks/useScroll';
import { IoMdCard } from 'react-icons/io';
import DownloadApp from '../components/download/DownloadApp';
import { checkActive } from '../utils/methods';
import { useAppSelector } from '../store';
import useMenu from '../hooks/useMenu';
import { ACCOUNT } from '@/lib/constant/texts';
import { saveProfile } from '@/lib/utils/profile';
import dynamic from 'next/dynamic';
import { setCurrentProfile } from '../store/slices/multiProfiles';
import { Profile } from '../api/user';
import { trackingEnterFuncLog16 } from '@/lib/tracking/trackingCommon';
import { GoSearch } from 'react-icons/go';
import HeaderAds from '@/lib/components/ads/HeaderAds';
import { HomepageBannerAds } from '@/lib/components/ads';
import { useNetwork } from '../components/contexts/NetworkProvider';

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
  const [localOpenMobileMenu, setLocalOpenMobileMenu] = useState(false);
  
  // Use context value if available, otherwise use local state
  const openMobileMenu = headerContext?.openMobileMenu ?? localOpenMobileMenu;
  const setOpenMobileMenu = headerContext?.setOpenMobileMenu ?? setLocalOpenMobileMenu;
  
  const [shouldHideHeaderAds, setShouldHideHeaderAds] = useState(false);
  const { scrollDistance } = useScroll();
  const { updateActiveMenuItem, clickLinkItem } = useMenu();
  const router = useRouter();
  const { isOffline } = useNetwork();
  const { type, id } = router.query;
  const isCategoryPage = useMemo(() => {
    // Thêm những page cần tắt hiệu ứng transparent header
    const pages = [ACCOUNT, PACKAGE];
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
  const { configs, menus } = appCtx;
  const { selectedMenuMoreItem } = useAppSelector((state) => state.app);

  const userInfo = useAppSelector((state) => state.user);
  const profiles = useAppSelector((state) => state.multiProfile.profiles);
  const currentProfile = useMemo(() => {
    const userProfileId = userInfo?.info?.profile?.profile_id;
    return profiles.find((p) => p.profile_id === userProfileId);
  }, [profiles, userInfo]);

  useEffect(() => {
    saveProfile({ profile: currentProfile });
    dispatch(setCurrentProfile(currentProfile as Profile));
  }, [currentProfile, dispatch]);

  useEffect(() => {
    // Check app_name in localStorage to determine if HeaderAds should be hidden
    const checkAppName = () => {
      if (typeof window !== 'undefined') {
        const appName = localStorage.getItem('app_name');
        const hideAdsApps = ['Truyền hình', 'Học tập', 'Thiếu nhi'];
        setShouldHideHeaderAds(hideAdsApps.includes(appName || ''));
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
  }, [router.isReady, router.events]);

  const desktopMenus = useMemo(() => {
    if (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(TYPE_PR) === PROFILE_TYPES.KID_PROFILE
    ) {
      return menus;
    }
    if (configs?.number_item_of_menu_web && menus?.length) {
      const r = menus.slice(0, Number(configs?.number_item_of_menu_web));
      if (selectedMenuMoreItem) {
        return r.concat([selectedMenuMoreItem]);
      }
      return r;
    }
    if (selectedMenuMoreItem) {
      return defaultMenu.concat([selectedMenuMoreItem]);
    }
    return defaultMenu;
  }, [configs, menus, selectedMenuMoreItem]);

  const desktopMenusMore = useMemo(() => {
    if (configs?.number_item_of_menu_web && menus?.length) {
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
        'xem-video',
        'xem-truyen-hinh',
        'dien-vien',
        'su-kien',
        'playlist',
        'short-videos',
        'tim-kiem',
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
        className={` fixed w-full left-0 top-0 h-[80px] z-[10] flex flex-col justify-center duration-800 bg-black tablet:bg-transparent ${
          scrollDistance > 300 || isCategoryPage ? '!bg-black' : ''
        } ${openMobileMenu ? '!bg-black' : ''}`}
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
                        className={`text-primary-gray hover:text-fpl 2xl:text-[18px] font-[600] xl:max-w-[152px] xl:line-clamp-1 ${
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
                <GoSearch className="fill-white h-[24px] w-[24px] hover:cursor-pointer hover:fill-fpl" />
              </Link>
              <div className="tablet:block">
                <Notification />
              </div>

              <div className="hidden tablet:block">
                <DownloadApp />
              </div>
            </div>
            <div className="flex items-center gap-[24px]">
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

              <div className="hidden xl:block">
                {userInfo && profiles.length && currentProfile ? (
                  <UserDropdownMenu
                    profiles={profiles}
                    currentProfile={currentProfile}
                  />
                ) : (
                  <button
                    className="text-white-smoke text-[18px] hover:cursor-pointer hover:text-fpl hidden lg:inline-block font-[600] leading-[130%] tracking-[0.36px]"
                    onClick={() => dispatch(openLoginModal())}
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {!shouldHideHeaderAds && <HeaderAds />}
      <HomepageBannerAds />
    </>
  );
}
