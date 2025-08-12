// Monitor Player - Match hoàn toàn với Vue.js logic
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import styles from './MonitorDropdown.module.css';
import { MdOutlineKeyboardArrowDown, MdClose } from 'react-icons/md';
import { useMonitorPlayer } from '@/lib/hooks/useMonitor';
import { ChannelItemType } from '@/lib/api/channel';
import dynamic from 'next/dynamic';
import { MonitorPlatform } from '@/lib/api/monitor';
import {
  pickMonitorQuality,
  MonitorQualityOption,
} from '@/lib/utils/monitorQuality';
import { useMonitorQuality } from './context/MonitorQualityContext';

// Dynamic import Monitor players (isolated instances per item)
const ShakaPlayer = dynamic(() => import('./player/ShakaMonitorPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-fpl mx-auto mb-2"></div>
      </div>
    </div>
  ),
});
const HlsPlayer = dynamic(() => import('./player/HlsMonitorPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-fpl mx-auto mb-2"></div>
      </div>
    </div>
  ),
});

interface MonitorPlayerProps {
  channelList: ChannelItemType[];
  deviceMonitor?: MonitorPlatform;
  index?: number;
  monitorChannel?: boolean;
  qualityAll?: { name: string; val: string };
}

interface ChannelDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (channel: ChannelItemType) => void;
  selectedChannel: ChannelItemType | null;
  channels: ChannelItemType[];
  searchChannel: string;
  onSearchChange: (search: string) => void;
}

interface QualityDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (quality: { _id: string; name: string; label: string }) => void;
  selectedQuality: { _id: string; name: string; label: string } | null;
  qualities: Array<{ _id: string; name: string; label: string }>;
}

