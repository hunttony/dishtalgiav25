'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ProductImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export default function ProductImage({ 
  src, 
  fallbackSrc = '/images/placeholder-food.jpg',
  alt = 'Product image',
  className = '',
  ...props 
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);

  // If we have an error and a fallback, use the fallback
  const handleError = () => {
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // Use the Next.js Image component with our fallback logic
  const NextImage = Image as any;

  return (
    <NextImage
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
