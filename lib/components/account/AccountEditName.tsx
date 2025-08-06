import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

interface FormData {
  name: string;
}

const AccountNameEdit: React.FC<{
  initialName: string;
  onSave: (newName: string) => Promise<void>;
  onCancel: () => void;
}> = ({ initialName, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { name: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const name = watch('name') || '';
  const trimmedName = name.trim();
  const isChanged = trimmedName !== initialName.trim();
  const isEmpty = trimmedName.length === 0;
  const isDisabled = isEmpty || !!errors.name || !isChanged || isSubmitting;
  const dispatch = useDispatch();

  const onSubmit = async (data: FormData) => {
    const trimmed = data.name.trim();
    if (trimmed.length === 0) {
      setError('name', { message: 'Tên không được để trống' });
      return;
    }
    await onSave(trimmed);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(
        setSideBarLeft({
          text: 'Thông tin tài khoản',
          url: `${window?.location?.origin}/tai-khoan?tab=tai-khoan`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();

  useEffect(() => {
    const newQuery = {
      ...router.query,
      child: 'ten-tai-khoan',
    };

    router.replace(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-full text-white-smoke max-w-[856px]"
    >
      <h1 className="text-[28px] font-semibold leading-[36px]">
        Tên tài khoản
      </h1>
      <p className="text-[16px] text-silver-chalice">
        Tên này sẽ được hiển thị trên thông tin tài khoản của bạn. Bạn cần thiết
        lập tên mới với giới hạn 15 ký tự và không chứa các ký tự đặc biệt.
      </p>

      <div className="flex flex-col gap-2">
        <label className="text-silver-chalice text-[16px]">Tên</label>
        <div
          className={`flex items-center border rounded-[104px] px-6 py-3 ${
            errors.name ? 'border-scarlet' : 'border-black-olive-404040'
          }`}
        >
          <input
            type="text"
            autoComplete="off"
            autoFocus
            placeholder="Nhập tên tài khoản"
            className="bg-transparent w-full outline-none text-[16px] text-white-smoke truncate"
            {...register('name', {
              validate: (value) => {
                const trimmed = value.trim();
                if (trimmed.length > 15) {
                  return 'Tên tài khoản không hợp lệ. Tên bao gồm từ 1 đến 15 ký tự (a-z, 0-9)';
                }
                if (/[^a-zA-Z0-9 ]/.test(trimmed)) {
                  return 'Tên tài khoản không hợp lệ. Tên bao gồm từ 1 đến 15 ký tự (a-z, 0-9)';
                }
                return true;
              },
            })}
          />
        </div>
        {errors.name && (
          <p className="text-scarlet text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="flex gap-4 mt-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-3 rounded-full text-[16px] font-semibold transition bg-charleston-green text-white-smoke cursor-pointer w-[104px] h-[48px]`}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className={`px-6 py-3 rounded-full text-[16px] font-semibold transition w-[104px] h-[48px] ${
            isDisabled
              ? 'bg-charleston-green text-davys-grey cursor-default'
              : 'fpl-bg text-white-smoke cursor-pointer'
          }`}
        >
          Lưu
        </button>
      </div>
    </form>
  );
};

export default AccountNameEdit;
