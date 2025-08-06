import { ChannelItemType } from '@/lib/api/channel';
import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useContext } from 'react';
import { IoIosSearch } from 'react-icons/io';

interface Props {
  channel?: ChannelItemType;
  onClickChannel?: () => void;
}

export default function ChannelSearchDropdownItem({
  channel,
  onClickChannel,
}: Props) {
  const ctx = useContext(ChannelPageContext);
  const { channelPageData, setChannelsBySearchKeyShown, setSearchKey } = ctx;
  const handleClick = () => {
    const found = channelPageData?.channels?.find(
      (cn) => cn?.id === channel?.id,
    );
    if (setChannelsBySearchKeyShown && found)
      setChannelsBySearchKeyShown([found]);

    if (setSearchKey) setSearchKey(channel?.name || '');
    if (onClickChannel) {
      onClickChannel();
    }
  };

  if (!channel) {
    return <></>;
  }
  return (
    <div
      className="flex items-center gap-[12px] hover:cursor-pointer px-[16px] py-[12px] hover:bg-charleston-green"
      onClick={handleClick}
    >
      <div>
        <IoIosSearch size={24} />
      </div>
      <div className="text-[18px] leading-[130%] tracking-[0.36px] text-white-smoke font-[400]">
        <span dangerouslySetInnerHTML={{ __html: channel.name || '' }}></span>
      </div>
    </div>
  );
}
