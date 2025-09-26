import { ChannelGroupType } from '@/lib/api/channel';
import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useCallback, useContext, useEffect } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import styles from './ChannelTabs.module.css';
import { useRouter } from 'next/router';

export default function ChannelTabs() {
  const router = useRouter();
  const ctx = useContext(ChannelPageContext);
  const {
    channelPageData,
    selectedGroup,
    setSelectedGroup,
    setChannelsBySearchKeyShown,
    setIsSearch,
    channelsBySearchKey,
  } = ctx;
  const { groups } = channelPageData || {};
  
  useEffect(() => {
    if (!groups?.length || !setSelectedGroup) return;

    const defaultGroup = groups.find((group: ChannelGroupType) => group.type === 'all') || groups[0];

    // Server-side rendering: just set default group
    if (typeof window === 'undefined') {
      setSelectedGroup(defaultGroup);
      return;
    }

    // Client-side: check localStorage and validate with current channel
    const savedGroupId = localStorage.getItem('selectedChannelGroupId');
    const savedGroup = groups.find((group: ChannelGroupType) => group.id === savedGroupId);

    if (savedGroup) {
      // Check if current channel belongs to saved group
      const currentChannelId = router.query.id as string;
      const currentChannel = channelPageData?.channels?.find(channel => channel.id === currentChannelId);

      if (currentChannel && currentChannel.group_id === savedGroup.id) {
        setSelectedGroup(savedGroup);
      } else {
        // Reset to default and clear localStorage
        localStorage.removeItem('selectedChannelGroupId');
        setSelectedGroup(defaultGroup);
        if (defaultGroup?.id) {
          localStorage.setItem('selectedChannelGroupId', defaultGroup.id);
        }
      }
    } else {
      // No saved group, use default
      setSelectedGroup(defaultGroup);
      if (defaultGroup?.id) {
        localStorage.setItem('selectedChannelGroupId', defaultGroup.id);
      }
    }
  }, [groups, setSelectedGroup, channelPageData, router.query.id]);

  const clickTab = useCallback(
    (group: ChannelGroupType) => {
      if (setSelectedGroup) {
        setSelectedGroup(group);
        if (typeof window !== 'undefined' && group.id) {
          localStorage.setItem('selectedChannelGroupId', group.id);
        }
      }
    },
    [setSelectedGroup],
  );

  const clickSearch = () => {
    if (setIsSearch) setIsSearch(true);
    if (setChannelsBySearchKeyShown)
      setChannelsBySearchKeyShown(channelsBySearchKey || []);
  };

  return (
    <div className="w-full pt-[16px]">
      {groups && groups?.length > 0 && (
        <div className="flex items-center gap-[32px] pb-[12px] xl:border-b xl:border-charleston-green">
          <button aria-label="search" onClick={clickSearch}>
            <RiSearchLine className="fill-white h-[20px] w-[20px] hover:cursor-pointer hover:fill-fpl" />
          </button>
          {groups?.map((group: ChannelGroupType, index: number) => {
            return (
              <div
                key={`channelgroup-${group.id}-${index}`}
                className={`${
                  styles.tab
                } relative whitespace-nowrap text-[18px] text-spanish-gray leading-[130%] tracking-[0.36px] hover:cursor-pointer ${
                  group?.id === selectedGroup?.id
                    ? `text-white-smoke ${styles.activeTab}`
                    : ''
                }`}
                onClick={() => {
                  clickTab(group);
                }}
              >
                {group?.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}