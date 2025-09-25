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
    if (groups && groups?.length > 0) {
      // Try to restore selected group from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        const savedGroupId = localStorage.getItem('selectedChannelGroupId');
        const savedGroup = groups.find((group: ChannelGroupType) => group.id === savedGroupId);
        
        if (savedGroup && setSelectedGroup) {
          setSelectedGroup(savedGroup);
        } else if (setSelectedGroup) {
          // Fall back to first group if no saved group or saved group not found
          setSelectedGroup(groups[0]);
          if (groups[0].id) {
            localStorage.setItem('selectedChannelGroupId', groups[0].id);
          }
        }
      } else if (setSelectedGroup) {
        // Server-side: just set the first group
        setSelectedGroup(groups[0]);
      }
    }
  }, [groups, setSelectedGroup]);

  const clickTab = useCallback(
    (group: ChannelGroupType) => {
      if (setSelectedGroup) {
        setSelectedGroup(group);
        // Save selected group to localStorage (client-side only)
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
