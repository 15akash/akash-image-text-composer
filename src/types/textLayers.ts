import * as fabric from 'fabric';
import React from 'react';

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

export interface State {
  textLayers: TextLayer[];
  selectedLayer: string | null;
  history: TextLayer[][];
  historyIndex: number;
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
  needsFabricRecreation: boolean;
}

export interface SavedProject {
  textLayers: Omit<TextLayer, 'fabricObject'>[];
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
  timestamp: number;
}

export type Action = 
  | { type: 'ADD_TEXT_LAYER'; layer: TextLayer }
  | { type: 'UPDATE_TEXT_LAYER'; layerId: string; updates: Partial<TextLayer> }
  | { type: 'UPDATE_TEXT_LAYER_IMMEDIATE'; layerId: string; updates: Partial<TextLayer> }
  | { type: 'DELETE_TEXT_LAYER'; layerId: string }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'CLEAR_LAYERS' }
  | { type: 'SET_IMAGE'; imageUrl: string | null; dimensions: {width: number, height: number} | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_TO_HISTORY' }
  | { type: 'RESTORE_PROJECT'; project: SavedProject }
  | { type: 'RESET_PROJECT' }
  | { type: 'UPDATE_FABRIC_OBJECTS'; layers: TextLayer[] }
  | { type: 'FORCE_FABRIC_RECREATION' };

export interface TextLayersContextType {
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