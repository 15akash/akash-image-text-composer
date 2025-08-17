import { useState, useCallback } from 'react';
import * as fabric from 'fabric';

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

interface UseTextLayersReturn {
  textLayers: TextLayer[];
  selectedLayer: string | null;
  setSelectedLayer: (layerId: string | null) => void;
  addTextLayer: (fabricCanvas: fabric.Canvas | null) => void;
  updateTextLayer: (layerId: string, updates: Partial<TextLayer>, fabricCanvas: fabric.Canvas | null) => void;
  deleteTextLayer: (layerId: string, fabricCanvas: fabric.Canvas | null) => void;
  moveLayerUp: (layerId: string, fabricCanvas: fabric.Canvas | null) => void;
  moveLayerDown: (layerId: string, fabricCanvas: fabric.Canvas | null) => void;
  clearTextLayers: () => void;
}

export const useTextLayers = (): UseTextLayersReturn => {
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

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
    newLayer.fabricObject = fabricText;

    fabricCanvas.add(fabricText);
    fabricCanvas.setActiveObject(fabricText);
    fabricCanvas.renderAll();

    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayerId);
  }, []);

  const updateTextLayer = useCallback((layerId: string, updates: Partial<TextLayer>, fabricCanvas: fabric.Canvas | null) => {
    setTextLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const updatedLayer = { ...layer, ...updates };
        
        if (layer.fabricObject) {
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
          fabricCanvas?.renderAll();
        }
        
        return updatedLayer;
      }
      return layer;
    }));
  }, []);

  const deleteTextLayer = useCallback((layerId: string, fabricCanvas: fabric.Canvas | null) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvas) {
      fabricCanvas.remove(layer.fabricObject);
      fabricCanvas.renderAll();
    }
    
    setTextLayers(prev => prev.filter(l => l.id !== layerId));
    setSelectedLayer(null);
  }, [textLayers]);

  const moveLayerUp = useCallback((layerId: string, fabricCanvas: fabric.Canvas | null) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvas) {
      fabricCanvas.bringObjectForward(layer.fabricObject);
      fabricCanvas.renderAll();
    }
  }, [textLayers]);

  const moveLayerDown = useCallback((layerId: string, fabricCanvas: fabric.Canvas | null) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvas) {
      fabricCanvas.sendObjectBackwards(layer.fabricObject);
      fabricCanvas.renderAll();
    }
  }, [textLayers]);

  const clearTextLayers = useCallback(() => {
    setTextLayers([]);
    setSelectedLayer(null);
  }, []);

  return {
    textLayers,
    selectedLayer,
    setSelectedLayer,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    moveLayerUp,
    moveLayerDown,
    clearTextLayers
  };
};