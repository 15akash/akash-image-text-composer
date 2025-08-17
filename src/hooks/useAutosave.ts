import { useEffect, useCallback } from 'react';
import type { TextLayer } from './useTextLayers';

interface ProjectState {
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
  textLayers: Omit<TextLayer, 'fabricObject'>[];
  timestamp: number;
}

interface UseAutosaveReturn {
  saveToLocalStorage: (state: Omit<ProjectState, 'timestamp'>) => void;
  loadFromLocalStorage: () => ProjectState | null;
  clearLocalStorage: () => void;
  hasAutoSavedData: () => boolean;
}

const STORAGE_KEY = 'image-text-composer-autosave';
const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useAutosave(): UseAutosaveReturn {
  const saveToLocalStorage = useCallback((state: Omit<ProjectState, 'timestamp'>) => {
    try {
      const projectState: ProjectState = {
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectState));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): ProjectState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved) as ProjectState;
      
      // Check if data is not too old (optional - e.g., 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, []);

  const hasAutoSavedData = useCallback((): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      console.log('Failed to check localStorage:', error);
      return false;
    }
  }, []);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    hasAutoSavedData
  };
}

// Hook for debounced autosave
export function useDebounceAutosave<T>(
  value: T,
  callback: (value: T) => void,
  delay: number = AUTOSAVE_DELAY
) {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, callback, delay]);
}