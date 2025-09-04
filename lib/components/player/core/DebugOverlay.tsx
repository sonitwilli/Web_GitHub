import { useMemo } from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { useDebugPlayer } from '@/lib/hooks/useDebugPlayer';

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

function toMbpsString(bps?: number | null): string | null {
  if (bps === null || bps === undefined) return null;
  const n = Number(bps);
  if (Number.isNaN(n)) return null;
  return `${(n / 1_000_000).toFixed(2)}Mbps`;
}

export default function DebugOverlay({ visible, dataChannel }: Props) {
  const { computedDebugInfo, enableDebug, disableDebug, isEnabled } =
    useDebugPlayer(dataChannel);

  // Auto enable debug when overlay becomes visible
  useMemo(() => {
    if (visible && !isEnabled) {
      enableDebug();
    } else if (!visible && isEnabled) {
      disableDebug();
    }
  }, [visible, isEnabled, enableDebug, disableDebug]);

  if (!visible) return null;

  // Convert store data to old format for compatibility - data now comes from store updated by handleTimeUpdate
  const info: DebugInfo = {
    ipAddress: computedDebugInfo.ipAddress,
    networkSpeed: computedDebugInfo.networkSpeed,
    res: computedDebugInfo.res,
    fps: computedDebugInfo.fps,
    mimeType: computedDebugInfo.mimeType,
    latency: computedDebugInfo.latency,
    OTT: computedDebugInfo.OTT,
    audio: computedDebugInfo.audio,
    video: computedDebugInfo.video,
  };

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
            {info?.mimeType && info?.audio?.BANDWIDTH ? <span>, </span> : null}
            {info?.mimeType ? <span>{info.mimeType}</span> : null}
            {info?.audio?.CODECS &&
            (info?.audio?.BANDWIDTH || info?.mimeType) ? (
              <span>, </span>
            ) : null}
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
