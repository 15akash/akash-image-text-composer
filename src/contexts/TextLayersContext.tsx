'use client';

import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { useDebounce } from '@/hooks/useDebounce';
import type { TextLayer, TextLayersContextType, SavedProject } from '@/types/textLayers';
import { textLayersReducer, initialState } from '@/reducers/textLayersReducer';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, hasAutoSavedData } from '@/utils/storage';

const AUTOSAVE_DELAY = 2000; // 2 seconds

const TextLayersContext = createContext<TextLayersContextType | undefined>(undefined);

export const useTextLayers = () => {
  const context = useContext(TextLayersContext);
  if (!context) {
    throw new Error('useTextLayers must be used within a TextLayersProvider');
  }
  return context;
};

export const TextLayersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(textLayersReducer, initialState);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [, setHasAutoSaved] = useState(false);
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

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
    
    // Use immediate update for real-time changes
    dispatch({ type: 'UPDATE_TEXT_LAYER_IMMEDIATE', layerId, updates });
    
    // Track that this layer has pending updates for history
    pendingUpdatesRef.current.add(layerId);
  }, [state.textLayers]);

  // Debounced function to save history after user stops typing
  useDebounce(
    () => {
      if (pendingUpdatesRef.current.size > 0) {
        dispatch({ type: 'SAVE_TO_HISTORY' });
        pendingUpdatesRef.current.clear();
      }
    },
    300, // 300ms delay
    [state.textLayers] // Dependencies
  );

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