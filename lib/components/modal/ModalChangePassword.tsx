import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { useForm, Controller } from 'react-hook-form';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { useChangePassword } from '@/lib/hooks/useChangePassword';
import { useAppSelector } from '@/lib/store';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentClassName?: string;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  contentClassName,
}) => {
  const [oldPasswordType, setOldPasswordType] = useState<'password' | 'text'>('password');
  const [newPasswordType, setNewPasswordType] = useState<'password' | 'text'>('password');
  const [confirmPasswordType, setConfirmPasswordType] = useState<'password' | 'text'>('password');
  const [serverError, setServerError] = useState<{ oldPassword?: string; newPassword?: string }>({});
  const { info } = useAppSelector((state) => state.user);

  const { changePassword, isLoading, error } = useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');

  // Assuming currentUser is retrieved from localStorage or context
  const getCurrentUser = () => {
    return info?.user_id_str ? info : null;
  };

  const onSubmit = async (data: FormValues) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.user_phone) {
      setServerError({ newPassword: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    try {
      const response = await changePassword({
        phone: currentUser.user_phone,
        current_password: data.oldPassword,
        new_password: data.newPassword,
        new_password_confirm: data.confirmPassword,
      });

      if (response.data.error_code === 0) {
        onClose();
      } else {
        setServerError({
          oldPassword: response.data.error_code === 9 ? response.data.msg : undefined,
          newPassword: response.data.error_code === 12 ? response.data.msg : undefined,
        });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setServerError({ newPassword: error || 'Đã có lỗi xảy ra' });
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    if (field === 'old') {
      setOldPasswordType(oldPasswordType === 'password' ? 'text' : 'password');
    } else if (field === 'new') {
      setNewPasswordType(newPasswordType === 'password' ? 'text' : 'password');
    } else {
      setConfirmPasswordType(confirmPasswordType === 'password' ? 'text' : 'password');
    }
  };

  const handleInput = (value: string, field: keyof FormValues) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setValue(field, sanitizedValue, { shouldValidate: true });
    setServerError({});
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      setServerError({});
      setOldPasswordType('password');
      setNewPasswordType('password');
      setConfirmPasswordType('password');
    }
  }, [isOpen, reset]);

  return (
    <ModalWrapper
      id="change-password-modal"
      open={isOpen}
      onHidden={onClose}
      contentClassName={`max-w-md w-full bg-white rounded-lg p-6 ${contentClassName}`}
      shouldCloseOnOverlayClick={false}
    >
      <div className="space-y-6">
        <h4 className="text-left text-xl font-semibold">Thay đổi mật khẩu</h4>
        <p className="text-left text-sm text-gray-500">
          Vui lòng nhập Mật khẩu tối đa 6 số (0-9)
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
            <div className="relative mt-1">
              <Controller
                name="oldPassword"
                control={control}
                rules={{
                  required: 'Mật khẩu cũ là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu cũ phải có ít nhất 6 số',
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Mật khẩu cũ chỉ được chứa số',
                  },
                }}
                render={({ field }) => (
                  <input
                    type={oldPasswordType}
                    {...field}
                    onChange={(e) => handleInput(e.target.value, 'oldPassword')}
                    maxLength={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {oldPasswordType === 'password' ? (
                  <BsEyeSlash className="h-5 w-5" />
                ) : (
                  <BsEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {(errors.oldPassword || serverError.oldPassword) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.oldPassword?.message || serverError.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <div className="relative mt-1">
              <Controller
                name="newPassword"
                control={control}
                rules={{
                  required: 'Mật khẩu mới là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu mới phải có ít nhất 6 số',
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Mật khẩu mới chỉ được chứa số',
                  },
                }}
                render={({ field }) => (
                  <input
                    type={newPasswordType}
                    {...field}
                    onChange={(e) => handleInput(e.target.value, 'newPassword')}
                    maxLength={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {newPasswordType === 'password' ? (
                  <BsEyeSlash className="h-5 w-5" />
                ) : (
                  <BsEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {(errors.newPassword || serverError.newPassword) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword?.message || serverError.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <div className="relative mt-1">
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: 'Xác nhận mật khẩu là bắt buộc',
                  validate: (value) =>
                    value === newPassword || 'Mật khẩu xác nhận không khớp',
                }}
                render={({ field }) => (
                  <input
                    type={confirmPasswordType}
                    {...field}
                    onChange={(e) => handleInput(e.target.value, 'confirmPassword')}
                    maxLength={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {confirmPasswordType === 'password' ? (
                  <BsEyeSlash className="h-5 W-5" />
                ) : (
                  <BsEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting || isLoading}
            className="w-full rounded-md bg-blue-600 py-2 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Xác nhận
          </button>
        </form>
      </div>
    </ModalWrapper>
  );
};

export default ChangePasswordModal;