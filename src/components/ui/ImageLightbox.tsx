import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";

interface LightboxImage {
  src: string;
  alt: string;
  index: number;
}

interface ImageLightboxProps {
  image: LightboxImage | null;
  images: { src: string; alt: string }[];
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const ImageLightbox = ({ image, images, onClose, onNavigate }: ImageLightboxProps) => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = useCallback((newDirection: number) => {
    if (!image) return;
    const newIndex = image.index + newDirection;
    if (newIndex >= 0 && newIndex < images.length) {
      onNavigate(newIndex);
      setPage([page + newDirection, newDirection]);
    }
  }, [image, images.length, onNavigate, page]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-xl flex items-center justify-center touch-none"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20"
      >
        <X size={24} />
      </button>

      {/* Navigation arrows - Hidden on mobile for swipe */}
      <button
        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20 hidden sm:block disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={image.index === 0}
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); paginate(1); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20 hidden sm:block disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={image.index === images.length - 1}
      >
        <ChevronRight size={28} />
      </button>

      {/* Image with swipe gestures */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={image.index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          src={image.src}
          alt={image.alt}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Counter & Swipe hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="text-white/70 text-sm bg-white/10 px-4 py-2 rounded-full">
          {image.index + 1} / {images.length}
        </div>
        <span className="text-white/40 text-xs sm:hidden">
          Desliza para navegar
        </span>
      </div>

      {/* Progress dots for mobile */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === image.index 
                ? "bg-white w-4" 
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ImageLightbox;