import { useCallback, useContext, useEffect, useLayoutEffect } from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { StreamItemType } from '@/lib/api/stream';
import { VodDetailType } from '@/lib/api/vod';
import useCodec from '@/lib/hooks/useCodec';
import usePlayer from '@/lib/hooks/usePlayer';

import OverlayLogo from '../core/OverlayLogo';
import Hls from 'hls.js';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { useAppSelector } from '@/lib/store';
import { useDrmPlayer } from '@/lib/hooks/useDrmPlayer';
import { PLAYER_NAME, VIDEO_ID } from '@/lib/constant/texts';
import PlayerTopMask from '../core/PlayerTopMask';
import dynamic from 'next/dynamic';
import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import styles from '../core/Text.module.css';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import {
  removePlayerSessionStorage,
  trackPlayerChange,
} from '@/lib/utils/playerTracking';
import { saveSessionStorage } from '@/lib/utils/storage';
import { trackingStoreKey } from '@/lib/constant/tracking';

const PlayerControlBar = dynamic(() => import('../control/PlayerControlBar'), {
  ssr: false,
});

type HlsPlayerProps = {
  srcTimeShift?: string; // Ưu tiên nếu có
  dataChannel?: ChannelDetailType | VodDetailType;
  dataStream?: StreamItemType;
};

const HlsPlayer: React.FC<HlsPlayerProps> = ({
  srcTimeShift,
  dataChannel,
  dataStream,
}) => {
  useLayoutEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_NAME,
            value: PLAYER_NAME.HLS,
          },
        ],
      });
      removePlayerSessionStorage();
    }
  }, []);
  const { handleAddError, handleIntervalCheckErrors } = usePlayer();
  const { viewportType } = useScreenSize();
  const { isTimeShift } = useContext(ChannelPageContext);
  const { info } = useAppSelector((s) => s.user);
  const {
    setPlayerName,
    isExpanded,
    fromTimeshiftToLive,
    loginManifestUrl,
    showLoginPlayer,
    setPlayingUrl,
    isPlaySuccessRef,
    previewHandled,
    clearErrorInterRef,
  } = usePlayerPageContext();
  const { isFullscreen } = useAppSelector((s) => s.player);
  useLayoutEffect(() => {
    if (setPlayerName) {
      setPlayerName('hls');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const {
    videoRef,
    autoplay,
    handlePlaying,
    handleVolumeChange,
    handleLoadedMetaData,
    handleTimeUpdate,
    handleProgress,
    handleEnd,
    handlePaused,
  } = usePlayer();
  const { getUrlToPlay } = useCodec({ dataChannel, dataStream });

  const playVideo = () => {
    try {
      const finalUrl = previewHandled
        ? getUrlToPlay() || dataStream?.trailer_url
        : showLoginPlayer && loginManifestUrl
        ? loginManifestUrl
        : isTimeShift && srcTimeShift
        ? srcTimeShift
        : getUrlToPlay();
      // const finalUrl =
      //   "https://vodcdn.fptplay.net/POVOD/encoded/2023/11/18/multi-legend-of-zhuohua-the-2023-cnf-001-1700300658/master.m3u8";
      if (finalUrl && window.hlsPlayer && videoRef?.current) {
        window.hlsPlayer.loadSource(finalUrl);
        if (setPlayingUrl) {
          setPlayingUrl(finalUrl);
        }
      }
    } catch {}
  };

  const initHls = useCallback(() => {
    const url =
      showLoginPlayer && loginManifestUrl
        ? loginManifestUrl
        : isTimeShift && srcTimeShift
        ? srcTimeShift
        : getUrlToPlay();
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
      });
      window.hlsPlayer = hls;
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (isPlaySuccessRef?.current) {
          console.log('--- PLAYER HLS.JS ERROR PLAYING', data);
        } else {
          console.log('--- PLAYER HLS.JS ERROR INIT', data);
        }
        if (data?.fatal) {
          handleAddError({ error: data });
          if (!showLoginPlayer) {
            if (clearErrorInterRef) {
              clearErrorInterRef();
            }
            handleIntervalCheckErrors();
          }
        }
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        trackPlayerChange();
      });
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
        trackPlayerChange();
      });
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
        trackPlayerChange();
      });
      const fragDownloadTimes = new Map();
      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        fragDownloadTimes.set(data.frag.sn, performance.now());
      });
      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        const start = fragDownloadTimes.get(data.frag.sn);
        if (start) {
          const durationMs = performance.now() - start;
          fragDownloadTimes.delete(data.frag.sn);
          saveSessionStorage({
            data: [
              {
                key: trackingStoreKey.BUFFER_LENGTH,
                value: String(durationMs),
              },
            ],
          });
        }
        const prev =
          sessionStorage.getItem(trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED) || 0;
        const size = data?.frag?.stats?.loaded;
        saveSessionStorage({
          data: [
            {
              key: trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
              value: String(parseInt(prev as string) + size),
            },
          ],
        });
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', () => {
        playVideo();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeShift, srcTimeShift, dataChannel, dataStream]);

  const { pingEnc } = useDrmPlayer({
    playVideo,
  });

  // Hủy player
  const destroyHls = () => {
    if (window?.hlsPlayer?.destroy) {
      window.hlsPlayer?.destroy();
    }
  };

  // play lại luồng live khi switch từ timeshift
  useEffect(() => {
    if (fromTimeshiftToLive) {
      try {
        const url = getUrlToPlay();
        if (url && window.hlsPlayer && videoRef?.current) {
          window.hlsPlayer.loadSource(url);
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
    if (
      url ||
      srcTimeShift ||
      (showLoginPlayer && loginManifestUrl) ||
      previewHandled
    ) {
      initHls();
      if (dataStream?.ping_enc && info?.user_id_str) {
        pingEnc();
      } else {
        playVideo();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream]);

  useEffect(() => {
    return () => {
      destroyHls();
      removePlayerSessionStorage();
    };
  }, []);

  useEffect(() => {
    if (srcTimeShift) {
      playVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcTimeShift]);

  useEffect(() => {
    if (showLoginPlayer && loginManifestUrl && window.hlsPlayer) {
      window.hlsPlayer.loadSource(loginManifestUrl);
      if (setPlayingUrl) {
        setPlayingUrl(loginManifestUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoginPlayer, loginManifestUrl]);

  return (
    <>
      <PlayerTopMask />
      <div
        className="hls-video-container w-full h-full flex items-center justify-center"
        id="hls-video-container"
      >
        <video
          id={VIDEO_ID}
          ref={videoRef}
          playsInline
          muted
          poster="/images/default-poster-horizontal.png"
          className={`w-full h-auto max-h-full ${
            !isFullscreen && !isExpanded ? 'xl:rounded-[16px]' : ''
          } ${styles.video} ${
            viewportType !== VIEWPORT_TYPE.DESKTOP ? '!rounded-0' : ''
          }`}
          onPlaying={handlePlaying}
          onVolumeChange={handleVolumeChange}
          onLoadedMetadata={handleLoadedMetaData}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onEnded={handleEnd}
          onPause={handlePaused}
        />
      </div>

      <OverlayLogo />
      <PlayerControlBar />
    </>
  );
};

export default HlsPlayer;
