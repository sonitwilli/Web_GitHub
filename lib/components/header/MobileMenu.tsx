'use client';

import { MenuItem } from '@/lib/api/menu';
import useClickOutside from '@/lib/hooks/useClickOutside';
import useMenu from '@/lib/hooks/useMenu';
import { HeaderContext } from '@/lib/layouts/Header';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { checkActive } from '@/lib/utils/methods';
import Link from 'next/link';
import { useContext, useEffect, useMemo, useRef } from 'react';
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
  const headerCtx = useContext(HeaderContext);
  const { activeMenu, openMobileMenu, setOpenMobileMenu } = headerCtx;
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
        className={`fixed left-0 top-[80px] w-full bg-black duration-300 ease-out ${
          openMobileMenu
            ? 'z-1 pointer-events-auto opacity-60'
            : '-z-[1] pointer-events-none opacity-0'
        }`}
        style={{ height: 'calc(100vh - 80px)' }}
      ></div>

      {/* Menus */}
      <div
        ref={ref}
        className={`custom-scroll flex flex-col fixed top-[80px] xl:w-[250px] ${
          openMobileMenu
            ? 'w-[266px] tablet:w-[320px]'
            : 'w-[266px] xl:w-[250px]'
        } z-[2] overflow-y-auto bg-smoky-black duration-300 ease-out ${
          openMobileMenu ? 'left-0' : '-left-[266px] xl:-left-[250px]'
        }`}
        style={{ 
          height: 'calc(100vh - 80px)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
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

        {menus?.length &&
          menus.map((menu, index) => (
            <Link
              prefetch={false}
              key={`menu-mobile-${index}`}
              href={`/trang/${menu.id}`}
              className={`text-left w-full px-[16px] tablet:px-[24px] py-[6px] text-[14px] leading-[130%] tracking-[0.28px] text-spanish-gray ${
                activeMenu?.id === menu.id ? '!text-white-smoke' : ''
              }`}
              onClick={(ev) =>
                clickLinkItem({
                  menuItem: menu,
                  event: ev,
                  cb: () => {
                    updateActiveMenuItem({ menuItem: menu });
                  },
                })
              }
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
                  className="h-[14px]"
                />
              ) : (
                menu.name
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}