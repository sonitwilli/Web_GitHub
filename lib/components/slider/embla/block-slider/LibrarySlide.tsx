import React, { useState, useEffect, useCallback } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import {
  BlockItemType,
  BlockSlideItemType,
  BlockMetaType,
} from '@/lib/api/blocks';
import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from '@/lib/components/slider/embla/top-slider/EmblaCarouselArrowButtons';
import LibrarySlideItem from './LibrarySlideItem';
import { useRouter } from 'next/router';
import { useDeleteDataBlock } from '@/lib/hooks/useLibraryDelete';
import NoData from '@/lib/components/empty-data/NoData';
import { FOLLOWING } from '@/lib/constant/texts';

type PropType = {
  children?: React.ReactNode;
  options?: EmblaOptionsType;
  block?: BlockItemType;
  slidesItems?: BlockSlideItemType[];
  slideClassName?: string;
  blockMeta?: BlockMetaType;
  reloadData?: () => void;
};

interface LibraryContextType {
  imageHeight?: number;
  changeImageHeight?: (n: number) => void;
}

export const LibraryContext = React.createContext<LibraryContextType>({
  imageHeight: 0,
  changeImageHeight: () => {},
});

const LibrarySlide: React.FC<PropType> = (props) => {
  const { slidesItems, slideClassName, block, blockMeta, reloadData } = props;
  const [imageHeight, setImageHeight] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [checkedSlides, setCheckedSlides] = useState<boolean[]>(
    slidesItems ? new Array(slidesItems.length).fill(false) : [],
  );
  const { deleteData, response } = useDeleteDataBlock();

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    slidesToScroll: 3,
    dragFree: true,
    align: 'start',
  });
  const router = useRouter();
  const queryId =
    typeof router.query.id === 'string' ? router.query.id : undefined;

  useEffect(() => {}, [selectedIndex]);

  // Callback xử lý khi checkbox thay đổi
  const handleCheckboxChange = useCallback(
    (index: number, checked: boolean) => {
      setCheckedSlides((prev) => {
        const newCheckedSlides = [...prev];
        newCheckedSlides[index] = checked;
        return newCheckedSlides;
      });
    },
    [],
  );

  // Xử lý chọn tất cả
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setCheckedSlides(new Array(slidesItems?.length || 0).fill(checked));
  };

  // Xử lý xóa (simulated)
  const handleDelete = async () => {
    // In a real app, call an API to delete items here
    setIsSelectionMode(false);
    await deleteData?.(block?.type);
    setIsModal(false);
  };

  useEffect(
    () => {
      if (response) {
        const { data } = response;
        if (data?.status === '0') return;
        reloadData?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [response],
  );

  useEffect(() => {
    // Reset checked slides when selection mode is toggled off
    if (!isSelectionMode) {
      setCheckedSlides(new Array(slidesItems?.length || 0).fill(false));
    }
  }, [isSelectionMode, slidesItems]);

  // Xử lý hủy
  const handleCancel = () => {
    setIsSelectionMode(false);
  };

  // Toggle selection mode
  // const toggleSelectionMode = () => {
  //   setIsSelectionMode(!isSelectionMode);
  //   setCheckedSlides(new Array(slidesItems?.length || 0).fill(false));
  // };

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, setSelectedIndex]);

  const selectAllChecked =
    checkedSlides?.length === slidesItems?.length &&
    checkedSlides.every((checked) => checked);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaMainApi);

  if (slidesItems?.length === 0 && queryId) {
    return <NoData />;
  }

  return (
    <LibraryContext.Provider
      value={{
        imageHeight,
        changeImageHeight: (n: number) => setImageHeight(n),
      }}
    >
      <div className={`block-slider ${slideClassName}`}>
        {/* Selection controls */}
        {slidesItems && slidesItems.length > 0 && (
          <div className="flex items-center gap-2 mb-6 absolute top-[-10px] right-0">
            {!isSelectionMode && queryId && (
              // <button
              //   onClick={toggleSelectionMode}
              //   className="px-4 py-[10px] text-[16px] font-semibold leading-[1.3] text-white-smoke bg-charleston-green rounded-[40px]"
              // >
              //   Chọn nội dung để xóa
              // </button>
              <button
                onClick={() => setIsModal(true)}
                className="px-4 py-[10px] cursor-pointer text-[16px] font-semibold leading-[1.3] text-white-smoke bg-charleston-green rounded-[40px]"
              >
                Xóa tất cả
              </button>
            )}

            {isSelectionMode && (
              <>
                <label className="flex items-center text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAll}
                    className="opacity-0 absolute w-0 h-0"
                    aria-label="Select all slides"
                  />
                  <span
                    className={`w-[18px] h-[18px] rounded-[3px] mr-2 border flex items-center justify-center transition-all duration-200
                      ${
                        selectAllChecked
                          ? 'bg-fpl border-fpl'
                          : 'bg-transparent'
                      }`}
                  >
                    {selectAllChecked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  Chọn tất cả
                </label>
                <button
                  onClick={handleDelete}
                  disabled={!selectAllChecked}
                  className={`px-4 py-[10px] text-[16px] font-semibold leading-[1.3] rounded-[40px] ${
                    checkedSlides?.length > 0 && checkedSlides?.includes(true)
                      ? 'bg-fpl text-white-smoke'
                      : 'bg-eerie-black text-davys-grey'
                  }`}
                >
                  Xóa
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-[10px] text-[16px] font-semibold leading-[1.3] text-white-smoke bg-charleston-green rounded-[40px]"
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        )}
        <div className="embla library">
          <div
            className="embla__viewport px-0 sm:px-[16px] py-[16px] pb-0"
            ref={emblaMainRef}
          >
            <div
              className={`embla__container ${
                queryId
                  ? '!grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-[26px] sm:gap-y-[48px]'
                  : ''
              }`}
            >
              {slidesItems?.map((slide, index) => (
                <LibrarySlideItem
                  key={index}
                  block={block}
                  slide={slide}
                  index={index}
                  isChecked={checkedSlides[index]}
                  onCheckboxChange={handleCheckboxChange}
                  isSelectionMode={isSelectionMode} // Pass selection mode to control checkbox visibility
                />
              ))}
            </div>
          </div>
          <div
            className={`block-slider-arrow hidden xl:flex items-center justify-center text-[rgba(255,255,255,0.3)] hover:text-white hover:cursor-pointer duration-400 absolute top-0 -left-[50px] -translate-y-1/2 ${
              queryId || prevBtnDisabled ? '!hidden' : ''
            }`}
            style={{
              marginTop: `${imageHeight / 2 + 16}px`,
            }}
          >
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
          </div>

          <div
            className={`block-slider-arrow hidden xl:flex items-center justify-center text-[rgba(255,255,255,0.3)] hover:text-white hover:cursor-pointer duration-400 absolute top-0 -right-[50px] -translate-y-1/2 ${
              queryId || nextBtnDisabled  ? '!hidden' : ''
            }`}
            style={{
              marginTop: `${imageHeight / 2 + 16}px`,
            }}
          >
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={isModal}
        onHidden={() => setIsModal(false)}
        modalContent={{
          title:
            blockMeta?.name === FOLLOWING
              ? blockMeta?.btn_info?.popup_info?.title ||
                'Xóa nội dung theo dõi'
              : blockMeta?.btn_info?.popup_info?.title || 'Xóa lịch sử xem',
          content:
            blockMeta?.name === FOLLOWING
              ? blockMeta?.btn_info?.popup_info?.description ||
                'Bạn muốn xóa vĩnh viễn nội dung theo dõi của hồ sơ này? Các thông tin sau khi bị xóa sẽ không thể khôi phục lại'
              : blockMeta?.btn_info?.popup_info?.description ||
                'Bạn muốn xóa vĩnh viễn lịch sử xem của hồ sơ này? Các thông tin sau khi bị xóa sẽ không thể khôi phục lại',
          buttons: {
            cancel: 'Đóng',
            accept: 'Xóa',
          },
        }}
        onSubmit={() => handleDelete()}
        onCancel={() => setIsModal(false)}
      />
    </LibraryContext.Provider>
  );
};

export default LibrarySlide;
