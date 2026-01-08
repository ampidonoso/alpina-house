import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MindicadorResponse {
  version: string;
  autor: string;
  fecha: string;
  uf: { codigo: string; nombre: string; valor: number };
  dolar: { codigo: string; nombre: string; valor: number };
  euro: { codigo: string; nombre: string; valor: number };
}

interface ExchangeRates {
  usd_to_clp: number;
  uf_to_clp: number;
  eur_to_clp: number;
  updated_at: string;
  source: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching exchange rates from mindicador.cl...');
    
    // Fetch data from mindicador.cl API
    const response = await fetch('https://mindicador.cl/api');
    
    if (!response.ok) {
      throw new Error(`Mindicador API error: ${response.status}`);
    }
    
    const data: MindicadorResponse = await response.json();
    console.log('Received data from mindicador.cl:', {
      fecha: data.fecha,
      dolar: data.dolar?.valor,
      uf: data.uf?.valor,
      euro: data.euro?.valor,
    });

    const rates: ExchangeRates = {
      usd_to_clp: data.dolar?.valor || 0,
      uf_to_clp: data.uf?.valor || 0,
      eur_to_clp: data.euro?.valor || 0,
      updated_at: new Date().toISOString(),
      source: 'mindicador.cl',
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store rates in site_config table as JSON
    const { data: existingConfig, error: fetchError } = await supabase
      .from('site_config')
      .select('id')
      .eq('key', 'exchange_rates')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing config:', fetchError);
    }

    let result;
    if (existingConfig) {
      // Update existing record
      result = await supabase
        .from('site_config')
        .update({
          value: JSON.stringify(rates),
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'exchange_rates');
    } else {
      // Insert new record
      result = await supabase
        .from('site_config')
        .insert({
          key: 'exchange_rates',
          value: JSON.stringify(rates),
          type: 'json',
          label: 'Tipos de Cambio',
          category: 'pricing',
        });
    }

    if (result.error) {
      throw new Error(`Database error: ${result.error.message}`);
    }

    console.log('Exchange rates saved successfully:', rates);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Exchange rates updated successfully',
        rates,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error syncing exchange rates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
