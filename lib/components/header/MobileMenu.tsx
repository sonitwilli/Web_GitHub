'use client';

import { MenuItem } from '@/lib/api/menu';
import useClickOutside from '@/lib/hooks/useClickOutside';
import useMenu from '@/lib/hooks/useMenu';
import { HeaderContext } from '@/lib/layouts/Header';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import Link from 'next/link';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { RiMenuFill } from 'react-icons/ri';
import dynamic from 'next/dynamic';

const UserDropdownMenu = dynamic(() => import('./ProfileDropdown'), {
  ssr: false,
});
interface Props {
  menus?: MenuItem[];
}
export default function MobileMenu({ menus }: Props) {
  const toogleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const headerCtx = useContext(HeaderContext);
  const { openMobileMenu, setOpenMobileMenu } = headerCtx;
  const { updateActiveMenuItem, clickLinkItem } = useMenu();
  const userInfo = useAppSelector((state) => state.user);
  const profiles = useAppSelector((state) => state.multiProfile.profiles);
  const currentProfile = useMemo(() => {
    const userProfileId = userInfo?.info?.profile?.profile_id;
    return profiles.find((p) => p.profile_id === userProfileId);
  }, [profiles, userInfo]);

  const ref = useClickOutside<HTMLDivElement>(() => {
    if (setOpenMobileMenu) setOpenMobileMenu(false);
  }, ['toogle_mobile_menu']);
  const dispatch = useAppDispatch();

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
        'thong-tin'
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
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (openMobileMenu) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }, [openMobileMenu]);

  return (
    <div className="relative">
      <div
        id="toogle_mobile_menu"
        ref={toogleRef}
        onClick={() => {
          if (setOpenMobileMenu) setOpenMobileMenu(!openMobileMenu);
        }}
      >
        <RiMenuFill className="w-[20px] h-[20px] hover:cursor-pointer hover:fill-fpl xl:hidden" />
      </div>

      {/* black background */}
      <div
        className={`fixed left-0 top-[80px] bottom-[108px] w-full bg-black duration-300 ease-out ${
          openMobileMenu
            ? 'z-1 pointer-events-auto opacity-60'
            : '-z-[1] pointer-events-none opacity-0'
        }`}
        // Include safe-area inset in the height so on landscape (small heights)
        // the overlay still covers the visible area and doesn't clip menu items.
        style={{ height: 'calc(100vh - 80px + env(safe-area-inset-bottom, 0px))' }}
      ></div>

      {/* Menus */}
      <div
        ref={ref}
        className={`custom-scroll flex flex-col fixed top-[80px] bottom-0 xl:w-[250px] ${
          openMobileMenu
            ? 'w-[266px] tablet:w-[320px]'
            : 'w-[266px] xl:w-[250px]'
        } z-[2] overflow-y-auto bg-smoky-black duration-300 ease-out ${
          openMobileMenu ? 'left-0' : '-left-[266px] xl:-left-[250px]'
        }`}
        // Ensure enough padding at the bottom to account for mobile safe-area and
        // give items room in landscape orientations where viewport height is small.
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)'
        }}
        onClick={() => {
          if (setOpenMobileMenu) setOpenMobileMenu(false);
        }}
      >
        {userInfo && profiles.length && currentProfile ? (
          <div onClick={(e) => e.stopPropagation()}>
            <UserDropdownMenu
              profiles={profiles}
              currentProfile={currentProfile}
              onOpenDropdown={() => {
                setOpenMobileMenu?.(true);
              }}
            />
          </div>
        ) : (
          <button
            className="text-left w-full px-[16px] tablet:px-[24px] pt-[16px] tablet:pt-[24px] pb-[6px] tablet:pb-[18px] text-[16px] font-[600] leading-[130%] tracking-[0.32px] text-white-smoke"
            onClick={() => dispatch(openLoginModal())}
          >
            Đăng nhập / Đăng ký
          </button>
        )}

        {Array.isArray(menus) &&
          menus?.map((menu, index) => {
            if (menu?.id) {
              return (
                <Link
                  prefetch={false}
                  key={`menu-mobile-${index}-${menu.id}`}
                  href={`/trang/${menu.id}`}
                  // Keep original spacing/leading but ensure block display so
                  // truncation and padding behave consistently.
                  className={`block flex-shrink-0 text-left w-full px-[16px] tablet:px-[24px] py-[3px] text-[14px] leading-[130%] tracking-[0.28px] text-spanish-gray truncate whitespace-nowrap ${
                    menu.id === activeMenu?.id ? '!text-white-smoke' : ''
                  }`}
                  title={menu?.name}
                  onClick={(ev) => {
                    // Store the menu item in sessionStorage when clicked (same as Header)
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
                        menu.id === activeMenu?.id
                          ? menu.logo_focus
                          : menu.logo
                      }
                      alt={menu?.name}
                      className="h-[14px]"
                    />
                  ) : (
                    ((): string => {
                      const name = menu?.name || '';
                      return name.length > 30 ? `${name.slice(0, 30)}…` : name;
                    })()
                  )}
                </Link>
              );
            }
          })}
      </div>
    </div>
  );
}