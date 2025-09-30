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
    const defaultGroup = groups[0];

    // Server-side rendering: just set default group
    if (typeof window === 'undefined') {
      setSelectedGroup(defaultGroup);
      return;
    }

    // Check saved group from localStorage first (for page refresh)
    const savedGroupId = localStorage.getItem('selectedChannelGroupId');
    const savedGroup = groups.find((group: ChannelGroupType) => group.id === savedGroupId);

    if (savedGroup) {
      setSelectedGroup(savedGroup);
      return;
    }
    setSelectedGroup(defaultGroup);
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