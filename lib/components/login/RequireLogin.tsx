import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { useEffect, useState } from 'react';

export default function RequireLogin() {
  const { timeOpenModalRequireLogin } = useAppSelector((state) => state.app);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (timeOpenModalRequireLogin) {
      setModalOpen(true);
    } else if (modalOpen) {
      setModalOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOpenModalRequireLogin]);

  const handleSubmit = () => {
    dispatch(openLoginModal());
    dispatch(changeTimeOpenModalRequireLogin(0));
  };

  const handleClose = () => {
    dispatch(changeTimeOpenModalRequireLogin(0));

    if (sessionStorage.getItem(trackingStoreKey.OPEN_NOTIFICATION_BELL)) {
      sessionStorage.removeItem(trackingStoreKey.OPEN_NOTIFICATION_BELL);
    }
  };

  return (
    <div>
      <ConfirmDialog
        modalContent={{
          title: 'Đăng nhập tài khoản',
          content: 'Bạn cần thực hiện đăng nhập để tiếp tục sử dụng dịch vụ',
          buttons: {
            accept: 'Đăng nhập',
            cancel: 'Đóng',
          },
        }}
        open={modalOpen}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
      />
    </div>
  );
}
