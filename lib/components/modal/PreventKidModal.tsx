import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ModalWrapper from '@/lib/components/modal/ModalWrapper'; // Giả định đường dẫn
import { getConfig } from '@/lib/api/config'; // Import API getConfig
import { PROFILE_TYPES, TYPE_PR } from '@/lib/constant/texts'; // Giả định constants
import { usePlayerPageContext } from '../player/context/PlayerPageContext'; // Giả định context để lấy dataChannel

// Danh sách whitelist
const whiteList = [
  '/dieu-khoan-su-dung',
  '/gioi-thieu',
  '/dich-vu/3g',
  '/bao-hanh',
  '/dieu-khoan-su-dung',
  '/chinh-sach-thanh-toan',
  '/chinh-sach-bao-mat',
  '/trang/home',
  '/trang/home-kids',
  '/tim-kiem',
];

const whiteListIncludes = [
  '/playlist/',
  '/cong-chieu/',
  '/tim-kiem',
];

const PreventKidModal: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preventKidText, setPreventKidText] = useState('');
  const [profilesRouteChanged] = useState(false); // Giả định tạm thời, thay bằng Redux nếu cần
  const { dataChannel } = usePlayerPageContext(); // Giả định context để lấy dataChannel

  // Lấy msg_not_support từ API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        const msgNotSupport = response.data?.data?.profile?.msg_not_support || '';
        setPreventKidText(msgNotSupport);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };

    fetchConfig();
  }, []);

  // Kiểm tra điều kiện hiển thị modal
  useEffect(() => {
    if (!router.isReady) return;
    const checkPreventKid = async () => {
      const path = router.asPath;
      
      const validInclude = isWhiteListInclude(path);
      
      if (path === '/' || validInclude) {
        return;
      }

      if(path.includes('/xem-video') && !dataChannel) {
        return
      }

      if(dataChannel?.is_kid === '1') {
        return
      }

      const valid = isWhiteList(path);
      
      if (valid) {
        return;
      }

      const type = localStorage.getItem(TYPE_PR);
      if (type === PROFILE_TYPES.KID_PROFILE && !profilesRouteChanged) {
        setOpen(true);
      }
    };

    checkPreventKid();
  }, [router.asPath, profilesRouteChanged, router.isReady, dataChannel]);

  // Hàm kiểm tra whitelist
  const isWhiteList = (path: string): boolean => {
    return whiteList.includes(path);
  };

  // Hàm kiểm tra whitelist includes
  const isWhiteListInclude = (path: string): boolean => {
    return whiteListIncludes.some((item) => path.includes(item));
  };

  // Hàm xử lý khi nhấn nút "Về trang chủ"
  const confirm = () => {
    window.location.href = '/';
  };

  return (
    <div>
      {preventKidText && (
        <ModalWrapper
          id="modal-profile-prevent-kid"
          open={open}
          onHidden={() => setOpen(false)}
          contentClassName="w-full max-w-[400px] bg-eerie-black rounded-[16px] p-8 text-white shadow-lg"
          overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]"
          shouldCloseOnEsc={false}
          shouldCloseOnOverlayClick={false}
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold leading-[1.3] mb-4">Hồ sơ không phù hợp</h2>
            <p className="text-base text-spanish-gray font-normal leading-[1.3] mb-8">{preventKidText}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={confirm}
                className="w-full bg-gradient-to-r from-portland-orange to-lust flex-1 cursor-pointer outline-0 text-white rounded-[40px] px-6 py-3 text-base font-medium hover:bg-white/10 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default PreventKidModal;