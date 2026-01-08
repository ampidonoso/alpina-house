import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { useProjectFinishes, useProjectTerrains } from '@/hooks/useProjectCustomizations';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronRight, Palette, Mountain, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Visualizer() {
  const { state, actions, helpers } = useJourney();
  const { selectedModel, customization } = state;

  const { data: finishes, isLoading: loadingFinishes } = useProjectFinishes(
    selectedModel?.id || ''
  );
  const { data: terrains, isLoading: loadingTerrains } = useProjectTerrains(
    selectedModel?.id || ''
  );

  // Auto-select first options if none selected
  useEffect(() => {
    if (finishes?.length && !customization.finish) {
      actions.selectFinish(finishes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishes?.length, customization.finish?.id]);

  useEffect(() => {
    if (terrains?.length && !customization.terrain) {
      actions.selectTerrain(terrains[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrains?.length, customization.terrain?.id]);

  const getPreviewImage = () => {
    // Priority: terrain image > finish image > model cover
    if (customization.terrain?.storage_path) return customization.terrain.storage_path;
    if (customization.finish?.storage_path) return customization.finish.storage_path;
    if (!selectedModel) return '/placeholder.svg';
    const cover = selectedModel.images?.find((img) => img.is_cover);
    return cover?.storage_path || selectedModel.images?.[0]?.storage_path || '/placeholder.svg';
  };

  const formatModifier = (value: number) => {
    if (value === 0) return 'Incluido';
    const sign = value > 0 ? '+' : '';
    return `${sign}$${Math.abs(value).toLocaleString()} USD`;
  };

  const isLoading = loadingFinishes || loadingTerrains;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 w-full">
      {/* Preview Image - 60% on desktop */}
      <div className="lg:col-span-3">
        <motion.div
          key={getPreviewImage()}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative aspect-[4/3] rounded-none overflow-hidden bg-zinc-100 group/image shadow-2xl"
        >
          <motion.img
            src={getPreviewImage()}
            alt="Vista previa"
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-700"
            whileHover={{ scale: 1.05 }}
          />
          
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
          
          {/* Selection badges overlay - Glassmorphism */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {customization.finish && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="bg-white/90 backdrop-blur-xl text-zinc-900 text-xs px-3 py-1.5 rounded-none uppercase tracking-wider flex items-center gap-1.5 border border-white/60 shadow-lg"
              >
                <Palette className="h-3 w-3 text-zinc-900" />
                {customization.finish.name}
              </motion.div>
            )}
            {customization.terrain && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-xl text-zinc-900 text-xs px-3 py-1.5 rounded-none uppercase tracking-wider flex items-center gap-1.5 border border-white/60 shadow-lg"
              >
                <Mountain className="h-3 w-3 text-zinc-900" />
                {customization.terrain.name}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Price indicator - Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-none shadow-lg"
        >
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Precio estimado</span>
            <span className="text-2xl font-light text-zinc-900 tracking-tight">
              {helpers.formattedTotalPrice}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Control Panel - 40% on desktop */}
      <div className="lg:col-span-2 space-y-6">
        {/* Finishes Section - Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-5 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-zinc-900" />
            <h3 className="text-lg font-light text-zinc-900 tracking-tight">Acabados</h3>
          </div>

          {finishes && finishes.length > 0 ? (
            <RadioGroup
              value={customization.finish?.id || ''}
              onValueChange={(id) => {
                const finish = finishes.find((f) => f.id === id);
                if (finish) actions.selectFinish(finish);
              }}
              className="grid grid-cols-2 gap-3"
            >
              {finishes.map((finish) => {
                const isSelected = customization.finish?.id === finish.id;
                return (
                  <Label
                    key={finish.id}
                    htmlFor={`finish-${finish.id}`}
                    className={cn(
                      'relative cursor-pointer rounded-none p-3 transition-all duration-300 group/item',
                      'border-2 bg-white/80 backdrop-blur-sm shadow-sm',
                      isSelected
                        ? 'border-zinc-900/80 bg-white/90 backdrop-blur-md shadow-lg scale-[1.02]'
                        : 'border-white/60 hover:border-zinc-300/80 hover:bg-white/90 hover:shadow-md hover:scale-[1.01]'
                    )}
                  >
                    <RadioGroupItem
                      value={finish.id}
                      id={`finish-${finish.id}`}
                      className="sr-only"
                    />
                    
                    {/* Color preview */}
                    {finish.storage_path && (
                      <div className="w-full aspect-square rounded-none overflow-hidden mb-2">
                        <img
                          src={finish.storage_path}
                          alt={finish.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-zinc-900 font-medium truncate">
                      {finish.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatModifier(finish.price_modifier || 0)}
                    </p>

                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-zinc-900 rounded-none flex items-center justify-center shadow-md"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-zinc-900/0 group-hover/item:bg-zinc-900/5 transition-colors duration-300 rounded-none pointer-events-none" />
                  </Label>
                );
              })}
            </RadioGroup>
          ) : (
            <p className="text-zinc-500 text-sm">No hay acabados disponibles</p>
          )}
        </motion.div>

        {/* Terrains Section - Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-5 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Mountain className="h-5 w-5 text-zinc-900" />
            <h3 className="text-lg font-light text-zinc-900 tracking-tight">Terreno</h3>
          </div>

          {terrains && terrains.length > 0 ? (
            <RadioGroup
              value={customization.terrain?.id || ''}
              onValueChange={(id) => {
                const terrain = terrains.find((t) => t.id === id);
                if (terrain) actions.selectTerrain(terrain);
              }}
              className="grid grid-cols-2 gap-3"
            >
              {terrains.map((terrain) => {
                const isSelected = customization.terrain?.id === terrain.id;
                return (
                  <Label
                    key={terrain.id}
                    htmlFor={`terrain-${terrain.id}`}
                    className={cn(
                      'relative cursor-pointer rounded-none p-3 transition-all duration-300 group/item',
                      'border-2 bg-white/80 backdrop-blur-sm shadow-sm',
                      isSelected
                        ? 'border-zinc-900/80 bg-white/90 backdrop-blur-md shadow-lg scale-[1.02]'
                        : 'border-white/60 hover:border-zinc-300/80 hover:bg-white/90 hover:shadow-md hover:scale-[1.01]'
                    )}
                  >
                    <RadioGroupItem
                      value={terrain.id}
                      id={`terrain-${terrain.id}`}
                      className="sr-only"
                    />
                    
                    {terrain.storage_path && (
                      <div className="w-full aspect-square rounded-none overflow-hidden mb-2">
                        <img
                          src={terrain.storage_path}
                          alt={terrain.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-zinc-900 font-medium truncate">
                      {terrain.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatModifier(terrain.price_modifier || 0)}
                    </p>

                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-zinc-900 rounded-none flex items-center justify-center shadow-md"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-zinc-900/0 group-hover/item:bg-zinc-900/5 transition-colors duration-300 rounded-none pointer-events-none" />
                  </Label>
                );
              })}
            </RadioGroup>
          ) : (
            <p className="text-zinc-500 text-sm">No hay opciones de terreno disponibles</p>
          )}
        </motion.div>

        {/* Continue button - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={actions.nextStep}
            className="w-full bg-zinc-900/95 backdrop-blur-md hover:bg-zinc-800 text-white py-6 text-sm font-bold tracking-widest uppercase rounded-none shadow-xl shadow-zinc-900/20 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              Ver proceso constructivo
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

export default Visualizer;
