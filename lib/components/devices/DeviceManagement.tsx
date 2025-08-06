import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFetchDevices } from '@/lib/hooks/useFetchDevices';
import { removeDevice } from '@/lib/api/devices';
import DeviceAccordion from './DeviceAccordion';
import { useCheckUserInfo } from '@/lib/hooks/useCheckUserInfo';
import ErrorData from '@/lib/components/error/ErrorData';
import Loading from '@/lib/components/common/Loading';
import ConfirmModal from '@/lib/components/modal/ModalConfirm';
import { useRouter } from 'next/router';

const DeviceManagement: React.FC = () => {
  const { data, loading, error, refetch } = useFetchDevices();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [otherDevicesRawState, setOtherDevicesRawState] = useState(
    () => data?.devices?.filter((d) => d.is_current !== '1') || [],
  );
  const { checkUserInfo } = useCheckUserInfo();
  const router = useRouter();

  // Map lưu id tạm cho các device không có id hợp lệ
  const generatedIdMap = new Map<number, string>();

  // Helper để sinh unique id
  const getDeviceId = (id: string | undefined) => {
    if (!id || id === '-1') {
      return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    }
    return id;
  };

  useEffect(() => {
    if (Array.isArray(data?.devices) && data?.devices?.length > 0) {
      setOtherDevicesRawState(
        data?.devices?.filter((d) => d.is_current !== '1') || [],
      );
    }
  }, [data]);

  const otherDeviceGroups = useMemo(
    () => [
      {
        groupName: 'Thiết bị khác',
        devices: otherDevicesRawState?.map((d, idx) => {
          let deviceId = d.device_id;
          if (!deviceId || deviceId === '-1') {
            if (!generatedIdMap.has(idx)) {
              generatedIdMap.set(
                idx,
                typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : Math.random().toString(36).slice(2),
              );
            }
            deviceId = generatedIdMap.get(idx) as string;
          }
          return {
            name: d.device_name,
            lastAccess: d.last_access,
            deviceIcon:
              d?.device_detail?.find((dt) => dt.type === '2')?.icon || '',
            deviceId,
            isWhitelist: d.is_whitelist,
            mac: d?.device_detail?.find((dt) => dt.type === 'mac')?.msg,
            profile: d?.device_detail?.find((dt) => dt.type === '2')?.msg || '',
            isCurrent: false,
          };
        }),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otherDevicesRawState],
  );

  // Map API data to DeviceProfile/DeviceGroup
  const currentDeviceRaw = data?.devices?.find((d) => d.is_current === '1');

  const currentDevice = currentDeviceRaw
    ? {
        name: currentDeviceRaw.device_name || '',
        lastAccess: currentDeviceRaw.last_access || '',
        deviceId: getDeviceId(currentDeviceRaw.device_id),
        isWhitelist: '0',
        deviceIcon:
          currentDeviceRaw?.device_detail?.find((dt) => dt.type === '2')
            ?.icon || '',
        mac: currentDeviceRaw?.device_detail?.find((dt) => dt.type === 'mac')
          ?.msg,
        profile:
          currentDeviceRaw?.device_detail?.find((dt) => dt.type === '2')?.msg ||
          '',
        isCurrent: true,
      }
    : undefined;

  const handleToggle = (deviceId: string) => {
    setExpanded((prev) => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  const handleSelect = (deviceId: string) => {
    setSelectedDevice((prev) => (prev === deviceId ? null : deviceId));
  };

  const handleLogout = useCallback(async () => {
    if (!router?.isReady) return;

    try {
      const response = await removeDevice(selectedDevice || '');
      setShowConfirmModal(false);

      // Kiểm tra status response - nếu status là '0' (thất bại) thì không cập nhật state
      if (response?.data?.status === '0') {
        return;
      }

      if (selectedDevice === currentDevice?.deviceId) {
        await router.push('/');
        checkUserInfo();
      } else {
        setOtherDevicesRawState((prev) =>
          prev.filter((d) => {
            if (d.device_id === selectedDevice) return false;
            const dd = d as { [key: string]: string };
            if (dd._generatedId && dd._generatedId === selectedDevice)
              return false;
            return true;
          }),
        );
        setSelectedDevice(null);
      }
    } catch (error) {
      // Xử lý lỗi - không cập nhật state nếu removeDevice thất bại
      console.error('Failed to remove device:', error);
      setShowConfirmModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.isReady, router?.pathname, selectedDevice]);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Quản lý thiết bị</h2>
        </div>
        <div className="w-full min-h-[200px] mx-auto relative">
          <Loading />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Quản lý thiết bị</h2>
        </div>
        <div className="w-full min-h-[200px] mx-auto relative">
          <ErrorData onRetry={refetch} />
        </div>
      </div>
    );
  }
  if (!data) {
    return null;
  }

  return (
    <div className="max-w-[856px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý thiết bị</h2>
        <button
          className={`text-base font-semibold line-[1.3] px-4 py-[10px] bg-charleston-green text-white-smoke rounded-[40px] transition ${
            selectedDevice === null
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-black-olive-404040'
          }`}
          onClick={() => setShowConfirmModal(true)}
          disabled={selectedDevice === null}
        >
          Đăng xuất thiết bị
        </button>
      </div>
      <div className="mb-8">
        <div className="text-silver-chalice mb-2">Thiết bị này</div>
        {currentDevice && (
          <DeviceAccordion
            key={currentDevice.deviceId || ''}
            device={{
              ...currentDevice,
              deviceIcon: currentDevice.deviceIcon || '',
            }}
            expanded={!!expanded[currentDevice.deviceId || '']}
            selected={selectedDevice === (currentDevice.deviceId || '')}
            onToggle={() => handleToggle(currentDevice.deviceId || '')}
            onSelect={() => handleSelect(currentDevice.deviceId || '')}
          />
        )}
      </div>
      {otherDeviceGroups && otherDeviceGroups[0]?.devices?.length > 0 && (
        <div>
          <div className="text-silver-chalice mb-2">Thiết bị khác</div>
          {otherDeviceGroups.map((group) => (
            <div key={group.groupName} className="mb-4">
              {group.devices?.map((device) => (
                <DeviceAccordion
                  key={device.deviceId || ''}
                  device={{
                    name: device.name || '',
                    lastAccess: device.lastAccess || '',
                    deviceId: device.deviceId || '',
                    isWhitelist: device.isWhitelist || '',
                    deviceIcon: device.deviceIcon || '',
                    mac: device.mac,
                    profile: device.profile || '',
                    isCurrent: device.isCurrent,
                  }}
                  expanded={!!expanded[device.deviceId || '']}
                  selected={selectedDevice === (device.deviceId || '')}
                  onToggle={() => handleToggle(device.deviceId || '')}
                  onSelect={() => handleSelect(device.deviceId || '')}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={showConfirmModal}
        onHidden={() => setShowConfirmModal(false)}
        modalContent={{
          title: 'Đăng xuất thiết bị',
          content:
            'Thao tác này sẽ đăng xuất thiết bị khỏi tài khoản của bạn. Bạn vẫn muốn tiếp tục?',
          buttons: {
            accept: 'Đăng xuất',
            cancel: 'Đóng',
          },
        }}
        onSubmit={handleLogout}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default DeviceManagement;
