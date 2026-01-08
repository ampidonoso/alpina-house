import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader = ({ onComplete }: PreloaderProps) => {
  const [count, setCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Much faster count (~1.5 seconds total)
        const increment = prev < 30 ? 8 : prev < 60 ? 10 : 15;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count === 100 && !isRevealing) {
      setIsRevealing(true);
      const timeout = setTimeout(onComplete, 800);
      return () => clearTimeout(timeout);
    }
  }, [count, onComplete, isRevealing]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      {/* Curtain Left */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full bg-stone-950 z-10"
        initial={{ x: 0 }}
        animate={isRevealing ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />

      {/* Curtain Right */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-stone-950 z-10"
        initial={{ x: 0 }}
        animate={isRevealing ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />

      {/* Center Content - Before reveal */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-950"
        initial={{ opacity: 1 }}
        animate={isRevealing ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Counter - Massive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
        >
          <span className="font-sans text-[20vw] md:text-[15vw] font-light text-stone-100 tabular-nums tracking-[-0.05em] leading-none">
            {count.toString().padStart(3, '0')}
          </span>
        </motion.div>

        {/* Progress Line - Thin and Minimal */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-32 h-px bg-stone-800 overflow-hidden">
          <motion.div
            className="h-full bg-stone-100"
            initial={{ width: "0%" }}
            animate={{ width: `${count}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-12 font-sans text-stone-500 text-[10px] tracking-[0.4em] uppercase"
        >
          Loading Experience
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;