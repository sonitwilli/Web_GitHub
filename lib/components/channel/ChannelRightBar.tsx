import { useEffect, useState } from 'react';
import SuggestChannels from './SuggestChannels';
import {
  ChannelDetailType,
  getSuggestChannels,
  SuggestChannelItemType,
} from '@/lib/api/channel';
import styles from './ChannelRightBar.module.css';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRouter } from 'next/router';
import useScreenSize from '@/lib/hooks/useScreenSize';
import {
  trackingExitScheduleLog461,
  trackingShowScheduleLog46,
} from '@/lib/hooks/useTrackingIPTV';

type Props = {
  dataChannel?: ChannelDetailType;
  onScheduleSelect?: (src: string) => void;
};

const BroadcastScheduleWrapper = dynamic(
  () => import('@/lib/components/live/BroadcastScheduleWrapper'),
  { ssr: false },
);

export default function ChannelRightBar({
  dataChannel,
  onScheduleSelect,
}: Props) {
  const { width } = useScreenSize();
  const router = useRouter();
  const [tab, setTab] = useState<'suggest-channel' | 'schedule'>(
    'suggest-channel',
  );
  const [suggestChannels, setSuggestChannels] = useState<
    SuggestChannelItemType[]
  >([]);

  // Suggest channel logic giữ nguyên
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await getSuggestChannels({});
        setSuggestChannels(res?.data?.data || []);
      } catch (err) {
        console.error('Lỗi khi fetch suggest channels:', err);
      }
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    if (tab === 'schedule') {
      trackingShowScheduleLog46();
    } else {
      trackingExitScheduleLog461();
    }
  }, [tab]);

  // Lấy channelId
  const channelId = dataChannel?._id || '';

  // Lấy trạng thái fullscreen từ redux
  const isFullscreen = useSelector(
    (state: RootState) => state.player.isFullscreen,
  );

  useEffect(() => {
    if (router.isReady) {
      const urlScheduleId = router.query?.time_shift_id as string;
      if (urlScheduleId) {
        setTab('schedule');
      }
    }
  }, [router]);

  return (
    <div className="relative w-full xl:h-0 min-h-full grid grid-rows-[55px_1fr]">
      <div className="grid grid-cols-2 gap-[16px] w-full">
        <div>
          <button
            className={`hover:cursor-pointer w-full h-[39px] flex items-center justify-center whitespace-nowrap ease-out duration-300 bg-eerie-black rounded-[8px] text-white-smoke font-[500] text-[18px] leading-[130%] tracking-[0.36px] hover:bg-charleston-green ${
              tab === 'suggest-channel'
                ? '!bg-white-smoke !text-smoky-black'
                : ''
            }`}
            onClick={() => setTab('suggest-channel')}
          >
            Kênh gợi ý
          </button>
        </div>
        <div>
          <button
            className={`hover:cursor-pointer w-full h-[39px] flex items-center justify-center whitespace-nowrap ease-out duration-300 bg-eerie-black rounded-[8px] text-white-smoke font-[500] text-[18px] leading-[130%] tracking-[0.36px] hover:bg-charleston-green ${
              tab === 'schedule' ? '!bg-white-smoke !text-smoky-black' : ''
            }`}
            onClick={() => setTab('schedule')}
          >
            Lịch phát sóng
          </button>
        </div>
      </div>

      <div className="h-full overflow-auto">
        <div
          id="suggest_wrapper"
          className={`h-full max-h-full overflow-y-auto ${styles.scrollBar} ${
            tab === 'suggest-channel' ? 'block' : 'hidden pointer-events-none'
          } ${width < 768 ? '!max-h-[411px]' : ''} ${
            width >= 768 && width < 1280 ? '!max-h-[314px]' : ''
          }`}
        >
          <SuggestChannels channels={suggestChannels} />
        </div>

        <div
          className={`h-full max-h-full rounded-t-[16px] rounded-b-[16px] overflow-hidden ${
            tab === 'schedule' ? 'block' : 'hidden pointer-events-none'
          } ${width < 768 ? '!max-h-[577px]' : ''} ${
            width >= 768 && width < 1280 ? '!max-h-[619px]' : ''
          }`}
        >
          <BroadcastScheduleWrapper
            channelId={channelId}
            dataChannel={dataChannel}
            onScheduleSelect={onScheduleSelect}
            isFullscreen={isFullscreen}
            visible={tab === 'schedule'}
          />
        </div>
      </div>
    </div>
  );
}
