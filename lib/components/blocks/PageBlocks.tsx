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
  }, [keywordSearch, blocks]);

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
        onBlockEmpty={
          keywordSearch
            ? (isEmpty: boolean) => handleBlockEmpty(index, isEmpty)
            : undefined
        }
        isFirstBlock={index === 1}
        isLastBlock={index === blocks.length - 1}
      />
    ));
  }, [blocks, keywordSearch, handleBlockEmpty]);

  if (typeof blocks === 'undefined' || !blocks?.length) {
    return <div className="h-screen"></div>;
  }

  return (
    <div className="flex flex-col gap-[40px] xl:gap-[80px]">{blockItems}</div>
  );
}
