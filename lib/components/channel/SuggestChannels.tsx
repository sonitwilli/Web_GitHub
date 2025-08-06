import { ChannelItemType } from '@/lib/api/channel';
import { useCallback, useEffect, useRef } from 'react';
import styles from './ChannelRightBar.module.css';
import ChannelItem from './ChannelItem';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';

interface SuggestChannelsProps {
  channels?: ChannelItemType[];
}

export default function SuggestChannels({ channels }: SuggestChannelsProps) {
  const { dataChannel } = usePlayerPageContext();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const activeChild = document.getElementById('active_suggest_channel');
    if (!activeChild || !containerRef.current) return;

    const subTop = activeChild.offsetTop;
    const subHeight = activeChild.offsetHeight;
    const targetScrollTop =
      subTop - containerRef.current.clientHeight / 2 + subHeight / 2;

    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth', // optional for animation
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, dataChannel, channels]);

  useEffect(() => {
    setTimeout(() => {
      handleScroll();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, dataChannel, channels]);
  return (
    <div
      className={`${styles.scrollBar} h-full relative overflow-y-auto`}
      ref={containerRef}
    >
      {channels && channels.length > 0 ? (
        <div
          className="grid grid-cols-2 tablet:grid-cols-4 xl:grid-cols-2 gap-[12px]"
          id="suggest_container"
        >
          {channels.map((channel, index) => (
            <ChannelItem isSuggest key={index} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-center leading-[130%] tracking-[0.32px] text-platinum">
          <div>
            <p>Lấy danh sách không thành công.</p>
            <p>Vui lòng thử lại sau</p>
          </div>
        </div>
      )}
    </div>
  );
}
