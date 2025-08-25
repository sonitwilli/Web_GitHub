import React, { useMemo, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import {
  PosterOverlayItem,
  PositionLabelsStatus,
  OverlayGroup,
  GroupedOverlay,
  OverlayGroupType,
  PosterOverlayType,
  PositionType,
} from '@/lib/utils/posterOverlays/types';
import { scalePosterOverlayUrl } from '@/lib/utils/methods';

type Props = {
  posterOverlays?: PosterOverlayItem[];
  positionLabelsStatus?: PositionLabelsStatus[];
  blockType?: string;
  onHandlePosterOverlays?: (positionRibbon: string[]) => void;
};

const LIST_BLOCK_TO_SHOW = [
  'feature_horizontal_slider',
  'horizontal_slider',
  'horizontal_slider_with_background',
  'numeric_rank',
  'vertical_slider_medium',
  'vertical_slider_small',
  'playlist',
  'auto_expansion',
  'game_horizontal_square',
  'game_list_square_button',
  'search',
  'new_vod_detail',
  'top_10_detail_vod',
  'category_vod',
] as const;

type BlockType = (typeof LIST_BLOCK_TO_SHOW)[number];

const overlaySizes = {
  badge_overlay: {
    large: { width: 30, height: 0 },
    small: { width: 24, height: 0 },
  },
  banner_overlay: {
    large: { width: 0, height: 63 },
    small: { width: 0, height: 55 },
  },
  general_overlay: {
    large: { width: 0, height: 22 },
    small: { width: 0, height: 20 },
  },
  ribbon_overlay: {
    large: { width: 60, height: 0 },
    small: { width: 40, height: 0 },
  },
};

const BLOCK_TYPE_SIZE_MAP: Record<BlockType, 'large' | 'small'> = {
  feature_horizontal_slider: 'large',
  horizontal_slider: 'small',
  horizontal_slider_with_background: 'small',
  numeric_rank: 'large',
  vertical_slider_medium: 'large',
  vertical_slider_small: 'large',
  playlist: 'small',
  auto_expansion: 'large',
  game_horizontal_square: 'small',
  game_list_square_button: 'large',
  search: 'small',
  new_vod_detail: 'large',
  top_10_detail_vod: 'small',
  category_vod: 'small',
};

function getOverlayDimensions(type: string, size: string) {
  const { width = 0, height = 0 } =
    overlaySizes[type as keyof typeof overlaySizes]?.[
      size as 'large' | 'small'
    ] || {};
  if (width > 0 && height > 0) return { width, height };
  if (width > 0 && height === 0) return { width, height: width };
  if (width === 0 && height > 0) return { width: height, height };
  return { width: 24, height: 24 };
}

// Position classes mapping (absolute positioning with tailwind utility classes)
const groupPositionClass: Record<string, string> = {
  tl: 'top-0 left-0',
  tc: 'top-0 left-1/2 -translate-x-1/2 items-baseline',
  tr: 'top-0 right-0 items-end',
  mr: 'right-0 top-1/2 -translate-y-1/2 items-end',
  br: 'bottom-0 right-0 items-end',
  bc: 'bottom-0 left-1/2 -translate-x-1/2 items-baseline',
  bl: 'bottom-0 left-0',
  ml: 'left-0 top-1/2 -translate-y-1/2',
};
const groupPaddingClass: Record<string, string> = {
  tl: 'pt-[8px] pl-[8px]',
  tc: 'pt-[8px]',
  tr: 'pt-[8px] pr-[8px]',
  mr: 'pr-[8px]',
  br: 'pb-[8px] pr-[8px]',
  bc: 'pb-[8px]',
  bl: 'pb-[8px] pl-[8px]',
  ml: 'pl-[8px]',
};
// Banner overlay position classes (custom px can be added via tailwind config)
const bannerPositionClass: Record<string, string> = {
  tc: 'top-0 left-1/2 -translate-x-1/2 w-full',
  bc: 'bottom-0 left-1/2 -translate-x-1/2 w-full',
  tl: 'top-0 left-0 w-full',
  tr: 'top-0 right-0 w-full',
  bl: 'bottom-0 left-0 w-full',
  br: 'bottom-0 right-0 w-full',
  mr: 'right-0 top-1/2 -translate-y-1/2 w-full',
  ml: 'left-0 top-1/2 -translate-y-1/2 w-full',
};
const ribbonPositionClass: Record<string, string> = {
  tc: 'top-[-3px] left-1/2 -translate-x-1/2',
  bc: 'bottom-[-3px] left-1/2 -translate-x-1/2',
  mr: 'right-[-3px] top-1/2 -translate-y-1/2',
  ml: 'left-[-3px] top-1/2 -translate-y-1/2',
  tl: 'top-[-3px] left-[-3px]',
  tr: 'top-[-3px] right-[-3px]',
  br: 'bottom-[-3px] right-[-3px]',
  bl: 'bottom-[-3px] left-[-3px]',
};

function getGroupClass(
  position: string,
  isBadgeGroup: boolean,
  isBannerGroup: boolean,
) {
  const pos = position.toLowerCase();
  const base = isBadgeGroup ? 'flex flex-col' : 'absolute w-full h-full';
  const pad = isBannerGroup ? '' : groupPaddingClass[pos] || '';
  return `${base} absolute ${groupPositionClass[pos] || ''} ${pad}`;
}

// Banner overlay border radius mapping (custom if needed)
function getBannerOverlayRadius(position: string, size: string) {
  const isTop = ['tl', 'tc', 'tr'].includes(position);
  const isBottom = ['bl', 'bc', 'br'].includes(position);
  if (isTop) return 'rounded-t-[12px]';
  if (isBottom)
    return size === 'large' ? 'rounded-b-[12px]' : 'rounded-b-[12px]';
  return '';
}

// Tailwind only! (no inline style)
function getOverlayClass(
  type: string,
  groupType: string,
  size: string,
  position: string,
  isLast: boolean,
  marginBottom?: string,
  bottom?: string,
) {
  const isBadge = groupType === 'badge_general';
  const overlayBase = isBadge ? 'relative w-max' : 'absolute';
  const mb = isLast ? '' : marginBottom || '';
  const bot = bottom || '';
  let rounded = '';
  if (type === 'ribbon_overlay') {
    const isTop = ['tl', 'tc', 'tr'].includes(position);
    const isBottom = ['bl', 'bc', 'br'].includes(position);
    if (isTop) rounded = size === 'large' ? 'rounded-t-lg' : 'rounded-t-md';
    if (isBottom) rounded = size === 'large' ? 'rounded-b-lg' : 'rounded-b-md';
  }
  return `${overlayBase} ${rounded} ${mb} ${bot}`.trim();
}
function getOverlayImageClass(
  type: string,
  size: string,
  error?: boolean,
  blockType?: string,
) {
  if (error) return 'invisible w-0 h-0 pointer-events-none';
  switch (type) {
    case 'banner_overlay':
      return `object-contain ${
        size === 'large' ? 'h-[63px]' : 'h-[55px]'
      } w-auto`;
    case 'badge_overlay':
      return `object-contain ${
        size === 'large' ? 'w-[30px]' : 'w-[24px]'
      } h-auto`;
    case 'general_overlay':
      // hide general overlays on mobile/tablet only for auto_expansion blocks
      if (blockType === 'auto_expansion') {
        return `object-contain ${
          size === 'large' ? 'h-[22px]' : 'h-[20px]'
        } w-auto hidden xl:block`;
      }
      return `object-contain ${
        size === 'large' ? 'h-[22px]' : 'h-[20px]'
      } w-auto`;
    case 'ribbon_overlay':
      return `object-contain ${
        size === 'large' ? 'w-[60px]' : 'w-[40px]'
      } h-auto`;
    default:
      return 'object-contain';
  }
}

const PosterOverlay: React.FC<Props> = ({
  posterOverlays = [],
  positionLabelsStatus = [],
  blockType = '',
  onHandlePosterOverlays,
}) => {
  const [listPoster, setListPoster] =
    useState<PosterOverlayItem[]>(posterOverlays);
  const [isReady, setIsReady] = useState(false);
  const { ref, inView } = useInView({
    rootMargin: '200px',
    triggerOnce: true,
  });
  const [errorUrls, setErrorUrls] = useState<string[]>([]);

  const isBlockTypeValid = useMemo(
    () => LIST_BLOCK_TO_SHOW.includes(blockType as BlockType),
    [blockType],
  );
  const overlaySize = useMemo(() => {
    if (!blockType || !isBlockTypeValid) return 'large';
    return BLOCK_TYPE_SIZE_MAP[blockType as BlockType] || 'large';
  }, [blockType, isBlockTypeValid]);

  // Group overlays
  const groupedOverlays = useMemo<OverlayGroup[]>(() => {
    if (!isBlockTypeValid || !listPoster.length || !inView) return [];
    const status = positionLabelsStatus[0] || {};
    const orientationMap = {
      feature_horizontal_slider: 'horizontal',
      horizontal_slider: 'horizontal',
      horizontal_slider_with_background: 'horizontal',
      numeric_rank: 'vertical',
      vertical_slider_medium: 'vertical',
      vertical_slider_small: 'vertical',
      playlist: 'horizontal',
      auto_expansion: 'horizontal',
      game_horizontal_square: 'horizontal',
      game_list_square_button: 'horizontal',
      search: 'horizontal',
      new_vod_detail: 'horizontal',
      top_10_detail_vod: 'horizontal',
      category_vod: 'horizontal',
    } as const;
    const orientation = orientationMap[blockType as BlockType] || 'horizontal';
    const shouldHideBottomPosition = blockType === 'numeric_rank';
    const listNotToScale = ['new_vod_detail'];
    const groupTypeMap: Record<PosterOverlayType, OverlayGroupType> = {
      banner_overlay: 'banner',
      ribbon_overlay: 'ribbon',
      badge_overlay: 'badge_general',
      general_overlay: 'badge_general',
    };
    const overlayMap = new Map<string, GroupedOverlay[]>();

    listPoster.forEach((item, i) => {
      const posKey = (item.position ?? '').toLowerCase();
      if (shouldHideBottomPosition && ['br', 'bl', 'bc'].includes(posKey)) {
        return; // Skip bottom positions for numeric_rank
      }
      if (
        blockType === 'top_10_detail_vod' &&
        ['mr', 'ml'].includes(posKey) &&
        item.type === 'general_overlay'
      ) {
        return;
      }
      if (status[posKey.toUpperCase()] || !item.type) return;
      const type = item.type as keyof typeof overlaySizes;
      const sizeClass = overlaySizes[type]?.[overlaySize];
      if (!sizeClass) return;
      const { width, height } = sizeClass;
      const rawUrl =
        type === 'banner_overlay' && orientation === 'vertical'
          ? item.url_portrait
          : item.url;
      if (!rawUrl) return;
      const imageUrl = listNotToScale.includes(blockType)
        ? rawUrl
        : scalePosterOverlayUrl({
            imageUrl: rawUrl,
            ...(width > 0 && { width }),
            ...(height > 0 && { height }),
            notWebp: true,
          });

      if (!imageUrl) return;
      const groupType = groupTypeMap[type];
      const mapKey = `${posKey}_${groupType}`;
      const overlay: GroupedOverlay = {
        ...item,
        position: posKey as PositionType,
        url: imageUrl,
        size: overlaySize,
        groupType,
        zIndex: i,
        error: item.error,
      };
      if (!overlayMap.has(mapKey)) overlayMap.set(mapKey, []);
      overlayMap.get(mapKey)?.push(overlay);
    });

    // Collect groups
    const clockwiseOrder = [
      'tl',
      'tc',
      'tr',
      'mr',
      'br',
      'bc',
      'bl',
      'ml',
    ] as const;
    const overlayGroupTypes: OverlayGroupType[] = [
      'banner',
      'ribbon',
      'badge_general',
    ];
    const groups: OverlayGroup[] = [];
    clockwiseOrder.forEach((pos) => {
      overlayGroupTypes.forEach((typeKey) => {
        const mapKey = `${pos}_${typeKey}`;
        const items = overlayMap.get(mapKey);
        if (items && items.length) {
          if (typeKey === 'badge_general') {
            items.forEach((o, k, arr) => {
              o.isLast = k === arr.length - 1;
              const next = arr[k + 1];
              o.marginBottom = !next
                ? 'mb-0'
                : o.type === next?.type
                ? 'mb-1'
                : next?.type === 'general_overlay'
                ? next.size === 'large' && (pos === 'mr' || pos === 'ml')
                  ? 'mb-[14px]'
                  : next.size === 'small' && (pos === 'mr' || pos === 'ml')
                  ? 'mb-[9px]'
                  : 'mb-1'
                : 'mb-1';
              o.bottom =
                next?.type === 'general_overlay' && next.size === 'small'
                  ? 'bottom-0'
                  : '';
            });
          }
          groups.push({
            position: pos,
            groupType: typeKey,
            overlays: items,
          });
        }
      });
    });
    return groups;
  }, [
    listPoster,
    blockType,
    positionLabelsStatus,
    overlaySize,
    isBlockTypeValid,
    inView,
  ]);

  useEffect(() => {
    if (posterOverlays.length) {
      setListPoster(posterOverlays);
      setIsReady(true);
    }
  }, [posterOverlays]);

  useEffect(() => {
    if (!isReady || !onHandlePosterOverlays) return;

    const result: string[] = [];

    const hasTopRibbon = (posterOverlays || []).some(
      (o) =>
        o.type === 'ribbon_overlay' &&
        ['tl', 'tc', 'tr'].includes((o.position || '').toLowerCase()),
    );

    const hasMidRibbon = (posterOverlays || []).some(
      (o) =>
        o.type === 'ribbon_overlay' &&
        ['ml', 'mr'].includes((o.position || '').toLowerCase()),
    );

    const hasBottomRibbon = (posterOverlays || []).some(
      (o) =>
        o.type === 'ribbon_overlay' &&
        ['bl', 'br'].includes((o.position || '').toLowerCase()),
    );

    if (hasTopRibbon) {
      result.push('top-ribbon');
    }

    if (hasMidRibbon) {
      result.push('mid-ribbon');
    }

    if (hasBottomRibbon) {
      result.push('bottom-ribbon');
    }

    if (result.length > 0) {
      onHandlePosterOverlays(result); // ['top-ribbon', 'mid-ribbon', 'bottom-ribbon']
    }
  }, [isReady, onHandlePosterOverlays, posterOverlays]);

  const handleImageError = useCallback(
    (err: React.SyntheticEvent<HTMLImageElement>) => {
      const src = (err.target as HTMLImageElement).currentSrc; // dùng `currentSrc` chính xác hơn
      setErrorUrls((prev) => [...prev, src]);
    },
    [],
  );

  if (!isBlockTypeValid || !isReady || !inView)
    return <div ref={ref} className="w-full h-full" />;

  return (
    <div ref={ref} className="absolute inset-0 z-[1] w-full h-full">
      {groupedOverlays.map((group, gIndex) => {
        const isBadgeGroup = group.groupType === 'badge_general';
        const isBannerGroup = group.groupType === 'banner';

        return (
          <div
            key={gIndex}
            className={getGroupClass(
              group.position,
              isBadgeGroup,
              isBannerGroup,
            )}
          >
            {group.overlays
              .filter((overlay) => !errorUrls.includes(overlay.url as string))
              .map((overlay, idx) => {
                const { width, height } = getOverlayDimensions(
                  overlay.type as string,
                  overlay.size as string,
                );
                // Banner Overlay
                if (overlay.type === 'banner_overlay') {
                  return (
                    <div
                      key={idx}
                      className={`absolute z-[${overlay.zIndex}] ${
                        bannerPositionClass[group.position] ?? ''
                      }`}
                    >
                      <Image
                        src={overlay.url || ''}
                        alt={overlay.type || 'poster_overlay'}
                        width={width}
                        height={height}
                        className={`object-contain w-full h-auto ${getBannerOverlayRadius(
                          group.position,
                          overlay.size as string,
                        )}`}
                        onError={handleImageError}
                        draggable={false}
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                  );
                }

                // Ribbon Overlay
                if (overlay.type === 'ribbon_overlay') {
                  return (
                    <div
                      key={idx}
                      className={`absolute z-[${overlay.zIndex}] ${
                        ribbonPositionClass[group.position] ?? ''
                      } ${getOverlayClass(
                        overlay.type as string,
                        group.groupType,
                        overlay.size as string,
                        group.position,
                        !!overlay.isLast,
                        overlay.marginBottom,
                        overlay.bottom,
                      )}`}
                    >
                      <Image
                        src={overlay.url || ''}
                        alt={overlay.type || 'poster_overlay'}
                        width={width}
                        height={height}
                        className={getOverlayImageClass(
                          overlay.type as string,
                          overlay.size as string,
                          overlay.error,
                          blockType,
                        )}
                        onError={handleImageError}
                        draggable={false}
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                  );
                }

                // Badge & General Overlay
                return (
                  <div
                    key={idx}
                    className={`${getOverlayClass(
                      overlay.type as string,
                      group.groupType,
                      overlay.size as string,
                      group.position,
                      !!overlay.isLast,
                      overlay.marginBottom,
                      overlay.bottom,
                    )} z-[${overlay.zIndex}]`}
                  >
                    <Image
                      src={overlay.url || ''}
                      alt={overlay.type || 'poster_overlay'}
                      width={width}
                      height={height}
                      className={getOverlayImageClass(
                        overlay.type as string,
                        overlay.size as string,
                        overlay.error,
                        blockType,
                      )}
                      onError={handleImageError}
                      draggable={false}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(
  PosterOverlay,
  (prev, next) =>
    prev.blockType === next.blockType &&
    prev.posterOverlays === next.posterOverlays &&
    prev.positionLabelsStatus === next.positionLabelsStatus,
);