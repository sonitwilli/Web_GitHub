import { MonitorEventItem, MonitorPlatform } from '@/lib/api/monitor';
import { useMonitorEventPlayer } from '@/lib/hooks/useMonitor';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { parseManifest } from '@/lib/utils/player';

const ShakaMonitorPlayer = dynamic(
  () => import('./player/ShakaMonitorPlayer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
        <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full" />
      </div>
    ),
  },
);

const HlsMonitorPlayer = dynamic(() => import('./player/HlsMonitorPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
      <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full" />
    </div>
  ),
});

interface Props {
  eventData: MonitorEventItem;
  deviceMonitor: MonitorPlatform;
  index: number;
  requestedQuality?: string | number;
}

const MonitorPlayerEvent: React.FC<Props> = ({
  eventData,
  deviceMonitor,
  requestedQuality,
}) => {
  const { streamData, loading, dataChannel } = useMonitorEventPlayer({
    eventData,
    deviceMonitor,
  });

  const [errors, setErrors] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [qualityDropdownOpen, setQualityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localQualities, setLocalQualities] = useState<
    Array<{ _id: string; name: string; label: string }>
  >([{ _id: 'auto', name: 'Auto', label: 'Auto' }]);
  const [localSelectedQuality, setLocalSelectedQuality] = useState<{
    _id: string;
    name: string;
    label: string;
  } | null>(null);

  const handleAddError = (err: string) => {
    setErrors(err);
    const candidate = localQualities.find((q) => q._id !== 'auto');
    if (candidate) {
      setLocalSelectedQuality(candidate);
      setErrors('');
    }
  };

  const handleClearErrors = useCallback(() => {
    setErrors('');
    setIsStarting(false);
  }, []);

  // Parse qualities from manifest per event
  useEffect(() => {
    const buildQualities = async () => {
      const url =
        streamData?.url || streamData?.url_hls || streamData?.url_dash;
      if (!url) return;
      try {
        const parsed = (await parseManifest({ manifestUrl: url })) as {
          qualities?: Array<{ id?: string; name?: string; height?: number }>;
        };
        const allowedHeights = new Set<string>([
          '144',
          '240',
          '288',
          '360',
          '480',
          '576',
          '720',
          '1080',
          '1440',
          '2160',
          '4320',
        ]);
        const heights = new Set<string>();
        (parsed?.qualities || []).forEach((q) => {
          const h = String(q?.height || q?.name || '').replace(/\D/g, '');
          if (h && allowedHeights.has(h)) heights.add(h);
        });
        const list = Array.from(heights)
          .map((h) => ({ _id: h, name: h, label: h }))
          .sort((a, b) => Number(b.name) - Number(a.name));
        const nextList = [
          { _id: 'auto', name: 'Auto', label: 'Auto' },
          ...list,
        ];
        setLocalQualities(nextList);
        // Default to first item (Auto) when event (re)plays
        setLocalSelectedQuality(nextList[0] || null);
        setIsStarting(true);
        setTimeout(() => setIsStarting(false), 3000);
      } catch {
        // Fallback options if parsing fails
        const nextList = [
          { _id: 'auto', name: 'Auto', label: 'Auto' },
          { _id: '1080', name: '1080', label: '1080' },
          { _id: '720', name: '720', label: '720' },
          { _id: '480', name: '480', label: '480' },
          { _id: '360', name: '360', label: '360' },
        ];
        setLocalQualities(nextList);
        setLocalSelectedQuality(nextList[0] || null);
        setIsStarting(true);
        setTimeout(() => setIsStarting(false), 3000);
      }
    };
    buildQualities();
  }, [streamData?.url, streamData?.url_hls, streamData?.url_dash]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setQualityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveRequestedQuality = useMemo(() => {
    if (localSelectedQuality) {
      return localSelectedQuality.name === 'Auto'
        ? 'auto'
        : localSelectedQuality.name;
    }
    return requestedQuality;
  }, [localSelectedQuality, requestedQuality]);

  // Apply global qualityAll for events if available (without overriding user's explicit selection)
  useEffect(() => {
    if (!requestedQuality) return;
    if (!localQualities || localQualities.length === 0) return;

    const rq = String(requestedQuality).toLowerCase();
    const match = localQualities.find(
      (q) => q._id.toLowerCase() === rq || q.name.toLowerCase() === rq,
    );
    if (match) {
      setLocalSelectedQuality(match);
      setErrors('');
    } else {
      // fallback to Auto if the requested quality is not present
      const auto = localQualities.find((q) => q._id === 'auto');
      if (auto) setLocalSelectedQuality(auto);
    }
  }, [requestedQuality, localQualities]);

  return (
    <div className="flex flex-col">
      <div className="bg-eerie-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-video bg-black/60 group">
          {loading || isStarting ? (
            <div className="flex items-center justify-center h-full bg-black/60 text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fpl mx-auto mb-2"></div>
            </div>
          ) : errors ? (
            <div className="relative w-full h-full bg-gradient-to-br from-eerie-black to-charleston-green">
              <img
                src="/images/default-poster-horizontal.png"
                alt="Event poster"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <h3 className="font-semibold mb-2">Lỗi tải Player</h3>
                  <p className="text-sm text-primary-gray mb-1">
                    Mã lỗi: {errors || ''}
                  </p>
                </div>
              </div>
            </div>
          ) : !(
              dataChannel?.verimatrix === '1' ||
              dataChannel?.verimatrix === true ||
              dataChannel?.drm === '1' ||
              dataChannel?.drm === true
            ) ? (
            <HlsMonitorPlayer
              dataChannel={dataChannel ?? undefined}
              dataStream={streamData ?? undefined}
              requestedQuality={effectiveRequestedQuality}
              onAddError={handleAddError}
              onClearErrors={handleClearErrors}
            />
          ) : (
            <ShakaMonitorPlayer
              src={streamData?.url}
              dataChannel={dataChannel ?? undefined}
              dataStream={streamData ?? undefined}
              requestedQuality={effectiveRequestedQuality}
              onAddError={handleAddError}
              onClearErrors={handleClearErrors}
            />
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-3 flex-1">
            {eventData.title || eventData.name || 'Sự kiện không có tên'}
          </h3>
          {/* Per-event Quality Dropdown */}
          {streamData && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setQualityDropdownOpen((v) => !v)}
                className="w-24 bg-eerie-black text-white rounded px-2 py-2 text-xs flex items-center justify-between hover:bg-charleston-green transition-colors duration-200"
              >
                <span className="truncate">
                  {localSelectedQuality?.name || 'Auto'}
                </span>
                <MdOutlineKeyboardArrowDown
                  className={`ml-1 transition-transform duration-200 ${
                    qualityDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {qualityDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50">
                  {localQualities.map((q) => (
                    <button
                      key={q._id}
                      onClick={() => {
                        setLocalSelectedQuality(q);
                        setQualityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs text-white hover:bg-charleston-green transition-colors duration-200 ${
                        q._id === localSelectedQuality?._id
                          ? 'bg-charleston-green'
                          : ''
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorPlayerEvent;
