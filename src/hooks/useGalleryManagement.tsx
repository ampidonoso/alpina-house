import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper para logging detallado
const logError = (operation: string, error: unknown, context?: Record<string, unknown>) => {
  console.error(`[GalleryManagement.${operation}] Error:`, error);
  if (context) console.error(`[GalleryManagement.${operation}] Context:`, context);
  const message = error instanceof Error ? error.message : String(error);
  toast.error(`Error en ${operation}: ${message}`);
};

// Reorder finishes
export const useReorderFinishes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, finishIds }: { projectId: string; finishIds: string[] }) => {
      const updates = finishIds.map((id, index) =>
        supabase
          .from('project_finishes')
          .update({ display_order: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project-finishes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Reorder terrains
export const useReorderTerrains = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, terrainIds }: { projectId: string; terrainIds: string[] }) => {
      const updates = terrainIds.map((id, index) =>
        supabase
          .from('project_terrains')
          .update({ display_order: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project-terrains', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Update finish image from gallery
export const useUpdateFinishImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ finishId, storagePath, projectId }: { finishId: string; storagePath: string | null; projectId: string }) => {
      const { error } = await supabase
        .from('project_finishes')
        .update({ storage_path: storagePath })
        .eq('id', finishId);
      
      if (error) throw error;
      return { finishId, projectId };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-finishes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Update terrain image from gallery
export const useUpdateTerrainImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ terrainId, storagePath, projectId }: { terrainId: string; storagePath: string | null; projectId: string }) => {
      const { error } = await supabase
        .from('project_terrains')
        .update({ storage_path: storagePath })
        .eq('id', terrainId);
      
      if (error) throw error;
      return { terrainId, projectId };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-terrains', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Update finish price modifier
export const useUpdateFinishPriceModifier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ finishId, priceModifier, projectId }: { finishId: string; priceModifier: number; projectId: string }) => {
      const { error } = await supabase
        .from('project_finishes')
        .update({ price_modifier: priceModifier })
        .eq('id', finishId);
      
      if (error) throw error;
      return { finishId, priceModifier, projectId };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-finishes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Update terrain price modifier
export const useUpdateTerrainPriceModifier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ terrainId, priceModifier, projectId }: { terrainId: string; priceModifier: number; projectId: string }) => {
      const { error } = await supabase
        .from('project_terrains')
        .update({ price_modifier: priceModifier })
        .eq('id', terrainId);
      
      if (error) throw error;
      return { terrainId, priceModifier, projectId };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-terrains', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};
