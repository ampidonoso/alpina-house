import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { useProjectStages, DEFAULT_STAGES, ProjectStage } from '@/hooks/useProjectCustomizations';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, HardHat, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisplayStage {
  number: number;
  name: string;
  start_month: number;
  duration_months: number;
  storage_path?: string | null;
}

const MONTH_LABELS = [
  { value: 0, label: 'Mes 0', description: 'Inicio' },
  { value: 1, label: 'Mes 1', description: 'Fundaciones' },
  { value: 2, label: 'Mes 2', description: 'Estructura' },
  { value: 3, label: 'Mes 3', description: 'Cerramientos' },
  { value: 4, label: 'Mes 4', description: 'Instalaciones' },
  { value: 5, label: 'Mes 5', description: 'Terminaciones' },
  { value: 6, label: 'Mes 6', description: 'Entrega' },
];

export function ConstructionTimeline() {
  const { state, actions } = useJourney();
  const { selectedModel, timeline } = state;

  const { data: stages, isLoading } = useProjectStages(selectedModel?.id || '');

  // Merge fetched stages with defaults
  const displayStages = useMemo((): DisplayStage[] => {
    if (!stages || stages.length === 0) {
      return DEFAULT_STAGES.map(s => ({ ...s, storage_path: null }));
    }
    
    return DEFAULT_STAGES.map((defaultStage) => {
      const fetchedStage = stages.find((s) => (s.display_order ?? 0) + 1 === defaultStage.number);
      if (fetchedStage) {
        return {
          number: (fetchedStage.display_order ?? 0) + 1,
          name: fetchedStage.name,
          start_month: fetchedStage.start_month,
          duration_months: fetchedStage.duration_months,
          storage_path: fetchedStage.storage_path,
        };
      }
      return { ...defaultStage, storage_path: null };
    });
  }, [stages]);

  // Map slider value (0-6) to stage index (0-5)
  const currentStageIndex = useMemo(() => {
    const month = timeline.month;
    // Find the stage that covers the current month
    const idx = displayStages.findIndex(
      (stage) => month >= stage.start_month && month < stage.start_month + stage.duration_months
    );
    return idx >= 0 ? idx : displayStages.length - 1;
  }, [timeline.month, displayStages]);

  const currentStage = displayStages[currentStageIndex];
  const currentMonthInfo = MONTH_LABELS[timeline.month];

  // Update active stage when month changes
  useEffect(() => {
    if (stages && stages[currentStageIndex]) {
      actions.setActiveStage(stages[currentStageIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageIndex, stages?.length]);

  const getStageImage = () => {
    if (currentStage?.storage_path) return currentStage.storage_path;
    if (!selectedModel) return '/placeholder.svg';
    // Fallback to model cover
    const cover = selectedModel.images?.find((img) => img.is_cover);
    return cover?.storage_path || '/placeholder.svg';
  };

  const getProgressPercentage = () => {
    return Math.round((timeline.month / 6) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Stage visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage image */}
        <div className="relative group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStageIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="aspect-[4/3] rounded-none overflow-hidden bg-zinc-100 shadow-2xl"
            >
              <motion.img
                src={getStageImage()}
                alt={currentStage?.name || 'Etapa de construcción'}
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-700"
                whileHover={{ scale: 1.05 }}
              />
              
              {/* Multi-layer overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
              
              {/* Stage info - Glassmorphism */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-none p-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <HardHat className="h-4 w-4 text-zinc-900" />
                    <span className="text-xs text-zinc-600 uppercase tracking-wider font-medium">
                      {currentMonthInfo.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-light text-zinc-900 tracking-tight">
                    {currentStage?.name || currentMonthInfo.description}
                  </h3>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress badge - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl border border-white/60 rounded-none px-4 py-2 flex items-center gap-2 shadow-xl"
          >
            <div className="w-8 h-8 rounded-none border-2 border-zinc-900 flex items-center justify-center bg-zinc-900/10">
              <span className="text-xs font-bold text-zinc-900">
                {getProgressPercentage()}%
              </span>
            </div>
            <span className="text-xs text-zinc-600 uppercase tracking-wider font-medium">Completado</span>
          </motion.div>
        </div>

        {/* Stage details */}
        <div className="space-y-6">
          {/* Current stage description - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-zinc-900" />
              <h4 className="text-lg font-light text-zinc-900 tracking-tight">
                {currentStage?.name || 'Proceso Constructivo'}
              </h4>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Desliza el control para explorar cada etapa del proceso de construcción de tu casa Alpina.
            </p>
          </motion.div>

          {/* Stage milestones - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-5 shadow-lg"
          >
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Etapas del proyecto
            </h4>
            <div className="space-y-3">
              {displayStages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div
                    key={stage.number}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-none transition-colors',
                      isCurrent && 'bg-zinc-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-none flex items-center justify-center border-2',
                        isCompleted
                          ? 'bg-green-50 border-green-500 text-green-600'
                          : isCurrent
                          ? 'bg-zinc-900 border-zinc-900 text-white'
                          : 'bg-white border-zinc-300 text-zinc-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        isCurrent ? 'text-zinc-900 font-medium' : 'text-zinc-500'
                      )}
                    >
                      {stage.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Timeline slider - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-6 shadow-lg"
      >
        <div className="mb-6">
          <h4 className="text-lg font-light text-zinc-900 tracking-tight mb-2">
            Línea de Tiempo
          </h4>
          <p className="text-sm text-zinc-600">
            Desliza para ver el avance de construcción mes a mes
          </p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <Slider
            value={[timeline.month]}
            onValueChange={([value]) => actions.setTimelineMonth(value)}
            min={0}
            max={6}
            step={1}
            className="w-full"
          />
        </div>

        {/* Month labels */}
        <div className="flex justify-between mt-4">
          {MONTH_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => actions.setTimelineMonth(value)}
              className={cn(
                'text-xs transition-colors uppercase tracking-wider font-medium',
                value === timeline.month
                  ? 'text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Continue button - Glassmorphism */}
      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={actions.nextStep}
            className="bg-zinc-900/95 backdrop-blur-md hover:bg-zinc-800 text-white px-8 py-6 text-sm font-bold tracking-widest uppercase rounded-none shadow-xl shadow-zinc-900/20 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              Ver resumen final
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
      </div>
    </div>
  );
}

export default ConstructionTimeline;
