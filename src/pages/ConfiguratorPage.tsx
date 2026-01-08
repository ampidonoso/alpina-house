import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useProjectFinishes, useProjectTerrains } from "@/hooks/useProjectCustomizations";
import { Button } from "@/components/ui/button";
import CinematicHeader from "@/components/layout/CinematicHeader";
import Footer from "@/components/layout/Footer";
import alpinaLogo from "@/assets/alpina-house-logo.png";
import { JourneyProvider, useJourney } from "@/hooks/useJourney";
import { ModelCarousel } from "@/components/journey/ModelCarousel";
import { Visualizer } from "@/components/journey/Visualizer";
import { ConstructionTimeline } from "@/components/journey/ConstructionTimeline";
import { JourneySummary } from "@/components/journey/JourneySummary";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Currency } from "@/lib/priceUtils";

// Step labels for the configurator (5 steps mapped to 4 journey steps)
const STEP_LABELS = [
  { title: "Modelo", subtitle: "Elige tu casa" },
  { title: "Personalización", subtitle: "Terminaciones y terreno" },
  { title: "Construcción", subtitle: "Timeline del proyecto" },
  { title: "Cotización", subtitle: "Solicita tu presupuesto" },
];

const CURRENCY_OPTIONS: { value: Currency; label: string; flag: string }[] = [
  { value: 'usd', label: 'USD', flag: '🇺🇸' },
  { value: 'clp', label: 'CLP', flag: '🇨🇱' },
  { value: 'uf', label: 'UF', flag: '🇨🇱' },
];

// Currency Selector Component
function CurrencySelector() {
  const { state, actions } = useJourney();

  return (
    <Select
      value={state.currency}
      onValueChange={(value: Currency) => actions.setCurrency(value)}
    >
      <SelectTrigger className="w-[100px] h-9 bg-white/80 backdrop-blur-md border-white/60 text-zinc-900 hover:bg-white/90 focus:ring-zinc-400 rounded-none shadow-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/60 z-[110] rounded-none shadow-xl">
        {CURRENCY_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer rounded-none"
          >
            <span className="flex items-center gap-2">
              <span>{option.flag}</span>
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Progress Indicator for full-page configurator
function ConfiguratorProgress() {
  const { state, actions, helpers } = useJourney();
  const { currentStep } = state;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8 md:mb-12 relative z-0 w-full"
    >
      {/* Step indicators - Glassmorphism container */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-none p-6 mb-6 shadow-lg shadow-zinc-900/5">
        <div className="flex items-center justify-center gap-2 md:gap-4 px-2 sm:px-4 overflow-x-auto pb-2 -mx-2 sm:mx-0">
        {STEP_LABELS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={() => {
                    if (stepNumber < currentStep) {
                      // Allow going back to previous steps
                      for (let i = currentStep; i > stepNumber; i--) {
                        actions.prevStep();
                      }
                    }
                  }}
                  disabled={stepNumber > currentStep}
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-none flex items-center justify-center text-xs md:text-sm font-semibold transition-all border-2 backdrop-blur-sm shadow-sm",
                    isCompleted && "bg-zinc-900/90 backdrop-blur-md text-white border-zinc-900/80 cursor-pointer hover:bg-zinc-800 hover:scale-105",
                    isCurrent && "bg-zinc-900/95 backdrop-blur-md text-white border-zinc-900 ring-2 ring-zinc-400/50 shadow-lg",
                    !isCompleted && !isCurrent && "bg-white/60 backdrop-blur-sm text-zinc-400 border-white/60 hover:bg-white/80"
                  )}
                  initial={false}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  whileHover={!isCompleted && !isCurrent ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </motion.button>
                <span className={cn(
                  "hidden md:block text-[10px] sm:text-xs mt-2 font-medium uppercase tracking-wider",
                  (isCompleted || isCurrent) ? "text-zinc-900" : "text-zinc-400"
                )}>
                  {step.title}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div className={cn(
                  "w-8 md:w-20 h-[2px] mx-2 md:mx-4",
                  isCompleted ? "bg-zinc-900" : "bg-zinc-200"
                )} />
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Current step info with currency selector - Glassmorphism */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-6 shadow-lg shadow-zinc-900/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-zinc-500 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
              Paso {currentStep} de {STEP_LABELS.length}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-zinc-900 tracking-tight break-words">
              {STEP_LABELS[currentStep - 1]?.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <CurrencySelector />
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={actions.prevStep}
                  disabled={!helpers.canGoBack}
                  className="border-white/60 bg-white/80 backdrop-blur-md hover:bg-white/90 disabled:opacity-30 rounded-none h-10 w-10 shadow-sm transition-all"
                >
                  <ChevronLeft className="h-4 w-4 text-zinc-900" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={actions.nextStep}
                  disabled={!helpers.canAdvance}
                  className="border-white/60 bg-white/80 backdrop-blur-md hover:bg-white/90 disabled:opacity-30 rounded-none h-10 w-10 shadow-sm transition-all"
                >
                  <ChevronRight className="h-4 w-4 text-zinc-900" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Slide animation variants - More immersive
const slideVariants = {
  enter: { opacity: 0, x: 30, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -30, scale: 0.98 },
};

// Main Configurator Content (uses Journey context)
function ConfiguratorContent() {
  const { state, helpers } = useJourney();
  const { currentStep, selectedModel } = state;
  
  // Fetch projects for hydration
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  
  // Fetch finishes and terrains for the selected model
  const { data: finishes = [] } = useProjectFinishes(selectedModel?.id || '');
  const { data: terrains = [] } = useProjectTerrains(selectedModel?.id || '');

  // Hydrate from localStorage when data is available
  useEffect(() => {
    if (projects.length > 0 && !selectedModel && !state.isHydrated) {
      helpers.hydrateFromStorage(projects, finishes, terrains);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, finishes.length, terrains.length, selectedModel?.id, state.isHydrated]);

  // Show loading state
  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="min-h-[400px] md:min-h-[500px] lg:min-h-[600px] w-full relative overflow-visible"
      >
        {/* Step 1: Model Selection */}
        {currentStep === 1 && <ModelCarousel projects={projects} />}

        {/* Step 2: Customization (Finishes & Terrain) */}
        {currentStep === 2 && <Visualizer />}

        {/* Step 3: Construction Timeline */}
        {currentStep === 3 && <ConstructionTimeline />}

        {/* Step 4: Summary & Quote Request */}
        {currentStep === 4 && <JourneySummary />}
      </motion.div>
    </AnimatePresence>
  );
}

// Main Configurator Page Component
const ConfiguratorPage = () => {
  return (
    <JourneyProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50/50 flex flex-col relative overflow-hidden"
      >
        {/* Background Pattern - Subtle texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,}} />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-100/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-zinc-100/20 pointer-events-none" />
        
        <CinematicHeader />

        {/* Main Content */}
        <main className="flex-1 pt-20 lg:pt-24 pb-12 relative z-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12 relative z-0">
              <motion.img
                src={alpinaLogo}
                alt="ALPINA HOUSE"
                className="h-12 md:h-16 mx-auto mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-zinc-900 tracking-tight mb-2"
              >
                Configura tu Casa
              </motion.h1>
              <p className="text-zinc-600 text-sm md:text-base font-light">
                Personaliza tu proyecto en simples pasos
              </p>
            </div>

            {/* Progress Indicator */}
            <ConfiguratorProgress />

            {/* Step Content */}
            <ConfiguratorContent />
          </div>
        </main>

        <Footer />
      </motion.div>
    </JourneyProvider>
  );
};

export default ConfiguratorPage;
