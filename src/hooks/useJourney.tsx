import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Project } from '@/hooks/useProjects';
import { ProjectFinish, ProjectTerrain, ProjectStage } from '@/hooks/useProjectCustomizations';
import { 
  Currency, 
  parsePriceRange, 
  formatPriceValue, 
  CURRENCY_SYMBOLS, 
  CURRENCY_LABELS,
  ExchangeRates,
  getConversionRates,
  getPriceInCurrency,
  convertModifier,
  DEFAULT_RATES
} from '@/lib/priceUtils';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { logger } from '@/lib/logger';

// ============================================================================
// INTERFACES
// ============================================================================

export interface JourneyState {
  currentStep: 1 | 2 | 3 | 4;
  selectedModel: Project | null;
  customization: {
    finish: ProjectFinish | null;
    terrain: ProjectTerrain | null;
  };
  timeline: {
    month: number; // 0-6
    activeStage: ProjectStage | null;
  };
  currency: Currency;
  isHydrated: boolean;
}

export type JourneyAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 | 4 }
  | { type: 'SELECT_MODEL'; payload: Project }
  | { type: 'SELECT_FINISH'; payload: ProjectFinish | null }
  | { type: 'SELECT_TERRAIN'; payload: ProjectTerrain | null }
  | { type: 'SET_TIMELINE_MONTH'; payload: number }
  | { type: 'SET_ACTIVE_STAGE'; payload: ProjectStage | null }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'HYDRATE'; payload: Partial<JourneyState> }
  | { type: 'RESET' };

export interface JourneySummaryData {
  modelId: string | null;
  modelName: string | null;
  modelSlug: string | null;
  finishId: string | null;
  finishName: string | null;
  terrainId: string | null;
  terrainName: string | null;
  currency: Currency;
  basePrice: number;
  finishModifier: number;
  terrainModifier: number;
  totalPrice: number;
  formattedTotalPrice: string;
  timestamp: string;
}

export interface PriceBreakdown {
  base: number;
  finishModifier: number;
  terrainModifier: number;
}

export interface JourneyContextValue {
  state: JourneyState;
  actions: {
    nextStep: () => void;
    prevStep: () => void;
    setStep: (step: 1 | 2 | 3 | 4) => void;
    selectModel: (model: Project) => void;
    selectFinish: (finish: ProjectFinish | null) => void;
    selectTerrain: (terrain: ProjectTerrain | null) => void;
    setTimelineMonth: (month: number) => void;
    setActiveStage: (stage: ProjectStage | null) => void;
    setCurrency: (currency: Currency) => void;
    reset: () => void;
  };
  helpers: {
    canAdvance: boolean;
    canGoBack: boolean;
    totalPrice: number;
    formattedTotalPrice: string;
    priceBreakdown: PriceBreakdown;
    isComplete: boolean;
    summaryData: JourneySummaryData;
    stepProgress: number; // 0-100 percentage
    hydrateFromStorage: (projects: Project[], finishes: ProjectFinish[], terrains: ProjectTerrain[]) => void;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const initialState: JourneyState = {
  currentStep: 1,
  selectedModel: null,
  customization: {
    finish: null,
    terrain: null,
  },
  timeline: {
    month: 0,
    activeStage: null,
  },
  currency: 'usd',
  isHydrated: false,
};

// Removed static CONVERSION_RATES - now using dynamic rates from useExchangeRates

const MAX_STEP = 4;
const MIN_STEP = 1;
const STORAGE_KEY = 'alpina-journey-state';

// ============================================================================
// REDUCER
// ============================================================================

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'NEXT_STEP': {
      // Validation: Cannot advance from step 1 without a model selected
      if (state.currentStep === 1 && !state.selectedModel) {
        return state;
      }
      // Cannot go beyond max step
      if (state.currentStep >= MAX_STEP) {
        return state;
      }
      return {
        ...state,
        currentStep: (state.currentStep + 1) as 1 | 2 | 3 | 4,
      };
    }

    case 'PREV_STEP': {
      if (state.currentStep <= MIN_STEP) {
        return state;
      }
      return {
        ...state,
        currentStep: (state.currentStep - 1) as 1 | 2 | 3 | 4,
      };
    }

    case 'SET_STEP': {
      const targetStep = action.payload;
      // Validation: Cannot jump to step 2+ without a model
      if (targetStep > 1 && !state.selectedModel) {
        return state;
      }
      // Ensure step is within bounds
      if (targetStep < MIN_STEP || targetStep > MAX_STEP) {
        return state;
      }
      return {
        ...state,
        currentStep: targetStep,
      };
    }

    case 'SELECT_MODEL': {
      // When selecting a new model, reset customization to avoid invalid states
      // (e.g., a finish that doesn't apply to the new model)
      return {
        ...state,
        selectedModel: action.payload,
        customization: {
          finish: null,
          terrain: null,
        },
        timeline: {
          month: 0,
          activeStage: null,
        },
      };
    }

    case 'SELECT_FINISH': {
      return {
        ...state,
        customization: {
          ...state.customization,
          finish: action.payload,
        },
      };
    }

    case 'SELECT_TERRAIN': {
      return {
        ...state,
        customization: {
          ...state.customization,
          terrain: action.payload,
        },
      };
    }

    case 'SET_TIMELINE_MONTH': {
      // Clamp value between 0 and 6
      const clampedMonth = Math.max(0, Math.min(6, action.payload));
      return {
        ...state,
        timeline: {
          ...state.timeline,
          month: clampedMonth,
        },
      };
    }

    case 'SET_ACTIVE_STAGE': {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          activeStage: action.payload,
        },
      };
    }

    case 'SET_CURRENCY': {
      return {
        ...state,
        currency: action.payload,
      };
    }

    case 'HYDRATE': {
      return {
        ...state,
        ...action.payload,
        isHydrated: true,
      };
    }

    case 'RESET': {
      return {
        ...initialState,
        isHydrated: state.isHydrated, // Preserve hydration state
      };
    }

    default: {
      // Type guard for exhaustive checking
      const _exhaustiveCheck: never = action;
      return state;
    }
  }
}

