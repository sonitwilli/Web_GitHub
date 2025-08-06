import { trackingLoadPageErrorLog176 } from '@/lib/tracking/trackingCommon';
import React from 'react';

interface CustomImageProps {
  id?: string;
  src?: string;
  className?: string;
  alt?: string;
  title?: string;
  placeHolder?: string;
  width?: string;
  height?: string;
  imageRatio?: string;
  containerClassName?: string;
}

const CustomImage: React.FC<CustomImageProps> = ({
  id = '',
  src,
  className = '',
  alt = '',
  title = '',
  placeHolder = '/images/profiles/placeholder.png',
  width = '',
  height = '',
  imageRatio,
  containerClassName,
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeHolder;
    trackingLoadPageErrorLog176({
      Screen: 'ImageError',
      Url: e.currentTarget.src,
    });
  };

  if (typeof imageRatio !== 'undefined') {
    return (
      <div
        className={`w-full h-0 relative overflow-hidden ${containerClassName} ${imageRatio}`}
      >
        <img
          id={id}
          src={src || placeHolder}
          className={`min-w-full min-h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
          alt={alt}
          title={title}
          width={width}
          height={height}
          onError={handleImageError}
          original-src={src}
        />
      </div>
    );
  }

  return (
    <img
      id={id}
      src={src || placeHolder}
      className={`object-cover ${className}`}
      alt={alt}
      title={title}
      width={width}
      height={height}
      onError={handleImageError}
    />
  );
};

export default CustomImage;
