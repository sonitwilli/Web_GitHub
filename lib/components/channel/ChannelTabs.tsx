import { ChannelGroupType } from '@/lib/api/channel';
import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useCallback, useContext, useEffect } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import styles from './ChannelTabs.module.css';

export default function ChannelTabs() {
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
    if (groups && groups?.length > 0 && setSelectedGroup) {
      // Try to restore selected tab from localStorage
      if (typeof window !== 'undefined') {
        const savedGroupId = localStorage.getItem('selectedChannelGroupId');
        const savedGroup = groups.find((group: ChannelGroupType) => group.id === savedGroupId);
        
        if (savedGroup) {
          setSelectedGroup(savedGroup);
        } else {
          // Default to 'All Channels' tab if no saved tab or saved tab not found
          const allChannelsGroup = groups.find((group: ChannelGroupType) => group.type === 'all');
          if (allChannelsGroup) {
            setSelectedGroup(allChannelsGroup);
            localStorage.setItem('selectedChannelGroupId', allChannelsGroup.id || '');
          } else {
            // Fallback to first group if 'all' type not found
            setSelectedGroup(groups[0]);
            if (groups[0].id) {
              localStorage.setItem('selectedChannelGroupId', groups[0].id);
            }
          }
        }
      } else {
        // Server-side: default to 'All Channels' tab
        const allChannelsGroup = groups.find((group: ChannelGroupType) => group.type === 'all');
        if (allChannelsGroup) {
          setSelectedGroup(allChannelsGroup);
        } else {
          setSelectedGroup(groups[0]);
        }
      }
    }
  }, [groups, setSelectedGroup]);

  const clickTab = useCallback(
    (group: ChannelGroupType) => {
      if (setSelectedGroup) {
        setSelectedGroup(group);
        // Save selected tab to localStorage for persistence across navigation
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
