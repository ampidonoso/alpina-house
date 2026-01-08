import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import MagneticButton from "@/components/ui/MagneticButton";
import LazyImage from "@/components/ui/LazyImage";
import { FadeUp } from "@/components/animations/PageTransition";
import { useProjects, Project } from "@/hooks/useProjects";

// Helper to get main image from project
const getMainImage = (project: Project, fallback: string) => {
  const coverImage = project.images?.find(img => img.is_cover || img.image_type === 'cover');
  return coverImage?.storage_path || project.images?.[0]?.storage_path || fallback;
};

// Fallback image
import casaRefugio from "@/assets/casa-refugio.jpg";

const ModelsCarousel = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { data: projects, isLoading } = useProjects();

  // Parse price_range JSON to get USD price
  const getUsdPrice = (priceRange: string | null) => {
    if (!priceRange) return "Consultar";
    try {
      const prices = JSON.parse(priceRange);
      return prices.usd ? `USD ${prices.usd}` : "Consultar";
    } catch {
      return priceRange;
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 xl:py-44 bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 lg:py-32 xl:py-44 bg-secondary overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <FadeUp className="text-center mb-10 sm:mb-12 lg:mb-16">
          <span className="section-label text-xs sm:text-sm">THE COLLECTION</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mt-4 sm:mt-6 tracking-[-0.02em]">
            Diseños que <span className="italic">inspiran</span>
          </h2>
        </FadeUp>

        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-8">
              {projects.map((project) => (
                <CarouselItem
                  key={project.id}
                  className="pl-3 sm:pl-4 md:pl-8 basis-[80%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%]"
                >
                  <Link
                    to={`/modelos#${project.slug}`}
                    className="group block relative"
                    data-cursor
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Image Container with Lazy Loading */}
                    <div className="relative overflow-hidden mb-4 sm:mb-6">
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                      >
                        <LazyImage
                          src={getMainImage(project, casaRefugio)}
                          alt={project.name}
                          className="group-hover:brightness-110 transition-all duration-500"
                          aspectRatio="aspect-[4/5]"
                        />
                      </motion.div>

                      {/* Price Badge - Always visible */}
                      <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                        <span className="text-white text-xs font-medium tracking-wide">
                          Desde {getUsdPrice(project.price_range as string | null)}
                        </span>
                      </div>

                      {/* Glassmorphism Info Panel - Appears on hover at bottom */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: hoveredId === project.id ? 1 : 0,
                          y: hoveredId === project.id ? 0 : 20,
                        }}
                        transition={{ duration: 0.4 }}
                        className="absolute bottom-0 left-0 right-0 glass p-3 sm:p-4 lg:p-5"
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-foreground font-medium text-sm sm:text-base">
                            {project.area_m2} M²
                          </span>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                            <span>{project.bedrooms}D</span>
                            <span className="w-px h-3 bg-border" />
                            <span>{project.bathrooms}B</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-medium text-sm sm:text-base">
                            {getUsdPrice(project.price_range as string | null)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs border-border text-muted-foreground rounded-none"
                          >
                            1 UF/m²
                          </Badge>
                        </div>
                      </motion.div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
                      {project.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Navigation */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 lg:mt-12">
              <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0 h-10 w-10 sm:h-12 sm:w-12 border-border bg-card hover:bg-muted rounded-none" />
              <CarouselNext className="relative inset-0 translate-x-0 translate-y-0 h-10 w-10 sm:h-12 sm:w-12 border-border bg-card hover:bg-muted rounded-none" />
            </div>
          </Carousel>
        </div>

        <FadeUp className="text-center mt-10 sm:mt-12 lg:mt-16" delay={0.3}>
          <div className="flex flex-col items-center gap-2">
            <MagneticButton>
              <Link
                to="/modelos"
                className="inline-flex items-center text-foreground font-medium text-xs sm:text-sm tracking-wide border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
                data-cursor
              >
                Explorar todos los modelos
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </MagneticButton>
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              Personalización sin costo adicional
            </span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

export default ModelsCarousel;
