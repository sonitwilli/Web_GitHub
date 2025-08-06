import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeWarningModal } from '@/lib/store/slices/liveChatSlice';

export default function LiveChatWarningModal({
  portalTarget,
}: {
  portalTarget?: HTMLElement;
}) {
  const { warningModal } = useAppSelector((state) => state.liveChat);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeWarningModal());
  };

  const title = warningModal.metadata?.title || '';
  const content = warningModal.metadata?.data?.[0]?.title || '';
  const buttonText = warningModal.metadata?.data?.[0]?.button || 'Đóng';
  return (
    <ConfirmDialog
      open={warningModal.isOpen}
      onSubmit={handleClose}
      modalContent={{
        title: title,
        content: content,
        buttons: {
          accept: buttonText,
        },
      }}
      bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
      portalTarget={portalTarget}
    />
  );
}
