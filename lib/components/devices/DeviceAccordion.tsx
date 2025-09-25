import React, { useMemo, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { VscInfo } from 'react-icons/vsc';

type DeviceAccordionProps = {
  device?: {
    name: string;
    lastAccess: string;
    deviceId: string;
    deviceIcon: string;
    mac?: string;
    profile: string;
    isCurrent?: boolean;
    isWhitelist?: string;
  };
  expanded?: boolean;
  selected?: boolean;
  onToggle: () => void;
  onSelect: () => void;
};

const DeviceAccordion: React.FC<DeviceAccordionProps> = ({
  device,
  expanded,
  selected,
  onToggle,
  onSelect,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isWhitelist = useMemo(() => device?.isWhitelist === '1', [device]);

  if (!device) return null;

  return (
    <div
      className={`bg-eerie-black rounded-xl mb-4 transition-all ${
        expanded ? 'shadow-lg' : ''
      } ${isWhitelist ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={isWhitelist ? undefined : onSelect}
    >
      <div
        className={`flex rounded-t-xl bg-eerie-black items-center w-full px-6 py-[15px] ${
          expanded ? 'border-b border-charleston-green mb-4' : 'rounded-b-xl'
        } ${isWhitelist ? '' : 'hover:bg-charleston-green'}`}
      >
        {/* Radio button */}
        <span className="mr-4 flex items-center justify-center">
          <span
            className={`w-5 h-5 min-w-[1rem] rounded-full border-[1.4px] flex items-center justify-center ${
              selected && !isWhitelist
                ? 'border-fpl'
                : isWhitelist
                ? 'cursor-not-allowed border-black-olive-404040'
                : 'border-silver-chalice'
            }`}
          >
            {selected && !isWhitelist && (
              <span className="w-3 h-3 rounded-full bg-fpl block"></span>
            )}
          </span>
        </span>
        <div className="flex-1 text-base text-white-smoke font-medium line-[1.3] flex items-center">
          {device.name}
          {isWhitelist && (
            <span
              className="ml-2 cursor-pointer relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip((v) => !v);
              }}
              tabIndex={0}
              style={{ outline: 'none' }}
            >
              <VscInfo size={18} className="text-white-smoke" />
              {showTooltip && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-5 bg-charleston-green text-white-smoke text-base font-normal line-[1.3] rounded-[12px] px-3 p-4 shadow z-10 whitespace-nowrap">
                  <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[8px] border-y-transparent border-r-[12px] border-r-charleston-green"></span>
                  Thiết bị không thể đăng xuất
                </span>
              )}
            </span>
          )}
        </div>
        <button
          className="ml-2 p-1 w-[30px] h-[30px] flex items-center justify-center cursor-pointer rounded-[50%] transition-colors focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-expanded={expanded}
        >
          <FaChevronDown
            size={18}
            className={`text-white-smoke ${
              expanded
                ? 'rotate-180 transition-transform'
                : 'transition-transform'
            }`}
          />
        </button>
      </div>
      {expanded && (
        <div className="px-6 pb-4 text-sm text-neutral-300 flex items-center gap-[70px]">
          <div className="flex flex-col gap-4">
            <div className="mb-1 text-base font-normal line-[1.3] text-spanish-gray">
              Truy cập lần cuối:{' '}
            </div>
            {!isWhitelist && (
              <div className="mb-1 text-base font-normal line-[1.3] text-spanish-gray">
                ID Thiết bị:
              </div>
            )}
            {device.mac && (
              <div className="mb-1 text-base font-normal line-[1.3] text-spanish-gray">
                Mac:
              </div>
            )}
            <div className="mb-1 text-base font-normal line-[1.3] text-spanish-gray">
              Hồ sơ sử dụng:{' '}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="mb-1 text-base font-normal line-[1.3] text-white-smoke">
              {device.lastAccess}
            </div>
            {!isWhitelist && (
              <div className="mb-1 text-base font-normal line-[1.3] text-white-smoke">
                {device.deviceId}
              </div>
            )}
            {device.mac && (
              <div className="mb-1 text-base font-normal line-[1.3] text-white-smoke">
                {device.mac}
              </div>
            )}

            <div className="mb-1 flex items-center ">
              <span className="flex items-center gap-2 text-base font-normal line-[1.3] text-white-smoke">
                <div className="w-6 h-6 rounded-[50%] overflow-hidden">
                  <img
                    src={device?.deviceIcon}
                    alt="device icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                {device.profile}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceAccordion;
