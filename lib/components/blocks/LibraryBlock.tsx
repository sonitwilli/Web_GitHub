import LibraryBlockItem from './LibraryBlockItem';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import usePageApi from '@/lib/hooks/usePageApi';
import { BlockItemType } from '@/lib/api/blocks';
import NoData from '@/lib/components/empty-data/NoData';
import ErrorData from '@/lib/components/error/ErrorData';
import { LIBRARY_TITLE } from '@/lib/constant/texts';
import Loading from '@/lib/components/common/Loading';

export default function LibraryBlock() {
  const {
    blocksSortedRecommendNotHighlight,
    pageData,
    pageDataError,
    reloadData,
    pageDataStatus,
    isLoading,
  } = usePageApi({
    currentId: 'library',
  });
  const router = useRouter();
  const queryId =
    typeof router.query.id === 'string' ? router.query.id : undefined;
  const [isEmpty, setIsEmpty] = useState<boolean[]>([]);
  const [isError, setIsError] = useState<boolean[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const reloadRefs = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (isLoading) {
      setIsDataLoading(true);
    } else {
      setTimeout(() => {
        setIsDataLoading(false);
      }, 0); // Simulate a delay for loading state
    }
  }, [isLoading]);

  useEffect(() => {
    if (blocksSortedRecommendNotHighlight) {
      setIsEmpty(
        new Array(blocksSortedRecommendNotHighlight.length).fill(false)
      );
      setIsError(
        new Array(blocksSortedRecommendNotHighlight.length).fill(false)
      );
      reloadRefs.current = new Array(
        blocksSortedRecommendNotHighlight.length
      ).fill(() => {});
    }
  }, [blocksSortedRecommendNotHighlight]);

  // Function to handle emptiness updates from LibraryBlockItem
  const handleEmptyData = (index: number, isEmpty: boolean) => {
    setIsEmpty((prev) => {
      const newIsEmpty = [...prev];
      newIsEmpty[index] = isEmpty;
      return newIsEmpty;
    });
  };

  // Function to handle error updates from LibraryBlockItem
  const handleErrorData = (index: number, isError: boolean) => {
    setIsError((prev) => {
      const newIsError = [...prev];
      newIsError[index] = isError;
      return newIsError;
    });
  };

  // Function to register reloadData from LibraryBlockItem
  // const registerReloadData = (index: number, reloadData: () => void) => {
  //   reloadRefs.current[index] = reloadData;
  // };

  // Filter blocks based on query id
  const filteredBlocks = queryId
    ? blocksSortedRecommendNotHighlight.filter(
        (block: BlockItemType) => block.id === queryId
      )
    : blocksSortedRecommendNotHighlight;

  // Check if all blocks are empty
  const allBlocksEmpty =
    isEmpty.length === filteredBlocks.length && isEmpty.every((item) => item);

  const allBlocksError =
    isError.length === filteredBlocks.length && isError.every((item) => item);

  const handleReloadData = () => {
    reloadData();
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="relative max-w-[1200px]">
        <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
          {LIBRARY_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px] min-h-[300px]">
          <Loading />
        </div>
      </div>
    );
  }

  if (pageDataError && pageDataStatus !== '0') {
    return (
      <div className="relative max-w-[1200px]">
        <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
          {LIBRARY_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px]">
          <ErrorData onRetry={handleReloadData} />
        </div>
      </div>
    );
  }

  if (
    typeof blocksSortedRecommendNotHighlight === 'undefined' ||
    !blocksSortedRecommendNotHighlight?.length ||
    pageDataStatus === '0'
  ) {
    return (
      <div className="relative max-w-[1200px]">
        <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
          {LIBRARY_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px]">
          <NoData />
        </div>
      </div>
    ); // No blocks to display
  }

  if (filteredBlocks.length === 0 && !allBlocksError) {
    return (
      <div className="relative max-w-[1200px]">
        <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-[16px]">
          {LIBRARY_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px]">
          <NoData />
        </div>
      </div>
    ); // No blocks to display
  }

  if (allBlocksError || (filteredBlocks.length === 1 && isError[0])) {
    return (
      <div className="relative max-w-[1200px]">
        {!queryId && (
          <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
            {pageData?.data?.meta?.name}
          </h1>
        )}
        {queryId && filteredBlocks.length === 1 && (
          <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
            {filteredBlocks[0]?.name}
          </h1>
        )}
        <div className="flex flex-col gap-[56px]">
          <ErrorData onRetry={handleReloadData} />
        </div>
      </div>
    );
  }

  if (
    (allBlocksEmpty && !allBlocksError) ||
    (filteredBlocks.length === 1 && isEmpty[0])
  ) {
    return (
      <div className="relative max-w-[1200px]">
        {!queryId && (
          <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
            {pageData?.data?.meta?.name}
          </h1>
        )}
        {queryId && filteredBlocks.length === 1 && (
          <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
            {filteredBlocks[0]?.name}
          </h1>
        )}
        <div className="flex flex-col gap-[56px]">
          <NoData />
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[1200px]">
      {!queryId && (
        <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
          {pageData?.data?.meta?.name}
        </h1>
      )}
      {(queryId && filteredBlocks.length === 1 && allBlocksError) ||
        (queryId && filteredBlocks.length === 1 && allBlocksEmpty && (
          <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[24px] sm:mb-[32px] pl-0 sm:pl-[16px]">
            {filteredBlocks[0]?.name}
          </h1>
        ))}
      <div className="flex flex-col gap-[56px]">
        {filteredBlocks.map((block: BlockItemType, filteredIndex: number) => {
          const originalIndex = blocksSortedRecommendNotHighlight.findIndex(
            (originalBlock: BlockItemType) => originalBlock.id === block.id
          );
          return (
            <LibraryBlockItem
              block={block}
              key={block.id || filteredIndex}
              setIsEmpty={(isEmpty: boolean) =>
                handleEmptyData(originalIndex, isEmpty)
              }
              setIsError={(isError: boolean) =>
                handleErrorData(originalIndex, isError)
              }
              // registerReloadData={(reloadData: () => void) =>
              //   registerReloadData(originalIndex, reloadData)
              // }
            />
          );
        })}
      </div>
    </div>
  );
}
