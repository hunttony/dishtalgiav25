'use client';

import React from 'react';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface PuddingCarouselProps {
  images: string[];
}

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const NextArrow: React.FC<ArrowProps> = ({ className, style, onClick }) => (
  <div
    className={`${className} slick-arrow slick-next z-10 text-black hover:opacity-80`}
    style={{ ...style }}
    onClick={onClick}
    aria-label="Next slide"
  />
);

const PrevArrow: React.FC<ArrowProps> = ({ className, style, onClick }) => (
  <div
    className={`${className} slick-arrow slick-prev z-10 text-black hover:opacity-80`}
    style={{ ...style }}
    onClick={onClick}
    aria-label="Previous slide"
  />
);

export default function PuddingCarousel({ images }: PuddingCarouselProps) {
  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.max(3, images.length),
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '100px',
    focusOnSelect: true,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          centerPadding: '60px',
          slidesToShow: Math.min(3, images.length)
        }
      },
      {
        breakpoint: 1024,
        settings: {
          centerPadding: '40px',
          slidesToShow: Math.min(2, images.length)
        }
      },
      {
        breakpoint: 768,
        settings: {
          centerPadding: '20px',
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="relative w-full" style={{ minHeight: '600px' }}>
        <Slider {...settings}>
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="px-2 h-full">
              <div className="relative w-full h-full">
                <div className="relative h-full w-full">
                  <img
                    src={src}
                    alt={`Pudding ${index + 1}`}
                    className="w-full h-full object-contain drop-shadow-lg"
                    style={{
                      maxHeight: '100%',
                      backgroundColor: 'transparent',
                      imageRendering: 'crisp-edges' as const,
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/placeholder.png';
                      target.alt = 'Image not available';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
