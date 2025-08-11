import { ChannelItemType, SuggestChannelItemType } from '@/lib/api/channel';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useCallback, useMemo, useState } from 'react';
import PosterOverlays from '../overlays/PosterOverlays';
import HandleImage from '../slider/HandleImage';

interface SuggestChannelsProps {
  channel?: ChannelItemType;
  isSuggest?: boolean;
}

export default function ChannelItem({
  channel,
  isSuggest,
}: SuggestChannelsProps) {
  const { dataChannel } = usePlayerPageContext();
  const router = useRouter();
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);

  const handleClick = ({
    channel,
  }: {
    channel: SuggestChannelItemType | ChannelItemType;
  }) => {
    const { id } = router.query;
    if (id === channel.id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push({
      pathname: `/xem-truyen-hinh/${channel.id}`,
      query: { group: router.query.group },
    });
  };

  // Tổng hợp positionLabelsStatus
  const positionLabelsStatus = useMemo(
    () => ({
      BL: false,
    }),
    [],
  );

  const handlePosterOverlays = useCallback((positionRibbons: string[]) => {
    setPosterOverlaysReady(positionRibbons);
  }, []);

  if (!channel) {
    return <></>;
  }
  return (
    <div
      data-href={`/xem-truyen-hinh/${channel?.id}`}
      className={`rounded-[12px] block relative hover:cursor-pointer ${
        !isSuggest ? 'ease-out duration-400 hover:scale-[1.05]' : ''
      } ${
        posterOverlaysReady.includes('top-ribbon')
          ? 'overflow-visible mt-[3px]'
          : posterOverlaysReady.includes('mid-ribbon')
          ? 'overflow-visible ml-[3px] mr-[3px]'
          : posterOverlaysReady.includes('bottom-ribbon')
          ? 'overflow-visible mb-[3px]'
          : 'overflow-hidden'
      }`}
      onClick={() => handleClick({ channel })}
      id={`${
        channel?.id === dataChannel?._id && isSuggest
          ? 'active_suggest_channel'
          : ''
      }`}
      title={channel.name}
    >
      {isSuggest ? (
        <HandleImage
          isChannel
          imageAlt={channel?.title}
          imageUrl={channel?.image?.portrait || channel?.image?.portrait_mobile}
          type="horizontal"
          blockDirection="horizontal"
          imageRadius="rounded-[12px]"
        />
      ) : (
        <HandleImage
          isChannel
          imageAlt={channel?.id}
          imageUrl={channel?.thumb}
          type="horizontal"
          blockDirection="horizontal"
          imageRadius="rounded-[12px]"
        />
      )}

      {channel.timeshift_limit &&
        ['12', '24', '48'].includes(channel.timeshift_limit) &&
        channel?.show_icon_timeshift === '1' && (
          <img
            src={`/images/timeshift/${channel?.timeshift_limit}.png`}
            alt="timeshift"
            className="absolute right-[6px] bottom-[6px] w-[28px] h-[28px]"
          />
        )}

      {channel?.id === dataChannel?._id && (
        <img
          src="/images/active_channel.gif"
          alt="active channel"
          className="w-[24px] h-[24px] absolute bottom-[8px] left-[8px]"
        />
      )}

      {/* Poster Overlays Area */}
      {channel?.poster_overlays && (
        <PosterOverlays
          posterOverlays={channel?.poster_overlays}
          blockType={'horizontal_slider'} // add block_type to show same Figma UI
          positionLabelsStatus={[positionLabelsStatus]}
          onHandlePosterOverlays={handlePosterOverlays}
        />
      )}
    </div>
  );
}
