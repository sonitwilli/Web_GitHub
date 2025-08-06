import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ModalWrapper from './ModalWrapper';
import {ALREADY_SHOWN_MODAL_MANAGEMENT_CODE} from '@/lib/constant/texts'

interface ModalManagementCodeProps {
  id?: string;
  open?: boolean;
  isConfirm?: boolean;
  loading?: boolean;
  onHidden?: () => void;
  onAcknowledge?: () => void;
  onConfirm?: () => void;
}

// Định nghĩa kiểu cho ref
export interface ModalManagementCodeRef {
  show: () => void;
}

const ModalManagementCode = forwardRef<ModalManagementCodeRef, ModalManagementCodeProps>(
  (
    {
      id = Date.now().toString(),
      open = false,
      isConfirm = false,
      loading = false,
      onHidden,
      onAcknowledge,
      onConfirm,
    },
    ref
  ) => {
    const [modalShow, setModalShow] = useState<boolean>(false);

    // Cập nhật trạng thái modalShow dựa trên prop open
    useEffect(() => {
      setModalShow(open);
    }, [open]);

    // Sử dụng useImperativeHandle để định nghĩa phương thức show cho ref
    useImperativeHandle(ref, () => ({
      show: () => {
        setModalShow(true);
      },
    }));

    const title = isConfirm ? 'Thiết lập mã quản lý' : 'Cập nhật mã quản lý';
    const description = isConfirm
      ? 'Tài khoản của bạn chưa được thiết lập mã quản lý. Mã này được dùng để bảo vệ hay xác nhận quyền truy cập đến các tính năng và thiết lập quan trọng.'
      : 'Mật khẩu tài khoản sẽ được cập nhật thành mã quản lý. Mã quản lý được dùng để bảo vệ hay xác nhận quyền truy cập đến các tính năng và thiết lập quan trọng.';

    const handleHide = () => {
      setModalShow(false);
      onHidden?.();
    };

    const handleAcknowledge = () => {
      if (!isConfirm && typeof window !== 'undefined') {
        localStorage.setItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE, '1');
      }
      onAcknowledge?.();
      handleHide();
    };

    const handleConfirm = () => {
      onConfirm?.();
      handleHide();
    };

    return (
      <ModalWrapper
        id={id}
        open={modalShow}
        onHidden={handleHide}
        contentClassName="w-full max-w-[400px] bg-eerie-black rounded-[16px] p-8 text-white shadow-lg"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]"
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-center text-2xl font-semibold text-white">{title}</h2>
          <p className="text-center text-sm font-light text-gray-300">{description}</p>
          <div className="flex justify-between gap-3 pt-4">
            {!isConfirm ? (
              <button
                className="flex-1 h-12 cursor-pointer text-white text-base font-medium rounded-[40px] bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                onClick={handleAcknowledge}
              >
                Đã hiểu
              </button>
            ) : (
              <>
                <button
                  className="flex-1 h-12 text-gray-400 cursor-pointer text-base font-medium rounded-[40px] bg-charleston-green hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={handleHide}
                >
                  Để sau
                </button>
                <button
                  className="flex-1 h-12 text-white cursor-pointer text-base font-medium rounded-[40px] bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={handleConfirm}
                >
                  Đồng ý
                </button>
              </>
            )}
          </div>
        </div>
      </ModalWrapper>
    );
  }
);

ModalManagementCode.displayName = 'ModalManagementCode'

export default ModalManagementCode;