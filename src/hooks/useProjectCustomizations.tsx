import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types - match database schema
export interface ProjectFinish {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  storage_path: string | null;
  display_order: number | null;
  price_modifier: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTerrain {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  storage_path: string | null;
  display_order: number | null;
  price_modifier: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStage {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  storage_path: string | null;
  display_order: number | null;
  start_month: number;
  duration_months: number;
  created_at: string;
  updated_at: string;
}

const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
};

// FINISHES
export const useProjectFinishes = (projectId: string) => {
  return useQuery({
    queryKey: ['project-finishes', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_finishes')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(f => ({
        ...f,
        storage_path: getPublicUrl(f.storage_path)
      })) as ProjectFinish[];
    },
    enabled: !!projectId,
  });
};

export const useCreateFinish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, name, priceModifier, file }: { projectId: string; name: string; priceModifier?: number; file?: File }) => {
      let storagePath = null;
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/finishes/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        storagePath = fileName;
      }
      
      const { data, error } = await supabase
        .from('project_finishes')
        .insert({ 
          id: crypto.randomUUID(),
          project_id: projectId, 
          name, 
          storage_path: storagePath,
          price_modifier: priceModifier || 0
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-finishes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteFinish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, storagePath }: { id: string; projectId: string; storagePath: string | null }) => {
      if (storagePath) {
        // Extract path from full URL
        const path = storagePath.includes('/storage/') 
          ? storagePath.split('/project-images/')[1] 
          : storagePath;
        if (path) {
          await supabase.storage.from('project-images').remove([path]);
        }
      }
      const { error } = await supabase.from('project_finishes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-finishes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// TERRAINS
export const useProjectTerrains = (projectId: string) => {
  return useQuery({
    queryKey: ['project-terrains', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_terrains')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        storage_path: getPublicUrl(t.storage_path)
      })) as ProjectTerrain[];
    },
    enabled: !!projectId,
  });
};

export const useCreateTerrain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, name, priceModifier, file }: { projectId: string; name: string; priceModifier?: number; file?: File }) => {
      let storagePath = null;
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/terrains/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        storagePath = fileName;
      }
      
      const { data, error } = await supabase
        .from('project_terrains')
        .insert({ 
          id: crypto.randomUUID(),
          project_id: projectId, 
          name, 
          storage_path: storagePath,
          price_modifier: priceModifier || 0
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-terrains', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteTerrain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, storagePath }: { id: string; projectId: string; storagePath: string | null }) => {
      if (storagePath) {
        const path = storagePath.includes('/storage/') 
          ? storagePath.split('/project-images/')[1] 
          : storagePath;
        if (path) {
          await supabase.storage.from('project-images').remove([path]);
        }
      }
      const { error } = await supabase.from('project_terrains').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-terrains', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// STAGES
export const useProjectStages = (projectId: string) => {
  return useQuery({
    queryKey: ['project-stages', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(s => ({
        ...s,
        storage_path: getPublicUrl(s.storage_path)
      })) as ProjectStage[];
    },
    enabled: !!projectId,
  });
};

export const useUpsertStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      stageNumber, 
      name, 
      startMonth,
      durationMonths,
      file,
      existingId 
    }: { 
      projectId: string; 
      stageNumber: number; 
      name: string;
      startMonth?: number;
      durationMonths?: number;
      file?: File;
      existingId?: string;
    }) => {
      let storagePath = null;
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/stages/${stageNumber}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        storagePath = fileName;
      }
      
      const stageData: any = {
        project_id: projectId,
        stage_number: stageNumber,
        name,
        start_month: startMonth ?? stageNumber - 1,
        duration_months: durationMonths ?? 1,
      };
      
      if (storagePath) {
        stageData.storage_path = storagePath;
      }
      
      if (existingId) {
        // Update existing
        const { data, error } = await supabase
          .from('project_stages')
          .update(stageData)
          .eq('id', existingId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('project_stages')
          .insert({ id: crypto.randomUUID(), ...stageData })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-stages', projectId] });
    },
  });
};

export const useDeleteStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, storagePath }: { id: string; projectId: string; storagePath: string | null }) => {
      if (storagePath) {
        const path = storagePath.includes('/storage/') 
          ? storagePath.split('/project-images/')[1] 
          : storagePath;
        if (path) {
          await supabase.storage.from('project-images').remove([path]);
        }
      }
      const { error } = await supabase.from('project_stages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-stages', projectId] });
    },
  });
};

// Default stage names with Gantt timing
export const DEFAULT_STAGES = [
  { number: 1, name: 'Radieres y Envigado', start_month: 0, duration_months: 1 },
  { number: 2, name: 'Estructura y Tabiquería', start_month: 1, duration_months: 1 },
  { number: 3, name: 'Cubierta', start_month: 2, duration_months: 1 },
  { number: 4, name: 'Revestimiento Exterior', start_month: 3, duration_months: 1 },
  { number: 5, name: 'Revestimiento Interior', start_month: 4, duration_months: 1 },
  { number: 6, name: 'Terminaciones', start_month: 5, duration_months: 1 },
];
