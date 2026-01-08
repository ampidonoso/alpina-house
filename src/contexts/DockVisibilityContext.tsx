import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface DockVisibilityContextType {
  isDockVisible: boolean;
}

const DockVisibilityContext = createContext<DockVisibilityContextType | undefined>(undefined);

export const DockVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isDockVisible, setIsDockVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Always show near top
      if (scrollY < 100) {
        setIsDockVisible(true);
        lastScrollY.current = scrollY;
        return;
      }
      
      // Hide when near footer (within 300px of bottom)
      const isNearBottom = scrollY + windowHeight > documentHeight - 300;
      if (isNearBottom) {
        setIsDockVisible(false);
        lastScrollY.current = scrollY;
        return;
      }
      
      // Otherwise always show
      setIsDockVisible(true);
      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <DockVisibilityContext.Provider value={{ isDockVisible }}>
      {children}
    </DockVisibilityContext.Provider>
  );
};

export const useDockVisibility = () => {
  const context = useContext(DockVisibilityContext);
  if (!context) {
    throw new Error("useDockVisibility must be used within DockVisibilityProvider");
  }
  return context;
};
