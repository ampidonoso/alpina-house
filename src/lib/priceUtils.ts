// Centralized price formatting utilities

export type Currency = 'usd' | 'clp' | 'uf';

export interface PriceData {
  usd?: string | number;
  clp?: string | number;
  uf?: string | number;
}

export interface ExchangeRates {
  usd_to_clp: number;
  uf_to_clp: number;
  eur_to_clp: number;
  updated_at: string;
  source: string;
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  usd: 'USD',
  clp: 'CLP',
  uf: 'UF',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  usd: '$',
  clp: '$',
  uf: '',
};

// Default fallback rates (used when no synced rates available)
export const DEFAULT_RATES: ExchangeRates = {
  usd_to_clp: 950,
  uf_to_clp: 38000,
  eur_to_clp: 1050,
  updated_at: new Date().toISOString(),
  source: 'default',
};

/**
 * Calculate conversion rates from exchange rates
 * Base currency is USD for modifiers
 */
export const getConversionRates = (rates: ExchangeRates | null): Record<Currency, number> => {
  const r = rates || DEFAULT_RATES;
  
  // Rates relative to USD (1 USD = X currency)
  return {
    usd: 1,
    clp: r.usd_to_clp,
    uf: r.usd_to_clp / r.uf_to_clp, // USD to UF
  };
};

/**
 * Convert a value from one currency to another using exchange rates
 */
export const convertCurrency = (
  value: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates | null
): number => {
  if (from === to) return value;
  
  const r = rates || DEFAULT_RATES;
  
  // Convert everything through CLP as base
  let valueInClp: number;
  
  switch (from) {
    case 'usd':
      valueInClp = value * r.usd_to_clp;
      break;
    case 'uf':
      valueInClp = value * r.uf_to_clp;
      break;
    case 'clp':
    default:
      valueInClp = value;
  }
  
  // Convert from CLP to target currency
  switch (to) {
    case 'usd':
      return valueInClp / r.usd_to_clp;
    case 'uf':
      return valueInClp / r.uf_to_clp;
    case 'clp':
    default:
      return valueInClp;
  }
};

/**
 * Parse price_range JSON string into PriceData object
 */
export const parsePriceRange = (priceRange: string | null): PriceData | null => {
  if (!priceRange) return null;
  try {
    return JSON.parse(priceRange) as PriceData;
  } catch {
    return null;
  }
};

/**
 * Format a price value with locale-appropriate separators
 */
