import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface ImageCarouselProps {
  images: string[];
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const fallbackImages = ['https://via.placeholder.com/800x600.png?text=No+Image'];
  const imageList = images.length > 0 ? images : fallbackImages;

  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = ((page % imageList.length) + imageList.length) % imageList.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full bg-dark-bg/50 rounded-2xl overflow-hidden shadow-2xl shadow-primary-blue/20 flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={page}
            src={imageList[imageIndex]}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute h-full w-full object-contain"
          />
        </AnimatePresence>
        {imageList.length > 1 && (
            <>
                <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
                    <button onClick={() => paginate(-1)} className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
                    <button onClick={() => paginate(1)} className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors">
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </>
        )}
      </div>
      {imageList.length > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {imageList.map((img, i) => (
            <button key={i} onClick={() => setPage([i, i > imageIndex ? 1 : -1])}>
              <img
                src={img}
                alt={`thumbnail ${i + 1}`}
                className={`w-16 h-12 object-cover rounded-md transition-all ${
                  i === imageIndex ? 'ring-4 ring-accent' : 'opacity-60 hover:opacity-100'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
