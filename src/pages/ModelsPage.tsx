import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Paintbrush, TreePine, Images } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import CinematicHeader from "@/components/layout/CinematicHeader";
import DockNav from "@/components/layout/DockNav";
import Footer from "@/components/layout/Footer";
import QuoteWizard from "@/components/QuoteWizard";
import MagneticButton from "@/components/ui/MagneticButton";
import LazyImage from "@/components/ui/LazyImage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  CurrencySelector, 
  FinishesTab, 
  TerrainsTab, 
  GallerySection,
  SelectionBadges 
} from "@/components/models";
import { useOptimizedAnimation } from "@/hooks/useReducedMotion";
import { useProjects, Project } from "@/hooks/useProjects";
import { useProjectFinishes, useProjectTerrains } from "@/hooks/useProjectCustomizations";
import { Currency, getFormattedPrice } from "@/lib/priceUtils";
import { getMainImage, getAllImages } from "@/lib/projectUtils";
import heroImage from "@/assets/hero-alpina.jpg";
import casaRefugio from "@/assets/casa-refugio.jpg";
import casaCaneloImg from "@/assets/casa-canelo-new.jpg";

// Model card with cinematic hover and lazy loading
const ModelCard = ({ project, index, currency }: { project: Project; index: number; currency: Currency }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const { duration, shouldReduceMotion } = useOptimizedAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 15 : 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: duration * 1.2, delay: index * 0.08, ease: [0.76, 0, 0.24, 1] }}
      className="group"
      data-cursor
    >
      <Link to={`/modelos/${project.slug}`} className="block">
        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground group-hover:text-primary transition-colors duration-500 mb-3 sm:mb-4 lg:mb-6">
          {project.name}
        </h3>

        <div className="relative overflow-hidden">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <LazyImage
              src={getMainImage(project, casaRefugio)}
              alt={project.name}
              aspectRatio="aspect-[3/4]"
              className="group-hover:brightness-90 transition-all duration-500"
            />
          </motion.div>
          
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent p-4 sm:p-6 lg:p-8 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-white">
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm opacity-80 mb-1 sm:mb-2">
                <span>{project.area_m2} m²</span>
                <span>{project.bedrooms}D / {project.bathrooms}B</span>
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-serif">{getFormattedPrice(project.price_range as string, currency)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ModelsPage = () => {
  const { data: projects, isLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('usd');
  const [selectedFinishId, setSelectedFinishId] = useState<string | undefined>(undefined);
  const [selectedTerrainId, setSelectedTerrainId] = useState<string | undefined>(undefined);
  const [quoteModelName, setQuoteModelName] = useState<string | undefined>(undefined);
  const [isHeroMounted, setIsHeroMounted] = useState(false);
  const { enableParallax, shouldReduceMotion } = useOptimizedAnimation();
  const heroRef = useRef<HTMLElement>(null);

  const { data: finishes = [], isLoading: finishesLoading } = useProjectFinishes(selectedProject?.id || '');
  const { data: terrains = [], isLoading: terrainsLoading } = useProjectTerrains(selectedProject?.id || '');

  // Only use scroll after hero is mounted to avoid hydration error
  const { scrollYProgress } = useScroll({
    target: isHeroMounted ? heroRef : undefined,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], enableParallax ? ["0%", "20%"] : ["0%", "0%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Set mounted state after component renders
  useEffect(() => {
    if (heroRef.current) {
      setIsHeroMounted(true);
    }
  }, []);

  const selectedImages = selectedProject ? getAllImages(selectedProject, casaRefugio) : [];

  const nextImage = () => setCurrentImageIndex((prev) => 
    selectedImages.length > 0 ? (prev === selectedImages.length - 1 ? 0 : prev + 1) : 0
  );
  const prevImage = () => setCurrentImageIndex((prev) => 
    selectedImages.length > 0 ? (prev === 0 ? selectedImages.length - 1 : prev - 1) : 0
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <CinematicHeader />
      <DockNav />
      
      <main>
        {/* Cinematic Hero */}
        <section ref={heroRef} className="h-[80vh] sm:h-screen relative flex items-center justify-center overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            style={{ 
              y: enableParallax ? heroY : undefined,
              willChange: enableParallax ? "transform" : "auto",
            }}
          >
            <img
              src={heroImage}
              alt="Alpina House"
              className="w-full h-[120%] object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-stone-950/50" />
          </motion.div>

          <motion.div 
            className="relative z-10 text-center px-4 sm:px-6"
            style={{ opacity: heroOpacity, willChange: "opacity" }}
          >
            <motion.span
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/70 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase block mb-4 sm:mb-6 lg:mb-8"
            >
              La Colección
            </motion.span>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-[10rem] 2xl:text-[12rem] text-white leading-[0.85] tracking-[-0.03em] mix-blend-difference">
              {shouldReduceMotion ? (
                <span>MODELOS</span>
              ) : (
                "MODELOS".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.03, duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))
              )}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-white/80 text-sm sm:text-base md:text-lg lg:text-xl mt-6 sm:mt-8 lg:mt-12 max-w-lg mx-auto px-4"
            >
              Proyectos prediseñados listos para construir. Arquitectura de calidad a 1 UF/m².
            </motion.p>
          </motion.div>

          {!shouldReduceMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 hidden sm:block"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-px h-12 sm:h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0"
              />
            </motion.div>
          )}
        </section>

        {/* Models Grid */}
        <section className="py-16 sm:py-24 lg:py-32 xl:py-48 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="mb-12 sm:mb-16 lg:mb-24 xl:mb-32 lg:ml-[20%]">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-primary text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase block mb-2 sm:mb-4"
              >
                // Explora
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground"
              >
                Nuestros <span className="italic text-muted-foreground">Diseños</span>
              </motion.h2>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {projects && projects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
                {projects.map((project, index) => (
                  <ModelCard 
                    key={project.id}
                    project={project} 
                    index={index}
                    currency={currency}
                  />
                ))}
              </div>
            )}

            {!isLoading && (!projects || projects.length === 0) && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No hay modelos disponibles</p>
              </div>
            )}
          </div>
        </section>

        {/* Giant CTA */}
        <section className="py-24 sm:py-32 lg:py-48 xl:py-64 relative overflow-hidden">
          <div className="absolute inset-0">
            <LazyImage
              src={casaCaneloImg}
              alt=""
              aspectRatio="aspect-auto"
              containerClassName="w-full h-full"
              className="opacity-20 grayscale"
            />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <MagneticButton strength={0.3}>
                <a
                  href="/configurador"
                  className="group relative px-8 sm:px-12 lg:px-20 py-6 sm:py-8 lg:py-10 bg-cta text-cta-foreground text-base sm:text-lg md:text-xl lg:text-2xl uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-cta/90 transition-all duration-500 inline-block"
                  data-cursor
                >
                  <span className="relative z-10">Iniciar Viaje</span>
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformOrigin: "left" }}
                  />
                </a>
              </MagneticButton>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <QuoteWizard
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setSelectedFinishId(undefined);
          setSelectedTerrainId(undefined);
          setQuoteModelName(undefined);
        }}
        preselectedModel={quoteModelName}
        preselectedFinish={selectedFinishId}
        preselectedTerrain={selectedTerrainId}
      />
    </motion.div>
  );
};

export default ModelsPage;
