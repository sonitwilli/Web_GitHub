import {
  ChannelGroupType,
  ChannelItemType,
  SuggestChannelItemType,
} from '@/lib/api/channel';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useCallback, useMemo, useState, useEffect } from 'react';
import PosterOverlays from '../overlays/PosterOverlays';
import HandleImage from '../slider/HandleImage';
import { scaleImageUrl } from '@/lib/utils/methods';
import { trackingStoreKey } from '@/lib/constant/tracking';

interface SuggestChannelsProps {
  channel?: ChannelItemType;
  isSuggest?: boolean;
  selectedGroup?: ChannelGroupType;
}

export default function ChannelItem({
  channel,
  isSuggest,
  selectedGroup,
}: SuggestChannelsProps) {
  const { dataChannel } = usePlayerPageContext();
  const router = useRouter();
  const [posterOverlaysReady, setPosterOverlaysReady] = useState<string[]>([]);

  // Reset posterOverlaysReady khi channel thay đổi
  useEffect(() => {
    setPosterOverlaysReady([]);
  }, [channel?.id]);

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
    });
    console.log('selectedGroup', selectedGroup, isSuggest);
    sessionStorage.setItem(
      trackingStoreKey.CHANNEL_SELECTED_GROUP,
      selectedGroup?.name || isSuggest ? 'Kênh gợi ý' : '',
    );
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

  // Khi channel không có poster_overlays, đảm bảo clear state
  useEffect(() => {
    if (!channel?.poster_overlays || channel.poster_overlays.length === 0) {
      setPosterOverlaysReady([]);
    }
  }, [channel?.poster_overlays]);

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
          imageUrl={scaleImageUrl({
            imageUrl:
              channel?.image?.portrait || channel?.image?.portrait_mobile,
            width: 200,
          })}
          type="horizontal"
          blockDirection="horizontal"
          imageRadius="rounded-[12px]"
        />
      ) : (
        <HandleImage
          isChannel
          imageAlt={channel?.id}
          imageUrl={scaleImageUrl({
            imageUrl: channel?.thumb,
            width: 200,
          })}
          type="horizontal"
          blockDirection="horizontal"
          imageRadius="rounded-[12px]"
        />
      )}
      {channel.timeshift_limit && channel?.show_icon_timeshift === '1' && (
        <div className="absolute right-[8px] bottom-[8px] w-[28px] h-[28px]">
          <img
            src={`/images/timeshift/timeshift_wrapper.png`}
            alt="timeshift"
            className="w-full h-full object-contain"
          />
          <span className="text-[10px] font-[800] text-fpl absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
            {channel.timeshift_limit}
          </span>
        </div>
      )}

      {channel?.id === dataChannel?._id && (
        <img
          src="/images/active_channel.gif"
          alt="active channel"
          className="w-[24px] h-[24px] absolute bottom-[8px] left-[8px]"
        />
      )}

      {/* Poster Overlays Area */}
      {channel?.poster_overlays && channel.poster_overlays.length > 0 && (
        <PosterOverlays
          posterOverlays={channel.poster_overlays}
          blockType={'horizontal_slider'} // add block_type to show same Figma UI
          positionLabelsStatus={[positionLabelsStatus]}
          onHandlePosterOverlays={handlePosterOverlays}
        />
      )}
    </div>
  );
}
