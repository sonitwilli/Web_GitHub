import {
  BlockItemResponseType,
  BlockItemType,
  BlockSlideItemType,
} from '@/lib/api/blocks';
import Link from 'next/link';
import EmblaBlockSlideItem from '@/lib/components/slider/embla/block-slider/EmblaBlockSlideItem';
import { useMemo, useRef } from 'react';
import { scaleImageUrl } from '@/lib/utils/methods';
import { IoChevronForward } from 'react-icons/io5';

type PropType = {
  children?: React.ReactNode;
  block?: BlockItemType;
  slidesItems?: BlockSlideItemType[];
  slideClassName?: string;
  blockData?: BlockItemResponseType;
  linkMore?: string;
};

export default function BlockHorizontalWithTitle({
  blockData,
  block,
  linkMore,
  slidesItems,
}: PropType) {
  const renderedSlides = useMemo(() => {
    return slidesItems?.slice(0, 10);
  }, [slidesItems]);

  const imgRef = useRef<HTMLImageElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="f-container horizontal_banner_with_title">
      <div className="xl:grid xl:grid-cols-[auto_auto] xl:gap-[16px]">
        <div className="flex items-center mb-[16px] gap-[16px] xl:hidden">
          <h2 className="text-[20px] 2xl:text-[24px] font-[700] text-white-smoke capitalize">
            {blockData?.data?.length
              ? blockData?.meta?.name || block?.name
              : ''}
          </h2>

          {blockData?.data && blockData?.data?.length > 0 ? (
            <Link
              href={linkMore || '#'}
              prefetch={false}
              className="text-[14px]"
              title={block?.name}
            >
              <img
                src="/images/view_more.png"
                alt="view more"
                className="w-[32px] h-[32px] min-w-[32px]"
              />
            </Link>
          ) : (
            ''
          )}
        </div>

        <div className="hidden xl:block relative" ref={imgContainerRef}>
          <img
            ref={imgRef}
            src={scaleImageUrl({
              imageUrl:
                block?.background_image?.web ||
                '/images/default-poster-vertical.jpg',
            })}
            alt={block?.name}
            className="images/default-poster-vertical.jpg w-[225px] 2xl:w-[272px] aspect-[272/454] rounded-[16px]"
          />

          <div className="absolute bottom-[40px] left-0 px-[16px] w-full">
            <h2 className="text-[20px] 2xl:text-[32px] font-[900] text-white-smoke line-clamp-2 break-words">
              {blockData?.data?.length
                ? blockData?.meta?.name || block?.name
                : ''}
            </h2>
            <Link
              href={linkMore || '#'}
              prefetch={false}
              className="text-[14px] text-smoky-black bg-white leading-[130%] px-[12px] py-[6px] rounded-[20px] inline-flex items-center gap-[4px] mt-[24px] hover:text-fpl ease-out duration-300"
              title={block?.name}
            >
              <span>Xem thêm</span>
              <IoChevronForward size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-[16px] gap-y-[10px] grid-rows-[1fr_auto] ">
          {renderedSlides?.map((slide, index) => (
            <EmblaBlockSlideItem
              key={index}
              block={block}
              slide={slide}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
