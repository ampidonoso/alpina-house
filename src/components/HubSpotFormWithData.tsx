import { useEffect, useRef, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { JourneySummaryData } from '@/hooks/useJourney';
import { logger } from '@/lib/logger';

interface HubSpotFormWithDataProps {
  portalId?: string;
  formId?: string;
  region?: string;
  className?: string;
  // Journey data to populate hidden fields
  journeyData?: JourneySummaryData | null;
  // Additional contact data
  contactLocation?: string;
  onFormSubmitted?: () => void;
}

/**
 * Extended HubSpot form that populates hidden fields with Journey data
 * for seamless CRM integration
 */
const HubSpotFormWithData = ({
  portalId = "5237863",
  formId = "2b6f5fa7-ae15-4de8-9068-3d14656be58f",
  region = "na1",
  className = "",
  journeyData,
  contactLocation,
  onFormSubmitted,
}: HubSpotFormWithDataProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [formRendered, setFormRendered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Populate hidden fields when form is ready
  const populateHiddenFields = useCallback(() => {
    if (!containerRef.current || !journeyData) return;

    const form = containerRef.current.querySelector('form');
    if (!form) return;

    // Map Journey data to HubSpot field names
    const fieldMapping: Record<string, string | number | null> = {
      'modelo': journeyData.modelName,
      'modelo_id': journeyData.modelId,
      'terminacion': journeyData.finishName,
      'tipo_terreno': journeyData.terrainName,
      'moneda': journeyData.currency.toUpperCase(),
      'precio_base': journeyData.basePrice,
      'modificador_terminacion': journeyData.finishModifier,
      'modificador_terreno': journeyData.terrainModifier,
      'precio_total': journeyData.totalPrice,
      'ubicacion_proyecto': contactLocation || null,
    };

    // Set values for hidden fields
    Object.entries(fieldMapping).forEach(([fieldName, value]) => {
      if (value === null || value === undefined) return;

      // Try to find the field by name attribute
      const input = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
      if (input) {
        input.value = String(value);
        // Trigger change event for HubSpot to pick up the value
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    logger.log('HubSpot form populated with Journey data:', fieldMapping);
  }, [journeyData, contactLocation]);

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
      setIsLoading(false);
    }

    // Timeout fallback
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

  // Watch for form rendering and populate fields
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const observer = new MutationObserver((mutations) => {
        if (containerRef.current && containerRef.current.querySelector('form')) {
          setHasError(false);
          setFormRendered(true);
          observer.disconnect();
          
          // Populate hidden fields after form renders
          setTimeout(() => {
            populateHiddenFields();
          }, 100);
        }
      });
      
      observer.observe(containerRef.current, { childList: true, subtree: true });
      
      // Check immediately
      if (containerRef.current.querySelector('form')) {
        setHasError(false);
        setFormRendered(true);
        populateHiddenFields();
      }
      
      return () => observer.disconnect();
    }
  }, [isLoading, populateHiddenFields]);

  // Re-populate when journey data changes
  useEffect(() => {
    if (formRendered && journeyData) {
      populateHiddenFields();
    }
  }, [formRendered, journeyData, populateHiddenFields]);

  // Listen for form submission
  useEffect(() => {
    if (!formRendered || !containerRef.current) return;

    const form = containerRef.current.querySelector('form');
    if (!form) return;

    const handleSubmit = () => {
      onFormSubmitted?.();
    };

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [formRendered, onFormSubmitted]);

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
      {/* Journey data summary for debugging (hidden in production) */}
      {journeyData && process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          <pre>{JSON.stringify(journeyData, null, 2)}</pre>
        </div>
      )}

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

export default HubSpotFormWithData;
