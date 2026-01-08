import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";

// Global lenis instance for scroll control
let globalLenis: Lenis | null = null;

export const scrollToTop = () => {
  if (globalLenis) {
    globalLenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
};

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      globalLenis = null;
    };
  }, []);

  return lenisRef;
};
