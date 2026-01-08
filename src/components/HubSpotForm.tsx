import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface HubSpotFormProps {
  portalId?: string;
  formId?: string;
  region?: string;
  className?: string;
}

const HubSpotForm = ({
  portalId = "5237863",
  formId = "2b6f5fa7-ae15-4de8-9068-3d14656be58f",
  region = "na1",
  className = ""
}: HubSpotFormProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load HubSpot script if not already loaded
    const existingScript = document.querySelector('script[src*="hsforms.net"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://js.hsforms.net/forms/embed/developer/${portalId}.js`;
      script.defer = true;
      script.onload = () => {
        setIsLoading(false);
      };
      script.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };
      document.head.appendChild(script);
    } else {
      // Script already exists, check if form renders
      setIsLoading(false);
    }

    // Timeout fallback - if form doesn't load in 10 seconds, show error
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [portalId, isLoading]);

  // Check if form has rendered
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const observer = new MutationObserver((mutations) => {
        if (containerRef.current && containerRef.current.querySelector('form')) {
          setHasError(false);
          observer.disconnect();
        }
      });
      
      observer.observe(containerRef.current, { childList: true, subtree: true });
      
      // Check immediately
      if (containerRef.current.querySelector('form')) {
        setHasError(false);
      }
      
      return () => observer.disconnect();
    }
  }, [isLoading]);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-muted-foreground mb-2">
          No se pudo cargar el formulario de contacto.
        </p>
        <p className="text-sm text-muted-foreground">
          Por favor, contáctanos directamente a{' '}
          <a href="mailto:contacto@alpina.cl" className="text-primary underline">
            contacto@alpina.cl
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-1/3" />
        </div>
      )}
      <div
        ref={containerRef}
        className={`hs-form-html ${isLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
        data-region={region}
        data-form-id={formId}
        data-portal-id={portalId}
      />
    </div>
  );
};

export default HubSpotForm;
