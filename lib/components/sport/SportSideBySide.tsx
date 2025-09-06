// components/SportSideBySide.tsx
import { FC, useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  BlockSlideItemType,
  BlockItemResponseType,
  BlockItemType,
} from '@/lib/api/blocks';
import SportItem from './SportItem';
import { useRouter } from 'next/router';
import { SPORT, SPORT_SIDEBYSIDE } from '@/lib/constant/texts';
import { useTableDetailData } from '@/lib/hooks/useTableDetailData';
import useEmblaCarousel from 'embla-carousel-react';
import {
  usePrevNextButtons,
  PrevButton,
  NextButton,
} from '@/lib/components/slider/embla/top-slider/EmblaCarouselArrowButtons';

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

interface GroupDataMenu {
  date?: string;
  title?: string;
}

interface SportSideBySideProps {
  data?: BlockItemType;
  blockData?: BlockItemResponseType;
  showAllMatches?: boolean;
  onAddHashToLocation?: (id: string) => void;
}

const SportSideBySide: FC<SportSideBySideProps> = ({
  data,
  blockData,
  showAllMatches = false,
  onAddHashToLocation,
}) => {
  const [groupDataMenu] = useState<GroupDataMenu[]>([
    {
      date: 'tat-ca',
      title: 'Tất cả',
    },
    {
      date: 'lich-dau',
      title: 'Lịch thi đấu',
    },
    {
      date: 'ket-qua',
      title: 'Kết quả',
    },
  ]);

  const [blockSport, setBlockSport] = useState<HighlightBlock>({
    id: data?.id ?? '',
    name: data?.name ?? '',
    type: data?.type ?? '',
    block_type: data?.block_type ?? '',
    list_items: blockData?.data,
    custom_data: data?.custom_data,
  });
  const memoizedData = useMemo(
    () => blockSport,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.id, data?.name, data?.type, data?.block_type],
  );

  const router = useRouter();
  const { tab } = router.query; // Lấy id và tab từ query

  const [initKey, setInitKey] = useState(Date.now());
  const [tagSelect, setTagSelect] = useState<string>(
    (tab as string) || 'tat-ca',
  ); // Khởi tạo tagSelect từ query
  const {
    data: dataDetail,
    loading,
    error,
  } = useTableDetailData(memoizedData, tagSelect); // Truyền tagSelect
  const sportItemRef = useRef<HTMLDivElement>(null);
  const todayMatchesRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<string>('');

  // Embla carousel setup: align slides to start so first snap shows full slide on initial scroll
  const [emblaRef, emblaApi] = useEmblaCarousel({ skipSnaps: false, align: 'start' });
  // Prev/Next button state management for embla (call hooks unconditionally)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi);

  // Đồng bộ tagSelect với query parameter tab
  useEffect(() => {
    setTagSelect((tab as string) || 'tat-ca');
  }, [tab]);

  // Recalculate embla when slides change to fix initial half-slide visible on iPad
  useEffect(() => {
    if (emblaApi) {
      // reInit will force embla to recalculate sizes and snaps
      try {
        emblaApi.reInit();
      } catch (e) {
        // ignore if embla not ready
      }
    }
  }, [emblaApi, dataDetail?.list_items?.length]);

  useEffect(() => {
    const dataTemp = {
      id: data?.id,
      name: data?.name,
      type: data?.type,
      block_type: data?.block_type,
      list_items: blockData?.data,
      custom_data: data?.custom_data,
    };

    if (data?.block_type === SPORT_SIDEBYSIDE?.[0]) {
      setBlockSport(dataTemp as HighlightBlock);
    }
  }, [
    blockData,
    data?.id,
    data?.name,
    data?.type,
    data?.block_type,
    data?.custom_data,
  ]);

  // Hàm xử lý thay đổi tagSelect
  const onChangeTagSelected = (value: string) => {
    setTagSelect(value);
  };

  useEffect(() => {
    setInitKey(Date.now());
  }, [memoizedData]);

  const groupByRoundName = useMemo(
    () => (item: BlockSlideItemType) => {
      if (memoizedData?.id === 'none_sport' && Array.isArray(item)) {
        const grouped = item.reduce(
          (
            acc: Record<string, BlockSlideItemType[]>,
            curr: BlockSlideItemType,
          ) => {
            const key = curr?.round_name || '';
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
          },
          {},
        );
        return Object.values(grouped).flat() as GroupDataMenu;
      }
      return item;
    },
    [memoizedData?.id],
  );

  const handleTabClick = (tagDate: string) => {
    if (onChangeTagSelected) {
      onChangeTagSelected(tagDate);
    }
    router.replace(
      {
        pathname: `/trang/${data?.id}`,
        query: { tab: tagDate },
      },
      undefined,
      { shallow: true },
    );
  };

  // Xử lý chiều cao (tương tự handleHeight)
  useEffect(() => {
    const refToUse = sportItemRef.current || todayMatchesRef.current;
    if (!refToUse) {
      setHeight(''); // Reset chiều cao nếu không cần
      return;
    }
    const isSport = router.asPath.includes('/sport');
    if (!isSport) {
      const size = refToUse.getBoundingClientRect();
      setHeight(`${size.height}px`);
    }
  }, [data?.type, dataDetail?.id, router.asPath]);

  if (loading) {
    return (
      <div id="sport-side-by-side" className="relative">
        <div className="tabs inline-block mb-4">
          <ul className="flex flex-wrap text-lg pl-0 list-none">
            {groupDataMenu.map((tag, index) => (
              <li key={index} className="">
                <p
                  className={`cursor-pointer py-2 ${
                    tagSelect === tag?.date ||
                    (tagSelect === '' && tag?.date === 'tat-ca')
                      ? 'border-b-4 border-safety-orange text-white font-extrabold text-base leading-[19px] p-0 pb-2 mr-8 mb-[10px]'
                      : 'border-none font-extrabold text-base leading-[19px] text-gray-400 p-0 pb-2 mr-8 mb-[10px]'
                  } hover:text-white`}
                  onClick={() => handleTabClick(tag.date!)}
                >
                  {tag?.title}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Determine slide classes to show 3 per view on wide screens
  const totalSlides = Array.isArray(dataDetail?.list_items)
    ? dataDetail!.list_items!.length
    : 0;
  const isSingle = totalSlides === 1;
  const slideClass = isSingle
    ? 'flex-none w-11/12 sm:w-1/2 lg:w-1/2 xl:w-1/3 px-2'
    : 'flex-none w-full sm:w-1/2 lg:w-1/2 xl:w-1/3 px-2';


  return (
    <div id="sport-side-by-side" className="relative w-full justify-center">
      <div className="tabs inline-block mb-4">
        <ul className="flex flex-wrap text-lg pl-0 list-none">
          {groupDataMenu.map((tag, index) => (
            <li key={index} className="">
              <p
                className={`cursor-pointer py-2 ${
                  tagSelect === tag?.date ||
                  (tagSelect === '' && tag?.date === 'tat-ca')
                    ? 'border-b-4 border-safety-orange text-white font-extrabold text-base leading-[19px] p-0 pb-2 mr-8 mb-[10px]'
                    : 'border-none font-extrabold text-base leading-[19px] text-gray-400 p-0 pb-2 mr-8 mb-[10px]'
                } hover:text-white`}
                onClick={() => handleTabClick(tag.date!)}
              >
                {tag?.title}
              </p>
            </li>
          ))}
        </ul>
      </div>

        
      {Array.isArray(dataDetail?.list_items) &&
        dataDetail?.list_items?.length > 0 &&
        dataDetail?.type === 'table_highlight' && (
          <div className="flex justify-between mb-3">
            <h2 className="text-2xl font-semibold text-white">
              {dataDetail?.name}
            </h2>
          </div>
        )}
      
      <div className="relative">
  {/* Embla viewport */}
  <div
    className="embla overflow-hidden"
    ref={emblaRef as unknown as (el: HTMLDivElement | null) => void}
    style={{ WebkitOverflowScrolling: 'touch' }}
  >
          <div className="embla__container flex -mx-2">
            {Array.isArray(dataDetail?.list_items) &&
              dataDetail?.list_items?.length > 0 &&
              dataDetail?.list_items?.map((item, index) => (
                <div key={`${initKey}-${index}`} className={`${slideClass}`}>
                  <div className="rounded-b-lg" ref={sportItemRef}>
                    <SportItem
                      data={groupByRoundName(item)}
                      pageType={dataDetail?.id}
                      height={height}
                      tagSelect={tagSelect}
                      showAllMatches={showAllMatches}
                      groupDataMenu={groupDataMenu}
                      getAllBlocksCategoriesData={[blockSport]}
                      onAddHashToLocation={onAddHashToLocation}
                      onChangeTagSelected={onChangeTagSelected}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Prev / Next buttons using shared Embla arrow components: render only when useful */}
        {totalSlides > 1 && (
          <>
            {!prevBtnDisabled && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-20 hidden md:block">
                <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
              </div>
            )}
            {!nextBtnDisabled && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-20 hidden md:block">
                <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
              </div>
            )}
          </>
        )}
        
        {dataDetail?.id === SPORT &&
          Array.isArray(dataDetail?.list_items) &&
          dataDetail?.list_items?.length > 0 &&
          dataDetail?.list_items?.length < 3 && (
            <div className="rounded-b-lg">
              <div className="time__table relative min-h-full">
                <Link
                  href={`/trang/${dataDetail?.id}/lich-thi-dau`}
                  className="block"
                >
                  <img
                    src="/images/the-thao/time_table_bg.png"
                    alt="Time Table Background"
                    className="h-[500px] w-[500px] object-cover"
                  />
                  <div className="time__name absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                    <span className="font-semibold text-xl text-white">
                      Lịch thi đấu
                    </span>
                    <div className="icon__bg pl-2">
                      <img
                        src="/images/the-thao/arrow_right.png"
                        alt="Arrow Right"
                        className="h-[20px] w-[20px]"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        
        {dataDetail?.list_items?.length === 0 && (
          <div className={`${slideClass} rounded-b-lg`}>
            <div className="mx-auto">
              <SportItem
                data={dataDetail?.list_items}
                height="auto"
                tagSelect={tagSelect}
                groupDataMenu={groupDataMenu}
                getAllBlocksCategoriesData={[blockSport]}
                onAddHashToLocation={onAddHashToLocation}
                onChangeTagSelected={onChangeTagSelected}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportSideBySide;