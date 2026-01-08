import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Ruler, Bed, Bath, Clock, Mountain, Loader2, Paintbrush, TreePine, Images, Share2 } from "lucide-react";
import CinematicHeader from "@/components/layout/CinematicHeader";
import DockNav from "@/components/layout/DockNav";
import Footer from "@/components/layout/Footer";
import QuoteWizard from "@/components/QuoteWizard";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  CurrencySelector, 
  FinishesTab, 
  TerrainsTab, 
  GallerySection,
  SelectionBadges,
  PriceSummary 
} from "@/components/models";
import { useOptimizedAnimation } from "@/hooks/useReducedMotion";
import { useProject } from "@/hooks/useProjects";
import { useProjectFinishes, useProjectTerrains } from "@/hooks/useProjectCustomizations";
import { Currency, getFormattedPrice } from "@/lib/priceUtils";
import { getAllImages, getImagesLinkedToFinish, getImagesLinkedToTerrain } from "@/lib/projectUtils";
import { toast } from "sonner";
import casaRefugio from "@/assets/casa-refugio.jpg";

const ModelDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProject(slug || '');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('usd');
  const [selectedFinishId, setSelectedFinishId] = useState<string | undefined>(undefined);
  const [selectedTerrainId, setSelectedTerrainId] = useState<string | undefined>(undefined);
  const [isHeroMounted, setIsHeroMounted] = useState(false);
  
  const { enableParallax } = useOptimizedAnimation();
  const heroRef = useRef<HTMLElement>(null);

  // Get finishes/terrains
  const { data: allFinishes = [], isLoading: finishesLoading } = useProjectFinishes(project?.id || '');
  const { data: allTerrains = [], isLoading: terrainsLoading } = useProjectTerrains(project?.id || '');
  
  const finishes = allFinishes;
  const terrains = allTerrains;

  // Only use scroll after hero is mounted to avoid hydration error
  const { scrollYProgress } = useScroll({
    target: isHeroMounted ? heroRef : undefined,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], enableParallax ? ["0%", "30%"] : ["0%", "0%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Set mounted state after component renders
  useEffect(() => {
    if (heroRef.current) {
      setIsHeroMounted(true);
    }
  }, [project]);

  // Get images
  const linkedFinishImages = getImagesLinkedToFinish(project, selectedFinishId);
  const linkedTerrainImages = getImagesLinkedToTerrain(project, selectedTerrainId);
  
  // Build a map of linked images for the gallery (simplified - no linked images in DB)
  const linkedImagesMap = new Map<string, { finishName?: string; terrainName?: string }>();

  // Get selected names for highlighting
  const selectedFinish = finishes.find(f => f.id === selectedFinishId);
  const selectedTerrain = terrains.find(t => t.id === selectedTerrainId);
  
  const images = project ? (() => {
    // If we have linked images for selections, show them first
    if (linkedFinishImages.length > 0 || linkedTerrainImages.length > 0) {
      const linkedUrls = [...linkedFinishImages, ...linkedTerrainImages].map(img => img.storage_path);
      const otherImages = getAllImages(project, casaRefugio).filter(url => !linkedUrls.includes(url));
      return [...linkedUrls, ...otherImages];
    }
    return getAllImages(project, casaRefugio);
  })() : [casaRefugio];

  const nextImage = () => setCurrentImageIndex((prev) => 
    images.length > 0 ? (prev === images.length - 1 ? 0 : prev + 1) : 0
  );
  const prevImage = () => setCurrentImageIndex((prev) => 
    images.length > 0 ? (prev === 0 ? images.length - 1 : prev - 1) : 0
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.name || 'Modelo Alpina',
          text: project?.description || '',
          url
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project || error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background"
      >
        <CinematicHeader />
        <DockNav />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-serif text-4xl text-foreground mb-4">Modelo no encontrado</h1>
          <p className="text-muted-foreground mb-8">El modelo que buscas no existe o no está disponible.</p>
          <Link 
            to="/modelos" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={18} /> Volver a modelos
          </Link>
        </div>
        <Footer />
      </motion.div>
    );
  }

  const coverImage = images[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <SEOHead 
        title={`${project.name} | Alpina House`}
        description={project.description || `Modelo ${project.name} - ${project.area_m2}m², ${project.bedrooms} dormitorios, ${project.bathrooms} baños`}
      />
      
      <CinematicHeader />
      <DockNav />
      
      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="h-[70vh] relative flex items-end overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            style={{ 
              y: enableParallax ? heroY : undefined,
              willChange: enableParallax ? "transform" : "auto",
            }}
          >
            <img
              src={coverImage}
              alt={project.name}
              className="w-full h-[130%] object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          </motion.div>

          <motion.div 
            className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pb-12"
            style={{ opacity: heroOpacity }}
          >
            <Link 
              to="/modelos" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Volver a modelos
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white"
                >
                  {project.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-primary text-2xl sm:text-3xl mt-2"
                >
                  {getFormattedPrice(project.price_range as string, currency)}
                </motion.p>
              </div>
              
              <div className="flex items-center gap-3">
                <CurrencySelector value={currency} onChange={setCurrency} priceRange={project.price_range as string} />
                <button
                  onClick={handleShare}
                  className="p-3 bg-stone-800/50 backdrop-blur rounded-lg text-white hover:bg-stone-700/50 transition-colors"
                  title="Compartir"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Content Section */}
        <section className="py-12 lg:py-20 bg-stone-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Left: Gallery & Tabs */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="gallery" className="w-full">
                  <TabsList className="w-full bg-stone-800/50 p-1 rounded-lg mb-6">
                    <TabsTrigger value="gallery" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Images size={14} className="mr-1.5" /> Galería
                    </TabsTrigger>
                    <TabsTrigger value="finishes" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Paintbrush size={14} className="mr-1.5" /> Terminaciones
                    </TabsTrigger>
                    <TabsTrigger value="terrains" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <TreePine size={14} className="mr-1.5" /> Terrenos
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="gallery" className="mt-0">
                    <GallerySection 
                      images={images}
                      currentIndex={currentImageIndex}
                      onPrev={prevImage}
                      onNext={nextImage}
                      onSelect={setCurrentImageIndex}
                      projectName={project.name}
                      linkedImages={linkedImagesMap}
                      selectedFinishName={selectedFinish?.name}
                      selectedTerrainName={selectedTerrain?.name}
                    />
                  </TabsContent>
                  
                  <TabsContent value="finishes" className="mt-0">
                    <FinishesTab 
                      finishes={finishes} 
                      isLoading={finishesLoading}
                      selectedId={selectedFinishId}
                      onSelect={setSelectedFinishId}
                    />
                  </TabsContent>
                  
                  <TabsContent value="terrains" className="mt-0">
                    <TerrainsTab 
                      terrains={terrains} 
                      isLoading={terrainsLoading}
                      selectedId={selectedTerrainId}
                      onSelect={setSelectedTerrainId}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right: Details & CTA */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-8">
                  {/* Specs */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="flex items-center gap-2 text-stone-300 bg-stone-800/50 px-4 py-2.5 rounded-lg text-sm">
                      <Ruler size={16} className="text-primary" />{project.area_m2} m²
                    </span>
                    <span className="flex items-center gap-2 text-stone-300 bg-stone-800/50 px-4 py-2.5 rounded-lg text-sm">
                      <Bed size={16} className="text-primary" />{project.bedrooms} Dorm.
                    </span>
                    <span className="flex items-center gap-2 text-stone-300 bg-stone-800/50 px-4 py-2.5 rounded-lg text-sm">
                      <Bath size={16} className="text-primary" />{project.bathrooms} Baños
                    </span>
                    {project.construction_time_months && (
                      <span className="flex items-center gap-2 text-stone-300 bg-stone-800/50 px-4 py-2.5 rounded-lg text-sm">
                        <Clock size={16} className="text-primary" />{project.construction_time_months} meses
                      </span>
                    )}
                  </div>
                  
                  <p className="text-stone-300 leading-relaxed mb-6">{project.description}</p>
                  
                  {project.features && project.features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {project.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-stone-400 text-sm">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />{f}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="bg-stone-800/30 p-4 mb-6 flex items-start gap-4 rounded-lg">
                    <Mountain size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white text-sm">Adaptación al terreno</h4>
                      <p className="text-xs text-stone-400 mt-1">Adaptable a múltiples terrenos según tus necesidades</p>
                    </div>
                  </div>
                  
                  <SelectionBadges
                    selectedFinishId={selectedFinishId}
                    selectedTerrainId={selectedTerrainId}
                    finishes={finishes}
                    terrains={terrains}
                    onClearFinish={() => setSelectedFinishId(undefined)}
                    onClearTerrain={() => setSelectedTerrainId(undefined)}
                  />
                  
                  <PriceSummary
                    priceRange={project.price_range as string}
                    currency={currency}
                    selectedFinish={selectedFinish}
                    selectedTerrain={selectedTerrain}
                  />
                  
                  <button
                    onClick={() => setIsQuoteOpen(true)}
                    className="w-full py-4 bg-primary text-primary-foreground font-medium uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 rounded-lg"
                  >
                    Cotizar este modelo
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
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
        }}
        preselectedModel={project.name}
        preselectedFinish={selectedFinishId}
        preselectedTerrain={selectedTerrainId}
      />
    </motion.div>
  );
};

export default ModelDetailPage;
