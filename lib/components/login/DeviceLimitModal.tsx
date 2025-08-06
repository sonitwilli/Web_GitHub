'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { onDevicesLimitResponse } from '@/lib/api/login';
import { LOGOUT_CONFIRM_MESSAGE } from '@/lib/constant/texts';
import styles from './DeviceLimitModal.module.css';

interface Props {
  isOpen: boolean;
  contentObject: {
    title?: string;
    content?: string;
    buttons?: {
      cancel?: string;
      accept?: string;
    };
  };
  deviceLimitData?: onDevicesLimitResponse;
  onClose: () => void;
  onRemoveDevices: (ids: string[]) => void;
}

export default function DeviceLimitModal({
  isOpen,
  contentObject,
  deviceLimitData,
  onClose,
  onRemoveDevices,
}: Props) {
  const { control, watch, reset, handleSubmit } = useForm<{
    selected: string[];
  }>({
    defaultValues: { selected: [] },
    mode: 'onSubmit',
  });

  const selected = watch('selected');

  const devices = useMemo(
    () => deviceLimitData?.data?.devices || [],
    [deviceLimitData],
  );
  const needRemove = Math.max(Number(deviceLimitData?.data?.need_remove || 1));
  const subText =
    deviceLimitData?.data?.sub_description || LOGOUT_CONFIRM_MESSAGE;
  const contentText = deviceLimitData?.data?.description;
  const titleText = deviceLimitData?.data?.title;

  const processedDevices = useMemo(
    () =>
      devices.map((device) => ({
        ...device,
        disabled: !!device.is_whitelist || !!device.is_current,
      })),
    [devices],
  );

  const onSubmit = ({ selected }: { selected: string[] }) => {
    if (selected.length >= needRemove) {
      onRemoveDevices(selected);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[343px] tablet:w-[576px] p-[24px] tablet:p-[32px] h-auto bg-eerie-black rounded-[16px] flex flex-col text-white-smoke"
      >
        <h1 className="text-[20px] mb-4 tablet:mb-8 tablet:text-2xl text-center tablet:text-left font-semibold text-smoke-white">
          {titleText || contentObject.title || 'Vượt giới hạn thiết bị'}
        </h1>
        <div className="flex flex-col gap-8 mb-[32px]">
          <p className="text-[14px] tablet:text-[16px] font-light leading-[150%] text-spanish-gray">
            {contentText || contentObject.content}
          </p>
        </div>

        <div
          className={`flex flex-col gap-4 overflow-y-auto mb-[32px] ${
            styles.customScrollBar
          } ${devices.length > 5 ? 'max-h-[184px]' : ''}`}
        >
          <Controller
            control={control}
            name="selected"
            render={({ field }) => (
              <div className="flex flex-col gap-4">
                {processedDevices.map((device) => {
                  const deviceId = String(device.id);
                  const isChecked = field.value.includes(deviceId);
                  const isDisabled = device.disabled;

                  return (
                    <label
                      key={deviceId}
                      className={`relative inline-flex items-center gap-3 cursor-pointer ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'text-white-smoke'
                      }`}
                    >
                      {/* Hidden input */}
                      <input
                        type="checkbox"
                        value={deviceId}
                        disabled={isDisabled}
                        checked={isChecked}
                        onChange={(e) => {
                          const id = e.target.value;
                          const next = e.target.checked
                            ? [...field.value, id]
                            : field.value.filter((val) => val !== id);
                          field.onChange(next);
                        }}
                        className="peer sr-only"
                      />

                      {/* Custom checkbox square */}
                      <div
                        className="h-[16px] w-[16px] shrink-0 rounded-[2px] border border-ash-grey bg-transparent 
                        peer-checked:border-none 
                        peer-checked:bg-[url('/images/svg/radio.svg')] 
                        peer-checked:bg-no-repeat 
                        peer-checked:bg-cover"
                      />

                      <span className="text-[14px] leading-[150%] font-normal text-white-087 select-none line-clamp-1 tablet:line-clamp-none tablet:text-[16px]">
                        {device.device_name}
                      </span>

                      <div></div>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        <p className="text-[16px] font-light text-spanish-gray leading-[150%] mb-[32px]">
          {subText}
        </p>

        <div className="flex gap-4 mt-auto">
          {contentObject.buttons?.cancel && (
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              className="w-full h-[56px] rounded-[52px] bg-black-olive-404040 text-white-smoke text-[16px] font-medium cursor-pointer"
            >
              {contentObject.buttons.cancel}
            </button>
          )}
          {contentObject.buttons?.accept && (
            <button
              type="submit"
              disabled={selected.length < needRemove}
              className={`w-full h-[56px] rounded-[52px] text-[16px] font-semibold transition-all ${
                selected.length >= needRemove
                  ? 'fpl-bg text-white-smoke hover:opacity-90 cursor-pointer'
                  : 'bg-charleston-green text-black-olive-404040 cursor-default'
              }`}
            >
              {contentObject.buttons.accept}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
