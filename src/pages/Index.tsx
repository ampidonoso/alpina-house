import { useState } from "react";
import { ArrowRight, Maximize2, Thermometer, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CinematicHeader from "@/components/layout/CinematicHeader";
import DockNav from "@/components/layout/DockNav";
import Footer from "@/components/layout/Footer";
import QuoteWizard from "@/components/QuoteWizard";
import HubSpotForm from "@/components/HubSpotForm";
import ImageLightbox from "@/components/ui/ImageLightbox";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Cotizador } from "@/components/Cotizador";
import { useFaqs, useTimeline, useFeaturedTestimonial, useFeaturedSuccessCase } from "@/hooks/useSiteContent";
import { useSiteAssets, getAssetUrl } from "@/hooks/useSiteAssets";
import { imageSlots, getSlotByKey } from "@/config/imageSlots";
import { useProjects, Project } from "@/hooks/useProjects";
import casaRefugio from "@/assets/casa-refugio.jpg";
import heroPoster from "@/assets/hero-refugio.jpg";
import BentoGridFeatures from "@/components/sections/BentoGridFeatures";
import HowItWorks from "@/components/sections/HowItWorks";
import ScrollIndicator from "@/components/ui/ScrollIndicator";

// Gallery slot keys for building the gallery from the slots system
const gallerySlotKeys = [
  'gallery_refugio_1',
  'gallery_refugio_2',
  'gallery_refugio_3',
  'gallery_refugio_4',
  'gallery_refugio_5',
  'gallery_refugio_6',
  'gallery_refugio_7',
  'gallery_refugio_8',
  'gallery_refugio_9',
];

// Helper to get main image from project
const getMainImage = (project: Project, fallback: string): string => {
  const coverImage = project.images?.find(img => img.is_cover || img.image_type === 'cover');
  return coverImage?.storage_path || project.images?.[0]?.storage_path || fallback;
};

