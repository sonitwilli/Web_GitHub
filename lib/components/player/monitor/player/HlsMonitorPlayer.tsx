import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import { VodDetailType } from '@/lib/api/vod';
import useCodec from '@/lib/hooks/useCodec';
import { useMonitorVideo } from '@/lib/hooks/useMonitorVideo';
import Hls, {
  ErrorDetails as HlsErrorDetails,
  ErrorTypes as HlsErrorTypes,
} from 'hls.js';
import { useAppSelector } from '@/lib/store';
import { usePlayerPageContext } from '../../context/PlayerPageContext';

type HlsPlayerProps = {
  srcTimeShift?: string; // Ưu tiên nếu có
  dataChannel?: ChannelDetailType | VodDetailType;
  dataStream?: StreamItemType;
  onAddError?: (err: string) => void;
  onClearErrors?: () => void;
  requestedQuality?: string | number;
};

const HlsMonitorPlayer: React.FC<HlsPlayerProps> = ({
  srcTimeShift,
  dataChannel,
  dataStream,
  onAddError,
  onClearErrors,
  requestedQuality,
}) => {
  // Keep selector to align with existing hooks signature; intentionally unused here.
  useAppSelector((s) => s.user);
  const {
    setPlayerName,
    fromTimeshiftToLive,
    loginManifestUrl,
    showLoginPlayer,
    setPlayingUrl,
    isPlaySuccessRef,
  } = usePlayerPageContext();
  useLayoutEffect(() => {
    if (setPlayerName) {
      setPlayerName('hls');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { videoRef, autoplay } = useMonitorVideo();
  const { getUrlToPlay } = useCodec({ dataChannel, dataStream });
  const hlsRef = useRef<Hls | null>(null);
  const videoId = useMemo(
    () => `monitor_hls_${Math.random().toString(36).slice(2)}`,
    [],
  );

  const playVideo = () => {
    try {
      const finalUrl = getUrlToPlay();

      if (finalUrl && hlsRef.current && videoRef?.current) {
        hlsRef.current.loadSource(finalUrl);
        if (setPlayingUrl) {
          setPlayingUrl(finalUrl);
        }
      }
    } catch {}
  };

  const initHls = useCallback(() => {
    const url = getUrlToPlay();
    if (!videoRef.current || !url) return;
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        autoplay();
        onClearErrors?.();
      });
      hlsRef.current = hls;
      // ------
      const mapHlsErrorToCode = (data: unknown): number => {
        const err = (data || {}) as {
          type?: HlsErrorTypes | string;
          details?: HlsErrorDetails | string;
          code?: number | string;
        };
        const type = err.type as HlsErrorTypes | string | undefined;
        const details = err.details as HlsErrorDetails | string | undefined;

        const d = String(details || '').toUpperCase();

        // Fine-grained mapping by details
        if (d.includes('MANIFEST_LOAD')) return 1001;
        if (d.includes('MANIFEST_PARS')) return 1002; // parsing
        if (d.includes('LEVEL_LOAD')) return 1003;
        if (d.includes('FRAG_LOAD')) return 1004;
        if (d.includes('FRAG_PARS')) return 1005;
        if (d.includes('AUDIO_TRACK_LOAD')) return 1007;
        if (d.includes('SUBTITLE_TRACK_LOAD')) return 1008;
        if (d.includes('KEY_SYSTEM')) return 3001;
        if (d.includes('BUFFER_STALLED')) return 2001;
        if (d.includes('BUFFER_APPEND')) return 2002;
        if (d.includes('BUFFER_APPENDING')) return 2003;

        // Coarse-grained fallback by type
        if (type === HlsErrorTypes.NETWORK_ERROR) return 1100;
        if (type === HlsErrorTypes.MEDIA_ERROR) return 2000;
        if (type === HlsErrorTypes.KEY_SYSTEM_ERROR) return 3000;
        if (type === HlsErrorTypes.MUX_ERROR) return 4000;

        // If Hls provided a numeric code, prefer it
        const provided = Number(err.code);
        if (!Number.isNaN(provided) && provided > 0) return provided;

        return 7000; // unknown
      };
      // ----------------------------

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (isPlaySuccessRef?.current) {
          console.log('--- PLAYER HLS.JS ERROR PLAYING', data);
        } else {
          console.log('--- PLAYER HLS.JS ERROR INIT', data);
        }
        const code = mapHlsErrorToCode(data);
        onAddError?.(String(code));
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', () => {
        playVideo();
        onClearErrors?.();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcTimeShift, dataChannel, dataStream]);

  // keep instance fully isolated for monitor

  // Hủy player
  const destroyHls = () => {
    if (hlsRef.current?.destroy) {
      hlsRef.current?.destroy();
    }
  };

  // play lại luồng live khi switch từ timeshift
  useEffect(() => {
    if (fromTimeshiftToLive) {
      try {
        const url = getUrlToPlay();
        if (url && hlsRef.current && videoRef?.current) {
          hlsRef.current.loadSource(url);
          if (setPlayingUrl) {
            setPlayingUrl(url);
          }
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTimeshiftToLive]);

  // Khởi tạo player một lần
  useEffect(() => {
    destroyHls();
    const url = getUrlToPlay();
    if (url) {
      initHls();
      playVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream]);

  // React to requestedQuality prop changes
  useEffect(() => {
    if (!hlsRef.current) return;
    if (typeof requestedQuality === 'undefined') return;
    const n = Number(requestedQuality);
    if (Number.isNaN(n)) {
      hlsRef.current.currentLevel = -1;
      return;
    }
    const levels = hlsRef.current.levels || [];
    if (!levels.length) return;
    const matches = levels.filter((lv) => Number(lv.height) === n);
    if (!matches.length) return;
    matches.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const best = matches[0];
    const idx = levels.findIndex((lv) => lv.bitrate === best.bitrate);
    if (idx >= 0) {
      hlsRef.current.currentLevel = idx;
    }
  }, [requestedQuality]);

  useEffect(() => {
    return () => {
      destroyHls();
    };
  }, []);

  useEffect(() => {
    if (showLoginPlayer && loginManifestUrl && hlsRef.current) {
      hlsRef.current.loadSource(loginManifestUrl);
      if (setPlayingUrl) {
        setPlayingUrl(loginManifestUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoginPlayer, loginManifestUrl]);

  return (
    <>
      <video
        id={videoId}
        ref={videoRef}
        playsInline
        muted
        poster="/images/default-poster-horizontal.png"
        className={`w-full h-auto max-h-full`}
      />
    </>
  );
};

export default HlsMonitorPlayer;
