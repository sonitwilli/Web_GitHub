export type PosterOverlayType =
  | 'badge_overlay'
  | 'banner_overlay'
  | 'general_overlay'
  | 'ribbon_overlay';

export type PositionType =
  | 'TC'
  | 'BC'
  | 'MR'
  | 'ML'
  | 'TL'
  | 'TR'
  | 'BR'
  | 'BL';

// tc |: 'top center',
// bc |: 'bottom center',
// mr |: 'middle right',
// ml |: 'middle left',
// tl |: 'top left',
// tr |: 'top right',
// br |: 'bottom right',
// bl |: 'bottom left',

export interface PosterOverlayItem {
  type?: PosterOverlayType;
  position?: PositionType; // 'TL', 'TR', etc.
  url?: string;
  url_portrait?: string;
  size?: 'large' | 'small';
  zIndex?: number;
  error?: boolean;
  group_account?: string[] | null;
}

export type PositionLabelsStatus = Record<string, boolean>;

export type OverlayGroupType = 'banner' | 'ribbon' | 'badge_general';

export interface GroupedOverlay extends PosterOverlayItem {
  groupType: OverlayGroupType;
  isLast?: boolean;
  marginBottom?: string;
  bottom?: string;
}

export interface OverlayGroup {
  position: string; // 'tl', 'tr', etc.
  groupType: OverlayGroupType;
  overlays: GroupedOverlay[];
}
