import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, TreePine, X } from "lucide-react";
import { ProjectFinish, ProjectTerrain } from "@/hooks/useProjectCustomizations";

interface SelectionBadgesProps {
  selectedFinishId?: string;
  selectedTerrainId?: string;
  finishes: ProjectFinish[];
  terrains: ProjectTerrain[];
  onClearFinish: () => void;
  onClearTerrain: () => void;
}

const SelectionBadges = ({
  selectedFinishId,
  selectedTerrainId,
  finishes,
  terrains,
  onClearFinish,
  onClearTerrain
}: SelectionBadgesProps) => {
  const hasSelections = selectedFinishId || selectedTerrainId;

  return (
    <AnimatePresence>
      {hasSelections && (
        <motion.div 
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-stone-400 mb-2">Selecciones incluidas:</p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {selectedFinishId && (
                  <motion.span 
                    key="finish-badge"
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-full"
                  >
                    <Paintbrush size={12} className="text-primary" />
                    {finishes.find(f => f.id === selectedFinishId)?.name || 'Terminación'}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onClearFinish(); }}
                      className="ml-1 hover:text-primary transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                )}
                {selectedTerrainId && (
                  <motion.span 
                    key="terrain-badge"
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-full"
                  >
                    <TreePine size={12} className="text-primary" />
                    {terrains.find(t => t.id === selectedTerrainId)?.name || 'Terreno'}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onClearTerrain(); }}
                      className="ml-1 hover:text-primary transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectionBadges;
