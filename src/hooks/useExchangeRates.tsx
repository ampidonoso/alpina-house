import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExchangeRates {
  usd_to_clp: number;
  uf_to_clp: number;
  eur_to_clp: number;
  updated_at: string;
  source: string;
}

export const useExchangeRates = () => {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('value, updated_at')
        .eq('key', 'exchange_rates')
        .maybeSingle();

      if (error) throw error;
      if (!data?.value) return null;

      try {
        const valueStr = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
        return JSON.parse(valueStr) as ExchangeRates;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSyncExchangeRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-exchange-rates');
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.rates as ExchangeRates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      toast.success('Tipos de cambio actualizados correctamente');
    },
    onError: (error) => {
      toast.error(`Error actualizando tipos de cambio: ${error.message}`);
    },
  });
};

// Helper to convert prices between currencies using current rates
export const useConvertPrice = () => {
  const { data: rates } = useExchangeRates();

  return {
    rates,
    // Convert USD to CLP
    usdToClp: (usd: number) => rates ? Math.round(usd * rates.usd_to_clp) : null,
    // Convert CLP to USD
    clpToUsd: (clp: number) => rates ? Math.round(clp / rates.usd_to_clp) : null,
    // Convert UF to CLP
    ufToClp: (uf: number) => rates ? Math.round(uf * rates.uf_to_clp) : null,
    // Convert CLP to UF
    clpToUf: (clp: number) => rates ? parseFloat((clp / rates.uf_to_clp).toFixed(2)) : null,
    // Convert USD to UF
    usdToUf: (usd: number) => rates ? parseFloat(((usd * rates.usd_to_clp) / rates.uf_to_clp).toFixed(2)) : null,
  };
};
