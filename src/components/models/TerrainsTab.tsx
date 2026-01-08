import { Loader2, TreePine, Check } from "lucide-react";
import { ProjectTerrain } from "@/hooks/useProjectCustomizations";

interface TerrainsTabProps {
  terrains: ProjectTerrain[];
  isLoading: boolean;
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
}

const TerrainsTab = ({ terrains, isLoading, selectedId, onSelect }: TerrainsTabProps) => {
  // Show all terrains (is_visible was removed from schema)
  const visibleTerrains = terrains;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (visibleTerrains.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <TreePine className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Sin tipos de terreno disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {visibleTerrains.map((terrain) => (
        <button
          key={terrain.id}
          onClick={() => onSelect?.(selectedId === terrain.id ? undefined : terrain.id)}
          className={`bg-stone-800/30 rounded-lg overflow-hidden group text-left transition-all duration-300 ${
            selectedId === terrain.id 
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-stone-900' 
              : 'hover:ring-1 hover:ring-stone-600'
          }`}
        >
          {terrain.storage_path ? (
            <div className="aspect-video overflow-hidden">
              <img 
                src={terrain.storage_path} 
                alt={terrain.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video bg-stone-800/50 flex items-center justify-center">
              <TreePine className="w-6 h-6 text-stone-600" />
            </div>
          )}
          <div className="p-3 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white text-sm">{terrain.name}</h4>
              {(terrain.price_modifier ?? 0) > 0 && (
                <p className="text-xs text-primary mt-1">+${(terrain.price_modifier ?? 0).toLocaleString()}</p>
              )}
            </div>
            {selectedId === terrain.id && (
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

export default TerrainsTab;