const ChannelDropdown: React.FC<ChannelDropdownProps> = ({
  isOpen,
  onToggle,
  onSelect,
  selectedChannel,
  channels,
  searchChannel,
  onSearchChange,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  // Filter channels based on search (dedupe + accent-insensitive + ranked)
  const normalizeKey = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '')
      .toLowerCase();

  const uniqueChannels = (() => {
    const seen = new Set<string>();
    const result: ChannelItemType[] = [];
    for (const ch of channels) {
      const key =
        (ch as unknown as { _id?: string })?._id ||
        (ch as unknown as { id?: string })?.id ||
        normalizeKey(ch.name || '');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(ch);
      }
    }
    return result;
  })();

  const filteredChannels = useMemo(
    () =>
      uniqueChannels
        .filter((channel) => {
          if (!searchChannel) return true;
          const q = normalizeKey(searchChannel);
          const name = normalizeKey(channel.name || '');
          return name.includes(q);
        })
        .sort((a, b) => {
          if (!searchChannel) return 0;
          const q = normalizeKey(searchChannel);
          const an = normalizeKey(a.name || '');
          const bn = normalizeKey(b.name || '');
          const rank = (n: string) =>
            n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3;
          const ra = rank(an);
          const rb = rank(bn);
          if (ra !== rb) return ra - rb;
          return (a.name || '').localeCompare(b.name || '', 'vi', {
            sensitivity: 'base',
          });
        }),
    [uniqueChannels, searchChannel],
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className="w-full bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fpl"
      >
        <span className="truncate">{selectedChannel?.name || 'Chọn kênh'}</span>
        <MdOutlineKeyboardArrowDown
          className={`ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 border border-charleston-green rounded shadow-lg z-50 max-h-60 overflow-y-auto ${styles.dropdownContainer} ${styles.scrollBar}`}
          ref={listRef}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-charleston-green relative">
            <input
              type="search"
              placeholder="Tìm kênh"
              value={searchChannel}
              onChange={(e) => onSearchChange(e.target.value)}
              onInput={(e) =>
                onSearchChange((e.target as HTMLInputElement).value)
              }
              className={`w-full px-2 pr-8 py-1 text-sm bg-charleston-green text-white rounded focus:outline-none focus:ring-1 focus:ring-fpl ${styles.inputNoCancel}`}
            />
            {searchChannel && (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white-smoke hover:text-white transition-colors"
              >
                <MdClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Channel List */}
          {filteredChannels.map((channel) => (
            <button
              key={
                (channel as unknown as { _id?: string })?._id ||
                (channel as unknown as { id?: string })?.id ||
                channel.name
              }
              onClick={() => {
                onSelect(channel);
                onToggle();
              }}
              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-charleston-green transition-colors duration-200 focus:outline-none focus:bg-charleston-green ${
                ((selectedChannel as unknown as { _id?: string })?._id ||
                  selectedChannel?.id) ===
                ((channel as unknown as { _id?: string })?._id ||
                  (channel as unknown as { id?: string })?.id)
                  ? 'bg-charleston-green'
                  : ''
              }`}
            >
              {channel.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const QualityDropdown: React.FC<QualityDropdownProps> = ({
  isOpen,
  onToggle,
  onSelect,
  selectedQuality,
  qualities,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className="w-20 bg-eerie-black text-white rounded px-2 py-2 text-xs flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
      >
        <span className="truncate">{selectedQuality?.name || 'Auto'}</span>
        <MdOutlineKeyboardArrowDown
          className={`ml-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
          {qualities.map((quality) => (
            <button
              key={quality._id}
              onClick={() => {
                onSelect(quality);
                onToggle();
              }}
              className={`w-full text-left px-2 py-1 text-xs text-white hover:bg-charleston-green transition-colors duration-200 ${
                quality._id === selectedQuality?._id
                  ? 'bg-charleston-green'
                  : ''
              }`}
            >
              {quality.label || quality._id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MonitorPlayer: React.FC<MonitorPlayerProps> = ({
  channelList,
  deviceMonitor = 'web',
  index = 0,
  qualityAll,
}) => {
  const { qualityByIndex } = useMonitorQuality();
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [qualityDropdownOpen, setQualityDropdownOpen] = useState(false);
  const [searchChannel, setSearchChannel] = useState('');
  const [shakaKey, setShakaKey] = useState(new Date().getTime());
  const [isStarting, setIsStarting] = useState(false);

  const {
    selectedChannel,
    channelDetail,
    streamData,
    loading,
    qualities,
    selectedQuality,
    errors,
    selectChannel,
    selectQuality,
    addError,
    clearErrors,
    removePlayer,
  } = useMonitorPlayer({ channelList, deviceMonitor, index });

  // Update shakaKey when stream changes (match Vue.js logic)
  useEffect(() => {
    if (streamData) {
      setShakaKey(new Date().getTime());
      // Enter startup-loading state when new stream arrives
      setIsStarting(true);
      const t = setTimeout(() => setIsStarting(false), 3000);
      return () => clearTimeout(t);
    }
  }, [streamData]);

  // Player reported started: stop startup-loading and clear residual errors
  const handlePlayerStarted = useCallback(() => {
    setIsStarting(false);
    clearErrors();
  }, [clearErrors]);

  // Apply Quality All: pick by helper consistent with main players
  useEffect(() => {
    const match = pickMonitorQuality(
      qualities as unknown as MonitorQualityOption[],
      qualityAll,
    );
    if (match)
      Promise.resolve(
        selectQuality({
          _id: match._id,
          name: match.name,
          label: match.label,
          manifest_id: match.manifest_id,
          resolvedUri: match.resolvedUri,
          is_auto_profile: match.is_auto_profile,
        }),
      );
  }, [qualityAll, qualities, selectQuality]);

  // Handle search channel change
  const handleSearchChange = (search: string) => {
    setSearchChannel(search);
  };

  return (
    <div className="bg-eerie-black shadow-lg hover:shadow-xl transition-shadow duration-300 relative group rounded-lg">
      {channelDetail?.name && (
        <button
          onClick={removePlayer}
          className="cursor-pointer absolute -top-3.5 -right-3.5 z-2 w-8 h-8 bg-black/60 rounded-full hidden items-center justify-center text-white-smoke border border-charleston-green group-hover:flex hover:bg-black/80 transition-all duration-200"
          aria-label="Đóng"
        >
          <MdClose className="w-5 h-5 text-red-500" />
        </button>
      )}

      {/* Header Controls */}
      <div className="p-3 border-b border-charleston-green">
        <div className="flex items-center gap-2 mb-2">
          {/* Channel Dropdown */}
          <div className="flex-1">
            <ChannelDropdown
              isOpen={channelDropdownOpen}
              onToggle={() => setChannelDropdownOpen(!channelDropdownOpen)}
              onSelect={selectChannel}
              selectedChannel={selectedChannel}
              channels={channelList}
              searchChannel={searchChannel}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* Quality Dropdown */}
          {channelDetail?.name &&
            selectedQuality?.name &&
            qualities.length > 0 && (
              <QualityDropdown
                isOpen={qualityDropdownOpen}
                onToggle={() => setQualityDropdownOpen(!qualityDropdownOpen)}
                onSelect={selectQuality}
                selectedQuality={selectedQuality}
                qualities={qualities}
              />
            )}
        </div>
      </div>

      {/* Video Player Area */}
      <div className="relative aspect-video bg-black rounded-none">
        {loading || isStarting ? (
          <div className="w-full h-full flex items-center justify-center bg-black/80 text-white">
            <div className="animate-spin h-8 w-8 border-b-2 border-fpl rounded-full" />
          </div>
        ) : errors.length > 0 ? (
          <div className="relative w-full h-full bg-gradient-to-br from-eerie-black to-charleston-green">
            <img
              src="/images/default-poster-horizontal.png"
              alt="Channel poster"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <h3 className="font-semibold mb-2">Lỗi tải Player</h3>
                <p className="text-sm text-primary-gray mb-1">
                  Mã lỗi: {errors[0]?.content || ''}
                </p>
              </div>
            </div>
          </div>
        ) : channelDetail?.name && streamData?.url ? (
          <div key={shakaKey} className="w-full h-full">
            {!(
              channelDetail?.verimatrix === '1' ||
              channelDetail?.verimatrix === true ||
              channelDetail?.drm === '1' ||
              channelDetail?.drm === true
            ) ? (
              <HlsPlayer
                dataChannel={channelDetail || undefined}
                dataStream={streamData}
                requestedQuality={qualityByIndex[index]}
                onAddError={addError}
                onClearErrors={handlePlayerStarted}
              />
            ) : (
              <ShakaPlayer
                dataChannel={channelDetail || undefined}
                dataStream={streamData}
                requestedQuality={qualityByIndex[index]}
                onAddError={addError}
                onClearErrors={handlePlayerStarted}
              />
            )}
          </div>
        ) : (
          <video
            className="w-full h-full object-cover rounded-none"
            poster="/images/default-poster-horizontal.png"
          />
        )}
      </div>

      {/* Channel Info */}
      {selectedChannel && (
        <div className="p-3">
          <div className="text-center">
            <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
              {selectedChannel.name}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorPlayer;
