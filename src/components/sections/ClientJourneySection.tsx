import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Palette, Mountain, Hammer, ChevronRight, Home, TreePine, PenTool } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { 
  useProjectFinishes, 
  useProjectTerrains, 
  useProjectStages,
  ProjectFinish,
  ProjectTerrain,
  ProjectStage,
  DEFAULT_STAGES
} from "@/hooks/useProjectCustomizations";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { Button } from "@/components/ui/button";
import MagneticButton from "@/components/ui/MagneticButton";
import LazyImage from "@/components/ui/LazyImage";
import casaRefugio from "@/assets/casa-refugio.jpg";

const JOURNEY_STEPS = [
  { id: 1, title: "Elige tu modelo", icon: Home, color: "bg-amber-700", activeColor: "bg-amber-600" },
  { id: 2, title: "Personaliza tu fachada", icon: Palette, color: "bg-rose-800", activeColor: "bg-rose-600" },
  { id: 3, title: "Visualiza en tu terreno", icon: TreePine, color: "bg-emerald-800", activeColor: "bg-emerald-600" },
  { id: 4, title: "Proceso de construcción", icon: Hammer, color: "bg-stone-700", activeColor: "bg-stone-600" },
];

// Helper to get main image from project
const getMainImage = (project: Project, fallback: string) => {
  const coverImage = project.images?.find(img => img.is_cover || img.image_type === 'cover');
  return coverImage?.storage_path || project.images?.[0]?.storage_path || fallback;
};

interface ClientJourneySectionProps {
  onQuoteRequest?: (model?: string) => void;
}

