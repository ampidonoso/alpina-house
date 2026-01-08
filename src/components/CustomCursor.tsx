import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const checkDesktop = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isLargeScreen = window.innerWidth >= 1024;
      setIsDesktop(!hasTouch && isLargeScreen);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    if (!isVisible) setIsVisible(true);
  }, [isVisible]);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = 
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer") ||
        target.dataset.cursor;
      
      if (interactive) setIsHovering(true);
    };

    const handleMouseLeave = () => setIsHovering(false);

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseout", handleMouseOut);

    const addListeners = () => {
      document.querySelectorAll("a, button, .cursor-pointer, [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter as EventListener);
        el.addEventListener("mouseleave", handleMouseLeave);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseout", handleMouseOut);
      observer.disconnect();
    };
  }, [handleMouseMove, isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="rounded-full bg-white"
          animate={{
            width: isHovering ? 64 : 24,
            height: isHovering ? 64 : 24,
            scale: isClicking ? 0.8 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        />
      </div>
    </div>
  );
};

export default CustomCursor;