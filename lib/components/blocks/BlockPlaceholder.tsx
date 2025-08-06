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
        // Calculate the current padding based on container width and screen width
        const screenWidth = window.innerWidth;     
        let itemsPerRow: number;
        
        // Use screen width breakpoints to match CSS media queries exactly
        if (screenWidth >= 1280) {
          itemsPerRow = 6;
        } else if (screenWidth >= 768) {
          itemsPerRow = 4;
        } else {
          itemsPerRow = 2;
        }
        
        setItemCount(itemsPerRow);
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
