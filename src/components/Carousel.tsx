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
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isHovered]);

  const getImageStyle = (index: number) => {
    const total = images.length;
    const left = (currentIndex - 1 + total) % total;
    const right = (currentIndex + 1) % total;

    if (index === currentIndex) {
      return { scale: 1.1, opacity: 1, zIndex: 3 };
    } else if (index === left || index === right) {
      return { scale: 0.9, opacity: 0.8, zIndex: 2 };
    } else {
      return { scale: 0.8, opacity: 0.8, zIndex: 1 };
    }
  };

  return (
    <div
      className="relative w-full h-[500px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full max-w-5xl h-full mx-auto">
        <AnimatePresence initial={false} custom={currentIndex} mode="wait">
          {images.map((image, index) => {
            const style = getImageStyle(index);
            const isActive = index === currentIndex;

            return (
              isActive && (
                <motion.div
                  key={index}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0, scale: 0.95, x: 100 }}
                  animate={{
                    opacity: style.opacity,
                    scale: style.scale,
                    x: 0,
                    zIndex: style.zIndex,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    x: -100,
                    zIndex: 0,
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`Slide ${index + 1}`}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 960px"
                      className="object-contain"
                    />
                  </div>
                </motion.div>
              )
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
