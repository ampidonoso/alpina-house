import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useDockVisibility } from "@/contexts/DockVisibilityContext";

const ScrollToTopButton = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDockVisible } = useDockVisibility();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 400);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    handleResize();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // On mobile, hide when dock is visible to avoid overlap
  const shouldShow = hasScrolled && (!isMobile || !isDockVisible);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={scrollToTop}
          className="fixed right-4 sm:right-6 bottom-24 sm:bottom-8 z-40 p-3 bg-stone-900/90 backdrop-blur-sm border border-stone-700/50 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 hover:border-stone-600 transition-all duration-300 shadow-lg shadow-black/20 group"
          aria-label="Volver arriba"
          data-cursor
        >
          <ArrowUp 
            size={18} 
            strokeWidth={1.5}
            className="group-hover:-translate-y-0.5 transition-transform duration-200" 
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
