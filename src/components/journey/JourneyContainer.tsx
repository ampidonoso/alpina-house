import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { JourneyProvider, useJourney } from '@/hooks/useJourney';
import { useProjects } from '@/hooks/useProjects';
import { useProjectFinishes, useProjectTerrains } from '@/hooks/useProjectCustomizations';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { ModelCarousel } from './ModelCarousel';
import { Visualizer } from './Visualizer';
import { ConstructionTimeline } from './ConstructionTimeline';
import { JourneySummary } from './JourneySummary';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Currency } from '@/lib/priceUtils';

// Context to pass onQuoteRequest through the provider
const QuoteRequestContext = createContext<((model?: string) => void) | undefined>(undefined);
export const useQuoteRequest = () => useContext(QuoteRequestContext);
const STEP_LABELS = [
  { step: 1, title: 'Selección', subtitle: 'Elige tu modelo' },
  { step: 2, title: 'Personalización', subtitle: 'Define acabados' },
  { step: 3, title: 'Construcción', subtitle: 'Visualiza el proceso' },
  { step: 4, title: 'Resumen', subtitle: 'Tu configuración' },
];

// Direction-aware slide + fade animations
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
    filter: 'blur(4px)',
  }),
};

const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.25 },
  scale: { duration: 0.3 },
  filter: { duration: 0.2 },
};

const CURRENCY_OPTIONS: { value: Currency; label: string; flag: string }[] = [
  { value: 'usd', label: 'USD', flag: '🇺🇸' },
  { value: 'clp', label: 'CLP', flag: '🇨🇱' },
  { value: 'uf', label: 'UF', flag: '🇨🇱' },
];

function CurrencySelector() {
  const { state, actions } = useJourney();
  const { data: exchangeRates } = useExchangeRates();
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CL', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return '';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Select
          value={state.currency}
          onValueChange={(value: Currency) => actions.setCurrency(value)}
        >
          <SelectTrigger className="w-[100px] h-9 bg-stone-900 border-stone-700 text-sage-50 hover:bg-stone-800 focus:ring-burnt-clay">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-stone-900 border-stone-700 z-50">
            {CURRENCY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-sage-50 focus:bg-stone-800 focus:text-sage-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Exchange rate indicator */}
        {exchangeRates && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 cursor-help">
                <RefreshCw size={10} />
                <span>TC</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-stone-900 border-stone-700 text-sage-50 text-xs">
              <p className="font-medium mb-1">Tipos de cambio actualizados</p>
              <p className="text-stone-400">1 USD = ${exchangeRates.usd_to_clp.toLocaleString('es-CL')} CLP</p>
              <p className="text-stone-400">1 UF = ${exchangeRates.uf_to_clp.toLocaleString('es-CL')} CLP</p>
              <p className="text-stone-500 text-[10px] mt-1">
                Actualizado: {formatDate(exchangeRates.updated_at)} • {exchangeRates.source}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

function ProgressIndicator() {
  const { state, actions, helpers } = useJourney();
  const { currentStep } = state;

  return (
    <div className="mb-8">
      {/* Step counter & Currency selector */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-stone-400 text-sm font-sans">
            Paso {currentStep} de 4
          </p>
          <h2 className="font-serif-display text-2xl md:text-3xl text-sage-50">
            {STEP_LABELS[currentStep - 1].title}
          </h2>
        </div>
        
        {/* Currency selector & Navigation buttons */}
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={actions.prevStep}
              disabled={!helpers.canGoBack}
              className="border-stone-700 bg-stone-900/50 hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={actions.nextStep}
              disabled={!helpers.canAdvance}
              className="border-stone-700 bg-stone-900/50 hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-stone-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-burnt-clay rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${helpers.stepProgress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {STEP_LABELS.map(({ step, subtitle }) => (
          <button
            key={step}
            onClick={() => actions.setStep(step as 1 | 2 | 3 | 4)}
            disabled={step > 1 && !state.selectedModel}
            className={cn(
              'flex flex-col items-center gap-1 transition-opacity',
              step <= currentStep ? 'opacity-100' : 'opacity-40',
              step > 1 && !state.selectedModel && 'cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'w-3 h-3 rounded-full border-2 transition-colors',
                step === currentStep
                  ? 'bg-burnt-clay border-burnt-clay'
                  : step < currentStep
                  ? 'bg-sage-50 border-sage-50'
                  : 'bg-transparent border-stone-600'
              )}
            />
            <span className="text-xs text-stone-500 hidden md:block">
              {subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function JourneyContent() {
  const { state, helpers } = useJourney();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  
  // Track animation direction based on step changes
  const prevStepRef = useRef(state.currentStep);
  const [direction, setDirection] = useState(0);
  
  useEffect(() => {
    if (prevStepRef.current !== state.currentStep) {
      setDirection(state.currentStep > prevStepRef.current ? 1 : -1);
      prevStepRef.current = state.currentStep;
    }
  }, [state.currentStep]);
  
  // Get finishes and terrains for the selected model
  const { data: finishes = [] } = useProjectFinishes(state.selectedModel?.id || '');
  const { data: terrains = [] } = useProjectTerrains(state.selectedModel?.id || '');

  // Hydrate from localStorage when projects are available
  useEffect(() => {
    if (!state.isHydrated && projects && !projectsLoading) {
      helpers.hydrateFromStorage(projects, finishes, terrains);
    }
  }, [state.isHydrated, projects, projectsLoading, finishes, terrains, helpers]);

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-burnt-clay border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProgressIndicator />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={state.currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            {state.currentStep === 1 && (
              <ModelCarousel projects={projects || []} />
            )}
            {state.currentStep === 2 && <Visualizer />}
            {state.currentStep === 3 && <ConstructionTimeline />}
            {state.currentStep === 4 && <JourneySummary onQuoteRequest={useQuoteRequest()} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface JourneyContainerProps {
  className?: string;
  onQuoteRequest?: (model?: string) => void;
}

export function JourneyContainer({ className, onQuoteRequest }: JourneyContainerProps) {
  return (
    <QuoteRequestContext.Provider value={onQuoteRequest}>
      <JourneyProvider>
        <section
          className={cn(
            'w-full px-4 py-12 md:py-20 bg-stone-950',
            className
          )}
        >
          <div className="max-w-5xl mx-auto">
            <JourneyContent />
          </div>
        </section>
      </JourneyProvider>
    </QuoteRequestContext.Provider>
  );
}

export default JourneyContainer;
