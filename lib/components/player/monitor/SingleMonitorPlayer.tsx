import React, { useEffect, useMemo, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { ChannelItemType } from '@/lib/api/channel';
import { getMonitorChannels, MonitorPlatform } from '@/lib/api/monitor';
import MonitorPlayer from './MonitorPlayer';

interface SingleMonitorPlayerProps {
  platformQuery?: string | null;
}

const SingleMonitorPlayer: React.FC<SingleMonitorPlayerProps> = ({
  platformQuery,
}) => {
  const [channels, setChannels] = useState<ChannelItemType[]>([]);
  const [device, setDevice] = useState<MonitorPlatform>(
    (platformQuery as MonitorPlatform) || 'web',
  );
  const [openDevice, setOpenDevice] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getMonitorChannels(device);
      setChannels(res as ChannelItemType[]);
    };
    load();
  }, [device]);

  const devices: Array<{ name: string; val: MonitorPlatform }> = useMemo(
    () => [
      { name: 'WEB', val: 'web' },
      { name: 'BOX', val: 'box' },
      { name: 'SMARTTV HTML', val: 'smarttv_html' },
      { name: 'SMARTTV ANDROID', val: 'smarttv_android' },
    ],
    [],
  );

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Truyền hình</h2>
          <div className="relative">
            <button
              onClick={() => setOpenDevice(!openDevice)}
              className="cursor-pointer w-32 bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
            >
              <span className="truncate">
                {devices.find((d) => d.val === device)?.name}
              </span>
              <MdOutlineKeyboardArrowDown
                className={`ml-2 transition-transform duration-200 ${
                  openDevice ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            {openDevice && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                {devices.map((option) => (
                  <button
                    key={option.val}
                    onClick={() => {
                      setDevice(option.val);
                      setOpenDevice(false);
                    }}
                    className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-charleston-green transition-colors duration-200"
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <MonitorPlayer channelList={channels} deviceMonitor={device} />
      </div>
    </div>
  );
};

export default SingleMonitorPlayer;
