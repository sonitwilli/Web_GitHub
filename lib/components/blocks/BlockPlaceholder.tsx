import { BlockItemType } from '@/lib/api/blocks';
import { useMemo, useEffect, useState, useRef } from 'react';
import { SlideDirectionType } from '../slider/HandleImage';

interface Props {
  block?: BlockItemType;
}

export default function BlockPlaceholder({ block }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemCount, setItemCount] = useState(6);

  const blockDirection = useMemo<SlideDirectionType>(() => {
    if (
      block?.block_type?.toUpperCase().includes('VERTICAL') ||
      block?.block_type?.toUpperCase().includes('VOD_DETAIL')
    ) {
      return 'vertical';
    }
    return 'horizontal';
  }, [block]);

  // Get the same aspect ratio as the actual blocks
  const imageRatio = useMemo(() => {
    if (block?.block_type === 'numeric_rank') {
      return 'pb-[150%]';
    } else if (block?.block_type === 'new_vod_detail') {
      return 'pb-[calc(608_/_1080_*_100%)]';
    } else if (blockDirection === 'horizontal') {
      return 'pb-[56.25%]';
    } else if (blockDirection === 'vertical') {
      return 'pb-[150%]';
    }
    return 'pb-[56.25%]';
  }, [block?.block_type, blockDirection]);

  useEffect(() => {
    const calculateItemCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const minItemWidth = 200; // Minimum width per item
        const gap = 16; // Gap between items
        
        // Calculate how many full items can fit
        const maxItems = Math.floor((containerWidth + gap) / (minItemWidth + gap));
        
        // Ensure only even numbers: 2, 4, or 6
        let evenCount;
        if (maxItems >= 6) {
          evenCount = 6;
        } else if (maxItems >= 4) {
          evenCount = 4;
        } else {
          evenCount = 2;
        }
        
        setItemCount(evenCount);
      }
    };

    calculateItemCount();
    
    const resizeObserver = new ResizeObserver(calculateItemCount);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="f-container">
      <div 
        ref={containerRef}
        className="flex items-center gap-[16px] w-full flex-nowrap overflow-hidden"
      >
        {Array.from({ length: itemCount }, (_, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ width: `calc((100% - ${(itemCount - 1) * 16}px) / ${itemCount})` }}
          >
            <div className={`rounded-[16px] h-0 w-full relative overflow-hidden ${imageRatio}`}>
              <img
                src={
                  blockDirection === 'horizontal'
                    ? '/images/default-poster-horizontal.png'
                    : '/images/default-poster-vertical.jpg'
                }
                alt="block placeholder"
                className="absolute min-w-full min-h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
