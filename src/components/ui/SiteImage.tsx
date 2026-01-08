import { useSiteAsset } from '@/hooks/useSiteAssets';
import { getSlotByKey } from '@/config/imageSlots';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface SiteImageProps {
  slotKey: string;
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
}

/**
 * SiteImage Component
 * 
 * Displays an image from a predefined slot. Uses the database image if available,
 * otherwise falls back to the default image defined in imageSlots.ts.
 * 
 * Usage:
 * <SiteImage slotKey="section_manifesto" className="w-full h-full object-cover" />
 */
const SiteImage = ({ slotKey, className, alt, loading = 'lazy', onLoad }: SiteImageProps) => {
  const { data: dbAsset, isLoading } = useSiteAsset(slotKey);
  const slot = getSlotByKey(slotKey);

  if (!slot) {
    logger.warn(`SiteImage: No slot found for key "${slotKey}"`);
    return null;
  }

  // Use database image if available, otherwise fallback to default
  const imageSrc = dbAsset?.storage_path || slot.defaultImage;
  const imageAlt = alt || dbAsset?.alt_text || slot.name;

  return (
    <img
      src={imageSrc}
      alt={imageAlt}
      className={cn(className)}
      loading={loading}
      onLoad={onLoad}
    />
  );
};

export default SiteImage;

/**
 * Hook to get the image source for a slot
 * Useful when you need just the URL without rendering an img tag
 */
export const useSiteImageSrc = (slotKey: string): { src: string; alt: string; isLoading: boolean } => {
  const { data: dbAsset, isLoading } = useSiteAsset(slotKey);
  const slot = getSlotByKey(slotKey);

  if (!slot) {
    return { src: '', alt: '', isLoading: false };
  }

  return {
    src: dbAsset?.storage_path || slot.defaultImage,
    alt: dbAsset?.alt_text || slot.name,
    isLoading,
  };
};
