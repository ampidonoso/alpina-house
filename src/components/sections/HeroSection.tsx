import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useOptimizedAnimation } from "@/hooks/useReducedMotion";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import alpinaHouseLogo from "@/assets/alpina-house-logo.png";
import heroPoster from "@/assets/hero-refugio.jpg";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fadeOut' | 'fadeIn'>('idle');
  const { shouldReduceMotion } = useOptimizedAnimation();
  const { getConfig } = useSiteConfigContext();
  
  // Get configured videos from Admin - empty by default (clean slate)
  const configuredVideosRaw = getConfig('hero_videos', '');
  const videos: string[] = (() => {
    try {
      return configuredVideosRaw ? JSON.parse(configuredVideosRaw) : [];
    } catch { return []; }
  })();
  
  const hasVideos = videos.length > 0;
  const useRotation = videos.length > 1;
  
  // Hero text configs
  const heroPreheadline = getConfig('hero_preheadline', 'Proyectos prediseñados listos para construir');
  const heroBtnPrimaryText = getConfig('hero_btn_primary_text', 'Ver Modelos');
  const heroBtnPrimaryLink = getConfig('hero_btn_primary_link', '/modelos');
  const heroCtaText = getConfig('hero_cta_text', 'Cotizar Ahora');
  const heroBtnSecondaryLink = getConfig('hero_btn_secondary_link', 'https://calendar.app.google/UJZzttg7stibZpjB8');
  
  // Stats configs
  const stat1Label = getConfig('hero_stat_1_label', 'Modelos');
  const stat1Value = getConfig('hero_stat_1_value', '5');
  const stat2Label = getConfig('hero_stat_2_label', 'Desde');
  const stat2Value = getConfig('hero_stat_2_value', '18 m²');
  const stat3Label = getConfig('hero_stat_3_label', 'Tiempo');
  const stat3Value = getConfig('hero_stat_3_value', '~6 mes');
  
  // Value proposition
  const valueProposition = getConfig('hero_value_proposition', 'Casas prefabricadas de diseño nórdico desde 1 UF/m² · Entrega en ~6 meses');

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Cinematic crossfade transition between videos (only when multiple videos configured)
  useEffect(() => {
    if (!videoLoaded || !useRotation) return;
    
    const transitionDuration = 3000; // 3s for smooth crossfade
    const displayDuration = 10000;   // 10s display per video
    
    const interval = setInterval(() => {
      setTransitionPhase('fadeOut');
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((prev) => (prev + 1) % videos.length);
        setTransitionPhase('fadeIn');
        
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionPhase('idle');
        }, transitionDuration);
      }, transitionDuration);
      
    }, displayDuration + transitionDuration);
    
    return () => clearInterval(interval);
  }, [videoLoaded, nextIndex, useRotation, videos.length]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-stone-950"
    >
      {/* Background - Video or Static Image */}
      {hasVideos ? (
        <>
          {/* Background Video - Current */}
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              opacity: isTransitioning && transitionPhase === 'fadeOut' ? 0 : videoLoaded ? 1 : 0,
              scale: isTransitioning && transitionPhase === 'fadeOut' ? 1.08 : 1
            }}
            transition={{ 
              duration: 3, 
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={videoLoaded && !shouldReduceMotion ? { 
                scale: [1, 1.06, 1],
              } : {}}
              transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "linear",
              }}
            >
              <video
                key={`current-${currentIndex}`}
                autoPlay
                muted
                loop
                playsInline
                poster={heroPoster}
                onCanPlayThrough={() => setVideoLoaded(true)}
                className="w-full h-full object-cover"
                style={{ 
                  filter: "saturate(1.08) contrast(1.02) brightness(0.95)",
                  transform: "scale(1.1)",
                }}
              >
                <source src={videos[currentIndex]} type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>

          {/* Background Video - Next (preloaded, fades in during transition) */}
          {useRotation && (
            <motion.div 
              className="absolute inset-0"
              animate={{ 
                opacity: isTransitioning && transitionPhase === 'fadeOut' ? 1 : 0,
                scale: isTransitioning && transitionPhase === 'fadeOut' ? 1 : 0.98
              }}
              transition={{ 
                duration: 3, 
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
            >
              <motion.div
                className="absolute inset-0"
                animate={!shouldReduceMotion ? { 
                  scale: [1, 1.06, 1],
                } : {}}
                transition={{ 
                  duration: 25, 
                  repeat: Infinity, 
                  ease: "linear",
                }}
              >
                <video
                  key={`next-${nextIndex}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={heroPoster}
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: "saturate(1.08) contrast(1.02) brightness(0.95)",
                    transform: "scale(1.1)",
                  }}
                >
                  <source src={videos[nextIndex]} type="video/mp4" />
                </video>
              </motion.div>
            </motion.div>
          )}
        </>
      ) : (
        /* Static Image Background (default when no videos configured) */
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute inset-0"
            animate={!shouldReduceMotion ? { 
              scale: [1, 1.06, 1],
            } : {}}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear",
            }}
          >
            <img
              src={heroPoster}
              alt="Alpina House"
              className="w-full h-full object-cover"
              style={{ 
                filter: "saturate(1.08) contrast(1.02) brightness(0.95)",
                transform: "scale(1.1)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
      
      {/* Cinematic Overlays - Premium Film Look */}
      <div className="absolute inset-0 bg-stone-950/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-stone-950/60 pointer-events-none" />
      
      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[8vh] bg-gradient-to-b from-stone-950 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[12vh] bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(12, 10, 9, 0.5) 100%)"
        }}
      />
      
      {/* Subtle film grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 pb-20 sm:pb-24"
        style={{ opacity, willChange: "opacity" }}
      >
        {/* Decorative line above */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-4 sm:mb-8"
        />
        
        {/* Pre-headline */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-3 sm:mb-6 px-2"
        >
          <span className="text-white/60 text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase font-light text-center block">
            {heroPreheadline}
          </span>
        </motion.div>

        {/* Alpina House Logo */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6 sm:mt-10"
        >
          <img 
            src={alpinaHouseLogo} 
            alt="ALPINA HOUSE" 
            className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          />
        </motion.div>

        {/* Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-4 sm:mt-6 text-white/70 text-xs sm:text-sm md:text-base tracking-wide text-center max-w-md sm:max-w-xl px-4"
        >
          {valueProposition}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 sm:mt-10 flex flex-col min-[380px]:flex-row gap-3 sm:gap-4 w-full px-4 sm:px-0 sm:w-auto items-center"
        >
          <div className="flex flex-col items-center">
            <Link
              to={heroBtnPrimaryLink}
              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 md:px-12 py-3 sm:py-4 bg-white text-stone-950 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] font-medium overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              data-cursor
            >
              <span className="relative z-10">{heroBtnPrimaryText}</span>
              <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-stone-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <span className="text-white/50 text-[9px] sm:text-[10px] mt-1.5 tracking-wide">
              Diseño y planos incluidos
            </span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href={heroBtnSecondaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 md:px-12 py-3 sm:py-4 border border-white/30 text-white text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              data-cursor
            >
              {heroCtaText}
            </a>
            <span className="text-white/50 text-[9px] sm:text-[10px] mt-1.5 tracking-wide">
              Sin compromiso · Respuesta en 24h
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 bg-stone-950/90 backdrop-blur-md border-t border-white/10"
      >
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center md:justify-between sm:items-center sm:gap-8 text-center">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-white/50 text-[8px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">{stat1Label}</span>
              <span className="text-white text-lg sm:text-2xl font-serif">{stat1Value}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-white/50 text-[8px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">{stat2Label}</span>
              <span className="text-white text-lg sm:text-2xl font-serif">{stat2Value}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-white/50 text-[8px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">{stat3Label}</span>
              <span className="text-white text-lg sm:text-2xl font-serif">{stat3Value}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Hidden on mobile */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 hidden sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 sm:h-12 bg-gradient-to-b from-white/50 to-transparent"
          />
        </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
