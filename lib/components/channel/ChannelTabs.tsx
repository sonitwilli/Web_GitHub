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
    if (groups && groups?.length > 0) {
      if (setSelectedGroup) setSelectedGroup(groups[0]);
    }
    if (router.isReady) {
      const groupId = router.query.group;
      const found = groups?.find(
        (item: ChannelGroupType) => item.id === groupId,
      );
      if (found) {
        if (setSelectedGroup) setSelectedGroup(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, router]);

  const clickTab = useCallback(
    (group: ChannelGroupType) => {
      if (router.isReady) {
        if (setSelectedGroup) setSelectedGroup(group);
        router.push(
          {
            query: {
              ...router.query,
              group: group?.id,
            },
          },
          undefined,
          { shallow: true },
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
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
