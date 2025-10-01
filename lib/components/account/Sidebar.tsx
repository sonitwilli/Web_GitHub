import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import { useAppSelector } from '@/lib/store';
import { useLogout } from '@/lib/hooks/useLogout';
import styles from './SideBar.module.css';
import { GoHome } from 'react-icons/go';
import { MdOutlineGroup } from 'react-icons/md';
import {
  MdOutlineManageAccounts,
  MdOutlineCreditCard,
  MdOutlineDevices,
  MdOutlineBookmarks,
} from 'react-icons/md';
import { ReactSVG } from 'react-svg';
import { FiLogOut } from 'react-icons/fi';
import { BsBookmarks } from 'react-icons/bs';
import { IconType } from 'react-icons/lib';
import { getMenu } from '@/lib/api/sidebar'; // Import hàm getMenu
import { ALREADY_SHOWN_MODAL_MANAGEMENT_CODE } from '@/lib/constant/texts';
import BookMarkIcon from '../icons/BookMarkIcon';
import LaptopIcon from '../icons/LaptopIcon';
import { trackingLog180 } from '@/lib/hooks/useTrackingModule';
import { useAccountGroupCache } from '@/lib/hooks/useAccountGroupCache';

interface MenuItem {
  id?: string;
  title?: string;
  url?: string;
  icon: IconType;
}

interface ModalContent {
  title?: string;
  content?: string;
  buttons?: {
    accept?: string;
    cancel?: string;
  };
}

