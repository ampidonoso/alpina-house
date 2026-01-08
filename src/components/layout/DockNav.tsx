import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import QuoteWizard from "@/components/QuoteWizard";
import casaRefugio from "@/assets/casa-refugio.jpg";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { useDockVisibility } from "@/contexts/DockVisibilityContext";

const DockNav = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const { isDockVisible: isVisible } = useDockVisibility();
  const location = useLocation();
  const { getConfig } = useSiteConfigContext();
  
  const calendarUrl = getConfig('calendar_url', 'https://calendar.app.google/UJZzttg7stibZpjB8');
  const contactEmail = getConfig('contact_email', 'contacto@alpinahouse.com');
  const contactPhone = getConfig('contact_phone', '+56 9 8977 6227');

  const navItems = [
    { label: "Modelos", href: "/modelos" },
    { label: "Filosofía", href: "/quienes-somos" },
    { label: "Contacto", action: () => setIsContactOpen(true) },
  ];

  const isActive = (href?: string) => href && location.pathname === href;

  return (
    <>
      {/* Floating Dock - Mobile Only */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: (isVisible && !isContactOpen && !isQuoteOpen) ? 0 : 100, 
          opacity: (isVisible && !isContactOpen && !isQuoteOpen) ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed z-50 left-0 right-0 bottom-0 lg:hidden flex justify-center pb-[calc(env(safe-area-inset-bottom)+24px)] sm:pb-[calc(env(safe-area-inset-bottom)+32px)]"
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
      >
        <div className="flex items-center justify-between sm:justify-center w-[92%] max-w-[340px] sm:w-auto sm:max-w-none px-4 py-3.5 bg-stone-950/98 backdrop-blur-2xl border border-stone-800/60 rounded-full shadow-2xl shadow-black/50">
          {navItems.map((item, index) => (
            <motion.div 
              key={item.label} 
              whileHover={{ backgroundColor: "rgba(168, 162, 158, 0.12)", scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`relative ${index === 0 ? 'rounded-l-full' : ''} ${index === navItems.length - 1 ? 'rounded-r-full' : ''}`}
            >
              {item.href ? (
                <Link
                  to={item.href}
                  className={`relative px-5 sm:px-6 py-3.5 sm:py-4 text-[10px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] transition-all duration-300 block text-center whitespace-nowrap ${
                    isActive(item.href)
                      ? "text-stone-100 font-medium"
                      : "text-stone-400 hover:text-stone-100"
                  }`}
                  data-cursor
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-stone-100 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              ) : (
                <button
                  onClick={item.action}
                  className="px-5 sm:px-6 py-3.5 sm:py-4 text-[10px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] text-stone-400 hover:text-stone-100 transition-all duration-300 whitespace-nowrap"
                  data-cursor
                >
                  {item.label}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Full-screen Contact Overlay - Slides from Right */}
      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "30%", opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.32, 0.72, 0, 1],
              opacity: { duration: 0.4 }
            }}
            className="fixed inset-0 z-[200] bg-stone-950 flex overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 p-2 sm:p-3 text-stone-500 hover:text-stone-100 transition-colors z-10"
              data-cursor
            >
              <X size={24} strokeWidth={1} className="sm:w-7 sm:h-7" />
            </button>

            {/* Left Column - Dark with messaging */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-24 py-16 sm:py-20">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                exit={{ opacity: 0, y: -10, transition: { delay: 0.15, duration: 0.2 } }}
                className="text-stone-600 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 lg:mb-8"
              >
                Contacto
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                exit={{ opacity: 0, y: -20, transition: { delay: 0.1, duration: 0.25 } }}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-stone-100 leading-[0.95] tracking-[-0.03em] mb-6 sm:mb-8 lg:mb-12"
              >
                Iniciemos
                <br />
                <span className="italic text-stone-500">tu viaje</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                exit={{ opacity: 0, y: -10, transition: { delay: 0.05, duration: 0.2 } }}
                className="text-stone-400 text-sm sm:text-base lg:text-lg max-w-md mb-8 sm:mb-10 lg:mb-12 leading-relaxed"
              >
                Cuéntanos sobre tu proyecto. Evaluamos tu terreno y te entregamos 
                una cotización detallada sin compromiso.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
                exit={{ opacity: 0, x: -20, transition: { delay: 0, duration: 0.2 } }}
                className="flex flex-col gap-3 sm:gap-4"
              >
                <button
                  onClick={() => {
                    setIsContactOpen(false);
                    setIsQuoteOpen(true);
                  }}
                  className="group flex items-center justify-between w-full max-w-md px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-cta text-cta-foreground hover:bg-cta/90 active:bg-cta/80 transition-all"
                  data-cursor
                >
                  <span className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em]">Solicitar cotización</span>
                  <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-2 transition-transform" />
                </button>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full max-w-md px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 active:text-stone-100 transition-all"
                  data-cursor
                >
                  <span className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em]">Agendar reunión</span>
                  <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-2 transition-transform" />
                </a>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.8 } }}
                exit={{ opacity: 0, transition: { delay: 0, duration: 0.15 } }}
                className="mt-10 sm:mt-12 lg:mt-16 flex flex-col gap-2 sm:gap-3 text-stone-600 text-xs sm:text-sm"
              >
                <a href={`mailto:${contactEmail}`} className="hover:text-stone-400 active:text-stone-400 transition-colors" data-cursor>
                  {contactEmail}
                </a>
                <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-stone-400 active:text-stone-400 transition-colors" data-cursor>
                  {contactPhone}
                </a>
              </motion.div>
            </div>

            {/* Right Column - Image (hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, duration: 1 } }}
              exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
              className="hidden lg:block w-1/2 relative overflow-hidden"
            >
              <img
                src={casaRefugio}
                alt="Casa Alpina"
                className="w-full h-full object-cover"
                style={{ filter: "saturate(0.8) brightness(0.7)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuoteWizard isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </>
  );
};

export default DockNav;
