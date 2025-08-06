import { MenuItem } from '@/lib/api/menu';
import { useAppDispatch } from '../store';
import {
  changeActiveMenuItem,
  changeSelectedMenuMoreItem,
} from '../store/slices/appSlice';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

export default function useMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const saveMenuMore = ({ menuItem }: { menuItem: MenuItem }) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('menuItem', JSON.stringify(menuItem));
      localStorage.setItem('menuItemActive', menuItem.id || '');
    }
    dispatch(changeSelectedMenuMoreItem(menuItem));
    dispatch(changeActiveMenuItem(menuItem));
  };

  const checkSelectedMenuOnRefresh = useCallback(
    ({ menus }: { menus?: MenuItem[] }) => {
      if (typeof localStorage !== 'undefined') {
        const menuMoreItemLc = localStorage.getItem('menuItem');
        if (menuMoreItemLc) {
          const menuItem = JSON.parse(menuMoreItemLc) as MenuItem;
          dispatch(changeSelectedMenuMoreItem(menuItem));
        }
        // active menu
        const menuItemActiveLc = localStorage.getItem('menuItemActive');
        if (menuItemActiveLc) {
          const found = menus?.find((item) => item.id === menuItemActiveLc);
          if (found) {
            dispatch(changeActiveMenuItem(found));
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  const updateActiveMenuItem = ({ menuItem }: { menuItem: MenuItem }) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('menuItemActive', menuItem.id || '');
    }
    dispatch(changeActiveMenuItem(menuItem));
  };

  const clickLinkItem = useCallback(
    // Trong trường hợp người dùng đang ở tab Trang chủ => Click vào tab Trang chủ => Roll lên đầu trang (Không reload lại trang).
    ({
      menuItem,
      event,
      cb,
    }: {
      menuItem: MenuItem;
      event: React.MouseEvent;
      cb?: () => void;
    }) => {
      const { id } = router.query;
      const isSamePage =
        id === menuItem.id ||
        (menuItem?.id === 'channel' &&
          router.pathname.includes('/xem-truyen-hinh/'));
      if (isSamePage) {
        event.preventDefault();
        window.scrollTo({
          behavior: 'smooth',
          top: 0,
        });
      }
      if (cb) cb();
    },
    [router],
  );

  return {
    saveMenuMore,
    checkSelectedMenuOnRefresh,
    updateActiveMenuItem,
    clickLinkItem,
  };
}
