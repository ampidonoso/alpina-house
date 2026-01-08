import { motion } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Palette,
  Mountain,
  Calendar,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  FileText,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface JourneySummaryProps {
  onQuoteRequest?: (model?: string) => void;
}

export function JourneySummary({ onQuoteRequest }: JourneySummaryProps) {
  const { state, actions, helpers } = useJourney();
  const { selectedModel, customization, timeline } = state;
  const { priceBreakdown, formattedTotalPrice, summaryData } = helpers;

  const getCoverImage = () => {
    const cover = selectedModel?.images?.find((img) => img.is_cover);
    return cover?.storage_path || selectedModel?.images?.[0]?.storage_path || '/placeholder.svg';
  };

  const handleQuoteRequest = () => {
    // Log summary data for HubSpot integration
    logger.log('Journey Summary Data:', summaryData);
    
    if (onQuoteRequest) {
      // Pass the selected model name to the quote wizard
      onQuoteRequest(selectedModel?.name);
    }
  };

  const formatPrice = (value: number) => {
    if (state.currency === 'uf') {
      return `${value.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF`;
    }
    return `$${value.toLocaleString()} ${state.currency.toUpperCase()}`;
  };

  if (!selectedModel) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-500">No hay modelo seleccionado</p>
        <Button
          variant="outline"
          onClick={() => actions.setStep(1)}
          className="mt-4"
        >
          Volver a seleccionar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 w-full">
      {/* Receipt/Ticket - Main content */}
      <div className="lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-none overflow-hidden shadow-2xl"
        >
          {/* Header with model image */}
          <div className="relative h-48 md:h-64">
            <img
              src={getCoverImage()}
              alt={selectedModel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
            
            {/* Model name overlay */}
            <div className="absolute bottom-4 left-6 right-6">
              <p className="text-xs text-white/80 mb-1 uppercase tracking-wider font-medium">Tu selección</p>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                {selectedModel.name}
              </h2>
            </div>
          </div>

          {/* Ticket content */}
          <div className="p-6">
            {/* Model specs - Glassmorphism */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {selectedModel.area_m2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <Maximize className="h-5 w-5 text-zinc-900 mx-auto mb-1" />
                  <p className="text-lg font-light text-zinc-900 tracking-tight">
                    {selectedModel.area_m2}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">m²</p>
                </motion.div>
              )}
              {selectedModel.bedrooms && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-center p-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <Bed className="h-5 w-5 text-zinc-900 mx-auto mb-1" />
                  <p className="text-lg font-light text-zinc-900 tracking-tight">
                    {selectedModel.bedrooms}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Dormitorios</p>
                </motion.div>
              )}
              {selectedModel.bathrooms && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <Bath className="h-5 w-5 text-zinc-900 mx-auto mb-1" />
                  <p className="text-lg font-light text-zinc-900 tracking-tight">
                    {selectedModel.bathrooms}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Baños</p>
                </motion.div>
              )}
            </div>

            <Separator className="bg-zinc-200 my-6" />

            {/* Customization details */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Personalización
              </h3>

              {/* Finish */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between py-3 px-3 bg-white/50 backdrop-blur-sm rounded-none hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-sm">
                    <Palette className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Acabado</p>
                    <p className="text-zinc-900 font-medium">
                      {customization.finish?.name || 'Estándar'}
                    </p>
                  </div>
                </div>
                {priceBreakdown.finishModifier !== 0 && (
                  <span className="text-sm text-zinc-900 font-medium">
                    +{formatPrice(priceBreakdown.finishModifier)}
                  </span>
                )}
              </motion.div>

              {/* Terrain */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-between py-3 px-3 bg-white/50 backdrop-blur-sm rounded-none hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-sm">
                    <Mountain className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Terreno</p>
                    <p className="text-zinc-900 font-medium">
                      {customization.terrain?.name || 'Plano'}
                    </p>
                  </div>
                </div>
                {priceBreakdown.terrainModifier !== 0 && (
                  <span className="text-sm text-zinc-900 font-medium">
                    +{formatPrice(priceBreakdown.terrainModifier)}
                  </span>
                )}
              </motion.div>

              {/* Timeline */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between py-3 px-3 bg-white/50 backdrop-blur-sm rounded-none hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-sm">
                    <Calendar className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Tiempo estimado</p>
                    <p className="text-zinc-900 font-medium">
                      {selectedModel.construction_time_months ? `${selectedModel.construction_time_months} meses` : '6 meses'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <Separator className="bg-zinc-200 my-6" />

            {/* Price breakdown - Glassmorphism */}
            <div className="space-y-3 bg-white/50 backdrop-blur-sm p-4 rounded-none border border-white/60">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Precio base</span>
                <span className="text-zinc-900 font-medium">{formatPrice(priceBreakdown.base)}</span>
              </div>
              {priceBreakdown.finishModifier !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Acabado premium</span>
                  <span className="text-zinc-900 font-medium">
                    +{formatPrice(priceBreakdown.finishModifier)}
                  </span>
                </div>
              )}
              {priceBreakdown.terrainModifier !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Adaptación terreno</span>
                  <span className="text-zinc-900 font-medium">
                    +{formatPrice(priceBreakdown.terrainModifier)}
                  </span>
                </div>
              )}

              <Separator className="bg-zinc-200" />

              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between items-center pt-2"
              >
                <span className="text-zinc-900 font-medium uppercase tracking-wider text-xs">Total estimado</span>
                <span className="text-2xl font-light text-zinc-900 tracking-tight">
                  {formattedTotalPrice}
                </span>
              </motion.div>

              <p className="text-xs text-zinc-500 text-center mt-4">
                * Precio referencial sujeto a cotización final
              </p>
            </div>
          </div>

          {/* Ticket footer - dashed line effect */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-4 flex items-center justify-between px-0">
              <div className="w-4 h-8 bg-white rounded-r-none -ml-2" />
              <div className="flex-1 border-t-2 border-dashed border-zinc-300 mx-2" />
              <div className="w-4 h-8 bg-white rounded-l-none -mr-2" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions sidebar */}
      <div className="lg:col-span-2 space-y-4">
        {/* Main CTA - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-none p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-white" />
            <h3 className="text-xl font-light text-white tracking-tight">
              Solicitar Cotización
            </h3>
          </div>
          <p className="text-white/80 text-sm mb-6">
            Recibe una cotización personalizada con todos los detalles de tu
            configuración.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleQuoteRequest}
              className="w-full bg-white/95 backdrop-blur-md text-zinc-900 hover:bg-white py-6 text-sm font-bold tracking-widest uppercase rounded-none shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                Solicitar ahora
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-900/5 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </motion.div>
        </motion.div>

        {/* Secondary actions - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-none p-5 space-y-3 shadow-lg"
        >
          <Button
            variant="outline"
            onClick={() => actions.setStep(1)}
            className="w-full justify-start border-zinc-300 hover:bg-zinc-50 rounded-none"
          >
            <Home className="mr-2 h-4 w-4" />
            Cambiar modelo
          </Button>
          <Button
            variant="outline"
            onClick={() => actions.setStep(2)}
            className="w-full justify-start border-zinc-300 hover:bg-zinc-50 rounded-none"
          >
            <Palette className="mr-2 h-4 w-4" />
            Modificar acabados
          </Button>
          <Button
            variant="ghost"
            onClick={actions.reset}
            className="w-full justify-start text-zinc-500 hover:text-zinc-700 rounded-none"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Comenzar de nuevo
          </Button>
        </motion.div>

        {/* Info card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-none p-5 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-zinc-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-zinc-900 mb-1">
                Financiamiento disponible
              </h4>
              <p className="text-xs text-zinc-600">
                Consulta por nuestras opciones de pago y financiamiento
                adaptadas a tu proyecto.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default JourneySummary;
