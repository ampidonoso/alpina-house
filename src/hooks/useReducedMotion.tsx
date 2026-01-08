import { useState, useEffect } from "react";

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  return isTablet;
};

// Optimized animation settings based on device capabilities
// Mobile animations are now faster and use GPU-friendly transforms
export const useOptimizedAnimation = () => {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Only truly reduce for accessibility preference
  const shouldReduceMotion = prefersReducedMotion;

  // Mobile-optimized settings - faster, simpler, GPU-friendly
  if (isMobile) {
    return {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      staggerDelay: 0.03,
      translateY: 15,
      translateX: 20,
      enableParallax: false,
      shouldReduceMotion: false,
      viewportMargin: "-20px",
      // Mobile-specific optimizations
      useTransform3d: true,
      disableBlur: true,
      simpleEase: true,
    };
  }

  // Tablet settings - balanced performance
  if (isTablet) {
    return {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      staggerDelay: 0.05,
      translateY: 20,
      translateX: 25,
      enableParallax: true,
      shouldReduceMotion: false,
      viewportMargin: "-40px",
      useTransform3d: true,
      disableBlur: false,
      simpleEase: false,
    };
  }

  // Desktop settings - full animations
  return {
    duration: shouldReduceMotion ? 0.3 : 0.7,
    ease: shouldReduceMotion 
      ? [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      : [0.16, 1, 0.3, 1] as [number, number, number, number],
    staggerDelay: shouldReduceMotion ? 0 : 0.1,
    translateY: shouldReduceMotion ? 10 : 30,
    translateX: shouldReduceMotion ? 15 : 40,
    enableParallax: !shouldReduceMotion,
    shouldReduceMotion,
    viewportMargin: "-80px",
    useTransform3d: false,
    disableBlur: shouldReduceMotion,
    simpleEase: shouldReduceMotion,
  };
};