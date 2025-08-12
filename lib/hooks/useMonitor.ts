// Monitor Hook logic hoàn toàn
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ChannelItemType, ChannelDetailType } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import {
  getMonitorChannels,
  getMonitorChannelDetail,
  getMonitorChannelStream,
  getMonitorEvents,
  MonitorEventItem,
  MonitorPlatform,
} from '@/lib/api/monitor/index';
import { userAgentInfo } from '../utils/ua';
import { parseManifest } from '@/lib/utils/player';
import { useMonitorQuality } from '@/lib/components/player/monitor/context/MonitorQualityContext';

// Types
interface DeviceOption {
  name: string;
  val: MonitorPlatform;
}

interface QualityOption {
  description: string;
  manifest_id: string;
  name: string;
  require_payment: string;
}

interface PlayerQuantityOption {
  name: string;
  val: number;
}

interface StreamResponse {
  url: string;
  error?: string;
  isPreview?: boolean;
  isBlocked?: boolean;
  needLogin?: boolean;
  qualities?: Array<{
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
  }>;
}

interface UseMonitorProps {
  platformQuery?: string;
}

interface UseMonitorResult {
  channels: ChannelItemType[];
  eventsRender: MonitorEventItem[];
  device: DeviceOption;
  deviceOptions: DeviceOption[];
  qualityOptions: QualityOption[];
  qualityOptionsEvent: QualityOption[];
  selectedPlayerQuantity: PlayerQuantityOption;
  playerQuantityOptions: PlayerQuantityOption[];
  numberPlayerChannelRender: number;
  changeDevice: (device: DeviceOption) => void;
  setSelectedPlayerQuantity: (quantity: PlayerQuantityOption) => void;
  loading: boolean;
  refreshKey: number;
  refreshKeyEvent: number;
}

