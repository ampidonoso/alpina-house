import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SiteConfig {
  id: string;
  key: string;
  value: Json;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSiteConfig = () => {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      return data as SiteConfig[];
    },
  });
};

export const useSiteConfigByKey = (key: string) => {
  return useQuery({
    queryKey: ['site-config', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data as SiteConfig | null;
    },
  });
};

export const useUpdateSiteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      const { data, error } = await supabase
        .from('site_config')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
  });
};

export const useCreateSiteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Omit<SiteConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('site_config')
        .insert(config)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
  });
};

// Helper to get config as a key-value map
export const useConfigMap = () => {
  const { data: configs, ...rest } = useSiteConfig();
  
  const configMap = configs?.reduce((acc, config) => {
    acc[config.key] = config.value;
    return acc;
  }, {} as Record<string, Json>) ?? {};

  return { configMap, configs, ...rest };
};
