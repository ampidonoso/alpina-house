import { type AssetCategory, type AssetPage } from '@/config/imageSlots';
import { logger } from '@/lib/logger';

export type { AssetCategory, AssetPage };

export interface SiteAsset {
  id: string;
  key: string;
  storage_path: string;
  alt_text: string | null;
  category: AssetCategory;
  page: AssetPage;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadAssetInput {
  file: File;
  key: string;
  category: AssetCategory;
  page: AssetPage;
  altText?: string;
}

// Placeholder hooks - site_assets table doesn't exist yet
export const useSiteAssets = () => {
  return { data: [] as SiteAsset[], isLoading: false, error: null };
};

export const useSiteAsset = (_key: string) => {
  return { data: null as SiteAsset | null, isLoading: false, error: null };
};

export const useSiteAssetsByCategory = (_category: AssetCategory) => {
  return { data: [] as SiteAsset[], isLoading: false, error: null };
};

export const useSiteAssetsByPage = (_page: AssetPage) => {
  return { data: [] as SiteAsset[], isLoading: false, error: null };
};

export const useUploadSiteAsset = () => {
  return {
    mutateAsync: async (_input: UploadAssetInput) => { 
      logger.warn('site_assets table not available');
      // Return a mock asset for now
      return null;
    },
    isPending: false,
  };
};

export const useUpdateSiteAsset = () => {
  return {
    mutateAsync: async (_asset: Partial<SiteAsset>) => { 
      logger.warn('site_assets table not available');
      return null;
    },
    isPending: false,
  };
};

export const useDeleteSiteAsset = () => {
  return {
    mutateAsync: async (_asset: SiteAsset) => { 
      logger.warn('site_assets table not available');
    },
    isPending: false,
  };
};

// Helper to get asset URL with fallback
export const getAssetUrl = (
  assets: SiteAsset[] | undefined,
  key: string,
  fallback: string
): string => {
  const asset = assets?.find((a) => a.key === key && a.is_active);
  return asset?.storage_path || fallback;
};

// Re-export labels from config for backwards compatibility
export { categoryLabels, pageLabels } from '@/config/imageSlots';
