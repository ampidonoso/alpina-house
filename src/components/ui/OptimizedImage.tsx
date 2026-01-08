import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  webpSrc?: string;
  avifSrc?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  aspectRatio?: string;
  fallback?: string;
}

/**
 * OptimizedImage Component
 * 
 * Displays images with modern format support (WebP/AVIF) and automatic fallback.
 * Includes lazy loading, proper aspect ratio handling, and error fallback.
 * 
 * Usage:
 * <OptimizedImage 
 *   src="/image.jpg" 
 *   webpSrc="/image.webp"
 *   alt="Description"
 *   className="w-full h-full object-cover"
 * />
 */
const OptimizedImage = ({
  src,
  webpSrc,
  avifSrc,
  alt,
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
  aspectRatio,
  fallback,
  ...props
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate WebP/AVIF sources if not provided
  const webpSource = webpSrc || (src ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp') : undefined);
  const avifSource = avifSrc || (src ? src.replace(/\.(jpg|jpeg|png)$/i, '.avif') : undefined);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallback) {
      setImgSrc(fallback);
      setHasError(true);
    } else if (!hasError) {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // If we have modern formats, use picture element
  if (webpSource || avifSource) {
    return (
      <picture className={cn('block', aspectRatio && `aspect-${aspectRatio}`, className)}>
        {/* AVIF source (best compression) */}
        {avifSource && (
          <source srcSet={avifSource} type="image/avif" />
        )}
        {/* WebP source (good compression, wider support) */}
        {webpSource && (
          <source srcSet={webpSource} type="image/webp" />
        )}
        {/* Fallback to original */}
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={loading}
          fetchPriority={fetchPriority}
          onError={handleError}
          onLoad={handleLoad}
          decoding="async"
          {...props}
        />
      </picture>
    );
  }

  // Fallback to regular img if no modern formats
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        aspectRatio && `aspect-${aspectRatio}`,
        className
      )}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={handleError}
      onLoad={handleLoad}
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
