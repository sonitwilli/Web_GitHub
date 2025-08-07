import { BlockItemType } from '@/lib/api/blocks';
import BlockLazyItem from './BlockLazyItem';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

interface Props {
  blocks?: BlockItemType[];
  keywordSearch?: string;
  onAllBlocksEmpty?: (isEmpty: boolean) => void;
}

export default function PageBlocks({
  blocks,
  keywordSearch,
  onAllBlocksEmpty,
}: Props) {
  const [emptyBlocks, setEmptyBlocks] = useState<Set<number>>(new Set());
  const [firstBlockIndex, setFirstBlockIndex] = useState<number>(1);
  const [lastBlockIndex, setLastBlockIndex] = useState<number>(() =>
    blocks ? blocks.length - 1 : 0,
  );
  const totalBlocksRef = useRef<number>(0);

  const handleBlockEmpty = useCallback(
    (blockIndex: number, isEmpty: boolean) => {
      setEmptyBlocks((prev) => {
        const newSet = new Set(prev);
        if (isEmpty) {
          newSet.add(blockIndex);
        } else {
          newSet.delete(blockIndex);
        }
        return newSet;
      });
    },
    [],
  );

  // Reset empty blocks when keyword or blocks change
  useEffect(() => {
    setEmptyBlocks(new Set());
    setFirstBlockIndex(1); // Reset về index 1 ban đầu
    setLastBlockIndex(blocks ? blocks.length - 1 : 0); // Reset về index cuối ban đầu
  }, [keywordSearch, blocks]);

  // Tự động cập nhật firstBlockIndex khi block hiện tại empty
  useEffect(() => {
    if (!blocks?.length) return;
    // Tìm block đầu tiên không empty, bắt đầu từ index 1
    let newFirstBlockIndex = 1;

    while (
      newFirstBlockIndex < blocks.length &&
      emptyBlocks.has(newFirstBlockIndex)
    ) {
      newFirstBlockIndex++;
    }

    // Chỉ cập nhật nếu có thay đổi và vẫn trong phạm vi blocks
    if (
      newFirstBlockIndex !== firstBlockIndex &&
      newFirstBlockIndex < blocks.length
    ) {
      setFirstBlockIndex(newFirstBlockIndex);
    }
  }, [emptyBlocks, blocks, firstBlockIndex]);

  // Tự động cập nhật lastBlockIndex khi block hiện tại empty
  useEffect(() => {
    if (!blocks?.length) return;
    // Tìm block cuối cùng không empty, bắt đầu từ blocks.length - 1
    let newLastBlockIndex = blocks.length - 1;

    while (newLastBlockIndex >= 0 && emptyBlocks.has(newLastBlockIndex)) {
      newLastBlockIndex--;
    }

    // Chỉ cập nhật nếu có thay đổi và vẫn trong phạm vi blocks

    if (newLastBlockIndex !== lastBlockIndex && newLastBlockIndex >= 0) {
      setLastBlockIndex(newLastBlockIndex);
    }
  }, [emptyBlocks, blocks, lastBlockIndex]);

  // Check if all blocks are empty - separate effect to avoid conflicts
  useEffect(() => {
    if (blocks && blocks.length > 0 && keywordSearch && onAllBlocksEmpty) {
      totalBlocksRef.current = blocks.length;
      const allEmpty = emptyBlocks.size === blocks.length;
      onAllBlocksEmpty(allEmpty);
    }
  }, [emptyBlocks, blocks, keywordSearch, onAllBlocksEmpty]);

  const blockItems = useMemo(() => {
    if (!blocks?.length) return null;

    return blocks.map((block, index) => (
      <BlockLazyItem
        key={`${block.id || index}-${keywordSearch || 'no-search'}`}
        block={block}
        keywordSearch={keywordSearch}
        onBlockEmpty={(isEmpty: boolean) => handleBlockEmpty(index, isEmpty)}
        isFirstBlock={index === firstBlockIndex}
        isLastBlock={index === lastBlockIndex}
      />
    ));
  }, [
    blocks,
    keywordSearch,
    handleBlockEmpty,
    firstBlockIndex,
    lastBlockIndex,
  ]);

  if (typeof blocks === 'undefined' || !blocks?.length) {
    return <div className="h-screen"></div>;
  }

  return (
    <div className="flex flex-col gap-[40px] xl:gap-[80px]">{blockItems}</div>
  );
}
