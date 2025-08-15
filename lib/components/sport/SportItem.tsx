import { FC, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MetaData,
  Match,
  BlockSlideItemType,
  RankingItem,
} from '@/lib/api/blocks';
import LeagueDetail from '@/lib/components/sport/League';
import TableResult from '@/lib/components/sport/TableLeagueResult';
import { viToEn } from '@/lib/utils/methods';
import {
  MATCH_RANKING,
  TABLE_LEAGUE_DETAIL,
  NONE_SPORT,
} from '@/lib/constant/texts';

interface GroupDataMenu {
  date?: string;
  title?: string;
}
interface HighlightBlock {
  id?: string | number;
  name?: string;
  type?: string;
  block_type?: string;
  custom_data?: string;
  list_items?: BlockSlideItemType[] | BlockSlideItemType[][];
  date?: string;
}

interface SportItemProps {
  data?: BlockSlideItemType;
  pageType?: string | number;
  height?: string;
  tagSelect?: string;
  showAllMatches?: boolean;
  groupDataMenu?: GroupDataMenu[];
  getMetaData?: MetaData;
  getAllBlocksCategoriesData?: HighlightBlock[];
  onAddHashToLocation?: (id: string) => void;
  onChangeTagSelected?: (value: string) => void;
}

// Component chính
const SportItem: FC<SportItemProps> = ({
  data,
  height = '',
  pageType = '',
  tagSelect = '',
  showAllMatches = false,
  groupDataMenu = [],
  getMetaData,
  getAllBlocksCategoriesData = [],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();
  const initKey = Date.now();
  const permissionShow = [MATCH_RANKING, TABLE_LEAGUE_DETAIL];
  const sportItemRef = useRef<HTMLDivElement>(null);

  // Tính toán leagueLogo
  const leagueLogo =
    (getAllBlocksCategoriesData[0]?.list_items?.[0] as BlockSlideItemType)
      ?.league?.image || '';

  // Tính toán tabName
  const tabName = (() => {
    if (data?.title) return data?.title;
    if (tagSelect) {
      const found = Array.isArray(groupDataMenu)
        ? groupDataMenu.find((item) => item.date === tagSelect)
        : null;
      return found?.title || 'Kết quả';
    }
    return 'Kết quả';
  })();

  // Tính toán dataListRender
  const dataListRender = tagSelect
    ? data
    : (data?.league?.matches || []).filter((_, index: number) => index < 5);

  // Tính toán finalDataRenderring
  const finalDataRenderring =
    Array.isArray(dataListRender) && dataListRender?.length > 0
      ? dataListRender[dataListRender?.length - 1]
      : null;

  // Kiểm tra hasMore
  const hasMore =
    ((Array.isArray(data?.league?.matches) &&
      data?.league?.matches?.length > 5) ||
      (Array.isArray(data?.league?.ranking) &&
        data?.league?.ranking?.length > 5)) ??
    false;

  // Xử lý load more
  const handleLoadMoreOld = (data: BlockSlideItemType) => {
    if (permissionShow.includes(data?.type ?? '')) {
      setIsCollapsed(!isCollapsed);
    } else {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, tab: viToEn(data?.title ?? '') },
        },
        undefined,
        { shallow: true },
      );
    }
  };

  useEffect(() => {
    if (height !== '0px' && sportItemRef.current && pageType !== NONE_SPORT) {
      sportItemRef.current.style.minHeight = height;
    } else if (sportItemRef.current) {
      sportItemRef.current.style.minHeight = 'auto';
    }
  }, [height, pageType, tagSelect]);

  return (
    <div
      ref={sportItemRef}
      className={`mr-3 flex flex-col justify-between ${
        pageType === 'sport'
          ? 'h-[500px] bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black rounded-lg'
          : ''
      } ${!tagSelect && pageType !== 'sport' ? 'w-full' : ''}`}
    >
      <div className="flex flex-col flex-1">
        {data?.type === TABLE_LEAGUE_DETAIL ? (
          <div className="flex items-center justify-between p-2">
            <div className="pt-3 pb-3 font-semibold text-2xl leading-7 text-white">
              {data?.league?.name}
            </div>
            {data?.league?.image && data?.league.image !== 'None' && (
              <img
                src={data?.league.image}
                alt={data?.league.name || 'League Logo'}
                className="w-[40px] h-[40px]"
              />
            )}
          </div>
        ) : (
          data?.league && (
            <div className="py-3 font-semibold text-2xl text-white">
              {data?.league.name}
            </div>
          )
        )}

        {data && (
          <div className="flex-1 bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black rounded-lg">
            {/* Lịch chiếu & kết quả */}
            {Array.isArray(data?.league?.matches) &&
              data?.league?.matches?.length > 0 && (
                <div className={isCollapsed ? '' : 'h-[80%]'}>
                  {data?.league.matches.map((itemRow: Match, index: number) => (
                    <div
                      key={index}
                      className={
                        (!showAllMatches &&
                          ((index >= 6 && !isCollapsed) || index < 5)) ||
                        showAllMatches
                          ? ''
                          : 'hidden'
                      }
                    >
                      <LeagueDetail
                        typeLeague={data?.type}
                        data={itemRow}
                        leagueLogo={leagueLogo}
                        noMarginBottom={itemRow?.id === finalDataRenderring?.id}
                        preRoundName={
                          index > 0
                            ? data?.league?.matches?.[index - 1]?.round_name
                            : ''
                        }
                        preMatchDate={
                          index > 0
                            ? data?.league?.matches?.[index - 1]?.match_date
                            : ''
                        }
                        className="bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black"
                      />
                    </div>
                  ))}
                </div>
              )}

            {/* Bảng xếp hạng */}
            {Array.isArray(data?.league?.ranking) &&
              data?.league?.ranking?.length > 0 && (
                <div className={isCollapsed ? '' : 'h-[80%]'}>
                  {data?.league.is_stage === '0' && (
                    <div className="bg-charleston-green rounded-t-lg p-4 flex justify-between items-center h-[56px]">
                      <div className="font-medium text-sm text-white cursor-pointer">
                        {data?.league.right_name || getMetaData?.name}
                      </div>
                      {leagueLogo && leagueLogo !== 'None' && (
                        <img
                          src={leagueLogo}
                          alt={getMetaData?.name || 'League Logo'}
                          className="object-contain w-[40px] h-[40px]"
                        />
                      )}
                    </div>
                  )}
                  {data?.league.ranking.map(
                    (item: RankingItem, index: number) => (
                      <div
                        key={index}
                        className={
                          (index >= 5 && !isCollapsed) || index < 6
                            ? ''
                            : 'hidden'
                        }
                      >
                        <TableResult
                          data={item}
                          lastIndex={
                            index === (data?.league?.ranking?.length ?? 0) - 1
                          }
                          idRow={item?.id === 'round_name' ? index + 1 : index}
                          imgLogo={data?.league?.image ?? ''}
                          nameLeague={data?.league ?? null}
                        />
                      </div>
                    ),
                  )}
                </div>
              )}

            {/* Cập nhật sau */}
            {data?.league?.matches?.length === 0 &&
              data?.league?.ranking?.length === 0 && (
                <div>
                  <div className="flex items-center justify-between bg-charleston-green rounded-t-lg p-2">
                    <div className="hidden">
                      {data?.league?.right_name || getMetaData?.name}
                    </div>
                    <div></div>
                    {leagueLogo && leagueLogo !== 'None' && (
                      <img
                        src={leagueLogo}
                        alt={getMetaData?.name || 'League Logo'}
                        className="object-contain w-[40px] h-[40px]"
                      />
                    )}
                  </div>
                  <div className="bg-gradient-to-b from-black-035 pt-[56px] pb-[233px] to-black-035 bg-raisin-black text-center text-white rounded-b-lg">
                    {data?.league.name} đang được cập nhật
                  </div>
                </div>
              )}

            {/* Cập nhật sau */}
            {data?.length === 0 && (
              <div>
                <div className="flex items-center justify-between bg-charleston-green rounded-t-lg p-2">
                  <div className="hidden"></div>
                  <div></div>
                  {leagueLogo && leagueLogo !== 'None' && (
                    <img
                      src={leagueLogo}
                      alt={getMetaData?.name || 'League Logo'}
                      className="object-contain w-[40px] h-[40px]"
                    />
                  )}
                </div>
                <div className="bg-gradient-to-b from-black-035 pt-[56px] pb-[233px] to-black-035 bg-raisin-black text-center text-white rounded-b-lg">
                  {tabName} đang được cập nhật
                </div>
              </div>
            )}

            {/* Lịch thi đấu theo ngày */}
            {Array.isArray(data) && data?.length > 0 && (
              <div>
                {data?.map((itemRow: Match, index: number) => (
                  <LeagueDetail
                    key={`${initKey}-${Math.round(Math.random() * 99999)}`}
                    noMarginBottom={itemRow?.id === finalDataRenderring?.id}
                    data={itemRow}
                    leagueLogo={leagueLogo}
                    lastIndex={index === data?.length - 1}
                    className="bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black"
                    preRoundName={index > 0 ? data[index - 1].round_name : ''}
                    preMatchDate={index > 0 ? data[index - 1].match_date : ''}
                  />
                ))}
              </div>
            )}

            {(Array.isArray(data) && data?.length === 0) ||
              (!data && (
                <div>
                  <div className="flex items-center justify-between bg-charleston-green rounded-t-lg p-2">
                    <div className="hidden">League</div>
                    {leagueLogo && leagueLogo !== 'None' && (
                      <img
                        src={leagueLogo}
                        alt="League Logo"
                        className="object-contain w-[40px] h-[40px]"
                      />
                    )}
                  </div>
                  <div className="bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black py-14 text-center text-white rounded-b-lg">
                    {tabName} đang được cập nhật
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !showAllMatches && data && (
        <div
          className="bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black rounded-lg py-4 text-center text-white mt-2 cursor-pointer text-sm"
          onClick={() => handleLoadMoreOld(data)}
        >
          {isCollapsed ? 'Xem thêm' : 'Ẩn bớt'}
        </div>
      )}
    </div>
  );
};

export default SportItem;
