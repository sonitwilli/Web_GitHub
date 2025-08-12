// Shared props for player control buttons and containers to prevent unwanted mobile behaviors
import React from 'react';

export const playerButtonProps = {
  onContextMenu: (e: React.SyntheticEvent) => {
    e.preventDefault();
  },
  onTouchStart: (e: React.TouchEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    (target.style as CSSStyleDeclaration & { webkitTouchCallout?: string; webkitUserSelect?: string }).webkitTouchCallout = 'none';
    (target.style as CSSStyleDeclaration & { webkitUserSelect?: string }).webkitUserSelect = 'none';
  },
  style: {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    touchAction: 'manipulation',
  } as React.CSSProperties,
};
