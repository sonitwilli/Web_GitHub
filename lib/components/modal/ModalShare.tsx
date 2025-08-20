import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { createLink } from '@/lib/utils/methods';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import { ChannelDetailType } from '@/lib/api/channel';
import { useAppSelector } from '@/lib/store';

const ModalWrapper = dynamic(
  () => import('@/lib/components/modal/ModalWrapper'),
  {
    ssr: false,
  },
);
interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
  open?: boolean;
  onClose?: () => void;
  dataChannel?: ChannelDetailType;
  isChannel?: boolean;
  isUseRouteLink?: boolean;
}

export default function ModalShare({
  open,
  onClose,
  isChannel,
  dataChannel,
  isUseRouteLink,
}: Props) {
  const { sharedBlock: block, sharedSlideItem: slide } = useAppSelector(
    (s) => s.app,
  );
  const router = useRouter();
  const linkShare = useMemo(() => {
    if (isUseRouteLink && typeof window !== 'undefined') {
      return `${process.env.NEXT_PUBLIC_BASE_URL}${window.location.pathname}`;
    }
    if (isChannel && dataChannel) {
      return `${process.env.NEXT_PUBLIC_BASE_URL}/xem-truyen-hinh/${dataChannel?._id}`;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL}${createLink({
      data: slide || {},
      type: block?.type || '',
    })}`;
  }, [slide, block, dataChannel, isChannel, isUseRouteLink]);

  const link = useMemo(() => {
    return linkShare || process.env.BASE_URL + `${router.pathname}`;
  }, [router, linkShare]);

  const socialList = useMemo(() => {
    return [
      {
        title: 'Facebook',
        value: 'facebook',
        avatar: '/images/share-link/Facebook.png',
        to: `https://www.facebook.com/sharer/sharer.php?u=${linkShare || link}`,
      },
      {
        title: 'Twitter',
        value: 'twitter',
        avatar: '/images/share-link/X.png',
        to: `https://twitter.com/share?url=${linkShare || link}`,
      },
      {
        title: 'Pinterest',
        value: 'pinterest',
        avatar: '/images/share-link/Pinterest.png',
        to: `https://pinterest.com/pin/create/link/?url=${linkShare || link}`,
      },
      {
        title: 'Gửi email',
        value: 'email',
        avatar: '/images/share-link/Email.png',
        to: `mailto:?body=${linkShare || link}`,
      },
      {
        title: 'Blogger',
        value: 'blogger',
        avatar: '/images/share-link/Blogger.png',
        to: `https://www.blogger.com/blog-this.g?n=${linkShare || link}&n=${
          slide?.title_vie || slide?.title
        }&t=${slide?.detail?.description}`,
      },
    ];
  }, [link, linkShare, slide]);

  return (
    <ModalWrapper
      open={!!open}
      overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]"
      contentClassName="bg-eerie-black p-[32px] rounded-[16px] w-[95%] max-w-[480px] relative"
      onHidden={onClose}
      shouldCloseOnOverlayClick
    >
      <button
        aria-label="close modal share"
        className="absolute top-[16px] right-[16px] text-spanish-gray hover:cursor-pointer hover:text-fpl"
        onClick={onClose}
      >
        <IoMdClose size={24} />
      </button>

      <div className="w-full  ">
        <div className="text-center font-[500] text-[20px] mb-[24px]">
          Chia sẻ
        </div>
        <div className="flex gap-[16px] mb-[32px] justify-around">
          {socialList?.map((sc, index) => (
            <a href={sc.to} key={index} target="_blank">
              <img
                src={sc.avatar}
                alt={sc.title}
                className="h-[52px] sm:h-[72px]"
                loading="lazy"
              />
            </a>
          ))}
        </div>
        <div className="bg-smoky-black h-[48px] w-full rounded-[8px] flex items-center px-[12px] relative">
          <div className="text-spanish-gray flex-1 min-w-0 truncate pr-[95px]">
            {linkShare || link}
          </div>

          <button
            aria-label="copy link"
            className="absolute top-1/2 -translate-y-1/2 right-[12px] text-white fpl-bg h-[32px] px-[12px] rounded-[40px] hover:cursor-pointer"
            onClick={() => {
              copy(linkShare);
            }}
          >
            Sao chép
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}