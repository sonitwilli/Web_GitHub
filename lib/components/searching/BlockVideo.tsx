import React from 'react';
import dynamic from 'next/dynamic';
import { BlockItemType } from '@/lib/api/blocks';

const PageBlocks = dynamic(() => import('../blocks/PageBlocks'), {
  ssr: false,
});

type PropsVideo = {
  blocks?: BlockItemType[];
  keywordSearch?: string;
  onAllBlocksEmpty?: (isEmpty: boolean) => void;
};

const BlockVideo = (props: PropsVideo) => {
  const { blocks, keywordSearch, onAllBlocksEmpty } = props;
  return (
    <div className="py-4 mt-[60px] md:mt-[124px] 2xl:mt-[124px]">
      <PageBlocks 
        blocks={blocks} 
        keywordSearch={keywordSearch} 
        onAllBlocksEmpty={onAllBlocksEmpty}
      />
    </div>
  );
};

export default React.memo(BlockVideo);
