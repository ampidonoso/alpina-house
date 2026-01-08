import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { Project } from '@/hooks/useProjects';
import { getFormattedPrice } from '@/lib/priceUtils';
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModelCarouselProps {
  projects: Project[];
}

export function ModelCarousel({ projects }: ModelCarouselProps) {
  const { state, actions, helpers } = useJourney();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    loop: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleSelectModel = (project: Project) => {
    actions.selectModel(project);
  };

  const getCoverImage = (project: Project): string => {
    const cover = project.images?.find((img) => img.is_cover);
    return cover?.storage_path || project.images?.[0]?.storage_path || '/placeholder.svg';
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p>No hay modelos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel controls */}
      <div className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="rounded-none bg-zinc-900/90 hover:bg-zinc-800 text-white disabled:opacity-30 shadow-lg h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="rounded-none bg-zinc-900/90 hover:bg-zinc-800 text-white disabled:opacity-30 shadow-lg h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex gap-4 md:gap-6">
          {projects.map((project, index) => {
            const isSelected = state.selectedModel?.id === project.id;
            const isActive = index === 0 || isSelected;

            return (
              <motion.div
                key={project.id}
                className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_40%] min-w-0 shrink-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => handleSelectModel(project)}
                  className={cn(
                    'w-full text-left rounded-none overflow-hidden transition-all duration-500 group',
                    'bg-white/80 backdrop-blur-xl border-2 shadow-lg',
                    isSelected
                      ? 'border-zinc-900/80 shadow-xl shadow-zinc-900/20 scale-[1.02]'
                      : 'border-white/60 hover:border-zinc-300/80 hover:shadow-xl hover:scale-[1.01]'
                  )}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <motion.img
                      src={getCoverImage(project)}
                      alt={project.name}
                      loading={isActive ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-transform duration-700"
                      whileHover={{ scale: 1.05 }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-zinc-900/10 backdrop-blur-[2px]"
                      />
                    )}
                    {/* Selected badge - Glassmorphism */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-none uppercase tracking-wider border border-white/60 shadow-lg"
                      >
                        Seleccionado
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-5">
                    <h3 className="text-xl md:text-2xl font-light text-zinc-900 mb-2 tracking-tight">
                      {project.name}
                    </h3>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-3 text-zinc-500 text-sm mb-4">
                      {project.area_m2 && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span>{project.area_m2} m²</span>
                        </div>
                      )}
                      {project.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{project.bedrooms}</span>
                        </div>
                      )}
                      {project.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{project.bathrooms}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="pt-3 border-t border-zinc-200">
                      <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Desde</p>
                      <p className="text-lg font-light text-zinc-900 tracking-tight">
                        {getFormattedPrice(project.price_range as string | null, state.currency)}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Continue button */}
      {state.selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={actions.nextStep}
              className="bg-zinc-900/95 backdrop-blur-md hover:bg-zinc-800 text-white px-8 py-6 text-sm font-bold tracking-widest uppercase rounded-none shadow-xl shadow-zinc-900/20 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Continuar con {state.selectedModel.name}
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default ModelCarousel;
