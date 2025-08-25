import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { useEffect, useMemo, useState } from 'react';
import { PLAYER_WRAPPER_ID } from '@/lib/constant/texts';
import usePlayer from '@/lib/hooks/usePlayer';

export default function RequireLogin() {
  const { timeOpenModalRequireLogin } = useAppSelector((state) => state.app);
  const { isFullscreen } = useAppSelector((s) => s.player);
  const { clickFullScreen } = usePlayer();

  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const portalTarget = useMemo(() => {
    if (isFullscreen) {
      return document.getElementById(PLAYER_WRAPPER_ID) as HTMLElement;
    }
  }, [isFullscreen]);
  useEffect(() => {
    if (timeOpenModalRequireLogin) {
      setModalOpen(true);
    } else if (modalOpen) {
      setModalOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOpenModalRequireLogin]);

  const handleSubmit = () => {
    if (isFullscreen) {
      clickFullScreen();
    }
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
        portalTarget={portalTarget}
      />
    </div>
  );
}
