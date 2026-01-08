import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormWatch, UseFormGetValues } from 'react-hook-form';

export type AutosaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutosaveOptions<T> {
  watch: UseFormWatch<T>;
  getValues: UseFormGetValues<T>;
  onSave: (data: T) => Promise<void>;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useAutosave<T>({
  watch,
  getValues,
  onSave,
  interval = 30000, // Default 30 seconds
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const isSaving = useRef(false);

  // Track form changes
  useEffect(() => {
    if (!enabled) return;

    const subscription = watch(() => {
      // Skip first render to avoid marking as unsaved on load
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      
      if (status !== 'saving') {
        setStatus('unsaved');
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, enabled, status]);

  // Autosave timer
  useEffect(() => {
    if (!enabled || status !== 'unsaved') return;

    timeoutRef.current = setTimeout(() => {
      triggerSave();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, interval, enabled]);

  const triggerSave = useCallback(async () => {
    if (isSaving.current || status === 'saved') return;

    isSaving.current = true;
    setStatus('saving');

    try {
      const data = getValues();
      await onSave(data);
      setStatus('saved');
      setLastSaved(new Date());
    } catch (error: any) {
      // Handle "no rows returned" as success (no changes to save)
      if (error?.code === 'PGRST116' || error?.message?.includes('no encontrado')) {
        setStatus('saved');
      } else {
        console.error('Autosave error:', error);
        setStatus('error');
      }
    } finally {
      isSaving.current = false;
    }
  }, [getValues, onSave, status]);

  const reset = useCallback(() => {
    setStatus('saved');
    isFirstRender.current = true;
  }, []);

  return {
    status,
    lastSaved,
    triggerSave,
    reset,
  };
}
