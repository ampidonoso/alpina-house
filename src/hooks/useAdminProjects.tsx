import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectImage, ImageType, MediaType } from './useProjects';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
};

// Helper para logging detallado
const logError = (operation: string, error: unknown, context?: Record<string, unknown>) => {
  logger.error(`[${operation}] Error:`, error);
  if (context) logger.error(`[${operation}] Context:`, context);
  const message = error instanceof Error ? error.message : String(error);
  toast.error(`Error en ${operation}: ${message}`);
};

export const useAdminProjects = () => {
  return useQuery({
    queryKey: ['admin-projects'],
    queryFn: async (): Promise<Project[]> => {
      logger.log('[useAdminProjects] Fetching projects...');
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        logError('useAdminProjects', error);
        throw error;
      }

      const projectsWithImages = await Promise.all(
        (projects || []).map(async (project) => {
          const { data: images } = await supabase
            .from('project_images')
            .select('*')
            .eq('project_id', project.id)
            .order('display_order', { ascending: true });

          return {
            ...project,
            images: (images || []).map(img => ({
              ...img,
              storage_path: getPublicUrl(img.storage_path)
            }))
          };
        })
      );

      logger.log('[useAdminProjects] Loaded', projectsWithImages.length, 'projects');
      return projectsWithImages;
    }
  });
};

export const useAdminProject = (id: string) => {
  return useQuery({
    queryKey: ['admin-project', id],
    queryFn: async (): Promise<Project | null> => {
      logger.log('[useAdminProject] Fetching project:', id);
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        logError('useAdminProject', error, { id });
        throw error;
      }
      if (!project) return null;

      const { data: images } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', project.id)
        .order('display_order', { ascending: true });

      return {
        ...project,
        images: (images || []).map(img => ({
          ...img,
          storage_path: getPublicUrl(img.storage_path)
        }))
      };
    },
    enabled: !!id && id !== 'new'
  });
};

interface CreateProjectData {
  name: string;
  slug: string;
  description?: string;
  location?: string;
  area_m2?: number;
  bedrooms?: number;
  bathrooms?: number;
  construction_time?: string;
  price_range?: string;
  features?: string[];
  is_published?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      logger.log('[useCreateProject] Creating project:', data.name);
      const { data: project, error } = await supabase
        .from('projects')
        .insert(data)
        .select()
        .single();

      if (error) {
        logError('useCreateProject', error, { data });
        throw error;
      }
      logger.log('[useCreateProject] Created project:', project.id);
      toast.success('Proyecto creado exitosamente');
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: (error) => {
      logError('useCreateProject', error);
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProjectData> }) => {
      const { error } = await supabase
        .from('projects')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.log('[useDeleteProject] Deleting project:', id);

      // 1. Delete all main project images from storage
      const { data: images } = await supabase
        .from('project_images')
        .select('storage_path')
        .eq('project_id', id);

      if (images && images.length > 0) {
        const paths = images.map(img => img.storage_path);
        await supabase.storage.from('project-images').remove(paths);
      }

      // 2. Delete related records in order (foreign key dependencies)

      // A. Delete project_images records
      await supabase.from('project_images').delete().eq('project_id', id);

      // B. Delete project_finishes (clean storage first)
      const { data: finishes } = await supabase
        .from('project_finishes')
        .select('storage_path')
        .eq('project_id', id);

      if (finishes) {
        const finishPaths = finishes
          .filter(f => f.storage_path)
          .map(f => f.storage_path as string);
        if (finishPaths.length > 0) {
          await supabase.storage.from('project-images').remove(finishPaths);
        }
      }
      await supabase.from('project_finishes').delete().eq('project_id', id);

      // C. Delete project_terrains (clean storage first)
      const { data: terrains } = await supabase
        .from('project_terrains')
        .select('storage_path')
        .eq('project_id', id);

      if (terrains) {
        const terrainPaths = terrains
          .filter(t => t.storage_path)
          .map(t => t.storage_path as string);
        if (terrainPaths.length > 0) {
          await supabase.storage.from('project-images').remove(terrainPaths);
        }
      }
      await supabase.from('project_terrains').delete().eq('project_id', id);

      // D. Delete project_stages
      await supabase.from('project_stages').delete().eq('project_id', id);

      // 3. Finally delete the project itself
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('[useDeleteProject] Error deleting project:', error);
        throw error;
      }

      logger.log('[useDeleteProject] Successfully deleted project:', id);
      toast.success('Modelo eliminado exitosamente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

export const useUploadProjectImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      file, 
      imageType = 'gallery',
      mediaType = 'image',
      displayOrder = 0
    }: { 
      projectId: string; 
      file: File; 
      imageType?: ImageType;
      mediaType?: MediaType;
      displayOrder?: number;
    }) => {
      logger.log('[useUploadProjectImage] Uploading:', { projectId, fileName: file.name, imageType, mediaType });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) {
        logError('useUploadProjectImage.storage', uploadError, { fileName, fileSize: file.size });
        throw uploadError;
      }
      
      logger.log('[useUploadProjectImage] Storage upload successful:', uploadData);

      // If this is a cover image, remove existing cover
      if (imageType === 'cover') {
        const { data: existingCovers } = await supabase
          .from('project_images')
          .select('id, storage_path')
          .eq('project_id', projectId)
          .eq('image_type', 'cover');

        if (existingCovers && existingCovers.length > 0) {
          logger.log('[useUploadProjectImage] Removing existing covers:', existingCovers.length);
          for (const cover of existingCovers) {
            await supabase.storage.from('project-images').remove([cover.storage_path]);
            await supabase.from('project_images').delete().eq('id', cover.id);
          }
        }
      }

      const { data: image, error: dbError } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          storage_path: fileName,
          is_cover: imageType === 'cover',
          image_type: imageType,
          media_type: mediaType,
          display_order: displayOrder
        })
        .select()
        .single();

      if (dbError) {
        logError('useUploadProjectImage.database', dbError, { projectId, fileName });
        throw dbError;
      }
      
      logger.log('[useUploadProjectImage] Database record created:', image.id);
      toast.success('Imagen subida exitosamente');
      return image;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      logError('useUploadProjectImage', error);
    }
  });
};

export const useDeleteProjectImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageId, storagePath, projectId }: { imageId: string; storagePath: string; projectId: string }) => {
      // Extract just the path part (remove the public URL prefix if present)
      const pathOnly = storagePath.includes('project-images/') 
        ? storagePath.split('project-images/')[1]
        : storagePath;

      await supabase.storage.from('project-images').remove([pathOnly]);
      
      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

export const useSetCoverImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageId, projectId }: { imageId: string; projectId: string }) => {
      // Unset all covers first
      await supabase
        .from('project_images')
        .update({ is_cover: false })
        .eq('project_id', projectId);

      // Set new cover
      const { error } = await supabase
        .from('project_images')
        .update({ is_cover: true })
        .eq('id', imageId);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

export const useReorderProjectImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      imageIds 
    }: { 
      projectId: string; 
      imageIds: string[];
    }) => {
      // Update display_order for each image based on new position
      const updates = imageIds.map((id, index) => 
        supabase
          .from('project_images')
          .update({ display_order: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};
