import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Link from 'next/link';
import LikeReaction from '../reaction/LikeReaction';
import useReaction from '@/lib/hooks/useReaction';
import ShareReaction from '../reaction/ShareReaction';
import useModalToggle from '@/lib/hooks/useModalToggle';
import { MdOutlineVolumeUp } from 'react-icons/md';
import { MdOutlineVolumeOff } from 'react-icons/md';
import ModalShare from '../modal/ModalShare';
import { useMemo } from 'react';
import { IoNotifications } from 'react-icons/io5';
import { BiSolidBellOff } from 'react-icons/bi';
import { viToEn } from '@/lib/utils/methods';
import { trackingStoreKey } from '@/lib/constant/tracking';

export type ActionType = 'top-slide' | 'block-slide' | 'hovered-slide';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  slideLink?: string;
  type?: ActionType;
  onClickVolume?: () => void;
  isMuted?: boolean;
}

export default function VodActionButtons({
  block,
  slide,
  slideLink,
  type,
  onClickVolume,
  isMuted,
}: Props) {
  const { isLiked, handleReaction } = useReaction({ slide, block });
  const { showModalShare, setShowModalShare } = useModalToggle({
    block,
    slide,
  });

  const isComingSoon = useMemo(() => {
    const byFlag = String(slide?.is_coming_soon) === '1';
    const byBlockName = viToEn(block?.name || '').includes('sap-cong-chieu');
    return byFlag || byBlockName;
  }, [slide?.is_coming_soon, block?.name]);

  return (
    <div>
      <div className="flex items-center gap-[16px]">
        {isComingSoon ? (
          <div
            className={`${
              type === 'hovered-slide' ? 'flex-1' : ''
            } mr-[8px] tablet:mr-[32px]`}
          >
            <button
              aria-label="schedule"
              onClick={handleReaction}
              className={`inline-flex items-center justify-center w-[146px] md:w-[150px] xl:w-[171px] font-[500] gap-[8px] rounded-[40px] bg-linear-to-r from-portland-orange to-lust hover:to-portland-orange ease-out duration-300 ${
                type !== 'hovered-slide'
                  ? 'px-[16px] h-[36px] tablet:h-auto py-[8px] xl:px-[24px] xl:pr-[29px] xl:py-[12px] text-[16px]'
                  : 'w-[138px] h-[40px] px-[16px]'
              }`}
            >
              {isLiked ? (
                <>
                  <BiSolidBellOff
                    style={{ transform: 'scaleX(-1)' }}
                    className="text-[20px] tablet:text-[24px]"
                  />
                  <span>Hủy đặt lịch</span>
                </>
              ) : (
                <>
                  <IoNotifications className="text-[20px] tablet:text-[24px]" />
                  <span>Đặt lịch</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div
            className={`${
              type === 'hovered-slide' ? 'flex-1' : ''
            } mr-[8px] tablet:mr-[32px]`}
          >
            <Link
              prefetch={false}
              href={slideLink || ''}
              className={`inline-flex items-center font-[500] gap-[8px] rounded-[40px] bg-linear-to-r from-portland-orange to-lust hover:to-portland-orange ease-out duration-300 ${
                type !== 'hovered-slide'
                  ? 'px-[16px] h-[36px] tablet:h-auto py-[8px] xl:px-[24px] xl:pr-[29px] xl:py-[12px] text-[16px]'
                  : 'w-[138px] h-[40px] px-[16px]'
              }`}
              onClick={() => {
                sessionStorage.setItem(
                  trackingStoreKey.APP_MODULE_SCREEN,
                  block?.block_type || '',
                );
                sessionStorage.setItem(
                  trackingStoreKey.APP_MODULE_SUBMENU_ID,
                  block?.name || '',
                );
                sessionStorage.setItem(
                  trackingStoreKey.IS_RECOMMEND_ITEM,
                  slide?.is_recommend ? '1' : '0',
                );
              }}
            >
              <img
                src="/images/xem_ngay.png"
                alt="play"
                width={24}
                height={24}
                className="w-[20px] h-[20px] tablet:w-[24px] tablet:h-[24px]"
              />
              <span className="">Xem ngay</span>
            </Link>
          </div>
        )}

        {block?.block_type !== 'auto_expansion' && (
          <LikeReaction
            isActive={isLiked}
            onClick={handleReaction}
            type={type}
          />
        )}

        <ShareReaction onClick={() => setShowModalShare(true)} type={type} />

        {type === 'top-slide' && slide?.trailer_info?.url && (
          <>
            <img
              src="/images/vertical_line.png"
              alt="vertical line"
              className="h-[30px] w-[2px]"
            />

            <button
              aria-label="volume"
              onClick={() => {
                if (onClickVolume) {
                  onClickVolume();
                }
              }}
              className="hover:cursor-pointer"
            >
              {isMuted ? (
                <MdOutlineVolumeOff className="text-[30px]" />
              ) : (
                <MdOutlineVolumeUp className="text-[30px]" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Modal share */}
      {showModalShare && (
        <ModalShare
          open={showModalShare}
          onClose={() => setShowModalShare(false)}
          block={block}
          slide={slide}
        />
      )}
    </div>
  );
}