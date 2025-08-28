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
  removePlayerSessionStorageWhenRender,
  trackingStartBuffering,
  trackPlayerChange,
} from '@/lib/utils/playerTracking';
import { saveSessionStorage } from '@/lib/utils/storage';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { getRemainingBufferedTime } from '@/lib/utils/player';
import {
  trackingLogChangeResolutionLog113,
  trackingPlayAttempLog521,
} from '@/lib/hooks/useTrackingPlayback';
import { trackingPlayAttempLog179 } from '@/lib/hooks/useTrackingEvent';
import { trackingPlayAttempLog414 } from '@/lib/hooks/useTrackingIPTV';
import CodecNotSupport from '../core/CodecNotSupport';

const PlayerControlBar = dynamic(() => import('../control/PlayerControlBar'), {
  ssr: false,
});

type HlsPlayerProps = {
  srcTimeShift?: string; // Ưu tiên nếu có
  dataChannel?: ChannelDetailType | VodDetailType;
  dataStream?: StreamItemType;
  queryEpisodeNotExist?: boolean;
};

const HlsPlayer: React.FC<HlsPlayerProps> = ({
  srcTimeShift,
  dataChannel,
  dataStream,
}) => {
  useLayoutEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      removePlayerSessionStorageWhenRender();
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_NAME,
            value: PLAYER_NAME.HLS,
          },
        ],
      });
    }
  }, []);
  const { handleAddError, handleIntervalCheckErrors, isValidForProfileType } =
    usePlayer();
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
    streamType,
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
  const { getUrlToPlayH264, isVideoCodecNotSupported } = useCodec({
    dataChannel,
    dataStream,
  });

  const playVideo = () => {
    try {
      const finalUrl = previewHandled
        ? getUrlToPlayH264() || dataStream?.trailer_url
        : showLoginPlayer && loginManifestUrl
        ? loginManifestUrl
        : isTimeShift && srcTimeShift
        ? srcTimeShift
        : getUrlToPlayH264();
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
        : getUrlToPlayH264();
    if (!videoRef.current || !url) return;
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // const lengthHAAC = data.levels.filter(
        //   (a) => a.audioCodec && a.audioCodec.includes('mp4a'),
        // ).length;
        // const regex = /(ac-3|ac3|ec3|ac-4|ac4)/;
        // for (let index = data.audioTracks.length - 1; index >= 0; index--) {
        //   if (regex.test(data.audioTracks[index].url)) {
        //     data.audioTracks.splice(index, 1);
        //   }
        // }

        // if (lengthHAAC && data.levels.length) {
        //   data.levels.sort(
        //     (a, b) =>
        //       (a.audioCodec && a.audioCodec.includes('mp4a') ? 0 : 1) -
        //       (b.audioCodec && b.audioCodec.includes('mp4a') ? 0 : 1),
        //   );
        //   if (data.levels.length > lengthHAAC) {
        //     data.levels.splice(lengthHAAC, data.levels.length - lengthHAAC);
        //   }
        // }
        // --- Keep only AAC audio tracks ---
        if (streamType !== 'timeshift') {
          try {
            for (let i = data.audioTracks.length - 1; i >= 0; i--) {
              const track = data.audioTracks[i];
              if (!track.audioCodec || !track.audioCodec.includes('mp4a')) {
                data.audioTracks.splice(i, 1);
              }
            }

            // --- Keep only AAC levels (video+audio) ---
            for (let i = data.levels.length - 1; i >= 0; i--) {
              const level = data.levels[i];
              if (!level.audioCodec || !level.audioCodec.includes('mp4a')) {
                data.levels.splice(i, 1);
              }
            }
          } catch {}
        }

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
            handleIntervalCheckErrors();
          }
        }
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        trackPlayerChange();
        const isUserManual = sessionStorage.getItem(
          trackingStoreKey.IS_MANUAL_CHANGE_RESOLUTION,
        );
        trackingLogChangeResolutionLog113({
          Resolution: `${hls?.levels[hls?.currentLevel]?.height}p`,
          isManual: isUserManual || '0',
        });
        sessionStorage.setItem(
          trackingStoreKey.IS_MANUAL_CHANGE_RESOLUTION,
          '0',
        );
      });
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
        trackPlayerChange();
      });
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
        trackPlayerChange();
      });
      hls.on(Hls.Events.MANIFEST_LOADING, () => {
        console.log('--- HLS: LOAD MANIFEST');
        const firstLoad = sessionStorage.getItem(
          trackingStoreKey.PLAYER_FIRST_LOAD,
        );
        if (!firstLoad) {
          saveSessionStorage({
            data: [
              {
                key: trackingStoreKey.PLAYER_FIRST_LOAD,
                value: new Date().getTime().toString(),
              },
            ],
          });
          switch (streamType) {
            case 'vod':
            case 'playlist':
              trackingPlayAttempLog521({
                Event: 'FirstLoad',
              });
              break;
            case 'event':
            case 'premiere':
              trackingPlayAttempLog179({
                Event: 'FirstLoad',
              });
              break;
            case 'channel':
            case 'timeshift':
              trackingPlayAttempLog414({
                Event: 'FirstLoad',
              });
              break;
          }
        } else {
          switch (streamType) {
            case 'vod':
            case 'playlist':
              trackingPlayAttempLog521({
                Event: 'PlayAttemp',
              });
              break;
            case 'event':
            case 'premiere':
              trackingPlayAttempLog179({
                Event: 'PlayAttemp',
              });
              break;
            case 'channel':
            case 'timeshift':
              trackingPlayAttempLog414({
                Event: 'PlayAttemp',
              });
              break;
          }
        }
      });
      const fragDownloadTimes = new Map();
      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        fragDownloadTimes.set(data.frag.sn, performance.now());
        const remaining = getRemainingBufferedTime();
        if (remaining === 0) {
          trackingStartBuffering();
          saveSessionStorage({
            data: [
              {
                key: trackingStoreKey.PLAYER_START_BUFFER_TIME,
                value: new Date().getTime().toString(),
              },
            ],
          });
        }
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
        // https://github.com/video-dev/hls.js/blob/master/docs/API.md#loader
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
        const url = getUrlToPlayH264();
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
    if (!isValidForProfileType) {
      return;
    }
    destroyHls();
    const url = getUrlToPlayH264();
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
      console.log('--- PLAYER UNMOUNTED hlsPlayer');
      destroyHls();
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
      {(streamType === 'channel' ||
        streamType === 'event' ||
        streamType === 'premiere') && <PlayerTopMask />}
      <div
        className="hls-video-container w-full h-full flex items-center justify-center"
        id="hls-video-container"
      >
        {isVideoCodecNotSupported && (
          <div className="absolute left-0 top-0 w-full h-full">
            <CodecNotSupport />
          </div>
        )}
        <video
          id={VIDEO_ID}
          ref={videoRef}
          playsInline
          muted
          controls={false}
          webkit-playsinline="true"
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
      {!isVideoCodecNotSupported && <OverlayLogo />}

      <PlayerControlBar />
    </>
  );
};

export default HlsPlayer;