const ClientJourneySection = ({ onQuoteRequest }: ClientJourneySectionProps) => {
  const { getConfig } = useSiteConfigContext();
  const constructionTime = getConfig('construction_time', '~6 meses');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<ProjectFinish | null>(null);
  const [selectedTerrain, setSelectedTerrain] = useState<ProjectTerrain | null>(null);
  
  const { data: projects = [] } = useProjects();
  const { data: finishes = [] } = useProjectFinishes(selectedProject?.id || '');
  const { data: terrains = [] } = useProjectTerrains(selectedProject?.id || '');
  const { data: stages = [] } = useProjectStages(selectedProject?.id || '');

  // Auto-select first project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Reset selections when project changes
  useEffect(() => {
    setSelectedFinish(null);
    setSelectedTerrain(null);
  }, [selectedProject?.id]);

  // Auto-select first finish/terrain when available
  useEffect(() => {
    if (finishes.length > 0 && !selectedFinish) {
      setSelectedFinish(finishes[0]);
    }
  }, [finishes, selectedFinish]);

  useEffect(() => {
    if (terrains.length > 0 && !selectedTerrain) {
      setSelectedTerrain(terrains[0]);
    }
  }, [terrains, selectedTerrain]);

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleQuote = () => {
    onQuoteRequest?.(selectedProject?.name);
  };

  // Get price in USD
  const getUsdPrice = (priceRange: string | null) => {
    if (!priceRange) return "Consultar";
    try {
      const prices = JSON.parse(priceRange);
      return prices.usd ? `USD ${prices.usd}` : "Consultar";
    } catch {
      return priceRange;
    }
  };

  // Merge DB stages with defaults
  const displayStages = DEFAULT_STAGES.map(defaultStage => {
    const dbStage = stages.find(s => (s.display_order ?? 0) + 1 === defaultStage.number);
    return {
      number: defaultStage.number,
      name: dbStage?.name || defaultStage.name,
      image: dbStage?.storage_path || null,
    };
  });

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-stone-950 text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-sage-400 text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4 block">
            Tu Casa en 4 Pasos
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
            Diseña tu <span className="italic text-stone-400">experiencia</span>
          </h2>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-4">
            {JOURNEY_STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <motion.button
                    onClick={() => setCurrentStep(step.id)}
                    className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ${
                      isActive 
                        ? step.activeColor + " ring-2 ring-white/20 ring-offset-2 ring-offset-stone-950" 
                        : isCompleted
                        ? step.color
                        : "bg-stone-800/80"
                    }`}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        isActive ? "text-white" : "text-stone-400"
                      }`} />
                    )}
                    
                    {/* Glow effect for active */}
                    {isActive && (
                      <motion.div
                        layoutId="step-glow"
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: "0 0 25px rgba(255,255,255,0.15), 0 0 50px rgba(255,255,255,0.05)"
                        }}
                      />
                    )}
                  </motion.button>
                  
                  {/* Connector line */}
                  {idx < JOURNEY_STEPS.length - 1 && (
                    <div className="relative w-12 sm:w-20 h-0.5 mx-1 sm:mx-2">
                      <div className="absolute inset-0 bg-stone-800" />
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-stone-500 to-stone-600"
                        initial={{ width: "0%" }}
                        animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Title */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h3 className="font-serif text-xl sm:text-2xl text-white">
            {JOURNEY_STEPS[currentStep - 1].title}
          </h3>
        </motion.div>

        {/* Step Content */}
        <div className="min-h-[400px] sm:min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Model */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
              >
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`relative cursor-pointer group ${
                      selectedProject?.id === project.id 
                        ? "ring-2 ring-primary" 
                        : ""
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={getMainImage(project, casaRefugio)}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h4 className="font-serif text-sm sm:text-base text-white mb-1">{project.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span>{project.area_m2} m²</span>
                        <span>•</span>
                        <span>{project.bedrooms}D/{project.bathrooms}B</span>
                      </div>
                      <span className="text-primary text-xs sm:text-sm font-medium mt-1 block">
                        {getUsdPrice(project.price_range as string | null)}
                      </span>
                    </div>
                    {selectedProject?.id === project.id && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Step 2: Select Finish */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                {/* Preview */}
                <div className="relative aspect-video lg:aspect-[4/3] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedFinish?.id || 'default'}
                      src={selectedFinish?.storage_path || getMainImage(selectedProject!, casaRefugio)}
                      alt={selectedFinish?.name || selectedProject?.name || ''}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-4 left-4 bg-stone-950/80 backdrop-blur px-4 py-2">
                    <span className="text-sm text-stone-300">Terminación: </span>
                    <span className="text-white font-medium">{selectedFinish?.name || "Original"}</span>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-medium">Opciones de Fachada</h4>
                  </div>
                  
                  {finishes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {finishes.map((finish) => (
                        <motion.button
                          key={finish.id}
                          onClick={() => setSelectedFinish(finish)}
                          className={`relative aspect-square overflow-hidden ${
                            selectedFinish?.id === finish.id 
                              ? "ring-2 ring-primary" 
                              : "ring-1 ring-stone-700"
                          }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {finish.storage_path ? (
                            <img 
                              src={finish.storage_path} 
                              alt={finish.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                              <Palette className="w-8 h-8 text-stone-600" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-stone-950/90 p-2">
                            <span className="text-xs text-white">{finish.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-stone-900/50 border border-stone-800">
                      <Palette className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                      <p className="text-stone-400 text-sm">
                        No hay opciones de terminación configuradas para este modelo.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Select Terrain */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                {/* Preview */}
                <div className="relative aspect-video lg:aspect-[4/3] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedTerrain?.id || 'default'}
                      src={selectedTerrain?.storage_path || getMainImage(selectedProject!, casaRefugio)}
                      alt={selectedTerrain?.name || selectedProject?.name || ''}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-4 left-4 bg-stone-950/80 backdrop-blur px-4 py-2">
                    <span className="text-sm text-stone-300">Entorno: </span>
                    <span className="text-white font-medium">{selectedTerrain?.name || "Sin definir"}</span>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mountain className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-medium">¿Dónde construirás?</h4>
                  </div>
                  
                  {terrains.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {terrains.map((terrain) => (
                        <motion.button
                          key={terrain.id}
                          onClick={() => setSelectedTerrain(terrain)}
                          className={`relative aspect-video overflow-hidden ${
                            selectedTerrain?.id === terrain.id 
                              ? "ring-2 ring-primary" 
                              : "ring-1 ring-stone-700"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {terrain.storage_path ? (
                            <img 
                              src={terrain.storage_path} 
                              alt={terrain.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                              <Mountain className="w-8 h-8 text-stone-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <span className="text-sm text-white font-medium">{terrain.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-stone-900/50 border border-stone-800">
                      <Mountain className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                      <p className="text-stone-400 text-sm">
                        No hay opciones de terreno configuradas para este modelo.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Construction Timeline */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="flex items-center gap-2 mb-6 justify-center">
                  <Hammer className="w-5 h-5 text-primary" />
                  <h4 className="text-lg font-medium">6 Etapas de Construcción</h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {displayStages.map((stage, idx) => (
                    <motion.div
                      key={stage.number}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-stone-900 border border-stone-800 overflow-hidden"
                    >
                      <div className="aspect-video relative">
                        {stage.image ? (
                          <img 
                            src={stage.image} 
                            alt={stage.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                            <span className="text-3xl font-serif text-stone-600">{stage.number}</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {stage.number}
                        </div>
                      </div>
                      <div className="p-3">
                        <h5 className="text-sm font-medium text-white mb-1">{stage.name}</h5>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 p-6 bg-stone-900/50 border border-stone-800"
                >
                  <h4 className="font-serif text-xl text-white mb-4">Tu selección</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-stone-400 block mb-1">Modelo</span>
                      <span className="text-white font-medium">{selectedProject?.name}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block mb-1">Terminación</span>
                      <span className="text-white font-medium">{selectedFinish?.name || "Original"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block mb-1">Terreno</span>
                      <span className="text-white font-medium">{selectedTerrain?.name || "Sin definir"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block mb-1">Tiempo estimado</span>
                      <span className="text-white font-medium">{selectedProject?.construction_time_months ? `${selectedProject.construction_time_months} meses` : constructionTime}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 sm:mt-12">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < 4 ? (
            <MagneticButton>
              <Button
                onClick={nextStep}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <Button
                onClick={handleQuote}
                className="bg-cta text-cta-foreground hover:bg-cta/90 px-8"
              >
                Solicitar Cotización
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </MagneticButton>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClientJourneySection;
