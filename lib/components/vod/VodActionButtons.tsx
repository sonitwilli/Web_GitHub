import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Link from 'next/link';
import LikeReaction from '../reaction/LikeReaction';
import useReaction from '@/lib/hooks/useReaction';
import ShareReaction from '../reaction/ShareReaction';
import useModalToggle from '@/lib/hooks/useModalToggle';
import { MdOutlineVolumeUp } from 'react-icons/md';
import { MdOutlineVolumeOff } from 'react-icons/md';
import ModalShare from '../modal/ModalShare';

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
  const { isLiked, handleReaction } = useReaction({ slide });
  const { showModalShare, setShowModalShare } = useModalToggle({
    block,
    slide,
  });
  return (
    <div>
      <div className="flex items-center gap-[16px]">
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

        {/* TODO: lắng nghe từ firebase để biết isActive hay không */}
        <LikeReaction isActive={isLiked} onClick={handleReaction} type={type} />

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