const SidebarAccount: React.FC = () => {
  const router = useRouter();
  const { tab, id } = router.query;
  const { logout } = useLogout();
  const { forceResetToAnonymous } = useAccountGroupCache();
  const { token, info } = useAppSelector((state) => state.user);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: '',
    content: '',
    buttons: {
      accept: 'Hủy',
      cancel: 'Đăng xuất',
    },
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [menuList, setMenuList] = useState<MenuItem[]>([]); // State để lưu menuList
  const [isLoading, setIsLoading] = useState(true); // State để xử lý loading
  const [hoveredItem, setHoveredItem] = useState<string | null>(null); // State để track hover

  // Map id từ API với icon tương ứng
  const iconMap: Record<string, IconType> = {
    overview: GoHome,
    account_info: MdOutlineManageAccounts,
    payment_plan_management: MdOutlineCreditCard,
    device_management: MdOutlineDevices,
    profile_management: MdOutlineGroup,
    library: BsBookmarks,
    logout: FiLogOut,
  };

  // Map id từ API với url tương ứng
  const urlMap: Record<string, string> = {
    overview: 'tong-quan',
    account_info: 'tai-khoan',
    payment_plan_management: 'thanh-toan-va-goi',
    device_management: 'quan-ly-thiet-bi',
    profile_management: 'ho-so',
    library: 'thu-vien',
    logout: '', // Không cần url cho logout
  };

  // Gọi API getMenu khi component mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        const response = await getMenu();
        const menuData = response.data?.data?.menu || [];

        // Map dữ liệu API với menuList
        const mappedMenuList: MenuItem[] = menuData
          .filter((item) => item.id !== 'logout') // Loại bỏ logout khỏi menuList
          .map((item) => ({
            title: item.title,
            url: urlMap[`${item.id}`] || item.id, // Lấy url từ urlMap hoặc fallback về id
            icon: iconMap[`${item.id}`] || GoHome, // Lấy icon từ iconMap hoặc fallback
          }));

        setMenuList(mappedMenuList);
        if (response.data?.data?.menu?.length === 0) {
          // Nếu không có menu, hiển thị menuList cứng-coded
          setMenuList([
            {
              title: 'Tổng quan',
              url: 'tong-quan',
              icon: GoHome,
            },
            {
              title: 'Thông tin tài khoản',
              url: 'tai-khoan',
              icon: MdOutlineManageAccounts,
            },
            {
              title: 'Quản lý thanh toán và gói',
              url: 'thanh-toan-va-goi',
              icon: MdOutlineCreditCard,
            },
            {
              title: 'Quản lý thiết bị',
              url: 'quan-ly-thiet-bi',
              icon: MdOutlineDevices,
            },
            {
              title: 'Quản lý hồ sơ',
              url: 'ho-so',
              icon: MdOutlineGroup,
            },
            {
              title: 'Thư viện',
              url: 'thu-vien',
              icon: MdOutlineBookmarks,
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch menu:', error);
        // Fallback về menuList cứng-coded nếu API lỗi
        setMenuList([
          {
            title: 'Tổng quan',
            url: 'tong-quan',
            icon: GoHome,
          },
          {
            title: 'Thông tin tài khoản',
            url: 'tai-khoan',
            icon: MdOutlineManageAccounts,
          },
          {
            title: 'Quản lý thanh toán và gói',
            url: 'thanh-toan-va-goi',
            icon: MdOutlineCreditCard,
          },
          {
            title: 'Quản lý thiết bị',
            url: 'quan-ly-thiet-bi',
            icon: MdOutlineDevices,
          },
          {
            title: 'Quản lý hồ sơ',
            url: 'ho-so',
            icon: MdOutlineGroup,
          },
          {
            title: 'Thư viện',
            url: 'thu-vien',
            icon: BsBookmarks,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logOutAction = () => {
    setModalContent({
      title: 'Đăng xuất tài khoản',
      content: 'Bạn có chắc chắn muốn đăng xuất tài khoản?',
      buttons: {
        accept: 'Hủy',
        cancel: 'Đăng xuất',
      },
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      localStorage.removeItem('page_home');
      localStorage.removeItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE);
      const logoutState = {
        token: token || '',
        user: info || {},
      };
      trackingLog180();
      forceResetToAnonymous();
      await logout(logoutState);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (id) {
    return null;
  }

  return (
    <>
      <div className="side-bar text-white w-full">
        <nav
          className={`${styles['mobile-scrollbar']} flex flex-row xl:flex-col xl:gap-0 overflow-x-auto xl:overflow-x-visible overflow-y-visible items-stretch xl:items-start xl:pb-0`}
        >
          {isLoading ? (
            <div className="text-center py-4 whitespace-nowrap xl:w-full">
              Loading...
            </div>
          ) : (
            menuList.map((item, index) => (
              <Link
                key={index}
                href={
                  item?.url?.startsWith('/')
                    ? item.url
                    : {
                        pathname: router.pathname,
                        query: { ...router.query, tab: item.url },
                      }
                }
                className="menu-item transition-colors xl:w-full flex-shrink-0"
                shallow={!item?.url?.startsWith('/')}
                onMouseEnter={() => setHoveredItem(item.url || '')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div
                  className={`inline-flex items-center justify-center xl:justify-start gap-0 xl:gap-4 text-base whitespace-nowrap xl:whitespace-normal font-medium w-full xl:rounded-[10px] px-4 py-4 xl:p-4 border-b-2 xl:border-b-0 transition-all duration-200 group ${
                    tab === item.url
                      ? 'text-white border-b-[2px] border-fpl xl:border-transparent xl:bg-charleston-green'
                      : 'text-silver-chalice border-b-[2px] border-black-olive-404040 xl:border-transparent xl:hover:bg-eerie-black hover:text-white'
                  }`}
                >
                  <span className="hidden xl:block">
                    {item.url === 'tai-khoan' ? (
                      <ReactSVG
                        src="/images/settings/settings_account_box.svg"
                        className="w-[24px] h-[24px] transition-colors"
                        style={{
                          filter:
                            hoveredItem === item.url
                              ? 'brightness(0) invert(1)'
                              : 'none',
                        }}
                      />
                    ) : item.url === 'thu-vien' ? (
                      <BookMarkIcon
                        className="w-[24px] h-[24px] transition-colors"
                        fill={hoveredItem === item.url ? '#FFFFFF' : '#B0B0B0'}
                      />
                    ) : item.url === 'quan-ly-thiet-bi' ? (
                      <LaptopIcon
                        className="w-[24px] h-[24px] transition-colors"
                        fill={hoveredItem === item.url ? '#FFFFFF' : '#B0B0B0'}
                      />
                    ) : (
                      <item.icon
                        size={24}
                        className="group-hover:text-white transition-colors"
                      />
                    )}
                  </span>
                  <span className="text-center xl:text-left">{item.title}</span>
                </div>
              </Link>
            ))
          )}
          <div className="max-w-fit xl:max-w-full border-b-[2px] border-black-olive-404040 rounded-0 xl:border-b-0  flex items-center gap-4 p-4 hover:bg-eerie-black w-full xl:rounded-[10px] hover:text-white flex-shrink-0 group">
            <FiLogOut
              size={24}
              className="text-dark-gray hidden xl:block group-hover:text-white transition-colors"
            />
            <button
              className="menu-item text-base font-[500] text-silver-chalice transition-colors text-left w-full cursor-pointer group-hover:text-white"
              onClick={logOutAction}
            >
              Đăng xuất
            </button>
          </div>
        </nav>

        <ConfirmDialog
          modalContent={modalContent}
          open={modalOpen}
          onSubmit={() => setModalOpen(false)}
          onCancel={handleSubmit}
          onAfterClose={() => setModalOpen(false)}
          onHidden={() => setModalOpen(false)}
        />
      </div>
    </>
  );
};

export default SidebarAccount;
