import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PasswordInput from '@/lib/components/common/PasswordInput';
import ProfileButton from '@/lib/components/common/ProfileButton';
import ConfirmDialog, {
  ModalContent,
} from '@/lib/components/modal/ModalConfirm';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import styles from './ModalFillCode.module.css';

interface ProfilePasswordModalProps {
  title?: string;
  subTitle?: string;
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: (password: string) => void;
  onForget?: () => void;
  open: boolean;
  onHidden?: () => void;
}

// Định nghĩa kiểu cho ref
export interface ProfilePasswordModalRef {
  error?: string;
  setError?: (error: string) => void; // Thêm phương thức setError
}

const ProfilePasswordModal = forwardRef<
  ProfilePasswordModalRef,
  ProfilePasswordModalProps
>(
  (
    {
      title = 'Nhập mã quản lý',
      subTitle = 'Vui lòng nhập mã quản lý gồm 6 số (0-9) để thực hiện chỉnh sửa hồ sơ người dùng',
      loading = false,
      onCancel,
      onConfirm,
      onForget,
      open,
      onHidden,
    },
    ref,
  ) => {
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    // Cung cấp error và setError cho ref
    useImperativeHandle(ref, () => ({
      error: error,
      setError: (newError: string) => setError(newError), // Cho phép cập nhật error state
    }));

    const handleConfirm = () => {
      if (password && password.length === 6) {
        onConfirm?.(password);
      }
    };

    const modalContent: ModalContent = {
      title: title,
      content: subTitle,
      buttons: {
        cancel: 'Hủy',
        accept: 'Xác nhận',
      },
    };

    return (
      <ModalWrapper
        id="profile_password_modal"
        open={open}
        onHidden={() => {
          onHidden?.();
          setError('');
          setPassword('');
        }}
        isCustom={true}
        contentClassName="w-full max-w-[calc(100%-32px)] sm:max-w-[460px] bg-eerie-black rounded-2xl px-4 sm:px-8 py-6 sm:py-8 text-white shadow-lg"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]"
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={false}
      >
        <h2 className="text-center text-[20px] sm:text-2xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-center text-base font-normal text-spanish-gray mb-8">
          {subTitle}
        </p>
        <div className="w-full mb-8">
          <PasswordInput
            placeholder="Nhập mã quản lý"
            onChangeValue={(value: string) => setPassword(value)}
            autoFocus={true}
            classCustom={`${
              error
                ? 'border-scarlet focus:border-scarlet'
                : 'border-black-olive-404040 focus:border-gray'
            } border`}
          />
          {error && (
            <div className="text-left mt-2 text-sm font-normal text-scarlet">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-between gap-3 w-full">
          <ProfileButton
            className={`flex-1 cursor-pointer px-6 py-3 rounded-full text-base font-medium ${
              password.length < 6 || loading
                ? `${styles.disabledButton} cursor-not-allowed`
                : styles.enabledButton
            }`}
            width="full"
            disabled={password.length < 6 || loading}
            onClickBtn={handleConfirm}
          >
            Xác nhận
          </ProfileButton>
        </div>
        <div
          className="text-center text-base font-medium text-white-smoke mt-6 cursor-pointer hover:text-fpl transition-colors"
          onClick={onForget}
        >
          Quên mã quản lý
        </div>
        <ConfirmDialog
          modalContent={modalContent}
          open={modalOpen}
          onSubmit={handleConfirm}
          onCancel={onCancel}
          onHidden={() => setModalOpen(false)}
        />
      </ModalWrapper>
    );
  },
);

ProfilePasswordModal.displayName = 'ProfilePasswordModal';

export default ProfilePasswordModal;