export const useMonitor = ({
  platformQuery,
}: UseMonitorProps): UseMonitorResult => {
  const router = useRouter();

  // State
  const [channels, setChannels] = useState<ChannelItemType[]>([]);
  const [eventsRender, setEventsRender] = useState<MonitorEventItem[]>([]);
  const [loading] = useState(false);
  const [refreshKey] = useState(new Date().getTime());
  const [refreshKeyEvent] = useState(new Date().getTime());
  const [numberPlayerChannelRender, setNumberPlayerChannelRender] = useState(1);

  // Player quantity options
  const playerQuantityOptions: PlayerQuantityOption[] = [
    { name: '4 Player', val: 4 },
    { name: '8 Player', val: 8 },
    { name: '12 Player', val: 12 },
    { name: '16 Player', val: 16 },
  ];

  const [selectedPlayerQuantity, setSelectedPlayerQuantity] =
    useState<PlayerQuantityOption>(playerQuantityOptions[0]);

  const getDeviceOptions = useCallback((): DeviceOption[] => {
    const isSafari = userAgentInfo()?.isSafari;

    if (isSafari) {
      return [
        { name: 'WEB', val: 'web' as MonitorPlatform },
        { name: 'IOS', val: 'ios' as MonitorPlatform },
        { name: 'BOX', val: 'box' as MonitorPlatform },
        { name: 'SMARTTV HTML', val: 'smarttv_html' as MonitorPlatform },
        { name: 'SMARTTV ANDROID', val: 'smarttv_android' as MonitorPlatform },
      ];
    }
    return [
      { name: 'WEB', val: 'web' as MonitorPlatform },
      { name: 'BOX', val: 'box' as MonitorPlatform },
      { name: 'SMARTTV HTML', val: 'smarttv_html' as MonitorPlatform },
      { name: 'SMARTTV ANDROID', val: 'smarttv_android' as MonitorPlatform },
    ];
  }, []);

  const deviceOptions = getDeviceOptions();

  const [device, setDevice] = useState<DeviceOption>(() => {
    // Initial from query param (if provided via props), fallback to URL query, else WEB
    const queryPlatform = platformQuery as string | undefined;
    if (queryPlatform) {
      const found = deviceOptions.find((d) => d.val === queryPlatform);
      return found || deviceOptions[0];
    }
    return deviceOptions[0];
  });

  // Sync device from URL query when router is ready (e.g., /monitor-channel?platform=smarttv_html)
  useEffect(() => {
    if (!router.isReady) return;
    const qp = (router.query.platform as string) || (platformQuery as string);
    if (!qp) return;
    const found = deviceOptions.find((d) => d.val === qp);
    if (found && found.val !== device.val) {
      setDevice(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.platform, platformQuery, deviceOptions]);

  // Check if user is logged in and clear stale monitor data when logged out
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const logged = !!token;
    setIsLogged(logged);
    if (!logged) {
      try {
        // Clear persisted monitor state
        localStorage.removeItem('PREVIOUS_MONITOR_PLAYER_QUANTITY');
        // Remove per-player selections (support up to 32 indices)
        for (let i = 0; i < 32; i += 1) {
          localStorage.removeItem(`PREVIOUS_CHANNEL_MONITOR_${i}`);
          localStorage.removeItem(`PREVIOUS_QUALITY_MONITOR_${i}`);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  // React to logout/login in other tabs or app flows
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        const loggedNow = !!e.newValue;
        setIsLogged(loggedNow);
        if (!loggedNow) {
          try {
            localStorage.removeItem('PREVIOUS_MONITOR_PLAYER_QUANTITY');
            for (let i = 0; i < 32; i += 1) {
              localStorage.removeItem(`PREVIOUS_CHANNEL_MONITOR_${i}`);
              localStorage.removeItem(`PREVIOUS_QUALITY_MONITOR_${i}`);
            }
          } catch {
            // ignore
          }
          setChannels([]);
          setEventsRender([]);
          setNumberPlayerChannelRender(1);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Load channels
  const loadChannels = useCallback(async () => {
    if (!isLogged) return;
    try {
      const response = await getMonitorChannels(device.val);

      if (response && Array.isArray(response)) {
        setChannels(response as ChannelItemType[]);
        // Progressive render theo số lượng chọn hiện tại (tránh closure cũ)
        renderPlayerChannel(response.length, selectedPlayerQuantity.val);
      } else {
        setChannels([]);
      }
    } catch {
      setChannels([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.val, isLogged]);

  const loadEvents = useCallback(async () => {
    if (!isLogged) return;

    try {
      const response = await getMonitorEvents(device.val);

      if (response && Array.isArray(response)) {
        const result = (response as MonitorEventItem[]).map((item) => ({
          ...item,
          _id: item.id,
          is_event: true,
          name: item.id.toUpperCase(),
        }));

        setEventsRender(result);
      } else {
        setEventsRender([]);
      }
    } catch {
      setEventsRender([]);
    }
  }, [device.val, isLogged]);

  const renderPlayerChannel = useCallback(
    (maxPlayers: number, desiredQuantity?: number) => {
      const targetQuantity = Math.min(
        desiredQuantity ?? selectedPlayerQuantity.val,
        maxPlayers,
      );
      setNumberPlayerChannelRender(1);
      const interval = setInterval(() => {
        setNumberPlayerChannelRender((prev) => {
          if (prev < targetQuantity) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1500);
    },
    [selectedPlayerQuantity.val],
  );

  // Device change handler
  const changeDevice = useCallback(
    (newDevice: DeviceOption) => {
      router.replace({ query: { platform: newDevice.val } }, undefined, {
        shallow: true,
      });
      // Do not trigger loads here; sync effect based on URL will set device once
    },
    [router],
  );

  // Player quantity handler
  const setSelectedPlayerQuantityHandler = useCallback(
    (quantity: PlayerQuantityOption) => {
      setSelectedPlayerQuantity(quantity);
      try {
        localStorage.setItem(
          'PREVIOUS_MONITOR_PLAYER_QUANTITY',
          quantity.val.toString(),
        );
      } catch {
        // Handle storage error silently
      }
      renderPlayerChannel(channels.length, quantity.val);
    },
    [channels.length, renderPlayerChannel],
  );
  // Load data on mount and device change
  useEffect(() => {
    loadChannels();
    loadEvents();
  }, [loadChannels, loadEvents]);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const savedQuantity = localStorage.getItem(
        'PREVIOUS_MONITOR_PLAYER_QUANTITY',
      );
      if (savedQuantity) {
        const found = playerQuantityOptions.find(
          (opt) => opt.val.toString() === savedQuantity,
        );
        if (found) {
          setSelectedPlayerQuantity(found);
        }
      }
    } catch {
      // Handle storage error silently
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize quality options
  const qualityOptions: QualityOption[] = [];
  const qualityOptionsEvent: QualityOption[] = [];

  return {
    channels,
    eventsRender,
    device,
    deviceOptions,
    qualityOptions,
    qualityOptionsEvent,
    selectedPlayerQuantity,
    playerQuantityOptions,
    numberPlayerChannelRender,
    changeDevice,
    setSelectedPlayerQuantity: setSelectedPlayerQuantityHandler,
    loading,
    refreshKey,
    refreshKeyEvent,
  };
};

interface StreamProfile {
  manifest_id: string;
  name: string;
  require_payment: string;
  description: string;
}

interface ExtendedChannelDetailType extends ChannelDetailType {
  stream_profiles?: StreamProfile[];
  auto_profile?: string;
  verimatrix?: boolean | string;
}

// Hook cho monitor player events logic
interface UseMonitorEventPlayerProps {
  eventData: MonitorEventItem;
  deviceMonitor?: MonitorPlatform;
  qualityAll?: QualityOption;
}

interface UseMonitorEventPlayerResult {
  streamData: StreamItemType | null;
  loading: boolean;
  error: string | null;
  qualities: Array<{
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  }>;
  selectedQuality: {
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  } | null;
  dataChannel: ChannelDetailType | null;
  retry: () => void;
  selectQuality: (quality: {
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  }) => void;
}

export const useMonitorEventPlayer = ({
  eventData,
  deviceMonitor = 'web',
}: UseMonitorEventPlayerProps): UseMonitorEventPlayerResult => {
  const [streamData, setStreamData] = useState<StreamItemType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qualities, setQualities] = useState<
    Array<{
      _id: string;
      name: string;
      label: string;
      manifest_id?: string;
      resolvedUri?: string;
      is_auto_profile?: boolean;
    }>
  >([]);

  const [selectedQuality, setSelectedQuality] = useState<{
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  } | null>(null);
  const [dataChannel, setDataChannel] = useState<ChannelDetailType | null>(
    null,
  );

  // Load event stream data logic
  const loadEventStream = useCallback(async () => {
    if (!eventData.id) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Lấy channel detail từ event ID
      const channelDetail = await getMonitorChannelDetail(
        eventData.id,
        deviceMonitor,
      );

      setDataChannel(channelDetail as ExtendedChannelDetailType);

      if (!channelDetail) {
        setError('Không tìm thấy thông tin kênh cho sự kiện này');
        return;
      }

      // 2. Lấy stream data
      const streamResponse = await getMonitorChannelStream(
        channelDetail,
        deviceMonitor,
      );
      setStreamData(streamResponse as StreamItemType);
      // setQualities([]); // Uncomment when needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải stream sự kiện');
    } finally {
      setLoading(false);
    }
  }, [eventData.id, deviceMonitor]);

  const retry = useCallback(() => {
    loadEventStream();
  }, [loadEventStream]);

  const selectQuality = useCallback(
    (quality: {
      _id: string;
      name: string;
      label: string;
      manifest_id?: string;
      resolvedUri?: string;
    }) => {
      setSelectedQuality(quality);
    },
    [],
  );

  useEffect(() => {
    loadEventStream();
  }, [loadEventStream]);

  return {
    streamData,
    loading,
    error,
    qualities,
    selectedQuality,
    dataChannel,
    retry,
    selectQuality,
  };
};

// Hook cho monitor player logic
interface UseMonitorPlayerProps {
  channelList: ChannelItemType[];
  deviceMonitor?: MonitorPlatform;
  index?: number;
  qualityAll?: QualityOption;
}

interface UseMonitorPlayerResult {
  selectedChannel: ChannelItemType | null;
  channelDetail: ChannelDetailType | null;
  streamData: StreamItemType | null;
  loading: boolean;
  errors: Array<{ code: string; content: string; category: string }>;
  isPreviewLive: boolean;
  blockStream: boolean;
  isRequiredLogin: boolean;
  isErrorGetStream: boolean;
  qualities: Array<{
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  }>;
  selectedQuality: {
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  } | null;
  searchChannel: string;
  filteredChannels: ChannelItemType[];

  selectChannel: (channel: ChannelItemType) => void;
  selectQuality: (quality: {
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  }) => void;
  setSearchChannel: (search: string) => void;
  clearErrors: () => void;
  addError: (code: string | number) => void;
  removePlayer: () => void;
  getStreamsLive: () => Promise<StreamResponse>;
}

export const useMonitorPlayer = ({
  channelList,
  deviceMonitor = 'web',
  index = 0,
}: UseMonitorPlayerProps): UseMonitorPlayerResult => {
  const { requestQuality } = useMonitorQuality();
  const [selectedChannel, setSelectedChannel] =
    useState<ChannelItemType | null>(null);
  const [channelDetail, setChannelDetail] = useState<ChannelDetailType | null>(
    null,
  );
  const [streamData, setStreamData] = useState<StreamItemType | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Array<{ code: string; content: string; category: string }>
  >([]);

  const [qualities, setQualities] = useState<
    Array<{
      _id: string;
      name: string;
      label: string;
      manifest_id?: string;
      resolvedUri?: string;
      is_auto_profile?: boolean;
    }>
  >([]);
  const [selectedQuality, setSelectedQuality] = useState<{
    _id: string;
    name: string;
    label: string;
    manifest_id?: string;
    resolvedUri?: string;
    is_auto_profile?: boolean;
  } | null>(null);
  const [searchChannel, setSearchChannel] = useState('');

  // Restore previous selection for this player on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedChannelId = localStorage.getItem(
        `PREVIOUS_CHANNEL_MONITOR_${index}`,
      );
      if (savedChannelId) {
        const found = channelList.find((ch) => {
          const id =
            (ch as { _id?: string; id?: string })._id ||
            (ch as { _id?: string; id?: string }).id ||
            '';

          return id === savedChannelId;
        });
        if (found) {
          // fire and forget
          void selectChannel(found);
        }
      }

      const savedQuality = localStorage.getItem(
        `PREVIOUS_QUALITY_MONITOR_${index}`,
      );
      if (savedQuality) {
        // will be applied after qualities are parsed; also push to context now
        requestQuality(index, savedQuality);
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered channels based on search (accent-insensitive, ranked)
  const normalizeKey = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '')
      .toLowerCase();

  // Deduplicate channels by stable key: _id || id || normalized name
  const uniqueChannels = (() => {
    const seen = new Set<string>();
    const result: ChannelItemType[] = [];
    for (const ch of channelList) {
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

  const makeSearchData = (s: string) => {
    const noDia = (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const upper = noDia.toUpperCase();
    const tokens = upper.split(/[^A-Z0-9]+/).filter(Boolean);
    const acronym = tokens.map((t) => t[0]).join('');
    const compact = upper.replace(/[^A-Z0-9]+/g, '');
    return { upper, tokens, acronym, compact };
  };

  const filteredChannels = uniqueChannels
    .map((ch) => ({ ...ch }))
    .filter((channel) => {
      if (!searchChannel) return true;
      const q = makeSearchData(searchChannel).upper.trim();
      const { upper } = makeSearchData(channel.name || '');
      return upper.includes(q);
    })
    .sort((a, b) => {
      if (!searchChannel) return 0;
      const q = makeSearchData(searchChannel);
      const aD = makeSearchData(a.name || '');
      const bD = makeSearchData(b.name || '');
      const tokenStarts = (d: ReturnType<typeof makeSearchData>) =>
        d.tokens.length > 0 && d.tokens[0].startsWith(q.upper);
      // const tokenHas = (d: ReturnType<typeof makeSearchData>) =>
      //   d.tokens.some((t) => t.startsWith(q.upper));

      const rankData = (d: ReturnType<typeof makeSearchData>) => {
        if (d.upper === q.upper) return 0; // exact
        if (d.upper.startsWith(q.upper + ' ') || d.tokens[0] === q.upper)
          return 1; // prefix at start token
        if (tokenStarts(d)) return 2; // any token starts with
        if (d.acronym.startsWith(q.upper)) return 2; // acronym match
        if (d.upper.includes(' ' + q.upper + ' ')) return 3; // whole word inside
        if (d.upper.includes(q.upper)) return 4; // anywhere
        return 5;
      };

      const ra = rankData(aD);
      const rb = rankData(bD);
      if (ra !== rb) return ra - rb;
      return (a.name || '').localeCompare(b.name || '', 'vi', {
        sensitivity: 'base',
      });
    });

  const selectChannel = useCallback(
    async (channel: ChannelItemType) => {
      setSelectedChannel(channel);
      setErrors([]);
      setLoading(true);
      try {
        // save selection
        const channelId =
          (channel && (channel as { _id?: string; id?: string }))._id ||
          (channel as { _id?: string; id?: string }).id ||
          '';
        localStorage.setItem(`PREVIOUS_CHANNEL_MONITOR_${index}`, channelId);

        // 1. Get channel detail
        const detail = (await getMonitorChannelDetail(
          channelId,
          deviceMonitor,
        )) as ExtendedChannelDetailType | null;
        if (!detail) {
          setChannelDetail(null);
          setStreamData(null);
          setQualities([]);
          setSelectedQuality(null);
          return;
        }
        setChannelDetail(detail);

        // 2. Get stream
        const streamResponse = await getMonitorChannelStream(
          detail,
          deviceMonitor,
        );
        const url = streamResponse?.url || '';
        if (!url) {
          setStreamData(null);
          setQualities([]);
          setSelectedQuality(null);
          return;
        }
        setStreamData({ ...(streamResponse as StreamItemType), url });

        // 3. Parse manifest to build qualities list
        const { qualities: parsed } = (await parseManifest({
          manifestUrl: url,
        })) as {
          qualities?: Array<{ id?: string; name?: string; height?: number }>;
        };
        // Build quality list: prefer video height, avoid bitrate values like 1800/5000
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

        let manifestList: Array<{
          _id: string;
          name: string;
          label: string;
          manifest_id?: string;
          resolvedUri?: string;
          is_auto_profile?: boolean;
        }> = Array.isArray(parsed)
          ? (parsed
              .map((q) => {
                const heightFromField = q?.height ? String(q.height) : '';
                const heightFromNameMatch = String(q?.name || '')
                  .toLowerCase()
                  .match(/(\d{3,4})p/);
                const heightFromName = heightFromNameMatch
                  ? heightFromNameMatch[1]
                  : '';
                const height = [heightFromField, heightFromName].find(
                  (h) => h && allowedHeights.has(String(h)),
                );

                if (!height) {
                  return null; // skip bitrate-only entries like 1800/5000
                }
                return {
                  _id: String(height),
                  manifest_id: String(height),
                  name: String(height),
                  label: String(height),
                };
              })
              .filter(Boolean) as Array<{
              _id: string;
              name: string;
              label: string;
              manifest_id?: string;
              resolvedUri?: string;
              is_auto_profile?: boolean;
            }>)
          : [];

        // Auto profile option
        if (detail?.auto_profile) {
          manifestList = [
            {
              _id: detail.auto_profile,
              manifest_id: detail.auto_profile,
              name: 'Auto',
              label: 'Auto',
              is_auto_profile: true,
              resolvedUri: url,
            },
            ...manifestList,
          ];
        }
        // Deduplicate by normalized resolution height
        const seen = new Set<string>();
        const normalizeHeight = (text?: string) => {
          if (!text) return '';
          const match = String(text).match(/\d{3,4}/g);
          if (!match || !match.length) return '';
          // pick the largest numeric group (covers '2K', '1080p nâng cao', etc.)
          return String(
            match.map((n) => Number(n)).sort((a, b) => b - a)[0] || '',
          );
        };
        const toKey = (item: {
          _id: string;
          name: string;
          label: string;
          manifest_id?: string;
          is_auto_profile?: boolean;
        }) => {
          if (item.is_auto_profile) return 'auto';
          return (
            normalizeHeight(item.manifest_id) ||
            normalizeHeight(item._id) ||
            normalizeHeight(item.label) ||
            normalizeHeight(item.name)
          );
        };

        const deduped: Array<{
          _id: string;
          name: string;
          label: string;
          manifest_id?: string;
          resolvedUri?: string;
          is_auto_profile?: boolean;
        }> = [];
        for (const item of manifestList) {
          const key = toKey(item);
          if (!seen.has(key)) {
            seen.add(key);
            // normalize label for UI: use key or 'Auto'
            const label = item.is_auto_profile ? 'Auto' : key || item.label;
            deduped.push({ ...item, label, name: label });
          }
        }

        setQualities(deduped);
        setSelectedQuality(deduped[0] || null);
        // persist quality height for this player index
        try {
          const first = deduped[0];
          const src = first?.is_auto_profile
            ? 'auto'
            : first?.manifest_id || first?._id || first?.label || first?.name;
          const m = src ? String(src).match(/\d{3,4}/g) : null;
          const height = first?.is_auto_profile
            ? 'auto'
            : m && m.length
            ? String(m.map((n) => Number(n)).sort((a, b) => b - a)[0] || '')
            : '';
          if (height) {
            localStorage.setItem(`PREVIOUS_QUALITY_MONITOR_${index}`, height);
          }
        } catch {
          // ignore
        }
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          {
            code: 'ERROR_GET_CHANNEL_DETAIL',
            category: 'ERROR',
            content: (err as Error)?.message || 'Error',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [index, deviceMonitor],
  );

  const getStreamsLive = async (): Promise<StreamResponse> => {
    // Placeholder implementation
    return {
      url: '',
      error: 'Not implemented',
    };
  };

  // Select quality
  const selectQuality = useCallback(
    async (quality: {
      _id: string;
      name: string;
      label: string;
      manifest_id?: string;
      resolvedUri?: string;
      is_auto_profile?: boolean;
    }) => {
      // Monitor: đổi chất lượng ngay trên player, không gọi API lại
      setSelectedQuality(quality);
      // Thuần React: cập nhật context để player nhận qua props
      const toHeight = (q: typeof quality): string => {
        if (q.is_auto_profile) return 'auto';
        const src = q.manifest_id || q._id || q.label || q.name;
        if (!src) return '';
        const m = String(src).match(/\d{3,4}/g);
        if (!m || !m.length) return '';
        return String(m.map((n) => Number(n)).sort((a, b) => b - a)[0] || '');
      };
      const height = toHeight(quality) || 'auto';
      requestQuality(index, height);
      try {
        localStorage.setItem(`PREVIOUS_QUALITY_MONITOR_${index}`, height);
      } catch {
        // ignore
      }
    },
    [index, requestQuality],
  );

  // Set search channel
  const updateSearchChannel = useCallback(
    (search: string) => {
      setSearchChannel(search);
    },
    [setSearchChannel],
  );

  // Remove player
  const removePlayer = useCallback(() => {
    if (!channelDetail?._id) return;

    try {
      localStorage.removeItem(`PREVIOUS_CHANNEL_MONITOR_${index}`);
      localStorage.removeItem(`PREVIOUS_QUALITY_MONITOR_${index}`);
    } catch {
      // Handle storage error silently
    }

    setChannelDetail(null);
    setSelectedChannel(null);
    setStreamData(null);
    setQualities([]);
    setSelectedQuality(null);
    setErrors([]);
    setLoading(false);
  }, [channelDetail?._id, index]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addError = useCallback((code: string | number) => {
    const msg = String(code || '');
    setErrors((prev) => [
      ...prev,
      { code: msg, content: msg, category: 'PLAYER' },
    ]);
  }, []);

  return {
    selectedChannel,
    channelDetail,
    streamData,
    loading,
    errors,
    isPreviewLive: false,
    blockStream: false,
    isRequiredLogin: false,
    isErrorGetStream: false,
    qualities,
    selectedQuality,
    searchChannel,
    filteredChannels,
    selectChannel,
    selectQuality,
    setSearchChannel: updateSearchChannel,
    removePlayer,
    clearErrors,
    addError,
    getStreamsLive,
  };
};
