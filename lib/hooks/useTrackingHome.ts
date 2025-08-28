import { BlockItemType, BlockSlideItemType } from '../api/blocks';
import tracking from '../tracking';

export const trackingLoadBlockDisplayLog511 = (
  blocksSortedRecommend: BlockItemType[],
) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const strsArr = (blocksSortedRecommend || []).map((item, index) => {
      return `${index}_!${item?.id || 0}_!${(item?.name || '').substring(
        0,
        15,
      )}`;
    });
    const ItemName = (strsArr || []).join('#;');
    tracking({
      LogId: '511',
      Event: 'LoadBlockDisplay',
      ItemName,
    });
  } catch {}
};

export const trackingLoadHighlightItemLog522 = (
  dataBlock: BlockSlideItemType[],
) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const ItemName = dataBlock
      .map((item, index) => {
        const isRecommend = item.is_recommend ? '1' : '0';
        return `${index}_!${item.id}_!${isRecommend}#;`;
      })
      .join('');
    tracking({
      LogId: '522',
      Event: 'LoadHighlightItem',
      ItemName,
    });
  } catch {}
};
