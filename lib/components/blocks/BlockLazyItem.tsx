'use client';
import { BlockItemType } from '@/lib/api/blocks';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import BlockPlaceholder from './BlockPlaceholder';
import { TopBannerAds, BottomBannerAds } from '@/lib/components/ads';
const PageBlockItem = dynamic(() => import('./PageBlockItem'), { ssr: false });
interface Props {
  block?: BlockItemType;
  keywordSearch?: string;
  useContainer?: boolean;
  onBlockEmpty?: (isEmpty: boolean) => void;
  isFirstBlock?: boolean;
  isLastBlock?: boolean;
}

export default function BlockLazyItem({
  block,
  keywordSearch,
  useContainer = true,
  onBlockEmpty,
  isFirstBlock = false,
  isLastBlock = false,
}: Props) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    rootMargin: '800px',
  });
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFetchAllCompleted, setIsFetchAllCompleted] = useState(false);
  useEffect(() => {
    setIsEmpty(false);
    setIsFetchAllCompleted(false);
  }, [keywordSearch]);

  // Notify parent when block is empty
  useEffect(() => {
    if (onBlockEmpty && isFetchAllCompleted) {
      onBlockEmpty(isEmpty);
    }
  }, [isEmpty, isFetchAllCompleted, onBlockEmpty]);

  if (isFetchAllCompleted && isEmpty) {
    return <></>;
  }
  return (
    <div ref={ref}>
      {inView ? (
        <>
          <PageBlockItem
            useContainer={useContainer}
            block={block}
            keywordSearch={keywordSearch}
            setIsEmpty={(value: boolean) => setIsEmpty(value)}
            onFetchCompleted={() => setIsFetchAllCompleted(true)}
          />
          {isFirstBlock && <TopBannerAds />}
          {!isFetchAllCompleted && (
            <>
              <BlockPlaceholder block={block} />
            </>
          )}
          {isLastBlock && <BottomBannerAds />}
        </>
      ) : (
        <div className="h-[200px]"></div>
      )}
    </div>
  );
}
