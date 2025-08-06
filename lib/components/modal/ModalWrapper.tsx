import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { IoCloseOutline } from 'react-icons/io5';
import ModalNotice, { NoticeModalProps } from './ModalNotice';
import { trackingShowPopupLog191 } from '@/lib/tracking/trackingCommon';
import ModalConfirm, { ConfirmDialogProps } from './ModalConfirm';

interface ModalWrapperProps {
  id?: string;
  open: boolean;
  isCustom?: boolean;
  onHidden?: () => void;
  title?: string; // Added for header title
  children: React.ReactNode;
  contentClassName?: string;
  overlayClassName?: string;
  shouldCloseOnEsc?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  htmlOpenClassName?: string;
  onRequestClose?: () => void;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
  portalTarget?: HTMLElement; // Added prop for custom portal target
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  id = Date.now().toString(),
  open,
  onHidden,
  isCustom = false,
  children,
  contentClassName = 'w-full max-w-[calc(100%-32px)] 2xl:max-w-md bg-white rounded-[16px] p-6 text-gray-900 shadow-lg',
  overlayClassName = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]',
  shouldCloseOnEsc = false,
  shouldCloseOnOverlayClick = false,
  htmlOpenClassName,
  onAfterOpen,
  onAfterClose,
  portalTarget, // Added portal target prop
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setModalOpen(open);
    if (open) {
      let ItemName = '';
      if (React.isValidElement(children) && children.type === ModalNotice) {
        const noticeContent = (children as React.ReactElement<NoticeModalProps>)
          .props?.data;
        ItemName = noticeContent?.content || '';
      }
      if (React.isValidElement(children) && children.type === ModalConfirm) {
        const confirmContent = (
          children as React.ReactElement<ConfirmDialogProps>
        ).props?.modalContent;
        ItemName = confirmContent?.content || '';
      }
      trackingShowPopupLog191({
        ItemName: ItemName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setModalOpen(false);
    onHidden?.();
  };

  return (
    <Modal
      id={id}
      isOpen={modalOpen}
      onRequestClose={handleClose}
      shouldCloseOnEsc={shouldCloseOnEsc}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      className={contentClassName}
      overlayClassName={overlayClassName}
      ariaHideApp={false}
      htmlOpenClassName={htmlOpenClassName}
      onAfterOpen={onAfterOpen}
      onAfterClose={onAfterClose}
      parentSelector={portalTarget ? () => portalTarget : undefined} // Added parentSelector for custom portal
    >
      {isCustom && (
        // <div className="flex justify-between items-center h-[48px]">
        //   {title && (
        //     <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        //   )}
        //   {!title && <div></div>}
        //   <button
        //     onClick={handleClose}
        //     className="hover:cursor-pointer text-white-smoke hover:text-fpl ease-out duration-300"
        //     aria-label="Close modal"
        //   >
        //     <IoMdClose size={28} />
        //   </button>
        // </div>
        <button
          onClick={handleClose}
          className="z-[1] absolute right-[16px] top-[16px] hover:cursor-pointer text-white-smoke hover:text-fpl ease-out duration-300"
          aria-label="Close modal"
        >
          <IoCloseOutline size={28} />
        </button>
      )}
      {children}
    </Modal>
  );
};

export default ModalWrapper;
