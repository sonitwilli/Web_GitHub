import { ChannelGroupType, ChannelItemType } from '@/lib/api/channel';
import ChannelItem from './ChannelItem';

export interface Props {
  channels?: ChannelItemType[];
  selectedGroup?: ChannelGroupType;
}

export default function ChannelsByGroup({ channels, selectedGroup }: Props) {
  return (
    <div className="grid grid-cols-2 tablet:grid-cols-4 xl:grid-cols-8 gap-x-[13px] gap-y-[24px] xl:gap-x-[16px] xl:gap-y-[48px]">
      {channels?.map((channel, index) => (
        <ChannelItem
          channel={channel}
          key={index}
          selectedGroup={selectedGroup}
        />
      ))}
    </div>
  );
}
