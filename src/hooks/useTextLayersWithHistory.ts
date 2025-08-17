import { useState, useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { useHistory } from './useHistory';
import { useAutosave, useDebounceAutosave } from './useAutosave';

export type TextLayer = {
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

interface ProjectState {
  textLayers: TextLayer[];
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
}

interface UseTextLayersWithHistoryReturn {
  textLayers: TextLayer[];
  selectedLayer: string | null;
  setSelectedLayer: (layerId: string | null) => void;
  addTextLayer: (fabricCanvas: fabric.Canvas | null) => void;
  updateTextLayer: (layerId: string, updates: Partial<TextLayer>, fabricCanvas: fabric.Canvas | null) => void;
  deleteTextLayer: (layerId: string, fabricCanvas: fabric.Canvas | null) => void;
  moveLayerUp: (layerId: string, fabricCanvas: fabric.Canvas | null) => void;
  moveLayerDown: (layerId: string, fabricCanvas: fabric.Canvas | null) => void;
  clearTextLayers: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  currentIndex: number;
  loadProject: (projectState: ProjectState) => void;
  resetProject: () => void;
}

const initialState: ProjectState = {
  textLayers: [],
  uploadedImage: null,
  originalImageDimensions: null
};

export const useTextLayersWithHistory = (
  uploadedImage: string | null,
  originalImageDimensions: {width: number, height: number} | null
): UseTextLayersWithHistoryReturn => {
  const { saveToLocalStorage, clearLocalStorage } = useAutosave();
  
  const {
    state: projectState,
    setState: setProjectState,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo,
    clear: clearHistory,
    historyLength,
    currentIndex
  } = useHistory<ProjectState>({
    ...initialState,
    uploadedImage,
    originalImageDimensions
  });

  // Debounced autosave
  useDebounceAutosave(
    {
      uploadedImage: projectState.uploadedImage,
      originalImageDimensions: projectState.originalImageDimensions,
      textLayers: projectState.textLayers.map(layer => ({
        ...layer,
        fabricObject: undefined // Don't save fabric objects
      }))
    },
    saveToLocalStorage
  );


  const addTextLayer = useCallback((fabricCanvas: fabric.Canvas | null) => {
    if (!fabricCanvas) return;

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
    
    // Store fabric object separately
    fabricObjectsRef.current.set(newLayerId, fabricText);

    fabricCanvas.add(fabricText);
    fabricCanvas.setActiveObject(fabricText);
    fabricCanvas.renderAll();

    // Don't store fabricObject in history state
    const layerForHistory = { ...newLayer };
    delete layerForHistory.fabricObject;

    setProjectState({
      ...projectState,
      uploadedImage,
      originalImageDimensions,
      textLayers: [...projectState.textLayers, layerForHistory]
    });
  }, [setProjectState, projectState, uploadedImage, originalImageDimensions]);

  const updateTextLayer = useCallback((layerId: string, updates: Partial<TextLayer>, fabricCanvas: fabric.Canvas | null) => {
    const updatedLayers = projectState.textLayers.map(layer => {
      if (layer.id === layerId) {
        const updatedLayer = { ...layer, ...updates };
        
        // Get fabric object from separate storage
        const fabricObject = fabricObjectsRef.current.get(layerId);
        if (fabricObject) {
          fabricObject.set({
            text: updatedLayer.text,
            fontFamily: updatedLayer.fontFamily,
            fontSize: updatedLayer.fontSize,
            fontWeight: updatedLayer.fontWeight,
            fill: updatedLayer.color,
            opacity: updatedLayer.opacity,
            textAlign: updatedLayer.textAlign,
            angle: updatedLayer.rotation
          });
          fabricCanvas?.renderAll();
        }
        
        return updatedLayer;
      }
      return layer;
    });

    setProjectState({
      ...projectState,
      uploadedImage,
      originalImageDimensions,
      textLayers: updatedLayers
    });
  }, [setProjectState, projectState, uploadedImage, originalImageDimensions]);

  const deleteTextLayer = useCallback((layerId: string, fabricCanvas: fabric.Canvas | null) => {
    // Get fabric object from separate storage
    const fabricObject = fabricObjectsRef.current.get(layerId);
    if (fabricObject && fabricCanvas) {
      fabricCanvas.remove(fabricObject);
      fabricCanvas.renderAll();
      // Remove from fabric objects storage
      fabricObjectsRef.current.delete(layerId);
    }
    
    setProjectState({
      ...projectState,
      uploadedImage,
      originalImageDimensions,
      textLayers: projectState.textLayers.filter(l => l.id !== layerId)
    });
  }, [setProjectState, projectState, uploadedImage, originalImageDimensions]);

  const moveLayerUp = useCallback((layerId: string, fabricCanvas: fabric.Canvas | null) => {
    const fabricObject = fabricObjectsRef.current.get(layerId);
    if (fabricObject && fabricCanvas) {
      fabricCanvas.bringObjectForward(fabricObject);
      fabricCanvas.renderAll();
    }
  }, []);

  const moveLayerDown = useCallback((layerId: string, fabricCanvas: fabric.Canvas | null) => {
    const fabricObject = fabricObjectsRef.current.get(layerId);
    if (fabricObject && fabricCanvas) {
      fabricCanvas.sendObjectBackwards(fabricObject);
      fabricCanvas.renderAll();
    }
  }, []);

  const clearTextLayers = useCallback(() => {
    // Clear fabric objects storage
    fabricObjectsRef.current.clear();
    
    setProjectState({
      ...projectState,
      uploadedImage,
      originalImageDimensions,
      textLayers: []
    });
  }, [setProjectState, projectState, uploadedImage, originalImageDimensions]);

  const loadProject = useCallback((newProjectState: ProjectState) => {
    setProjectState(newProjectState);
  }, [setProjectState]);

  const resetProject = useCallback(() => {
    clearLocalStorage();
    clearHistory();
    setProjectState(initialState);
  }, [clearLocalStorage, clearHistory, setProjectState]);

  // Track selected layer separately (not in history)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  
  // Track fabric objects separately (not in history)
  const fabricObjectsRef = useRef<Map<string, fabric.Text>>(new Map());

  // Attach fabric objects to text layers for return
  const textLayersWithFabric = projectState.textLayers.map(layer => ({
    ...layer,
    fabricObject: fabricObjectsRef.current.get(layer.id)
  }));

  return {
    textLayers: textLayersWithFabric,
    selectedLayer,
    setSelectedLayer,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    moveLayerUp,
    moveLayerDown,
    clearTextLayers,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo,
    historyLength,
    currentIndex,
    loadProject,
    resetProject
  };
};