export const formatPriceValue = (value: string | number, currency: Currency): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  
  if (isNaN(numValue)) return 'Consultar';
  
  if (currency === 'uf') {
    return numValue.toLocaleString('es-CL', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  }
  
  if (currency === 'clp') {
    return numValue.toLocaleString('es-CL', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  }
  
  // USD
  return numValue.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
};

/**
 * Get formatted price string for a specific currency
 * Now supports dynamic conversion using exchange rates
 */
export const getFormattedPrice = (
  priceRange: string | null, 
  currency: Currency,
  rates?: ExchangeRates | null
): string => {
  const prices = parsePriceRange(priceRange);
  if (!prices) return 'Consultar';
  
  // Try to get the direct value first
  let value = prices[currency];
  
  // If not available, convert from another available currency
  if (!value && rates) {
    if (prices.usd) {
      const usdValue = typeof prices.usd === 'string' 
        ? parseFloat(prices.usd.replace(/[^0-9.-]/g, ''))
        : prices.usd;
      value = convertCurrency(usdValue, 'usd', currency, rates);
    } else if (prices.clp) {
      const clpValue = typeof prices.clp === 'string'
        ? parseFloat(prices.clp.replace(/[^0-9.-]/g, ''))
        : prices.clp;
      value = convertCurrency(clpValue, 'clp', currency, rates);
    } else if (prices.uf) {
      const ufValue = typeof prices.uf === 'string'
        ? parseFloat(prices.uf.replace(/[^0-9.-]/g, ''))
        : prices.uf;
      value = convertCurrency(ufValue, 'uf', currency, rates);
    }
  }
  
  if (!value) return 'Consultar';
  
  const formatted = formatPriceValue(value, currency);
  
  if (currency === 'uf') {
    return `${formatted} UF`;
  }
  
  return `${CURRENCY_SYMBOLS[currency]}${formatted} ${CURRENCY_LABELS[currency]}`;
};

/**
 * Get price in a specific currency, with conversion if needed
 */
export const getPriceInCurrency = (
  priceRange: string | null,
  currency: Currency,
  rates: ExchangeRates | null
): number => {
  const prices = parsePriceRange(priceRange);
  if (!prices) return 0;
  
  // Try to get the direct value first
  const directValue = prices[currency];
  if (directValue) {
    return typeof directValue === 'string'
      ? parseFloat(directValue.replace(/[^0-9.-]/g, ''))
      : directValue;
  }
  
  // Convert from available currency
  if (prices.usd) {
    const usdValue = typeof prices.usd === 'string'
      ? parseFloat(prices.usd.replace(/[^0-9.-]/g, ''))
      : prices.usd;
    return convertCurrency(usdValue, 'usd', currency, rates);
  }
  
  if (prices.clp) {
    const clpValue = typeof prices.clp === 'string'
      ? parseFloat(prices.clp.replace(/[^0-9.-]/g, ''))
      : prices.clp;
    return convertCurrency(clpValue, 'clp', currency, rates);
  }
  
  if (prices.uf) {
    const ufValue = typeof prices.uf === 'string'
      ? parseFloat(prices.uf.replace(/[^0-9.-]/g, ''))
      : prices.uf;
    return convertCurrency(ufValue, 'uf', currency, rates);
  }
  
  return 0;
};

/**
 * Get all available prices formatted
 */
export const getAllFormattedPrices = (
  priceRange: string | null,
  rates?: ExchangeRates | null
): Record<Currency, string> => {
  return {
    usd: getFormattedPrice(priceRange, 'usd', rates),
    clp: getFormattedPrice(priceRange, 'clp', rates),
    uf: getFormattedPrice(priceRange, 'uf', rates),
  };
};

/**
 * Check if a price_range has a specific currency
 */
export const hasCurrency = (priceRange: string | null, currency: Currency): boolean => {
  const prices = parsePriceRange(priceRange);
  return prices ? !!prices[currency] : false;
};

/**
 * Get available currencies from price_range
 */
export const getAvailableCurrencies = (priceRange: string | null): Currency[] => {
  const prices = parsePriceRange(priceRange);
  if (!prices) return [];
  
  const available: Currency[] = [];
  if (prices.usd) available.push('usd');
  if (prices.clp) available.push('clp');
  if (prices.uf) available.push('uf');
  
  return available;
};

/**
 * Convert price modifier (in USD) to target currency
 */
export const convertModifier = (
  modifierUsd: number,
  currency: Currency,
  rates: ExchangeRates | null
): number => {
  if (currency === 'usd') return modifierUsd;
  return convertCurrency(modifierUsd, 'usd', currency, rates);
};

/**
 * Format a modifier value with + sign for display
 */
export const formatModifierDisplay = (
  value: number,
  currency: Currency
): string => {
  if (value === 0) return '';
  
  const formatted = formatPriceValue(value, currency);
  const sign = value > 0 ? '+' : '';
  
  if (currency === 'uf') {
    return `${sign}${formatted} UF`;
  }
  
  return `${sign}${CURRENCY_SYMBOLS[currency]}${formatted}`;
};

/**
 * Format price in compact form for badges/tags
 */
export const formatPriceCompact = (
  value: number,
  currency: Currency
): string => {
  if (value === 0) return '-';
  
  // For large numbers, use K/M notation
  let displayValue = value;
  let suffix = '';
  
  if (currency !== 'uf') {
    if (value >= 1000000) {
      displayValue = value / 1000000;
      suffix = 'M';
    } else if (value >= 1000) {
      displayValue = value / 1000;
      suffix = 'K';
    }
  }
  
  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: suffix ? 1 : 0,
  });
  
  if (currency === 'uf') {
    return `${formatted} UF`;
  }
  
  return `${CURRENCY_SYMBOLS[currency]}${formatted}${suffix}`;
};

/**
 * Get currency display info
 */
export const getCurrencyInfo = (currency: Currency): { symbol: string; label: string; flag: string } => {
  const flags: Record<Currency, string> = {
    usd: '🇺🇸',
    clp: '🇨🇱',
    uf: '🇨🇱',
  };
  
  return {
    symbol: CURRENCY_SYMBOLS[currency],
    label: CURRENCY_LABELS[currency],
    flag: flags[currency],
  };
};
