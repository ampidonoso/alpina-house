import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Paintbrush, TreePine, Tag, RefreshCw } from "lucide-react";
import { 
  Currency, 
  parsePriceRange, 
  formatPriceValue, 
  CURRENCY_SYMBOLS, 
  CURRENCY_LABELS,
  convertModifier,
  getPriceInCurrency,
  ExchangeRates
} from "@/lib/priceUtils";
import { ProjectFinish, ProjectTerrain } from "@/hooks/useProjectCustomizations";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface PriceSummaryProps {
  priceRange: string | null;
  currency: Currency;
  selectedFinish?: ProjectFinish;
  selectedTerrain?: ProjectTerrain;
}

const PriceSummary = ({ priceRange, currency, selectedFinish, selectedTerrain }: PriceSummaryProps) => {
  const { data: exchangeRates, isLoading: ratesLoading } = useExchangeRates();
  
  const prices = useMemo(() => {
    // Get base price in the selected currency (with conversion if needed)
    const basePrice = getPriceInCurrency(priceRange, currency, exchangeRates || null);
    
    // Convert modifiers from USD to selected currency using live rates
    const finishModifier = selectedFinish?.price_modifier || 0;
    const terrainModifier = selectedTerrain?.price_modifier || 0;
    
    const finishInCurrency = convertModifier(finishModifier, currency, exchangeRates || null);
    const terrainInCurrency = convertModifier(terrainModifier, currency, exchangeRates || null);
    const total = basePrice + finishInCurrency + terrainInCurrency;
    
    return {
      base: basePrice,
      finish: finishInCurrency,
      terrain: terrainInCurrency,
      total,
      hasModifiers: finishModifier > 0 || terrainModifier > 0,
    };
  }, [priceRange, currency, selectedFinish, selectedTerrain, exchangeRates]);

  const formatPrice = (value: number) => {
    if (value === 0) return '—';
    const formatted = formatPriceValue(value, currency);
    if (currency === 'uf') return `${formatted} UF`;
    return `${CURRENCY_SYMBOLS[currency]}${formatted}`;
  };

  const formatModifierDisplay = (value: number) => {
    if (value === 0) return '—';
    const formatted = formatPriceValue(value, currency);
    if (currency === 'uf') return `+${formatted} UF`;
    return `+${CURRENCY_SYMBOLS[currency]}${formatted}`;
  };

  if (prices.base === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-800/50 backdrop-blur-sm rounded-xl p-4 border border-stone-700/50"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-primary" />
        <h4 className="font-medium text-white text-sm">Resumen de precio</h4>
        <span className="text-xs text-stone-500 ml-auto flex items-center gap-1.5">
          {CURRENCY_LABELS[currency]}
          {exchangeRates && !ratesLoading && (
            <span className="text-[10px] text-emerald-500/70" title={`Tipos de cambio actualizados: ${new Date(exchangeRates.updated_at).toLocaleDateString()}`}>
              ●
            </span>
          )}
        </span>
      </div>
      
      <div className="space-y-2">
        {/* Base Price */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400 flex items-center gap-2">
            <Tag size={14} className="text-stone-500" />
            Precio base
          </span>
          <span className="text-white font-medium">{formatPrice(prices.base)}</span>
        </div>
        
        {/* Finish Modifier */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400 flex items-center gap-2">
            <Paintbrush size={14} className="text-amber-500/70" />
            {selectedFinish ? selectedFinish.name : 'Terminación'}
          </span>
          <motion.span 
            key={`finish-${selectedFinish?.id}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={prices.finish > 0 ? "text-amber-400 font-medium" : "text-stone-600"}
          >
            {formatModifierDisplay(prices.finish)}
          </motion.span>
        </div>
        
        {/* Terrain Modifier */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400 flex items-center gap-2">
            <TreePine size={14} className="text-emerald-500/70" />
            {selectedTerrain ? selectedTerrain.name : 'Terreno'}
          </span>
          <motion.span 
            key={`terrain-${selectedTerrain?.id}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={prices.terrain > 0 ? "text-emerald-400 font-medium" : "text-stone-600"}
          >
            {formatModifierDisplay(prices.terrain)}
          </motion.span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-stone-700/50 my-2" />
        
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Total estimado</span>
          <motion.span 
            key={`total-${prices.total}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-primary text-lg font-bold"
          >
            {formatPrice(prices.total)}
          </motion.span>
        </div>
      </div>
      
      {prices.hasModifiers && (
        <p className="text-[10px] text-stone-500 mt-3 leading-relaxed">
          * Precio referencial. El valor final puede variar según especificaciones técnicas.
        </p>
      )}
      
      {/* Exchange rate indicator */}
      {exchangeRates && (
        <div className="mt-3 pt-2 border-t border-stone-700/30">
          <p className="text-[9px] text-stone-600 flex items-center gap-1">
            <RefreshCw size={8} />
            TC: 1 USD = ${exchangeRates.usd_to_clp.toLocaleString('es-CL')} CLP | 1 UF = ${exchangeRates.uf_to_clp.toLocaleString('es-CL')} CLP
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PriceSummary;
