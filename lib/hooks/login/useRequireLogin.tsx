import { NoticeModalRef } from '@/lib/components/modal/ModalNotice';
import { useAppSelector } from '@/lib/store';
import { useEffect, useRef } from 'react';

export function useRequireLogin() {
  const noticeModalRef = useRef<NoticeModalRef>(null);
  const { timeOpenModalRequireLogin } = useAppSelector((state) => state.app);

  useEffect(() => {
    // action login
    if (timeOpenModalRequireLogin) {
      if (noticeModalRef.current) {
        noticeModalRef.current.setNoticeContent({
          title: 'Thông báo',
          content: `<span class="text-spanish-gray leading-[130%] text-[16px] tracking-[0.32px]">Vui lòng đăng nhập để sử dụng tiếp dịch vụ.</span>`,
          action: 'login_current_page',
          buttonContent: 'Đăng nhập',
        });
        noticeModalRef.current.openModal();
      }
    }
  }, [timeOpenModalRequireLogin, noticeModalRef]);

  return { noticeModalRef };
}
