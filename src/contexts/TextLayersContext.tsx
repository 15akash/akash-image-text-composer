'use client';

import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect, useState } from 'react';
import * as fabric from 'fabric';

export interface TextLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  opacity: number;
  textAlign: string;
  x: number;
  y: number;
  rotation: number;
  fabricObject?: fabric.Text;
}

interface State {
  textLayers: TextLayer[];
  selectedLayer: string | null;
  history: TextLayer[][];
  historyIndex: number;
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
}

interface SavedProject {
  textLayers: Omit<TextLayer, 'fabricObject'>[];
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
  timestamp: number;
}

const STORAGE_KEY = 'image-text-composer-autosave';
const AUTOSAVE_DELAY = 2000; // 2 seconds

type Action = 
  | { type: 'ADD_TEXT_LAYER'; layer: TextLayer }
  | { type: 'UPDATE_TEXT_LAYER'; layerId: string; updates: Partial<TextLayer> }
  | { type: 'DELETE_TEXT_LAYER'; layerId: string }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'CLEAR_LAYERS' }
  | { type: 'SET_IMAGE'; imageUrl: string | null; dimensions: {width: number, height: number} | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_TO_HISTORY' }
  | { type: 'RESTORE_PROJECT'; project: SavedProject }
  | { type: 'RESET_PROJECT' }
  | { type: 'UPDATE_FABRIC_OBJECTS'; layers: TextLayer[] };

const initialState: State = {
  textLayers: [],
  selectedLayer: null,
  history: [[]],
  historyIndex: 0,
  uploadedImage: null,
  originalImageDimensions: null
};

function textLayersReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TEXT_LAYER':
      const newLayers = [...state.textLayers, action.layer];
      return {
        ...state,
        textLayers: newLayers,
        selectedLayer: action.layer.id,
        history: [...state.history.slice(0, state.historyIndex + 1), newLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'UPDATE_TEXT_LAYER':
      const updatedLayers = state.textLayers.map(layer => 
        layer.id === action.layerId ? { ...layer, ...action.updates } : layer
      );
      return {
        ...state,
        textLayers: updatedLayers,
        history: [...state.history.slice(0, state.historyIndex + 1), updatedLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'DELETE_TEXT_LAYER':
      const filteredLayers = state.textLayers.filter(layer => layer.id !== action.layerId);
      return {
        ...state,
        textLayers: filteredLayers,
        selectedLayer: state.selectedLayer === action.layerId ? null : state.selectedLayer,
        history: [...state.history.slice(0, state.historyIndex + 1), filteredLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'SELECT_LAYER':
      return {
        ...state,
        selectedLayer: action.layerId
      };

    case 'CLEAR_LAYERS':
      return {
        ...state,
        textLayers: [],
        selectedLayer: null,
        history: [...state.history.slice(0, state.historyIndex + 1), []],
        historyIndex: state.historyIndex + 1
      };

    case 'SET_IMAGE':
      return {
        ...state,
        uploadedImage: action.imageUrl,
        originalImageDimensions: action.dimensions
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          textLayers: state.history[newIndex],
          historyIndex: newIndex,
          selectedLayer: null
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          textLayers: state.history[newIndex],
          historyIndex: newIndex,
          selectedLayer: null
        };
      }
      return state;

    case 'RESTORE_PROJECT':
      return {
        ...state,
        textLayers: action.project.textLayers as TextLayer[],
        uploadedImage: action.project.uploadedImage,
        originalImageDimensions: action.project.originalImageDimensions,
        selectedLayer: null,
        history: [action.project.textLayers as TextLayer[]],
        historyIndex: 0
      };

    case 'RESET_PROJECT':
      return {
        ...initialState,
        history: [[]],
        historyIndex: 0
      };

    case 'UPDATE_FABRIC_OBJECTS':
      return {
        ...state,
        textLayers: action.layers
      };

    default:
      return state;
  }
}

interface TextLayersContextType {
  state: State;
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  addTextLayer: () => void;
  updateTextLayer: (layerId: string, updates: Partial<TextLayer>) => void;
  deleteTextLayer: (layerId: string) => void;
  selectLayer: (layerId: string | null) => void;
  moveLayerUp: (layerId: string) => void;
  moveLayerDown: (layerId: string) => void;
  clearLayers: () => void;
  setImage: (imageUrl: string | null, dimensions: {width: number, height: number} | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportImage: () => void;
  resetProject: () => void;
  hasAutoSavedData: boolean;
  recreateFabricObjects: (canvas: fabric.Canvas, layers: TextLayer[]) => void;
}

const TextLayersContext = createContext<TextLayersContextType | undefined>(undefined);

export const useTextLayers = () => {
  const context = useContext(TextLayersContext);
  if (!context) {
    throw new Error('useTextLayers must be used within a TextLayersProvider');
  }
  return context;
};

// Helper functions for localStorage
const saveToLocalStorage = (project: SavedProject) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (): SavedProject | null => {
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

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

const hasAutoSavedData = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

export const TextLayersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(textLayersReducer, initialState);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [, setHasAutoSaved] = useState(false);

  const addTextLayer = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const newLayerId = `layer-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newLayerId,
      text: 'Sample Text',
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'normal',
      color: '#000000',
      opacity: 1,
      textAlign: 'left',
      x: 50,
      y: 50,
      rotation: 0
    };

    const fabricText = new fabric.Text(newLayer.text, {
      left: newLayer.x,
      top: newLayer.y,
      fontFamily: newLayer.fontFamily,
      fontSize: newLayer.fontSize,
      fontWeight: newLayer.fontWeight,
      fill: newLayer.color,
      opacity: newLayer.opacity,
      textAlign: newLayer.textAlign,
      angle: newLayer.rotation
    });

    (fabricText as fabric.Text & { layerId: string }).layerId = newLayerId;
    newLayer.fabricObject = fabricText;

    fabricCanvasRef.current.add(fabricText);
    fabricCanvasRef.current.setActiveObject(fabricText);
    fabricCanvasRef.current.renderAll();

    dispatch({ type: 'ADD_TEXT_LAYER', layer: newLayer });
  }, []);

  const updateTextLayer = useCallback((layerId: string, updates: Partial<TextLayer>) => {
    const layer = state.textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject) {
      const updatedLayer = { ...layer, ...updates };
      layer.fabricObject.set({
        text: updatedLayer.text,
        fontFamily: updatedLayer.fontFamily,
        fontSize: updatedLayer.fontSize,
        fontWeight: updatedLayer.fontWeight,
        fill: updatedLayer.color,
        opacity: updatedLayer.opacity,
        textAlign: updatedLayer.textAlign,
        angle: updatedLayer.rotation
      });
      fabricCanvasRef.current?.renderAll();
    }
    dispatch({ type: 'UPDATE_TEXT_LAYER', layerId, updates });
  }, [state.textLayers]);

  const deleteTextLayer = useCallback((layerId: string) => {
    const layer = state.textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }
    dispatch({ type: 'DELETE_TEXT_LAYER', layerId });
  }, [state.textLayers]);

  const selectLayer = useCallback((layerId: string | null) => {
    dispatch({ type: 'SELECT_LAYER', layerId });
  }, []);

  const moveLayerUp = useCallback((layerId: string) => {
    const layer = state.textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.bringObjectForward(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }
  }, [state.textLayers]);

  const moveLayerDown = useCallback((layerId: string) => {
    const layer = state.textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.sendObjectBackwards(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }
  }, [state.textLayers]);

  const clearLayers = useCallback(() => {
    dispatch({ type: 'CLEAR_LAYERS' });
  }, []);

  const setImage = useCallback((imageUrl: string | null, dimensions: {width: number, height: number} | null) => {
    dispatch({ type: 'SET_IMAGE', imageUrl, dimensions });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const exportImage = useCallback(() => {
    if (!fabricCanvasRef.current || !state.originalImageDimensions) return;

    const canvas = fabricCanvasRef.current;
    const currentWidth = canvas.getWidth();
    const currentHeight = canvas.getHeight();
    
    const multiplier = Math.max(
      state.originalImageDimensions.width / currentWidth,
      state.originalImageDimensions.height / currentHeight
    );

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier
    });

    const link = document.createElement('a');
    link.download = 'image-with-text.png';
    link.href = dataURL;
    link.click();
  }, [state.originalImageDimensions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const resetProject = useCallback(() => {
    clearLocalStorage();
    dispatch({ type: 'RESET_PROJECT' });
    setHasAutoSaved(false);
  }, []);

  // Auto-restore on mount
  useEffect(() => {
    const savedProject = loadFromLocalStorage();
    if (savedProject) {
      dispatch({ type: 'RESTORE_PROJECT', project: savedProject });
      setHasAutoSaved(true);
    }
  }, []);

  // Debounced autosave effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.textLayers.length > 0 || state.uploadedImage) {
        const projectToSave: SavedProject = {
          textLayers: state.textLayers.map(layer => ({
            id: layer.id,
            text: layer.text,
            fontFamily: layer.fontFamily,
            fontSize: layer.fontSize,
            fontWeight: layer.fontWeight,
            color: layer.color,
            opacity: layer.opacity,
            textAlign: layer.textAlign,
            x: layer.x,
            y: layer.y,
            rotation: layer.rotation
          })),
          uploadedImage: state.uploadedImage,
          originalImageDimensions: state.originalImageDimensions,
          timestamp: Date.now()
        };
        saveToLocalStorage(projectToSave);
        setHasAutoSaved(true);
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [state.textLayers, state.uploadedImage, state.originalImageDimensions]);

  // Function to recreate fabric objects after restore
  const recreateFabricObjects = useCallback((canvas: fabric.Canvas, layers: TextLayer[]) => {
    // Clear existing text objects
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'text') {
        canvas.remove(obj);
      }
    });

    // Recreate text layers and update state
    const updatedLayers = layers.map(layer => {
      const fabricText = new fabric.Text(layer.text, {
        left: layer.x,
        top: layer.y,
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        fill: layer.color,
        opacity: layer.opacity,
        textAlign: layer.textAlign,
        angle: layer.rotation
      });

      (fabricText as fabric.Text & { layerId: string }).layerId = layer.id;
      canvas.add(fabricText);
      
      return { ...layer, fabricObject: fabricText };
    });

    canvas.renderAll();
    
    // Update the state with fabric objects
    dispatch({ 
      type: 'UPDATE_FABRIC_OBJECTS', 
      layers: updatedLayers 
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const value: TextLayersContextType = {
    state,
    fabricCanvasRef,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    selectLayer,
    moveLayerUp,
    moveLayerDown,
    clearLayers,
    setImage,
    undo,
    redo,
    canUndo,
    canRedo,
    exportImage,
    resetProject,
    hasAutoSavedData: hasAutoSavedData(),
    recreateFabricObjects
  };

  return (
    <TextLayersContext.Provider value={value}>
      {children}
    </TextLayersContext.Provider>
  );
};