import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Currency, ExchangeRates } from '@/lib/priceUtils';
import { JourneySummaryData } from '@/hooks/useJourney';

// ============================================================================
// TYPES
// ============================================================================

export interface QuoteRequest {
  id: string;
  created_at: string;
  updated_at: string;
  // Contact info
  name: string;
  email: string;
  phone: string | null;
  // Location
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  // Structured references
  project_id: string | null;
  project_name: string | null;
  finish_id: string | null;
  finish_name: string | null;
  terrain_id: string | null;
  terrain_name: string | null;
  // Pricing
  currency: Currency;
  base_price: number;
  finish_modifier: number;
  terrain_modifier: number;
  total_price: number;
  exchange_rates: ExchangeRates | null;
  // Legacy
  model: string | null;
  notes: string | null;
  // Status
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
}

export interface CreateQuoteInput {
  // Contact info
  name: string;
  email: string;
  phone?: string;
  // Location
  location?: string;
  locationCoords?: { lat: number; lng: number } | null;
  // From Journey
  journeyData: JourneySummaryData;
  // Exchange rates snapshot
  exchangeRates?: ExchangeRates | null;
}

export type QuoteStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch all quote requests (admin use)
 */
export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async (): Promise<QuoteRequest[]> => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      return (data || []) as unknown as QuoteRequest[];
    },
  });
}

/**
 * Create a new quote request
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuoteInput): Promise<QuoteRequest> => {
      const { journeyData, exchangeRates, locationCoords, ...contactInfo } = input;

      // Build notes for legacy compatibility
      const notesParts: string[] = [];
      if (journeyData.finishName) {
        notesParts.push(`Terminación: ${journeyData.finishName}${journeyData.finishModifier > 0 ? ` (+$${journeyData.finishModifier.toLocaleString()})` : ''}`);
      }
      if (journeyData.terrainName) {
        notesParts.push(`Terreno: ${journeyData.terrainName}${journeyData.terrainModifier > 0 ? ` (+$${journeyData.terrainModifier.toLocaleString()})` : ''}`);
      }
      notesParts.push(`Precio total: ${journeyData.formattedTotalPrice}`);

      const insertData = {
        // Contact
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone || null,
        // Location
        location: contactInfo.location || null,
        location_lat: locationCoords?.lat || null,
        location_lng: locationCoords?.lng || null,
        // Structured data
        project_id: journeyData.modelId,
        project_name: journeyData.modelName,
        finish_id: journeyData.finishId,
        finish_name: journeyData.finishName,
        terrain_id: journeyData.terrainId,
        terrain_name: journeyData.terrainName,
        // Pricing
        currency: journeyData.currency,
        base_price: journeyData.basePrice,
        finish_modifier: journeyData.finishModifier,
        terrain_modifier: journeyData.terrainModifier,
        total_price: journeyData.totalPrice,
        exchange_rates: exchangeRates ? JSON.parse(JSON.stringify(exchangeRates)) : null,
        // Legacy
        model: journeyData.modelName,
        notes: notesParts.length > 0 ? notesParts.join(' | ') : null,
        // Status
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('quote_requests')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating quote:', error);
        throw error;
      }

      return data as unknown as QuoteRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Solicitud enviada', {
        description: 'Te contactaremos en menos de 24 horas.',
      });
    },
    onError: (error) => {
      console.error('Error creating quote:', error);
      toast.error('Error al enviar solicitud', {
        description: 'Por favor intenta nuevamente.',
      });
    },
  });
}

/**
 * Update quote status
 */
export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }): Promise<void> => {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating quote status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Estado actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar estado');
    },
  });
}

/**
 * Delete a quote request
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('quote_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting quote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Cotización eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar cotización');
    },
  });
}

/**
 * Get quote statistics
 */
export function useQuoteStats() {
  const { data: quotes = [] } = useQuotes();

  return {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    contacted: quotes.filter(q => q.status === 'contacted').length,
    completed: quotes.filter(q => q.status === 'completed').length,
    cancelled: quotes.filter(q => q.status === 'cancelled').length,
  };
}
