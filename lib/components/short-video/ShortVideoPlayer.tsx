import React from 'react';
import { ShortVideoDetail } from '@/lib/api/short-video';
import ShortVideoContent from './ShortVideoContent';

interface ShortVideoPlayerProps {
  shortVideoData?: ShortVideoDetail | null;
}

export default function ShortVideoPlayer({ shortVideoData }: ShortVideoPlayerProps) {
  // If no data is provided, show the default message
  if (!shortVideoData?.content) {
    return <ShortVideoContent />;
  }

  const { content } = shortVideoData;
  const title = content.title || content.caption || 'Short Videos';
  const description = content.caption || 'Short Videos';
  const thumbnail = content.thumb || '/images/moment/left_item.png';

  return (
    <section 
      className="relative min-h-screen bg-[url('/images/moment/background.png')] bg-cover bg-center bg-no-repeat"
    >
      <div className="relative z-5 mx-auto px-4 py-16 pt-32 lg:py-24">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-9 items-center justify-items-center min-h-[80vh]">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src={thumbnail}
                alt={title}
                className="w-80 h-auto lg:w-96 object-contain rounded-lg shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="text-white space-y-6 md:px-[96px] xl:px-0 xl:pr-[235px]">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white line-clamp-2 overflow-hidden">
              {title}
            </h1>
            
            <div className="text-base lg:text-lg leading-relaxed text-gray-100 line-clamp-4 overflow-hidden">
              {description}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
