import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useConfigMap } from '@/hooks/useSiteConfig';
import { Json } from '@/integrations/supabase/types';

interface SiteConfigContextType {
  config: Record<string, Json>;
  isLoading: boolean;
  getConfig: (key: string, fallback?: string) => string;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const { configMap, isLoading } = useConfigMap();

  // Apply color CSS variables when config changes
  useEffect(() => {
    if (!configMap) return;

    const root = document.documentElement;
    
    // Apply colors as CSS variables
    const primaryColor = configMap.primary_color;
    if (typeof primaryColor === 'string') {
      const hsl = hexToHSL(primaryColor);
      if (hsl) root.style.setProperty('--primary', hsl);
    }
    
    const secondaryColor = configMap.secondary_color;
    if (typeof secondaryColor === 'string') {
      const hsl = hexToHSL(secondaryColor);
      if (hsl) root.style.setProperty('--secondary', hsl);
    }
    
    const accentColor = configMap.accent_color;
    if (typeof accentColor === 'string') {
      const hsl = hexToHSL(accentColor);
      if (hsl) root.style.setProperty('--accent', hsl);
    }
  }, [configMap]);

  const getConfig = (key: string, fallback = ''): string => {
    const value = configMap?.[key];
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  return (
    <SiteConfigContext.Provider value={{ config: configMap || {}, isLoading, getConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfigContext = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfigContext must be used within a SiteConfigProvider');
  }
  return context;
};

// Helper: Convert hex to HSL string for CSS variables
function hexToHSL(hex: string): string | null {
  if (!hex || !hex.startsWith('#')) return null;
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
