import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import ModalWrapper from './ModalWrapper';

export type ModalCloseKey = 'on_close' | 'on_exit' | '';
export type ModalSubmitKey =
  | 'on_close'
  | 'on_mobile'
  | 'on_understood'
  | 'on_exit'
  | 'on_refresh'
  | '';

export interface ModalContent {
  title?: string;
  content?: string;
  buttons?: {
    cancel?: string;
    accept?: string;
  };
}

export interface ConfirmDialogProps {
  isCountdownRetry?: boolean;
  modalContent?: ModalContent;
  contentClassName?: string;
  bodyContentClassName?: string;
  open?: boolean;
  submitClass?: string;
  cancelClass?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  onHidden?: () => void;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
  portalTarget?: HTMLElement;
}

// Define the ref interface for openModal and closeModal
export interface ConfirmDialogRef {
  openModal?: () => void;
  closeModal?: () => void;
}

const ConfirmDialog = forwardRef<ConfirmDialogRef, ConfirmDialogProps>(
  (
    {
      modalContent,
      contentClassName,
      bodyContentClassName,
      open: propOpen,
      submitClass = 'fpl-bg',
      cancelClass = 'bg-charleston-green text-spanish-gray',
      onSubmit,
      onCancel,
      onHidden,
      onAfterOpen,
      onAfterClose,
      portalTarget,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(propOpen || false);

    // Sync propOpen with internal state if controlled externally
    useEffect(() => {
      if (propOpen !== undefined) {
        setIsOpen(propOpen);
      }
    }, [propOpen]);

    // Expose openModal and closeModal via ref
    useImperativeHandle(
      ref,
      () => ({
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
      }),
      [],
    );

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && isOpen) {
          e.preventDefault();
          const activeButton = document.querySelector('.button-active');
          const submitButton = document.querySelector('button[type="submit"]');
          if (activeButton) {
            (activeButton as HTMLButtonElement).click();
          } else if (submitButton) {
            (submitButton as HTMLButtonElement).click();
          }
        }
      };

      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }, [isOpen]);

    return (
      <ModalWrapper
        id="modal-confirm"
        open={isOpen}
        onHidden={onHidden}
        contentClassName={`max-w-[calc(400px-32px)] tablet:w-[400px] px-4 sm:px-8 py-6 sm:py-8 bg-eerie-black rounded-2xl text-white shadow-lg ${
          contentClassName || ''
        }`}
        overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999] cursor-default"
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        onAfterOpen={onAfterOpen}
        onAfterClose={onAfterClose}
        portalTarget={portalTarget}
      >
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <h4 className="text-center mb-[16px] text-[20px] sm:text-2xl font-semibold text-white">
            {modalContent?.title}
          </h4>
          <p
            className={`text-center text-base font-normal text-spanish-gray ${
              bodyContentClassName || ''
            }`}
          >
            <span
              className="modal-content-tracking"
              dangerouslySetInnerHTML={{
                __html: modalContent?.content as string,
              }}
            ></span>
          </p>
        </div>
        <div className="flex items-center justify-center w-full pb-0 gap-4">
          {modalContent?.buttons?.cancel && (
            <button
              className={`${cancelClass} whitespace-nowrap flex-1 cursor-pointer outline-0 rounded-[40px] px-6 py-3 text-base font-medium hover:bg-black-olive transition-colors`}
              onClick={() => {
                onCancel?.();
                setIsOpen(false); // Close modal on cancel
              }}
            >
              {modalContent?.buttons.cancel}
            </button>
          )}
          {modalContent?.buttons?.accept && (
            <button
              className={`${submitClass} whitespace-nowrap flex-1 cursor-pointer outline-0 text-white rounded-[40px] px-6 py-3 text-base font-medium hover:from-safety-orange hover:to-cg-red transition-colors`}
              onClick={() => {
                onSubmit?.();
                setIsOpen(false); // Close modal on submit
              }}
            >
              {modalContent?.buttons.accept}
            </button>
          )}
        </div>
      </ModalWrapper>
    );
  },
);

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
