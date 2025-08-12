import React, { useState, useEffect, useCallback } from 'react';
import { MonitorQualityProvider } from '@/lib/components/player/monitor/context/MonitorQualityContext';
import { useMonitor } from '@/lib/hooks/useMonitor';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import dynamic from 'next/dynamic';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { useDispatch } from 'react-redux';
import useClickOutside from '@/lib/hooks/useClickOutside';

// Dynamic imports for performance
const MonitorPlayer = dynamic(
  () => import('@/lib/components/player/monitor/MonitorPlayer'),
  { ssr: false },
);
const MonitorPlayerEvent = dynamic(
  () => import('@/lib/components/player/monitor/MonitorPlayerEvent'),
  { ssr: false },
);

interface MonitorChannelPageProps {
  platformQuery?: string;
}

const MonitorChannel: React.FC<MonitorChannelPageProps> = ({
  platformQuery,
}) => {
  const dispatch = useDispatch();
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<
    | 'eventDevice'
    | 'eventQuality'
    | 'channelDevice'
    | 'channelPlayers'
    | 'channelQuality'
    | null
  >(null);
  const isOpen = (
    key:
      | 'eventDevice'
      | 'eventQuality'
      | 'channelDevice'
      | 'channelPlayers'
      | 'channelQuality',
  ) => openDropdown === key;

  // Monitor hook - Match với Vue.js logic
  const {
    channels,
    eventsRender,
    device,
    deviceOptions,
    selectedPlayerQuantity,
    playerQuantityOptions,
    numberPlayerChannelRender,
    changeDevice,
    setSelectedPlayerQuantity,
    loading,
    refreshKey,
    refreshKeyEvent,
  } = useMonitor({ platformQuery });

  const qualityAllOptions = [
    { name: 'Auto', val: 'auto' },
    { name: '1080', val: '1080' },
    { name: '720', val: '720' },
    { name: '480', val: '480' },
    { name: '360', val: '360' },
  ];
  const [qualityAllChannel, setQualityAllChannel] = useState<{
    name: string;
    val: string;
  } | null>(null);
  const [qualityAllEvent, setQualityAllEvent] = useState<{
    name: string;
    val: string;
  } | null>(null);

  // Close dropdowns on outside click
  const eventDeviceRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen('eventDevice')) setOpenDropdown(null);
  });
  const eventQualityRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen('eventQuality')) setOpenDropdown(null);
  });
  const channelDeviceRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen('channelDevice')) setOpenDropdown(null);
  });
  const channelPlayersRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen('channelPlayers')) setOpenDropdown(null);
  });
  const channelQualityRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen('channelQuality')) setOpenDropdown(null);
  });

  // Client-side only state for login status
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // Login handlers
  const login = useCallback(() => {
    dispatch(openLoginModal());
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      window.location.reload();
    } catch {
      // Handle logout error silently
    }
  }, []);

  return (
    <MonitorQualityProvider>
      <div className="min-h-screen text-white">
        {/* Header Controls */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white-smoke">Monitor</h1>

            {/* Render login/logout button only on client to avoid hydration mismatch */}
            {isClient && (
              <>
                {!isLoggedIn ? (
                  <button
                    onClick={login}
                    className="cursor-pointer px-6 py-2 bg-gradient-to-r from-portland-orange to-lust rounded-lg font-medium text-sm hover:brightness-110 transition-all duration-200 transform"
                  >
                    Đăng nhập
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="cursor-pointer px-6 py-2 bg-gradient-to-r from-portland-orange to-lust rounded-lg font-medium text-sm hover:brightness-110 transition-all duration-200 transform"
                  >
                    Đăng xuất
                  </button>
                )}
              </>
            )}
          </div>

          {/* Events Section */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Sự kiện</h2>

              <div className="flex items-center gap-4">
                {/* Device Selection */}
                <div ref={eventDeviceRef} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        isOpen('eventDevice') ? null : 'eventDevice',
                      )
                    }
                    className="cursor-pointer w-48 bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
                  >
                    <span className="truncate">{device.name}</span>
                    <MdOutlineKeyboardArrowDown
                      className={`ml-2 transition-transform duration-200 ${
                        isOpen('eventDevice') ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {isOpen('eventDevice') && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                      {deviceOptions.map((option) => (
                        <button
                          key={option.val}
                          onClick={() => {
                            changeDevice(option);
                            setOpenDropdown(null);
                          }}
                          className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-charleston-green transition-colors duration-200"
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quality Selection - Events (independent from Channels) */}
                <div ref={eventQualityRef} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        isOpen('eventQuality') ? null : 'eventQuality',
                      )
                    }
                    className="cursor-pointer w-32 bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
                  >
                    <span className="truncate">
                      {qualityAllEvent?.name || 'Chất lượng'}
                    </span>
                    <MdOutlineKeyboardArrowDown
                      className={`ml-2 transition-transform duration-200 ${
                        isOpen('eventQuality') ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {isOpen('eventQuality') && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                      {qualityAllOptions.map((option) => (
                        <button
                          key={option.val}
                          onClick={() => {
                            setQualityAllEvent(option);
                            setOpenDropdown(null);
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
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {eventsRender.map((event, index) => (
                <MonitorPlayerEvent
                  key={`${refreshKeyEvent}-${event.id}-${index}`}
                  eventData={event}
                  deviceMonitor={device.val}
                  index={index}
                  requestedQuality={qualityAllEvent?.val}
                />
              ))}

              {eventsRender.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-12 text-primary-gray">
                  {loading ? 'Đang tải sự kiện...' : 'Không có sự kiện nào'}
                </div>
              )}
            </div>
          </section>

          {/* Channels Section */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <h2 className="text-xl font-semibold">Truyền hình</h2>

              <div className="flex items-center gap-4">
                {/* Device Selection */}
                <div ref={channelDeviceRef} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        isOpen('channelDevice') ? null : 'channelDevice',
                      )
                    }
                    className="cursor-pointer w-48 bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
                  >
                    <span className="truncate">{device.name}</span>
                    <MdOutlineKeyboardArrowDown
                      className={`ml-2 transition-transform duration-200 ${
                        isOpen('channelDevice') ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {isOpen('channelDevice') && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                      {deviceOptions.map((option) => (
                        <button
                          key={option.val}
                          onClick={() => {
                            changeDevice(option);
                            setOpenDropdown(null);
                          }}
                          className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-charleston-green transition-colors duration-200"
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Player Quantity Selection */}
                <div ref={channelPlayersRef} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        isOpen('channelPlayers') ? null : 'channelPlayers',
                      )
                    }
                    className="cursor-pointer w-32 bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
                  >
                    <span className="truncate">
                      {selectedPlayerQuantity.name}
                    </span>
                    <MdOutlineKeyboardArrowDown
                      className={`ml-2 transition-transform duration-200 ${
                        isOpen('channelPlayers') ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {isOpen('channelPlayers') && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                      {playerQuantityOptions.map((option) => (
                        <button
                          key={option.name}
                          onClick={() => {
                            setSelectedPlayerQuantity(option);
                            setOpenDropdown(null);
                          }}
                          className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-charleston-green transition-colors duration-200"
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quality Selection - Channels (Quality All - hard options) */}
                <div ref={channelQualityRef} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        isOpen('channelQuality') ? null : 'channelQuality',
                      )
                    }
                    className="cursor-pointer w-32 bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
                  >
                    <span className="truncate">
                      {qualityAllChannel?.name || 'Chất lượng'}
                    </span>
                    <MdOutlineKeyboardArrowDown
                      className={`ml-2 transition-transform duration-200 ${
                        isOpen('channelQuality') ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {isOpen('channelQuality') && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                      {qualityAllOptions.map((option) => (
                        <button
                          key={option.val}
                          onClick={() => {
                            setQualityAllChannel(option);
                            setOpenDropdown(null);
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
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: numberPlayerChannelRender }, (_, index) => (
                <MonitorPlayer
                  key={`${refreshKey}-${index}`}
                  channelList={channels}
                  deviceMonitor={device.val}
                  qualityAll={qualityAllChannel || undefined}
                  index={index}
                />
              ))}

              {channels.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-12 text-primary-gray">
                  {loading ? 'Đang tải kênh...' : 'Không có kênh nào'}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </MonitorQualityProvider>
  );
};

export default MonitorChannel;
