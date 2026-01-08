import { Loader2, Paintbrush, Check } from "lucide-react";
import { ProjectFinish } from "@/hooks/useProjectCustomizations";

interface FinishesTabProps {
  finishes: ProjectFinish[];
  isLoading: boolean;
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
}

const FinishesTab = ({ finishes, isLoading, selectedId, onSelect }: FinishesTabProps) => {
  // Show all finishes (is_visible was removed from schema)
  const visibleFinishes = finishes;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (visibleFinishes.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <Paintbrush className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Sin terminaciones disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {visibleFinishes.map((finish) => (
        <button
          key={finish.id}
          onClick={() => onSelect?.(selectedId === finish.id ? undefined : finish.id)}
          className={`bg-stone-800/30 rounded-lg overflow-hidden group text-left transition-all duration-300 ${
            selectedId === finish.id 
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-stone-900' 
              : 'hover:ring-1 hover:ring-stone-600'
          }`}
        >
          {finish.storage_path ? (
            <div className="aspect-video overflow-hidden">
              <img 
                src={finish.storage_path} 
                alt={finish.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video bg-stone-800/50 flex items-center justify-center">
              <Paintbrush className="w-6 h-6 text-stone-600" />
            </div>
          )}
          <div className="p-3 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white text-sm">{finish.name}</h4>
              {(finish.price_modifier ?? 0) > 0 && (
                <p className="text-xs text-primary mt-1">+${(finish.price_modifier ?? 0).toLocaleString()}</p>
              )}
            </div>
            {selectedId === finish.id && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default FinishesTab;
