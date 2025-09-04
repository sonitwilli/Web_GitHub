import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setDebugEnabled,
  resetPlayerInfo,
  syncFromPlayerParams,
  DebugPlayerInfo,
} from '../store/slices/debugSlice';
import { ChannelDetailType } from '../api/channel';
import { IP_ADDRESS, DEFAULT_IP_ADDRESS } from '../constant/texts';
import { trackingStoreKey } from '../constant/tracking';
import { getPlayerParams } from '../utils/playerTracking';

interface UseDebugPlayerReturn {
  debugInfo: DebugPlayerInfo;
  isEnabled: boolean;
  enableDebug: () => void;
  disableDebug: () => void;
  resetDebug: () => void;
  syncPlayerData: () => void;
  computedDebugInfo: DebugPlayerInfo;
}

// Map dataChannel flags to OTT code:
// 1: non-DRM non-LL; 2: DRM non-LL; 3: non-DRM LL; 4: DRM LL
function getOttType(dc?: ChannelDetailType | null): number | null {
  if (!dc) return null;
  const dcUnknown = dc as unknown as {
    verimatrix?: string | number | boolean;
    low_latency?: string | number | boolean;
  };
  const hasDrm =
    Boolean(dcUnknown?.verimatrix) && dcUnknown?.verimatrix !== '0';
  const ll = Boolean(dcUnknown?.low_latency);
  if (hasDrm) return ll ? 4 : 2;
  return ll ? 3 : 1;
}

function getIp(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(IP_ADDRESS) || DEFAULT_IP_ADDRESS;
    }
  } catch {}
  return DEFAULT_IP_ADDRESS;
}

// Latency in seconds
function computeLatency(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    try {
      const streamType = sessionStorage.getItem(
        trackingStoreKey.PLAYER_STREAM_TYPE,
      );
      if (
        !streamType ||
        ['vod', 'playlist', 'timeshift'].includes(streamType)
      ) {
        return null;
      }
    } catch {}
    // 1) Player-provided latency (Shaka)
    try {
      type ShakaStats = { liveLatency?: number };
      type ShakaLikePlayer = { getStats?: () => ShakaStats };
      const sp = (window as Window & { shakaPlayer?: ShakaLikePlayer })
        .shakaPlayer;
      const stats = sp?.getStats ? sp.getStats() : undefined;
      const v = stats?.liveLatency;
      if (typeof v === 'number' && Number.isFinite(v)) {
        return Math.max(0, v).toFixed(2);
      }
    } catch {}

    // 2) Player-provided latency (hls.js)
    try {
      type HlsLikePlayer = { latency?: number };
      const hls = (window as Window & { hlsPlayer?: HlsLikePlayer }).hlsPlayer;
      if (
        hls &&
        typeof hls.latency === 'number' &&
        Number.isFinite(hls.latency)
      ) {
        return Math.max(0, Number(hls.latency)).toFixed(2);
      }
    } catch {}

    return null;
  } catch {
    return null;
  }
}

export function useDebugPlayer(
  dataChannel?: ChannelDetailType | null,
): UseDebugPlayerReturn {
  const dispatch = useAppDispatch();
  const { playerInfo, isEnabled } = useAppSelector((s) => s.debug);

  // Latency suppression state
  const latencyState = useRef({
    last: null as string | null,
    suppressUntil: 0,
    stabilizeUntil: 0,
    lastVisibility: null as DocumentVisibilityState | null,
  });

  const enableDebug = useCallback(() => {
    dispatch(setDebugEnabled(true));
  }, [dispatch]);

  const disableDebug = useCallback(() => {
    dispatch(setDebugEnabled(false));
  }, [dispatch]);

  const resetDebug = useCallback(() => {
    dispatch(resetPlayerInfo());
  }, [dispatch]);

  const syncPlayerData = useCallback(() => {
    try {
      const playerParams = getPlayerParams();
      dispatch(
        syncFromPlayerParams(
          playerParams as Record<string, string | number | boolean | undefined>,
        ),
      );
    } catch {}
  }, [dispatch]);

  // Trigger immediate sync when debug is first enabled
  useEffect(() => {
    if (isEnabled) {
      // Force immediate sync when debug overlay becomes active
      syncPlayerData();
    }
  }, [isEnabled, syncPlayerData]);

  // Handle visibility changes for latency suppression
  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      try {
        const current = document.visibilityState;
        const { lastVisibility } = latencyState.current;

        if (lastVisibility !== current) {
          latencyState.current.lastVisibility = current;
          if (current === 'visible') {
            const now = performance.now();
            const SUPPRESS_DURATION_MS = 2000;
            const STABILIZE_DURATION_MS = 8000;

            latencyState.current.suppressUntil = now + SUPPRESS_DURATION_MS;
            latencyState.current.stabilizeUntil = now + STABILIZE_DURATION_MS;
          }
        }
      } catch {}
    };

    // Initialize
    try {
      latencyState.current.lastVisibility = document.visibilityState;
    } catch {}

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEnabled]);

  /**
   * Get latency with suppression logic
   * - Suppresses inflated values after tab focus
   * - Stabilizes growth during transition period
   * - Returns null when tab is hidden
   */
  const getSuppressedLatency = useCallback((): string | null => {
    try {
      const latency = computeLatency();
      const now = performance.now();
      const { last, suppressUntil, stabilizeUntil } = latencyState.current;

      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden'
      ) {
        return null;
      }

      if (now < suppressUntil) {
        return last;
      }

      const rawNum = latency !== null ? Number(latency) : NaN;
      if (!Number.isNaN(rawNum) && Number.isFinite(rawNum)) {
        if (now >= suppressUntil && now < stabilizeUntil) {
          const prev = Number(last);
          const prevValid = !Number.isNaN(prev) && Number.isFinite(prev);
          const baseline = prevValid ? prev : rawNum;
          const MAX_LATENCY_INCREASE_PER_TICK = 1.5;
          const next =
            rawNum > baseline + MAX_LATENCY_INCREASE_PER_TICK
              ? baseline + MAX_LATENCY_INCREASE_PER_TICK
              : rawNum;
          const formatted = next.toFixed(2);
          latencyState.current.last = formatted;
          return formatted;
        } else {
          const formatted = Math.max(0, rawNum).toFixed(2);
          latencyState.current.last = formatted;
          return formatted;
        }
      }

      return last;
    } catch {
      return null;
    }
  }, []);

  // Computed debug info - store data + real-time overrides
  const computedDebugInfo = useMemo((): DebugPlayerInfo => {
    if (!isEnabled) return {};

    return {
      ...playerInfo,
      ipAddress: getIp(),
      latency: getSuppressedLatency(),
      OTT: playerInfo.OTT || getOttType(dataChannel),
    };
  }, [isEnabled, playerInfo, dataChannel, getSuppressedLatency]);

  return {
    debugInfo: playerInfo,
    isEnabled,
    enableDebug,
    disableDebug,
    resetDebug,
    syncPlayerData,
    computedDebugInfo,
  };
}
