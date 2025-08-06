import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  closeConfirmDeleteModal,
  setDeleteConfirmationResult,
} from '@/lib/store/slices/liveChatSlice';
import { cloneDeep } from 'lodash';

export default function LiveChatConfirmModal({
  portalTarget,
}: {
  portalTarget?: HTMLElement;
}) {
  const { confirmDelete } = useAppSelector((state) => state.liveChat);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeConfirmDeleteModal());
  };

  const handleSubmit = () => {
    if (!confirmDelete.metadata) return;

    const newMetadata = cloneDeep(confirmDelete.metadata);

    if (newMetadata.data && newMetadata.data.length > 0) {
      newMetadata.data[0].selected = '1';
    }

    dispatch(
      setDeleteConfirmationResult({
        metadata: newMetadata,
      }),
    );
    handleClose();
  };

  const title = confirmDelete.metadata?.title || '';
  const content = confirmDelete.metadata?.data?.[0]?.title || '';
  const acceptText = 'Xóa';
  const cancelText = 'Hủy';
  return (
    <ConfirmDialog
      open={confirmDelete.isOpen}
      onCancel={handleClose}
      onSubmit={handleSubmit}
      modalContent={{
        title: title,
        content: content,
        buttons: {
          accept: acceptText,
          cancel: cancelText,
        },
      }}
      bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
      portalTarget={portalTarget}
    />
  );
}
