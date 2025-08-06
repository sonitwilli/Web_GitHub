import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../components/container/AppContainer';
import { BlockItemType, BlockSlideItemType } from '../api/blocks';
import { useAppDispatch } from '../store';
import {
  changeShareBlock,
  changeSharedSlideItem,
} from '../store/slices/appSlice';
interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}
export default function useModalToggle({ block, slide }: Props) {
  const [showModalShare, setShowModalShare] = useState(false);
  const appCtx = useContext(AppContext);
  const { setHoveredBlock, setHoveredSlide } = appCtx;
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (showModalShare) {
      if (setHoveredBlock && setHoveredSlide) {
        setHoveredBlock({});
        setHoveredSlide({});
      }
      dispatch(changeShareBlock(block || {}));
      dispatch(changeSharedSlideItem(slide || {}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModalShare]);

  return { showModalShare, setShowModalShare };
}
