import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { useLocation } from "react-router-dom";
import { useOptimizedAnimation } from "@/hooks/useReducedMotion";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fade up animation for sections - mobile-optimized with visible animations
interface AnimationProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const FadeUp = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const { duration, ease, translateY, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: translateY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration, delay: delay * 0.6, ease }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
FadeUp.displayName = "FadeUp";

// Slide in from left - mobile-optimized
export const SlideLeft = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const { duration, ease, translateX, shouldReduceMotion, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -translateX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration, delay: delay * 0.6, ease }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
SlideLeft.displayName = "SlideLeft";

// Slide in from right - mobile-optimized
export const SlideRight = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const { duration, ease, translateX, shouldReduceMotion, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : translateX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration, delay: delay * 0.6, ease }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
SlideRight.displayName = "SlideRight";

// Scale in animation - mobile-optimized
export const ScaleIn = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const { duration, ease, shouldReduceMotion, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration, delay: delay * 0.6, ease }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
ScaleIn.displayName = "ScaleIn";

// Blur fade in - disabled on mobile for performance
export const BlurFadeIn = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const animSettings = useOptimizedAnimation();
  const { duration, ease, viewportMargin } = animSettings;
  const disableBlur = 'disableBlur' in animSettings ? animSettings.disableBlur : false;
  
  // On mobile, use simple fade instead of blur for performance
  if (disableBlur) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: viewportMargin }}
        transition={{ duration, delay: delay * 0.5, ease }}
        className={className}
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration: duration * 0.8, delay: delay * 0.5, ease }}
      className={className}
      style={{ willChange: "opacity, filter" }}
    >
      {children}
    </motion.div>
  );
});
BlurFadeIn.displayName = "BlurFadeIn";

// Clip reveal animation - elegant for images
interface ClipRevealProps extends AnimationProps {
  direction?: "up" | "down" | "left" | "right";
}

export const ClipReveal = forwardRef<HTMLDivElement, ClipRevealProps>(({ 
  children, 
  delay = 0,
  className = "",
  direction = "up"
}, ref) => {
  const { duration, ease, viewportMargin } = useOptimizedAnimation();
  
  const clipPaths = {
    up: { initial: "inset(100% 0 0 0)", animate: "inset(0% 0 0 0)" },
    down: { initial: "inset(0 0 100% 0)", animate: "inset(0 0 0% 0)" },
    left: { initial: "inset(0 100% 0 0)", animate: "inset(0 0% 0 0)" },
    right: { initial: "inset(0 0 0 100%)", animate: "inset(0 0 0 0%)" },
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: clipPaths[direction].initial, opacity: 0.5 }}
      whileInView={{ clipPath: clipPaths[direction].animate, opacity: 1 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration: duration * 1.2, delay: delay * 0.5, ease: [0.76, 0, 0.24, 1] }}
      className={className}
      style={{ willChange: "clip-path, opacity" }}
    >
      {children}
    </motion.div>
  );
});
ClipReveal.displayName = "ClipReveal";

// Stagger children animation - mobile-optimized with visible stagger
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(({ 
  children, 
  className = "",
  staggerDelay = 0.1
}, ref) => {
  const { staggerDelay: optimizedStagger, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={{
        visible: {
          transition: {
            staggerChildren: optimizedStagger || staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});
StaggerContainer.displayName = "StaggerContainer";

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(({ 
  children, 
  className = "" 
}, ref) => {
  const { duration, ease, translateY } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: translateY },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration,
            ease,
          }
        },
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
StaggerItem.displayName = "StaggerItem";

// Parallax text reveal - mobile-friendly
interface TextRevealProps {
  children: ReactNode;
  className?: string;
}

export const TextReveal = forwardRef<HTMLDivElement, TextRevealProps>(({ 
  children, 
  className = "" 
}, ref) => {
  const { duration, ease, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: viewportMargin }}
        transition={{ duration: duration * 1.2, ease: [0.76, 0, 0.24, 1] }}
        style={{ willChange: "transform" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
});
TextReveal.displayName = "TextReveal";

// Rotate in animation
export const RotateIn = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const { duration, ease, viewportMargin, shouldReduceMotion } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -5, scale: 0.95 }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration, delay: delay * 0.5, ease }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
RotateIn.displayName = "RotateIn";

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Image reveal on hover - optimized
export const ImageReveal = ({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <motion.div 
    className={`overflow-hidden ${className}`}
    whileHover="hover"
  >
    <motion.img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      variants={{
        hover: {
          scale: 1.05,
          transition: { duration: 0.5, ease: easeOut },
        },
      }}
      style={{ willChange: "transform" }}
    />
  </motion.div>
);

// Float animation for decorative elements
export const FloatIn = forwardRef<HTMLDivElement, AnimationProps>(({ 
  children, 
  delay = 0,
  className = "" 
}, ref) => {
  const { duration, ease, viewportMargin } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ 
        duration: duration * 1.1, 
        delay: delay * 0.5, 
        ease,
        scale: { duration: duration * 0.8 }
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});
FloatIn.displayName = "FloatIn";
