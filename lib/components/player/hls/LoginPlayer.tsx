import { useEffect } from 'react';
import Hls from 'hls.js';
import { StreamItemType } from '@/lib/api/stream';
import { ChannelDetailType } from '@/lib/api/channel';
import usePlayer from '@/lib/hooks/usePlayer';
import { VodDetailType } from '@/lib/api/vod';

interface HlsPlayerProps {
  dataChannel?: ChannelDetailType | VodDetailType;
  dataStream?: StreamItemType;
  src?: string;
}

export default function LoginPlayer({ src }: HlsPlayerProps) {
  const { videoRef, playVideo, playerRef } = usePlayer();

  const initHls = () => {
    if (!videoRef.current || !src) return;
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playVideo();
      });
      playerRef.current = hls;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        playVideo();
      });
    } else {
    }
  };
  useEffect(() => {
    if (src) {
      initHls();
    }

    // Cleanup
    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current?.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        className="w-full h-full aspect-[16/9]"
        poster="/images/poster.webp"
        playsInline
        muted
      />
    </div>
  );
}
