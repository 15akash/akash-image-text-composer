import { SavedProject } from '@/types/textLayers';

const STORAGE_KEY = 'image-text-composer-autosave';

export const saveToLocalStorage = (project: SavedProject) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): SavedProject | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved) as SavedProject;
    
    // Check if data is not too old (30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

export const hasAutoSavedData = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};