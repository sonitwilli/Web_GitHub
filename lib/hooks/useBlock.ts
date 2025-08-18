import { useMemo } from 'react';
import { BlockItemType, BlockSlideItemType } from '../api/blocks';
import { useAppSelector } from '../store';
import _ from 'lodash';

interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}

export default function useBlock({ block }: Props) {
  const { pageBlocks } = useAppSelector((s) => s.blockSlice);
  const blockIndex = useMemo(() => {
    const index = _.findIndex(pageBlocks, { id: block?.id });
    return index;
  }, [pageBlocks, block]);
  return { blockIndex };
}
