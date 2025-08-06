import { ChannelItemType } from '@/lib/api/channel';
import ChannelItem from './ChannelItem';

export interface Props {
  channels?: ChannelItemType[];
}

export default function ChannelsByGroup({ channels }: Props) {
  return (
    <div className="grid grid-cols-2 tablet:grid-cols-4 xl:grid-cols-8 gap-x-[13px] gap-y-[24px] xl:gap-x-[16px] xl:gap-y-[48px]">
      {channels?.map((channel, index) => (
        <ChannelItem channel={channel} key={index} />
      ))}
    </div>
  );
}
