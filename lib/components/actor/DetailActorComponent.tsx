import { fetchDataActorBlock, fetchDataActorVideo } from '@/lib/api/actor';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import HandleLongText from './HandleLongText';
import HandleImage from '../slider/HandleImage';
const BlockSlideItem = dynamic(() => import('../slider/BlockSlideItem'), {
  ssr: false,
});

type ActorDetail = {
  image?: {
    portrait?: string;
  };
  description?: string;
  title?: string;
  blocks?: BlockItemType[];
};

const DetailActorComponent = () => {
  const router = useRouter();
  const rawId = router.query.id as string;
  const id = rawId?.split('-').pop();
  const [data, setData] = useState<ActorDetail>();
  const [listVideo, setListVideo] = useState<BlockSlideItemType[]>();
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(true);
  const [isLoadingActor, setIsLoadingActor] = useState(true);

  const fetchDataDetailActor = async () => {
    if (id) {
      try {
        const res = await fetchDataActorBlock(id as string);
        setData(res?.data?.data ?? undefined);
      } catch {
        return null;
      } finally {
        setIsLoadingActor(false);
      }
    }
  };

  useEffect(() => {
    if (!id) return;
    setIsLoadingActor(true);
    fetchDataDetailActor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const blockId = data?.blocks?.length ? data.blocks[0].id : undefined;

  const fetchDataVideo = async () => {
    if (blockId) {
      try {
        const res = await fetchDataActorVideo(blockId);
        setListVideo(res?.data?.data.videos ?? undefined);
      } catch {
        return null;
      } finally {
        setIsLoadingVideo(false);
      }
    }
  };

  useEffect(() => {
    if (blockId) {
      setIsLoadingVideo(true);
      fetchDataVideo();
    } else if (!isLoadingActor) {
      setIsLoadingVideo(false);
      setListVideo(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId, isLoadingActor]);

  return (
    <div className="flex flex-col items-center justify-center mx-5 sm:mx-15 xl:mx-26 h-auto mt-20 ">
      <div className="w-full py-[20px] xl:py-[104px] ">
        {/* Thông tin diễn viên */}
        <div className="flex flex-col sm:flex-row mb-[40px] xl:mb-[90px] gap-10">
          <div className="w-[120px] h-[120px] sm:min-w-[180px] sm:h-[180px] rounded-full overflow-hidden">
            <HandleImage
              imageUrl={data?.image?.portrait}
              type="circle"
              imageAlt="avatar-actor"
              imageClassName="object-cover w-full h-full"
              blockDirection={'circle'}
            />
          </div>
          <div
            className={`flex flex-col gap-1 ${
              data?.description ? '' : 'justify-center'
            }`}
          >
            <div className="text-3xl sm:text-5xl font-semibold leading-[130%] tracking-[0.96px]">
              {data?.title}
            </div>

            <HandleLongText
              text={data?.description}
              className="max-w-[916px]"
            />
          </div>
        </div>
        {/* Danh sách video */}
        <div className="text-[28px] font-semibold mb-6">
          {data?.blocks?.[0].name}
        </div>
        <div className="flex w-full flex-wrap gap-x-[2%] md:gap-x-[0.9%] gap-y-10">
          {!isLoadingVideo && listVideo && listVideo.length > 0
            ? listVideo.map((video, index) => (
                <div
                  key={index}
                  className="w-[48%] md:w-[24%] xl:w-[15.9%] transition-transform duration-300 hover:scale-105"
                >
                  <BlockSlideItem
                    slide={video}
                    index={index}
                    block={{ block_type: 'horizontal_slider' }}
                  />
                </div>
              ))
            : !isLoadingVideo && (
                <div className="w-full flex flex-col items-center justify-center py-[40px]">
                  <Image
                    src={'/images/EmptyData.png'}
                    width={260}
                    height={178}
                    alt="empty-data"
                  />
                  <span className="text-[18px] text-white-smoke">
                    Không tải được dữ liệu
                  </span>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default DetailActorComponent;
