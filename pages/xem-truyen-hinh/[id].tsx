import {
  ChannelDetailType,
  ChannelGroupType,
  ChannelItemType,
  ChannelResponseDataType,
  getChannels,
  ScheduleData,
  ScheduleItem,
} from '@/lib/api/channel';
import DefaultLayout from '@/lib/layouts/Default';
import {
  createContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import ChannelRightBar from '@/lib/components/channel/ChannelRightBar';
import ChannelInfo from '@/lib/components/channel/ChannelInfo';
import ChannelTabs from '@/lib/components/channel/ChannelTabs';
import ChannelSearch from '@/lib/components/channel/ChannelSearch';
import {
  BlockItemType,
  BlockSlideItemType,
  BlockTypeType,
  getBlockItemData,
} from '@/lib/api/blocks';
import BlockSlideItem from '@/lib/components/slider/BlockSlideItem';
import PlayerWrapper from '@/lib/components/player/core/PlayerWrapper';
import PlayerPlaceholder from '@/lib/components/player/core/PlayerPlaceholder';
import ShakaPlayer from '@/lib/components/player/shaka/ShakaPlayer';
import ChannelsByGroup from '@/lib/components/channel/ChannelsByGroup';
import type { GetServerSideProps } from 'next';
import slug from 'slug';
import dynamic from 'next/dynamic';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

import PlayerPageContextWrapper from '@/lib/components/player/context/PlayerPageContextWrapper';
import { usePlayerPageContext } from '@/lib/components/player/context/PlayerPageContext';
// import HlsPlayer from '@/lib/components/player/hls/HlsPlayer';
import { useRouter } from 'next/router';
import ErrorComponent from '@/lib/components/error/ErrorComponent';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { resetBroadcastSchedule } from '@/lib/store/slices/broadcastScheduleSlice';
import usePlayerPageCycle from '@/lib/hooks/usePlayerPageCycle';

const RequirePurchase = dynamic(
  () => import('@/lib/components/player/core/RequirePurchase'),
  { ssr: false },
);
const HlsPlayer = dynamic(
  () => import('@/lib/components/player/hls/HlsPlayer'),
  { ssr: false },
);
export interface ChannelPageContextType {
  channelPageData?: ChannelResponseDataType;
  selectedGroup?: ChannelGroupType;
  setSelectedGroup?: (group: ChannelGroupType) => void;
  isSearch?: boolean;
  setIsSearch?: (isSearch: boolean) => void;
  blockSlideItems?: BlockSlideItemType[];
  setBlockSlideItems?: (items: BlockSlideItemType[]) => void;
  channelsBySelectedGroup?: ChannelItemType[];
  isTimeShift?: boolean;
  setIsTimeShift?: (isTimeShift: boolean) => void;
  srcTimeShift?: string;
  setSrcTimeShift?: (src: string) => void;
  broadcastScheduleData?: ScheduleData;
  setBroadcastScheduleData?: (data: ScheduleData) => void;
  selectedTimeShift?: ScheduleItem;
  activeScheduleId?: string;
  setActiveScheduleId?: (str: string) => void;
  searchKey?: string;
  setSearchKey?: (v: string) => void;
  channelsBySearchKey?: ChannelItemType[];
  setChannelsBySearchKeyShown?: (cns: ChannelItemType[]) => void;
  allTimeShiftItems?: ScheduleItem[];
  setAllTimeShiftItems?: (items: ScheduleItem[]) => void;
}
export const ChannelPageContext = createContext<ChannelPageContextType>({});

function ChannelPageContent() {
  usePlayerPageCycle();
  const { viewportType } = useScreenSize();

  const router = useRouter();
  const {
    dataChannel,
    dataStream,
    fetchChannelCompleted,
    isDrm,
    isExpanded,
    requirePurchaseData,
    channelNotFound,
    notFoundError,
    videoHeight,
    queryEpisodeNotExist,
  } = usePlayerPageContext();
  const dispatch = useDispatch();
  const { width } = useScreenSize();
  const [searchKey, setSearchKey] = useState('');
  const [activeScheduleId, setActiveScheduleId] = useState<string>('');
  const [broadcastScheduleData, setBroadcastScheduleData] =
    useState<ScheduleData>({});
  const [isTimeShift, setIsTimeShift] = useState(false);
  const [channelPageData, setChannelPageData] =
    useState<ChannelResponseDataType>({});
  const [selectedGroup, setSelectedGroup] = useState<ChannelGroupType>();
  const [isSearch, setIsSearch] = useState(false);
  const [blockSlideItems, setBlockSlideItems] = useState<BlockSlideItemType[]>(
    [],
  );
  const [srcTimeShift, setSrcTimeShift] = useState<string>('');
  const [channelsBySearchKeyShown, setChannelsBySearchKeyShown] = useState<
    ChannelItemType[]
  >([]);
  const [allTimeShiftItems, setAllTimeShiftItems] = useState<ScheduleItem[]>(
    [],
  );
  const channelsBySelectedGroup = useMemo(() => {
    if (selectedGroup?.type === 'all') {
      return channelPageData?.channels || [];
    }
    return channelPageData?.channels?.filter(
      (item: ChannelItemType) => item.group_id === selectedGroup?.id,
    );
  }, [channelPageData, selectedGroup]);

  // Sử dụng Redux store để nhận biết timeshift hiện tại
  const broadcastScheduleState = useSelector(
    (state: RootState) => state.broadcastSchedule,
  );

  const selectedTimeShift = useMemo(() => {
    const { activeScheduleId: reduxActiveScheduleId, scheduleList } =
      broadcastScheduleState;

    if (!reduxActiveScheduleId) {
      return undefined;
    }

    // Tìm trong schedule_list hiện tại trước
    const fromCurrentSchedule = scheduleList?.find(
      (item) => item.id === reduxActiveScheduleId,
    );

    if (fromCurrentSchedule) {
      return fromCurrentSchedule;
    }

    // Nếu không tìm thấy trong schedule_list hiện tại, tìm trong allTimeShiftItems
    return allTimeShiftItems?.find((item) => item.id === reduxActiveScheduleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastScheduleState]);

  const channelsBySearchKey = useMemo(() => {
    if (!searchKey) {
      return channelPageData?.channels || [];
    } else {
      const slugSearchKey = slug(searchKey, '-');
      const plusSearchKey = slug(searchKey, '+');
      const searchKeyNoWhiteSpace = slug(searchKey, '');
      return (
        channelPageData?.channels?.filter((cn) => {
          return (
            cn?.slugName?.includes(slugSearchKey) ||
            cn?.plusName?.includes(plusSearchKey) ||
            cn?.nameNoWhiteSpace?.includes(searchKeyNoWhiteSpace)
          );
        }) || []
      );
    }
  }, [searchKey, channelPageData]);

  const getChannelsList = async () => {
    try {
      const res = await getChannels();
      if (res?.data?.data) {
        setChannelPageData({
          ...res?.data?.data,
          channels: res?.data?.data?.channels?.map((cn) => ({
            ...cn,
            slugName: slug(cn.name || '', '-'),
            plusName: slug(cn.name || '', '+'),
            nameNoWhiteSpace: slug(cn.name || '', ''),
          })),
        });
      }
    } catch {}
  };

  const handleSelectedScheduleChange = (src?: string) => {
    if (!src) {
      // Reset về live
      setSrcTimeShift('');
      setIsTimeShift(false);
      return;
    }

    setSrcTimeShift(src);
    setIsTimeShift(true);
  };

  useEffect(() => {
    getChannelsList();
  }, []);

  useEffect(() => {
    if (!isSearch) {
      setSearchKey('');
    }
  }, [isSearch]);

  // Clear broadcast schedule when channel changes
  useEffect(() => {
    if (router?.isReady && router?.query?.id) {
      dispatch(resetBroadcastSchedule());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.id, dispatch]);

  useLayoutEffect(() => {
    if (router?.isReady) {
      const { time_shift_id } = router.query;
      if (time_shift_id) {
        setIsTimeShift(true);
      } else {
        setIsTimeShift(false);
      }
    }
  }, [router]);

  const getBlockItems = async () => {
    if (!selectedGroup?.id) {
      return;
    }
    try {
      const res = await getBlockItemData({
        block: {
          id: selectedGroup.id,
          block_type: selectedGroup.block_type as BlockTypeType,
          type: selectedGroup.type,
        },
      });
      setBlockSlideItems(res?.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    if (selectedGroup?.type === 'highlight') {
      getBlockItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // Sử dụng data từ broadcastScheduleData đã có thay vì gọi thêm API
  useEffect(() => {
    if (broadcastScheduleData?.schedule_list?.length) {
      setAllTimeShiftItems(broadcastScheduleData.schedule_list);
    }
  }, [broadcastScheduleData?.schedule_list]);

  return (
    <ChannelPageContext.Provider
      value={{
        channelPageData,
        selectedGroup,
        setSelectedGroup,
        isSearch,
        setIsSearch,
        blockSlideItems,
        setBlockSlideItems,
        channelsBySelectedGroup,
        isTimeShift,
        setIsTimeShift,
        srcTimeShift,
        setSrcTimeShift,
        broadcastScheduleData,
        setBroadcastScheduleData,
        activeScheduleId,
        setActiveScheduleId,
        selectedTimeShift,
        searchKey,
        setSearchKey,
        channelsBySearchKey,
        setChannelsBySearchKeyShown,
        allTimeShiftItems,
        setAllTimeShiftItems,
      }}
    >
      <DefaultLayout>
        <div className="pt-[96px]">
          {/* Kênh ko tồn tại */}
          {channelNotFound ? (
            <div className="f-container">
              <ErrorComponent
                message={notFoundError?.title}
                subMessage={notFoundError?.content}
                code={notFoundError?.code}
              />
            </div>
          ) : (
            <>
              {/* player + LPS + kên gợi ý */}
              <div
                className={`${
                  isExpanded
                    ? ''
                    : viewportType === VIEWPORT_TYPE.DESKTOP
                    ? 'f-container'
                    : ''
                }`}
              >
                <div
                  className={`${
                    isExpanded ? '' : 'xl:grid xl:grid-cols-[1fr_432px]'
                  }`}
                >
                  {!fetchChannelCompleted ? (
                    <div
                      className="w-full col-span-full "
                      style={{
                        height:
                          viewportType === VIEWPORT_TYPE.DESKTOP
                            ? `${
                                videoHeight && videoHeight > 0
                                  ? videoHeight
                                  : ''
                              }px`
                            : '',
                      }}
                    >
                      <PlayerPlaceholder />
                    </div>
                  ) : requirePurchaseData ? (
                    <div
                      className="w-full col-span-full xl:px-[100px] 2xl:px-[216px]"
                      style={{
                        height:
                          viewportType === VIEWPORT_TYPE.DESKTOP
                            ? `${
                                videoHeight && videoHeight > 0
                                  ? videoHeight
                                  : ''
                              }px`
                            : '',
                      }}
                    >
                      <RequirePurchase />
                    </div>
                  ) : (
                    <>
                      <div className={` relative  ${isExpanded ? '' : ''}`}>
                        <PlayerWrapper>
                          {fetchChannelCompleted && (
                            <>
                              {isDrm ? (
                                <ShakaPlayer
                                  src={srcTimeShift}
                                  dataChannel={dataChannel}
                                  dataStream={dataStream}
                                  queryEpisodeNotExist={queryEpisodeNotExist}
                                />
                              ) : (
                                <HlsPlayer
                                  srcTimeShift={srcTimeShift}
                                  dataChannel={dataChannel}
                                  dataStream={dataStream}
                                  queryEpisodeNotExist={queryEpisodeNotExist}
                                />
                              )}
                            </>
                          )}
                        </PlayerWrapper>
                      </div>
                      <div
                        className={`mt-[24px] tablet:mt-[49px] xl:mt-[0] ${
                          isExpanded
                            ? 'w-0 max-w-0 overflow-hidden'
                            : 'xl:pl-[16px]'
                        } ${
                          viewportType !== VIEWPORT_TYPE.DESKTOP
                            ? 'f-container'
                            : ''
                        }`}
                      >
                        {width < 1280 && (
                          <div className="w-full xl:grid xl:grid-cols-[1fr_minmax(290px,_24.3559%)] xl:pr-[16px] mb-[40px] tablet:mb-[48px]">
                            <ChannelInfo />
                          </div>
                        )}
                        <ChannelRightBar
                          dataChannel={dataChannel as ChannelDetailType}
                          onScheduleSelect={handleSelectedScheduleChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {width >= 1280 && (
                <div className="f-container mt-[48px]">
                  <div className="w-full xl:grid xl:grid-cols-[1fr_432px]">
                    <ChannelInfo />
                  </div>
                </div>
              )}
              <div
                className={`ChannelSearch-ChannelTabs mt-[21px] xl:mt-[32px] ${
                  width >= 1280
                    ? 'f-container'
                    : 'w-screen hide-scroll border-b border-charleston-green'
                } ${isSearch ? 'border-0 border-b-0' : 'overflow-auto'}`}
              >
                <div className={`${width < 1280 ? 'f-container' : ''}`}>
                  {isSearch && (
                    <div>
                      <ChannelSearch />
                    </div>
                  )}
                  <div className={`${!isSearch ? '' : 'hidden'}`}>
                    <ChannelTabs />
                  </div>
                </div>
              </div>
              {/* List items */}
              <div className="ChannelsByGroup f-container mt-[21px] xl:mt-[32px]">
                {isSearch ? (
                  <>
                    {channelsBySearchKey && channelsBySearchKey.length > 0 && (
                      <ChannelsByGroup channels={channelsBySearchKeyShown} />
                    )}

                    {/* Only show empty search result if searchKey is not empty */}
                    {searchKey && channelsBySearchKeyShown?.length === 0 ? (
                      <div className="flex flex-col gap-[16px] items-center mt-[8px] mb-[40px] tablet:mb-[60px] xl:mb-[432px]">
                        <img
                          src="/images/empty_search.png"
                          alt="empty search"
                          width={260}
                          height={179}
                        />
                        <p className="text-white-smoke text-[18px] leading-[130%] tracking-[0.36px]">
                          Không có kết quả tìm kiếm
                        </p>
                      </div>
                    ) : (
                      ''
                    )}
                  </>
                ) : (
                  <>
                    {selectedGroup?.type === 'highlight' && (
                      <div className="grid grid-cols-2 tablet:grid-cols-4 xl:grid-cols-6 gap-x-[13px] gap-y-[24px] xl:gap-x-[16px] xl:gap-y-[48px]">
                        {blockSlideItems &&
                          blockSlideItems.length > 0 &&
                          blockSlideItems.map((item, index) => (
                            <div
                              key={index}
                              className="ease-out duration-300 hover:scale-[1.05]"
                            >
                              <BlockSlideItem
                                block={selectedGroup as BlockItemType}
                                slide={item}
                                index={index}
                              />
                            </div>
                          ))}
                      </div>
                    )}
                    {channelsBySelectedGroup &&
                      channelsBySelectedGroup.length > 0 && (
                        <ChannelsByGroup channels={channelsBySelectedGroup} />
                      )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DefaultLayout>
    </ChannelPageContext.Provider>
  );
}

export default function ChannelPage() {
  return (
    <PlayerPageContextWrapper>
      <ChannelPageContent />
    </PlayerPageContextWrapper>
  );
}

export const getServerSideProps = (async (context) => {
  const { id } = context.params as { id: string };

  const seoProps = await createSeoPropsFromMeta({
    pageId: id,
    fallbackTitle: 'FPT Play - Xem Truyền Hình | TV Online Chất Lượng Cao',
    fallbackDescription:
      'Xem truyền hình trực tuyến chất lượng cao trên FPT Play - Hàng trăm kênh TV trong nước và quốc tế, cập nhật 24/7.',
    pathPrefix: '/xem-truyen-hinh',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