// ============================================================================
// PERSISTENCE HELPERS
// ============================================================================

interface PersistedState {
  currentStep: 1 | 2 | 3 | 4;
  selectedModelId: string | null;
  finishId: string | null;
  terrainId: string | null;
  timelineMonth: number;
  currency: Currency;
  timestamp: number;
}

function saveToStorage(state: JourneyState): void {
  try {
    const persisted: PersistedState = {
      currentStep: state.currentStep,
      selectedModelId: state.selectedModel?.id || null,
      finishId: state.customization.finish?.id || null,
      terrainId: state.customization.terrain?.id || null,
      timelineMonth: state.timeline.month,
      currency: state.currency,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch (error) {
    logger.warn('Failed to save journey state to localStorage:', error);
  }
}

function loadFromStorage(): PersistedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as PersistedState;
    
    // Check if data is stale (older than 24 hours)
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - parsed.timestamp > MAX_AGE) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    logger.warn('Failed to load journey state from localStorage:', error);
    return null;
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.warn('Failed to clear journey state from localStorage:', error);
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const JourneyContext = createContext<JourneyContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface JourneyProviderProps {
  children: ReactNode;
  initialCurrency?: Currency;
}

export function JourneyProvider({ children, initialCurrency = 'usd' }: JourneyProviderProps) {
  const [state, dispatch] = useReducer(journeyReducer, {
    ...initialState,
    currency: initialCurrency,
  });
  
  // Get dynamic exchange rates
  const { data: exchangeRates } = useExchangeRates();

  // Wrapped actions (don't expose dispatch directly)
  const actions = useMemo(() => ({
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    setStep: (step: 1 | 2 | 3 | 4) => dispatch({ type: 'SET_STEP', payload: step }),
    selectModel: (model: Project) => dispatch({ type: 'SELECT_MODEL', payload: model }),
    selectFinish: (finish: ProjectFinish | null) => dispatch({ type: 'SELECT_FINISH', payload: finish }),
    selectTerrain: (terrain: ProjectTerrain | null) => dispatch({ type: 'SELECT_TERRAIN', payload: terrain }),
    setTimelineMonth: (month: number) => dispatch({ type: 'SET_TIMELINE_MONTH', payload: month }),
    setActiveStage: (stage: ProjectStage | null) => dispatch({ type: 'SET_ACTIVE_STAGE', payload: stage }),
    setCurrency: (currency: Currency) => dispatch({ type: 'SET_CURRENCY', payload: currency }),
    reset: () => {
      clearStorage();
      dispatch({ type: 'RESET' });
    },
  }), []);

  // Persist state to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (state.isHydrated && state.selectedModel) {
      saveToStorage(state);
    }
  }, [state]);

  // Expose hydration function for external use (e.g., after projects load)
  const hydrateFromStorage = useCallback((projects: Project[], finishes: ProjectFinish[], terrains: ProjectTerrain[]) => {
    if (state.isHydrated) return; // Already hydrated
    
    const persisted = loadFromStorage();
    if (!persisted || !persisted.selectedModelId) {
      dispatch({ type: 'HYDRATE', payload: {} }); // Mark as hydrated even if no data
      return;
    }

    // Find the model by ID
    const model = projects.find(p => p.id === persisted.selectedModelId);
    if (!model) {
      dispatch({ type: 'HYDRATE', payload: {} });
      return;
    }

    // Find finish and terrain by ID
    const finish = finishes.find(f => f.id === persisted.finishId) || null;
    const terrain = terrains.find(t => t.id === persisted.terrainId) || null;

    dispatch({
      type: 'HYDRATE',
      payload: {
        currentStep: persisted.currentStep,
        selectedModel: model,
        customization: { finish, terrain },
        timeline: { month: persisted.timelineMonth, activeStage: null },
        currency: persisted.currency,
      },
    });
  }, [state.isHydrated]);

  // Calculate if user can advance to next step
  const canAdvance = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return state.selectedModel !== null;
      case 2:
        // Customization is optional, can always advance
        return true;
      case 3:
        // Timeline is optional, can always advance
        return true;
      case 4:
        // Last step, cannot advance further
        return false;
      default:
        return false;
    }
  }, [state.currentStep, state.selectedModel]);

  // Calculate if user can go back
  const canGoBack = useMemo(() => {
    return state.currentStep > MIN_STEP;
  }, [state.currentStep]);

  // Calculate price breakdown using dynamic exchange rates
  const priceBreakdown = useMemo((): PriceBreakdown => {
    if (!state.selectedModel?.price_range) {
      return { base: 0, finishModifier: 0, terrainModifier: 0 };
    }

    // Get base price in selected currency using dynamic rates
    const base = getPriceInCurrency(
      state.selectedModel.price_range as string | null,
      state.currency, 
      exchangeRates || null
    );

    // Calculate modifiers (stored in USD, convert to selected currency) using dynamic rates
    const finishModifier = convertModifier(
      state.customization.finish?.price_modifier || 0, 
      state.currency, 
      exchangeRates || null
    );
    const terrainModifier = convertModifier(
      state.customization.terrain?.price_modifier || 0, 
      state.currency, 
      exchangeRates || null
    );

    return {
      base: isNaN(base) ? 0 : base,
      finishModifier: isNaN(finishModifier) ? 0 : finishModifier,
      terrainModifier: isNaN(terrainModifier) ? 0 : terrainModifier,
    };
  }, [state.selectedModel, state.customization, state.currency, exchangeRates]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return priceBreakdown.base + priceBreakdown.finishModifier + priceBreakdown.terrainModifier;
  }, [priceBreakdown]);

  // Format total price for display
  const formattedTotalPrice = useMemo(() => {
    if (totalPrice === 0) return 'Consultar';
    
    const formatted = formatPriceValue(totalPrice, state.currency);
    
    if (state.currency === 'uf') {
      return `${formatted} UF`;
    }
    
    return `${CURRENCY_SYMBOLS[state.currency]}${formatted} ${CURRENCY_LABELS[state.currency]}`;
  }, [totalPrice, state.currency]);

  // Check if journey is complete (all required selections made)
  const isComplete = useMemo(() => {
    return state.selectedModel !== null && state.currentStep === MAX_STEP;
  }, [state.selectedModel, state.currentStep]);

  // Calculate step progress percentage
  const stepProgress = useMemo(() => {
    return ((state.currentStep - 1) / (MAX_STEP - 1)) * 100;
  }, [state.currentStep]);

  // Build summary data for HubSpot integration
  const summaryData = useMemo((): JourneySummaryData => ({
    modelId: state.selectedModel?.id || null,
    modelName: state.selectedModel?.name || null,
    modelSlug: state.selectedModel?.slug || null,
    finishId: state.customization.finish?.id || null,
    finishName: state.customization.finish?.name || null,
    terrainId: state.customization.terrain?.id || null,
    terrainName: state.customization.terrain?.name || null,
    currency: state.currency,
    basePrice: priceBreakdown.base,
    finishModifier: priceBreakdown.finishModifier,
    terrainModifier: priceBreakdown.terrainModifier,
    totalPrice,
    formattedTotalPrice,
    timestamp: new Date().toISOString(),
  }), [state, priceBreakdown, totalPrice, formattedTotalPrice]);

  // Bundle all helpers
  const helpers = useMemo(() => ({
    canAdvance,
    canGoBack,
    totalPrice,
    formattedTotalPrice,
    priceBreakdown,
    isComplete,
    summaryData,
    stepProgress,
    hydrateFromStorage,
  }), [canAdvance, canGoBack, totalPrice, formattedTotalPrice, priceBreakdown, isComplete, summaryData, stepProgress, hydrateFromStorage]);

  // Context value
  const contextValue = useMemo((): JourneyContextValue => ({
    state,
    actions,
    helpers,
  }), [state, actions, helpers]);

  return (
    <JourneyContext.Provider value={contextValue}>
      {children}
    </JourneyContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useJourney(): JourneyContextValue {
  const context = useContext(JourneyContext);
  
  if (!context) {
    throw new Error(
      'useJourney must be used within a JourneyProvider. ' +
      'Wrap your component tree with <JourneyProvider> to fix this error.'
    );
  }
  
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { JourneyContext };
export type { JourneyProviderProps };
