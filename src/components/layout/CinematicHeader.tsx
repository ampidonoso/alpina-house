import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import AlpinaLogo from "@/components/AlpinaLogo";
import QuoteWizard from "@/components/QuoteWizard";

const CinematicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const navItems = [
    { label: "Modelos", href: "/modelos" },
    { label: "Quiénes Somos", href: "/quienes-somos" },
    { label: "Servicios", href: "/servicios" },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Smart header visibility based on scroll direction and position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setIsScrolled(scrollY > 50);
      
      // Always show at top
      if (scrollY < 100) {
        setIsVisible(true);
        lastScrollY.current = scrollY;
        return;
      }
      
      // Hide when near footer
      const isNearBottom = scrollY + windowHeight > documentHeight - 200;
      if (isNearBottom) {
        setIsVisible(false);
        lastScrollY.current = scrollY;
        return;
      }
      
      // Show on scroll up, hide on scroll down
      const isScrollingUp = scrollY < lastScrollY.current;
      setIsVisible(isScrollingUp);
      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Header - Horizontal Navigation */}
      <motion.header
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : -20 
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-[100] hidden lg:block transition-all duration-300 ${
          isScrolled ? 'bg-stone-950/90 backdrop-blur-md border-b border-white/10' : ''
        }`}
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
      >
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" data-cursor>
            <AlpinaLogo className="h-7 lg:h-8 w-auto drop-shadow-lg" color="white" />
          </Link>

          {/* Center Nav Links */}
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Link
                  to={item.href}
                  className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 relative ${
                    isActive(item.href)
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                  data-cursor
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="px-6 py-2.5 bg-white text-black text-xs uppercase tracking-[0.15em] hover:bg-zinc-100 transition-colors relative overflow-hidden group shadow-lg font-bold"
              data-cursor
            >
              <span className="relative z-10">Cotizar</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Header - Logo + Hamburger */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : -20 
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-[100] lg:hidden"
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
      >
        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 transition-all duration-300 ${
          isScrolled ? 'bg-stone-950/90 backdrop-blur-md' : ''
        }`}>
          <Link to="/" data-cursor>
            <AlpinaLogo className="h-6 sm:h-7 w-auto drop-shadow-lg" color="white" />
          </Link>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 group"
            data-cursor
          >
            <span className="text-white text-[10px] tracking-[0.15em] uppercase opacity-80">
              Menu
            </span>
            <Menu size={20} className="text-white" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      {/* Fullscreen Menu Overlay - Mobile Only */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 2rem) 2rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2rem) 2rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2rem) 2rem)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[200] bg-stone-950 flex items-center justify-center overflow-y-auto lg:hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-stone-400 hover:text-white transition-colors"
              data-cursor
            >
              <X size={28} strokeWidth={1} />
            </button>

            {/* Navigation */}
            <nav className="flex flex-col items-center gap-3 py-16">
              {[{ label: "Inicio", href: "/" }, ...navItems].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-serif text-4xl sm:text-5xl transition-all duration-500 ${
                      isActive(item.href) 
                        ? "text-white" 
                        : "text-stone-600 hover:text-white"
                    }`}
                    data-cursor
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8"
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsQuoteOpen(true);
                  }}
                  className="px-8 py-4 bg-cta text-cta-foreground text-sm uppercase tracking-[0.2em] hover:bg-cta/90 transition-colors"
                  data-cursor
                >
                  Iniciar Viaje
                </button>
              </motion.div>
            </nav>

            {/* Footer in Menu */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-600 text-xs">
              <span>© 2025 Alpina House</span>
              <span className="tracking-[0.15em] uppercase">Engineering by Winteri</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuoteWizard isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </>
  );
};

export default CinematicHeader;