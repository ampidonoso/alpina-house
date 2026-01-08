import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ImageType = 'cover' | 'gallery' | 'floor_plan';
export type MediaType = 'image' | 'video';

// Matches database schema from project_images table
export interface ProjectImage {
  id: string;
  project_id: string;
  storage_path: string;
  alt_text: string | null;
  is_cover: boolean | null;
  image_type: string | null;
  media_type: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

// Matches database schema from projects table
export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  construction_time_months: number | null;
  price_range: unknown | null;
  features: string[] | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
  images: ProjectImage[];
}

const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
};

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects', 'published'],
    queryFn: async (): Promise<Project[]> => {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Fetch images for each project
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

      return projectsWithImages;
    }
  });
};

export const useProject = (slug: string) => {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async (): Promise<Project | null> => {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
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
    enabled: !!slug
  });
};
