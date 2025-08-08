'use client';
import { BlockItemType } from '@/lib/api/blocks';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import BlockPlaceholder from './BlockPlaceholder';
import { TopBannerAds } from '@/lib/components/ads';
import { useRouter } from 'next/router';
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
}: Props) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    rootMargin: '800px',
  });
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFetchAllCompleted, setIsFetchAllCompleted] = useState(false);
  const [shouldHideAds, setShouldHideAds] = useState(false);
  const router = useRouter();   

  useEffect(() => {
    setIsEmpty(false);
    setIsFetchAllCompleted(false);
  }, [keywordSearch]);

  useEffect(() => {
    const checkAppName = () => {
      if (typeof window !== 'undefined') {
        const appName = localStorage.getItem('app_name');
        const hideAdsApps = ['Truyền hình', 'Học tập', 'Thiếu nhi'];
        setShouldHideAds(hideAdsApps.includes(appName || ''));
      }
    };

    // Initial check when router is ready
    if (router.isReady) {
      checkAppName();
    }

    // Listen for router events to detect when app_name might change
    const handleRouteComplete = () => {
      // Add a small delay to ensure app_name is set in localStorage
      setTimeout(checkAppName, 50);
    };

    if (router.isReady) {
      router.events.on('routeChangeComplete', handleRouteComplete);
    }

    return () => {
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router.isReady, router.events]);

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
          {isFirstBlock && !shouldHideAds && <TopBannerAds />}
          {!isFetchAllCompleted && (
            <>
              <BlockPlaceholder block={block} />
            </>
          )}
        </>
      ) : (
        <div className="h-[200px]"></div>
      )}
    </div>
  );
}
