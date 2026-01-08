import { Project, ProjectImage } from "@/hooks/useProjects";
import { GalleryItem } from "@/components/models";

// Helper to get main/cover image from a project
export const getMainImage = (project: Project, fallback: string): string => {
  const coverImage = project.images?.find(img => img.is_cover || img.image_type === 'cover');
  return coverImage?.storage_path || project.images?.[0]?.storage_path || fallback;
};

// Helper to get all images from a project (legacy - returns string array)
export const getAllImages = (project: Project | null, fallback: string): string[] => {
  if (!project?.images || project.images.length === 0) return [fallback];
  return project.images.map(img => img.storage_path);
};

// Helper to get all media items (images and videos) from a project
export const getAllMediaItems = (project: Project | null, fallback: string): GalleryItem[] => {
  if (!project?.images || project.images.length === 0) {
    return [{ url: fallback, type: 'image' }];
  }
  return project.images.map(img => ({
    url: img.storage_path,
    type: (img.media_type === 'video' ? 'video' : 'image') as 'image' | 'video'
  }));
};

// Helper to get images linked to a specific finish (placeholder - linked_finish_id doesn't exist in DB)
export const getImagesLinkedToFinish = (project: Project | null, finishId: string | undefined): ProjectImage[] => {
  // linked_finish_id doesn't exist in the DB schema, return empty array
  return [];
};

// Helper to get images linked to a specific terrain (placeholder - linked_terrain_id doesn't exist in DB)
export const getImagesLinkedToTerrain = (project: Project | null, terrainId: string | undefined): ProjectImage[] => {
  // linked_terrain_id doesn't exist in the DB schema, return empty array
  return [];
};