const Index = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [preselectedModel, setPreselectedModel] = useState<string | undefined>();
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; index: number } | null>(null);

  // Fetch content from database
  const { data: faqs = [] } = useFaqs();
  const { data: timeline = [] } = useTimeline();
  const { data: testimonial } = useFeaturedTestimonial();
  const { data: successCase } = useFeaturedSuccessCase();
  const { data: siteAssets } = useSiteAssets();
  const { data: projects = [] } = useProjects();

  // Helper to get image URL from slots system (DB or fallback)
  const getImageUrl = (slotKey: string): string => {
    const slot = getSlotByKey(slotKey);
    if (!slot) return '';
    return getAssetUrl(siteAssets, slotKey, slot.defaultImage);
  };

  // Build gallery images from slots system
  const galleryImages = gallerySlotKeys.map(key => {
    const slot = getSlotByKey(key);
    return {
      src: getImageUrl(key),
      alt: slot?.name || '',
    };
  });

  const openLightbox = (img: { src: string; alt: string }, index: number) => {
    setLightboxImage({ ...img, index });
  };

  const closeLightbox = () => setLightboxImage(null);

  const navigateToImage = (index: number) => {
    setLightboxImage({ ...galleryImages[index], index });
  };

  const handleQuoteRequest = (model?: string) => {
    setPreselectedModel(model);
    setIsQuoteOpen(true);
  };

  // Get price in USD
  const getUsdPrice = (priceRange: string | null): string => {
    if (!priceRange) return "Consultar";
    try {
      const prices = JSON.parse(priceRange);
      return prices.usd ? `USD ${prices.usd}` : "Consultar";
    } catch {
      return priceRange;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white text-zinc-900"
    >
      <SEOHead />
      <CinematicHeader />
      <DockNav />

      <main id="main-content" className="min-h-screen bg-white">
        {/* HERO SECTION: Lumi-pod Style - Full-screen Immersive */}
        <section 
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
          aria-label="Hero section"
        >
          {/* Background Image - Full Screen */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <motion.img
              src={getImageUrl('hero_house') || heroPoster}
              alt="Casa prefabricada Alpina en entorno natural con nieve y bosque"
              className="w-full h-full object-cover"
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
              loading="eager"
              fetchPriority="high"
            />
            
            {/* Multi-layer Overlay System - Inspired by Raulí & Canelo forests */}
            
            {/* Base darkening layer - subtle forest depth */}
            <div className="absolute inset-0 bg-[hsl(140_25%_5%)]/20" aria-hidden="true" />
            
            {/* Top gradient - forest canopy effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(140_30%_10%)]/40 via-[hsl(140_20%_15%)]/10 to-transparent" aria-hidden="true" />
            
            {/* Bottom gradient - forest floor effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30_15%_20%)]/50 via-[hsl(140_25%_15%)]/20 to-transparent" aria-hidden="true" />
            
            {/* Side gradients - Canelo-inspired warm tones */}
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(25_20%_15%)]/30 via-transparent to-[hsl(25_20%_15%)]/30" aria-hidden="true" />
            
            {/* Radial vignette - forest clearing effect */}
            <div 
              className="absolute inset-0" 
              style={{
                background: "radial-gradient(ellipse at center, transparent 0%, transparent 50%, hsl(140 25% 10% / 0.3) 100%)"
              }}
              aria-hidden="true"
            />
            
            {/* Subtle bark texture - Raulí-inspired */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23140' stroke-width='0.3' opacity='0.4'%3E%3Cpath d='M0 10 Q20 5 40 10 T80 10'/%3E%3Cpath d='M0 30 Q20 25 40 30 T80 30'/%3E%3Cpath d='M0 50 Q20 45 40 50 T80 50'/%3E%3Cpath d='M0 70 Q20 65 40 70 T80 70'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
              aria-hidden="true"
            />
            
            {/* Canelo leaf pattern - very subtle */}
            <div 
              className="absolute inset-0 opacity-[0.01]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23120' opacity='0.2'%3E%3Cellipse cx='50' cy='50' rx='8' ry='15' transform='rotate(45 50 50)'/%3E%3Cellipse cx='150' cy='80' rx='8' ry='15' transform='rotate(-30 150 80)'/%3E%3Cellipse cx='80' cy='150' rx='8' ry='15' transform='rotate(60 80 150)'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-center min-h-full">
            
            {/* Texto Hero */}
            <div className="lg:col-span-7 text-white space-y-5 sm:space-y-6 lg:space-y-8 lg:pr-6">
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase opacity-90 border-l-2 border-white/80 pl-3 sm:pl-4"
              >
                Prefabricadas de Alta Gama
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-[-0.03em] leading-[0.92]"
              >
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="block"
                >
                  Habitar
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-serif italic font-light text-white/95 block mt-2 sm:mt-3"
                >
                  la naturaleza.
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-lg sm:text-xl lg:text-2xl text-white/85 font-light max-w-2xl leading-relaxed tracking-wide"
              >
                Diseño consciente y eficiencia térmica. Tu refugio en el sur de Chile, entregado en 4 meses.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    className="bg-white text-black hover:bg-zinc-100 rounded-none h-12 sm:h-14 px-8 sm:px-10 text-xs sm:text-sm font-bold tracking-widest uppercase w-full sm:w-auto transition-all duration-200 shadow-2xl hover:shadow-white/20 relative overflow-hidden group"
                    asChild
                  >
                    <Link to="/modelos" aria-label="Ver todos los modelos disponibles">
                      <span className="relative z-10">Ver Modelos</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/20 hover:border-white rounded-none h-12 sm:h-14 px-8 sm:px-10 text-xs sm:text-sm font-bold tracking-widest uppercase w-full sm:w-auto transition-all duration-200 backdrop-blur-md bg-white/5 relative overflow-hidden group shadow-lg"
                    onClick={() => setIsQuoteOpen(true)}
                    aria-label="Abrir formulario de cotización"
                  >
                    <span className="relative z-10 text-white font-bold">Cotizar</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Cotizador (Lado derecho en desktop, debajo en móvil) */}
            <div className="lg:col-span-5 lg:order-last flex items-start lg:items-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full lg:w-auto lg:max-w-sm"
              >
                <Cotizador />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECCIÓN MODELOS (Grilla Limpia / Blanca) */}
        {projects.length > 0 && (
          <section id="modelos" className="py-20 sm:py-28 md:py-36 bg-white container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Modelos disponibles">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 sm:mb-18 md:mb-24 gap-4"
            >
              <div className="space-y-3 sm:space-y-4">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-[10px] sm:text-xs font-medium text-zinc-400/80 tracking-[0.3em] uppercase"
                >
                  Nuestra Colección
                </motion.h3>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.8 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-zinc-900 tracking-[-0.02em] leading-[0.95]"
                >
                  Modelos<br className="hidden sm:block" /> Prediseñados
                </motion.h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="link"
                  className="text-zinc-900 underline decoration-zinc-300 underline-offset-8 hover:text-zinc-600 rounded-none text-sm sm:text-base font-medium transition-all"
                  asChild
                >
                  <Link to="/modelos" className="flex items-center group">
                    Ver especificaciones técnicas completas 
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Grilla de Productos - Ultra refined */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-12 lg:gap-x-16 gap-y-16 sm:gap-y-24 lg:gap-y-28">
              {projects.slice(0, 4).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ 
                    delay: index * 0.12, 
                    duration: 0.8, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`group cursor-pointer ${index % 2 === 1 ? 'md:mt-16 lg:mt-20' : ''}`}
                >
                  <Link to={`/modelos#${project.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100/50 mb-6 sm:mb-8 rounded-sm group/image shadow-lg hover:shadow-2xl transition-shadow duration-700">
                      <motion.img
                        src={getMainImage(project, casaRefugio)}
                        alt={`${project.name} - ${project.area_m2}m², ${project.bedrooms} dormitorios, ${project.bathrooms} baños`}
                        className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover/image:scale-[1.12]"
                        loading="lazy"
                      />
                      {/* Multi-layer overlays for depth */}
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/15 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-700" />
                      {/* Enhanced shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        initial={{ x: '-100%', opacity: 0 }}
                        whileHover={{ x: '100%', opacity: 1 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-5 sm:gap-0 border-t-[1.5px] border-zinc-200/50 pt-6 sm:pt-8 group-hover:border-zinc-300/70 transition-all duration-500">
                      <div className="flex-1 space-y-2">
                        <motion.h3 
                          className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-zinc-900 group-hover:text-zinc-800 transition-colors duration-500"
                          whileHover={{ x: 2 }}
                        >
                          {project.name}
                        </motion.h3>
                        <p className="text-sm sm:text-base text-zinc-500/80 font-light tracking-wide">
                          {project.bedrooms} Dormitorios / {project.bathrooms} Baños
                        </p>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <motion.p 
                          className="text-xl sm:text-2xl lg:text-3xl font-light tracking-tight text-zinc-900"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          {getUsdPrice(project.price_range as string | null)}
                        </motion.p>
                        <p className="text-xs sm:text-sm text-zinc-400/70 font-light tracking-wider uppercase">{project.area_m2} m²</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* BENTO GRID FEATURES - Jupe Style */}
        <BentoGridFeatures />

        {/* Philosophy Section - Inspired by native forests */}
        <section className="py-20 sm:py-28 md:py-36 lg:py-44 bg-gradient-to-b from-white via-[hsl(140_12%_98%)] to-[hsl(120_10%_97%)] relative overflow-hidden">
          {/* Raulí bark texture overlay */}
          <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23140' stroke-width='0.4' opacity='0.3'%3E%3Cpath d='M0 15 Q25 8 50 15 T100 15'/%3E%3Cpath d='M0 35 Q25 28 50 35 T100 35'/%3E%3Cpath d='M0 55 Q25 48 50 55 T100 55'/%3E%3Cpath d='M0 75 Q25 68 50 75 T100 75'/%3E%3Cpath d='M0 95 Q25 88 50 95 T100 95'/%3E%3C/g%3E%3C/svg%3E")`,}} />
          {/* Canelo-inspired warm tint */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(25_15%_98%)]/30 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-28 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-zinc-400/80 mb-6 sm:mb-8 block font-medium"
                >
                  Philosophy
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-[-0.02em] text-zinc-900 mb-8 sm:mb-10 leading-[0.95]"
                >
                  Habitar <br/>
                  <span className="font-serif italic font-light text-zinc-800/90">la naturaleza.</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-lg sm:text-xl md:text-2xl text-zinc-600/80 leading-relaxed mb-10 sm:mb-12 max-w-2xl font-light tracking-wide"
                >
                  Waking up each morning. Sharing in a kitchen designed for you. 
                  Enjoying the garden with your family. We want to make your house 
                  your favorite place in the world.
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white rounded-none px-8 sm:px-10 py-6 sm:py-7 text-xs sm:text-sm tracking-[0.15em] uppercase w-full sm:w-auto transition-all relative overflow-hidden group"
                    asChild
                  >
                    <Link to="/quienes-somos" className="flex items-center">
                      <span className="relative z-10">Our Story</span>
                      <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1 relative z-10" aria-hidden="true" />
                      <motion.div
                        className="absolute inset-0 bg-zinc-900"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -8 }}
                className="order-1 lg:order-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 rounded-sm group cursor-pointer">
                  <motion.img
                    src={getImageUrl('section_manifesto')}
                    alt="Interior de casa Alpina con diseño minimalista y conexión con la naturaleza"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-black/5 group-hover:to-black/5 transition-all duration-700" />
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '100%', opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Samara Style */}
        <HowItWorks />

        {/* FAQ - Minimalist */}
        {faqs.length > 0 && (
          <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-white border-t border-zinc-100/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 sm:mb-16 md:mb-24 text-center"
              >
                <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-zinc-400 mb-3 sm:mb-4 block">
                  FAQ
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-zinc-900">
                  Frequently Asked Questions
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={`faq-${faq.id}`}
                      className="border-b border-zinc-200 px-0"
                    >
                      <AccordionTrigger className="text-left py-6 text-sm md:text-base font-medium text-zinc-900 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-zinc-600 leading-relaxed pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* Contact Form */}
        <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-zinc-50/30 border-t border-zinc-100/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-16 md:mb-24 text-center"
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-zinc-400 mb-3 sm:mb-4 block">
                Contact
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-zinc-900 mb-3 sm:mb-4">
                Have Questions?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-zinc-600 max-w-xl mx-auto px-4">
                Leave your details and we'll contact you shortly
              </p>
            </motion.div>

            <div className="max-w-xl mx-auto">
              <HubSpotForm className="hubspot-form-container" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-28 sm:py-36 md:py-44 lg:py-60 bg-zinc-900 text-white relative overflow-hidden">
          {/* Multi-layer Overlay System */}
          
          {/* Base pattern overlay - subtle */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 via-transparent to-zinc-950/30" />
          
          {/* Radial vignette */}
          <div 
            className="absolute inset-0" 
            style={{
              background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.2) 100%)"
            }}
          />
          
          {/* Subtle noise texture */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white/70 mb-5 sm:mb-7 block font-semibold">
                Get Started
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight mb-7 sm:mb-9 leading-[1.1] px-4">
                Ready to Build?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 sm:mb-14 px-4 leading-relaxed">
                Schedule a free technical visit. We evaluate your land and deliver 
                a detailed quote within 48 hours.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="default"
                  className="bg-white text-black hover:bg-zinc-100 rounded-none px-8 sm:px-10 py-6 sm:py-7 text-xs sm:text-sm tracking-[0.15em] uppercase w-full sm:w-auto transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group"
                  onClick={() => setIsQuoteOpen(true)}
                  aria-label="Solicitar cotización"
                >
                  <span className="relative z-10 flex items-center">
                    Request Quote
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.7 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Quote Wizard Modal */}
      <QuoteWizard 
        isOpen={isQuoteOpen} 
        onClose={() => {
          setIsQuoteOpen(false);
          setPreselectedModel(undefined);
        }}
        preselectedModel={preselectedModel}
      />

      {/* Lightbox Modal */}
      <ImageLightbox
        image={lightboxImage}
        images={galleryImages}
        onClose={closeLightbox}
        onNavigate={navigateToImage}
      />
    </motion.div>
  );
};

export default Index;
