import dynamic from 'next/dynamic';
import { StreamType, usePlayerPageContext } from '../context/PlayerPageContext';
import { useAppSelector } from '@/lib/store';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { playerButtonProps } from '../common/playerButtonProps';
import { EpisodeTypeEnum } from '@/lib/api/vod';
import useUA from '@/lib/hooks/useUA';
import { useMemo } from 'react';
import useCodec from '@/lib/hooks/useCodec';

const ChatButton = dynamic(() => import('../core/ChatButton'), {
  ssr: false,
});
const Subtitles = dynamic(() => import('../core/Subtitles'), {
  ssr: false,
});
const AudioButton = dynamic(() => import('../core/AudioButton'), {
  ssr: false,
});
const EpisodeListButton = dynamic(() => import('../core/EpisodeListButton'), {
  ssr: false,
});
const FullScreen = dynamic(() => import('../core/FullScreen'), { ssr: false });
const LiveButton = dynamic(() => import('../core/LiveButton'), { ssr: false });
const PlayPause = dynamic(() => import('../core/PlayPause'), { ssr: false });
const Resume = dynamic(() => import('../core/Resume'), { ssr: false });
const Report = dynamic(() => import('../core/Report'), { ssr: false });
const Resolution = dynamic(() => import('../core/Resolution'), { ssr: false });
const RewindForward = dynamic(() => import('../core/RewindForward'), {
  ssr: false,
});
const ScheduleButton = dynamic(() => import('../core/ScheduleButton'), {
  ssr: false,
});
const SeekBar = dynamic(() => import('../core/SeekBar'), { ssr: false });
const SpeedButton = dynamic(() => import('../core/SpeedButton'), {
  ssr: false,
});
const VideoDuration = dynamic(() => import('../core/VideoDuration'), {
  ssr: false,
});
const Volume = dynamic(() => import('../core/Volume'), { ssr: false });
const NextEpispode = dynamic(() => import('../core/NextEpisode'), {
  ssr: false,
});
export default function PlayerControlBar() {
  const {
    isPlaySuccess,
    dataChannel,
    isEndVideo,
    videoDuration,
    videoCurrentTime,
    dataPlaylist,
    previewHandled,
    dataStream,
    streamType,
  } = usePlayerPageContext();
  const { isFullscreen, isOpenLiveChat } = useAppSelector((s) => s.player);
  const { width } = useScreenSize();
  const { viewportInfo } = useUA();
  // Attach handler to parent and delegate to buttons
  const { getUrlToPlayH264 } = useCodec({ dataChannel, dataStream });

  const hiddenControlBarPreview = useMemo(() => {
    return (
      !getUrlToPlayH264() &&
      previewHandled &&
      isPlaySuccess &&
      dataStream?.trailer_url &&
      dataStream?.trailer_url !== getUrlToPlayH264() &&
      ['playlist', 'vod'].includes(streamType as StreamType)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaySuccess]);

  if (hiddenControlBarPreview) {
    return null;
  }

  return (
    <div
      className={`absolute left-0 bottom-0 z-[2] ease-out duration-500 ${
        isPlaySuccess ? '' : 'hidden'
      }${
        isOpenLiveChat && isFullscreen
          ? `w-[calc(100% - 290px)] ${
              viewportInfo?.browser?.toLowerCase() === 'edge'
                ? 'w-full'
                : 'w-[75.6441%]'
            }`
          : ' w-full'
      }`}
      id="nvm_player_control"
      {...playerButtonProps}
    >
      <div className="px-[16px] tablet:px-[32px] pb-[16px] pt-[91px] bg-gradient-to-b from-smoky-black-0 to-smoky-black-06">
        {/* Progress */}
        <div className="w-full -translate-y-[25px] relative z-[2]">
          <SeekBar />
        </div>
        {/* Others */}
        <div className="w-full flex items-center">
          {/* Left: play, rewind, volumes,... */}
          <div className="flex items-center justify-center gap-1 tablet:gap-6">
            <LiveButton />
            {width >= 768 &&
              (isEndVideo &&
              typeof videoCurrentTime === 'number' &&
              typeof videoDuration === 'number' &&
              videoCurrentTime >= videoDuration ? (
                <Resume />
              ) : (
                <PlayPause />
              ))}
            {width >= 768 && <RewindForward />}
            <NextEpispode />
            <Volume />
            {width >= 768 && <VideoDuration />}
          </div>
          {/* Spacer */}
          <div className="flex-1"></div>
          {/* Right: report, sub, audio... */}
          <div className="flex items-center justify-center gap-[16px] tablet:gap-[24px]">
            <Report />
            <ChatButton />

            {isPlaySuccess ? <Subtitles /> : ''}
            {isPlaySuccess ? <AudioButton /> : ''}

            <Resolution />
            <SpeedButton />
            {(dataChannel?.episodes && dataChannel?.episodes?.length > 1) ||
            (dataPlaylist?.videos && dataPlaylist?.videos?.length > 1) ||
            ((dataChannel?.episode_type === EpisodeTypeEnum.SERIES ||
              dataChannel?.episode_type === EpisodeTypeEnum.SEASON) &&
              dataChannel?.episodes?.length &&
              dataChannel?.episodes?.length > 0) ? (
              <EpisodeListButton />
            ) : (
              ''
            )}
            <ScheduleButton />
            {viewportInfo?.device &&
            viewportInfo?.device?.toUpperCase()?.includes('MOBILE') ? (
              ''
            ) : (
              <FullScreen />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
