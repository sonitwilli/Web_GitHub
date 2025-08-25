import { useEffect, useMemo, useRef, useState } from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { IP_ADDRESS, DEFAULT_IP_ADDRESS } from '@/lib/constant/texts';
import { trackingStoreKey } from '@/lib/constant/tracking';

type DebugTrack = {
  BANDWIDTH?: number | null;
  CODECS?: string | null;
};

type DebugInfo = {
  ipAddress?: string;
  networkSpeed?: string | null; // Mbps text
  res?: string | null;
  fps?: number | null;
  mimeType?: string | null;
  latency?: string | null;
  OTT?: number | null;
  audio?: DebugTrack | null;
  video?: DebugTrack | null;
};

interface Props {
  visible: boolean;
  dataChannel?: ChannelDetailType | null;
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

function toMbpsString(bps?: number | null): string | null {
  if (bps === null || bps === undefined) return null;
  const n = Number(bps);
  if (Number.isNaN(n)) return null;
  return `${(n / 1_000_000).toFixed(2)}Mbps`;
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

function getResolutionLabel(resolution?: string | null): string | null {
  if (!resolution) return null;
  const parts = resolution.split('x');
  const hStr = parts[1];
  const h = Number(hStr);
  return Number.isFinite(h) ? `${h}p` : null;
}

function parseProfilesForCurrentResolution(
  profiles?: string | null,
  resolution?: string | null,
): {
  mimeType: string | null;
  videoCodec: string | null;
  audioCodec: string | null;
  fps: number | null;
} {
  if (!profiles || !resolution) {
    return { mimeType: null, videoCodec: null, audioCodec: null, fps: null };
  }
  const [targetW, targetH] = resolution.split('x');
  const entries = profiles.split(';').map((s) => s.trim());
  for (const entry of entries) {
    const clean = entry.replace(/[()]/g, '');
    const parts = clean.split(',').map((p) => p.trim());
    const map: Record<string, string> = {};
    for (const p of parts) {
      const [k, v] = p.split(':');
      if (k && v) map[k] = v;
    }
    if (map['w'] === targetW && map['h'] === targetH) {
      const mimeType = map['m'] || null;
      let videoCodec: string | null = null;
      let audioCodec: string | null = null;
      if (map['c']) {
        const codecParts = String(map['c'])
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (codecParts.length === 1) {
          videoCodec = codecParts[0] || null;
        } else if (codecParts.length >= 2) {
          videoCodec = codecParts[0] || null;
          audioCodec = codecParts[codecParts.length - 1] || null;
        }
      }
      const fpsNum = Number(map['f']);
      const fps = Number.isFinite(fpsNum) ? Math.floor(fpsNum) : null;
      return { mimeType, videoCodec, audioCodec, fps };
    }
  }
  return { mimeType: null, videoCodec: null, audioCodec: null, fps: null };
}

function createTrack(
  bandwidth?: number | null,
  codecs?: string | null,
): DebugTrack | null {
  if (bandwidth === null && !codecs) return null;
  return { BANDWIDTH: bandwidth ?? null, CODECS: codecs ?? null };
}

export default function DebugOverlay({ visible, dataChannel }: Props) {
  const [info, setInfo] = useState<DebugInfo>({});
  // Avoid inflated latency right after returning to the tab
  const lastLatencyRef = useRef<string | null>(null);
  const suppressLatencyUntilRef = useRef<number>(0);
  // Stabilize displayed latency growth for a short window after refocus
  const stabilizeUntilRef = useRef<number>(0);
  // Track last known page visibility without attaching event listeners
  const lastVisibilityRef = useRef<DocumentVisibilityState | null>(null);

  const ott = useMemo(() => getOttType(dataChannel), [dataChannel]);

  const readFromStorage = (): DebugInfo => {
    const ipAddress = getIp();
    const bandwidthStr = sessionStorage.getItem(
      trackingStoreKey.PLAYER_BANDWIDTH,
    );
    const streamBandwidthStr = sessionStorage.getItem(
      trackingStoreKey.STREAM_BANDWIDTH,
    );
    const streamAudioBandwidthStr = sessionStorage.getItem(
      trackingStoreKey.STREAM_AUDIO_BANDWIDTH,
    );
    const resolutionStr = sessionStorage.getItem(
      trackingStoreKey.PLAYER_RESOLUTION,
    );
    const frameRateStr = sessionStorage.getItem(
      trackingStoreKey.PLAYER_FRAME_RATE,
    );
    const profilesStr = sessionStorage.getItem(
      trackingStoreKey.STREAM_PROFILES,
    );

    const networkSpeed = bandwidthStr
      ? toMbpsString(Number(bandwidthStr))
      : null;
    const videoBandwidth = streamBandwidthStr
      ? Number(streamBandwidthStr)
      : null;
    const audioBandwidth = streamAudioBandwidthStr
      ? Number(streamAudioBandwidthStr)
      : null;
    const res = getResolutionLabel(resolutionStr);

    const {
      mimeType,
      videoCodec,
      audioCodec,
      fps: fpsFromProfiles,
    } = parseProfilesForCurrentResolution(profilesStr, resolutionStr);

    const video = createTrack(videoBandwidth, videoCodec);
    const audio = createTrack(audioBandwidth, audioCodec);

    // Expose compact numbers for external debug usages
    try {
      const payload = {
        Bandwidth: bandwidthStr ? Number(bandwidthStr) : 0,
        StreamBandwidth: videoBandwidth || 0,
        StreamBandwidthAudio: audioBandwidth || 0,
      };
      sessionStorage.setItem('PLAYER_DEBUG_DATA', JSON.stringify(payload));
    } catch {}

    // Prefer fps from profiles when not available from player
    let fps = frameRateStr ? Math.floor(Number(frameRateStr)) : null;
    if (!fps && fpsFromProfiles) fps = fpsFromProfiles;

    // Latency direct from engines with brief suppression after visibility returns
    let latency = computeLatency();
    try {
      const now = performance.now();
      if (typeof document !== 'undefined') {
        if (document.visibilityState === 'hidden') {
          latency = null;
        } else if (now < suppressLatencyUntilRef.current) {
          latency = lastLatencyRef.current;
        }
      }
      const rawNum = latency !== null ? Number(latency) : NaN;
      if (!Number.isNaN(rawNum) && Number.isFinite(rawNum)) {
        // During stabilization, limit how fast latency can rise each tick
        if (
          now >= suppressLatencyUntilRef.current &&
          now < stabilizeUntilRef.current
        ) {
          const prev = Number(lastLatencyRef.current);
          const prevValid = !Number.isNaN(prev) && Number.isFinite(prev);
          const baseline = prevValid ? prev : rawNum;
          const MAX_INCREASE_PER_TICK = 1.5; // seconds per update
          const next =
            rawNum > baseline + MAX_INCREASE_PER_TICK
              ? baseline + MAX_INCREASE_PER_TICK
              : rawNum;
          const formatted = next.toFixed(2);
          lastLatencyRef.current = formatted;
          latency = formatted;
        } else {
          const formatted = Math.max(0, rawNum).toFixed(2);
          lastLatencyRef.current = formatted;
          latency = formatted;
        }
      } else if (lastLatencyRef.current) {
        latency = lastLatencyRef.current;
      }
    } catch {}

    return {
      ipAddress,
      networkSpeed,
      res,
      fps,
      mimeType,
      latency,
      OTT: ott,
      audio,
      video,
    };
  };

  useEffect(() => {
    if (!visible) return;
    const tick = () => {
      try {
        const current = document.visibilityState;
        const last = lastVisibilityRef.current;
        if (last !== current) {
          lastVisibilityRef.current = current;
          if (current === 'visible') {
            const now = performance.now();
            suppressLatencyUntilRef.current = now + 2000;
            stabilizeUntilRef.current = now + 8000;
          }
        }
      } catch {}
      setInfo(readFromStorage());
    };
    // Initialize last visibility and do first tick
    try {
      lastVisibilityRef.current = document.visibilityState;
    } catch {}
    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, ott]);

  if (!visible) return null;

  return (
    <div
      id="debug-player"
      className="absolute top-[10px] left-[10px] sm:top-[7%] sm:left-[5%] min-w-[240px] sm:min-w-[310px] max-w-[92vw] w-fit bg-black/70 text-white p-[10px] sm:p-[15px] rounded-[8px] z-[3] text-[12px] sm:text-[14px] leading-[130%] break-words whitespace-normal"
    >
      <ul className="list-none m-0 p-0 space-y-[4px] sm:space-y-[2px]">
        {(info?.ipAddress || info?.networkSpeed) && (
          <li>
            {(info?.ipAddress || info?.networkSpeed) && <span>B: </span>}
            {info?.ipAddress && <span>{info.ipAddress}&nbsp;&nbsp;&nbsp;</span>}
            {info?.networkSpeed && <span>{String(info.networkSpeed)}</span>}
          </li>
        )}
        {(info?.video || info?.res || info?.fps) && (
          <li>
            {(info?.video?.BANDWIDTH ||
              info?.res ||
              info?.fps ||
              info?.video?.CODECS) && <span>V: </span>}
            {info?.video?.BANDWIDTH ? (
              <span>{toMbpsString(info.video.BANDWIDTH)}</span>
            ) : null}
            {info?.res && (info?.video?.BANDWIDTH ? <span>, </span> : null)}
            {info?.res ? <span>{info.res}</span> : null}
            {info?.fps && (info?.video?.BANDWIDTH || info?.res) ? (
              <span>, </span>
            ) : null}
            {info?.fps ? <span>{info.fps}</span> : null}
            {info?.video?.CODECS &&
            (info?.video?.BANDWIDTH || info?.res || info?.fps) ? (
              <span>, </span>
            ) : null}
            {info?.video?.CODECS ? <span>{info.video.CODECS}</span> : null}
          </li>
        )}
        {info?.audio && (
          <li>
            {(info?.audio?.BANDWIDTH ||
              info?.mimeType ||
              info?.audio?.CODECS) && <span>A: </span>}
            {info?.audio?.BANDWIDTH ? (
              <span>{toMbpsString(info.audio.BANDWIDTH)}</span>
            ) : null}
            {info?.mimeType ? <span>, </span> : null}
            {info?.mimeType ? <span>{info.mimeType}</span> : null}
            {info?.audio?.CODECS ? <span>, </span> : null}
            {info?.audio?.CODECS ? <span>{info.audio.CODECS}</span> : null}
          </li>
        )}
        {info?.latency && !Number.isNaN(Number(info.latency)) && (
          <li>
            <span>L: </span>
            <span>{`${info.latency}s`}</span>
          </li>
        )}
        {info?.OTT ? (
          <li>
            <span>O: {info.OTT}</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
