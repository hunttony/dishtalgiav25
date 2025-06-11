'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CarouselProps {
  images: string[];
  interval?: number;
}

export default function Carousel({ images, interval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isHovered]);

  const getImageStyle = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    const isCenter = distance === 0;
    const isAdjacent = distance === 1 || (currentIndex === 0 && index === images.length - 1) || (currentIndex === images.length - 1 && index === 0);

    let style = {
      scale: 0.8,
      opacity: 0.8,
      filter: 'blur(2px)',
      zIndex: 1,
    };

    if (isCenter) {
      style = {
        scale: 2,
        opacity: 2,
        filter: 'blur(0)',
        zIndex: 3,
      };
    } else if (isAdjacent) {
      style = {
        scale: 1,
        opacity: 0.8,
        filter: 'blur(1px)',
        zIndex: 2,
      };
    }

    return style;
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full max-w-[920px]  mx-auto">
        <AnimatePresence mode="wait" custom={currentIndex}>
          {images.map((image, index) => {
            const style = getImageStyle(index);
            const direction = index > currentIndex ? 1 : -1;
            
            return (
              <motion.div
                key={index}
                className="absolute inset-0 w-full h-full"
                custom={direction}
                initial={{ x: '100%', opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: style.opacity,
                  scale: style.scale,
                  filter: style.filter,
                  zIndex: style.zIndex,
                }}
                exit={{
                  x: '-100%',
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.5, ease: 'easeInOut' }
                }}
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 },
                  filter: { duration: 0.5 }
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 620px) 100vw, 620px"
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
