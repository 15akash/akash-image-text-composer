'use client';

import { useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import type { TextLayer } from '@/types/textLayers';

export const useCanvas = (externalFabricCanvasRef?: React.MutableRefObject<fabric.Canvas | null>) => {
  const internalFabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const fabricCanvasRef = externalFabricCanvasRef || internalFabricCanvasRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initializeCanvas = useCallback((
    imageUrl: string, 
    imgWidth: number, 
    imgHeight: number,
    onSelectionCreated: (layerId: string) => void,
    onSelectionCleared: () => void,
    onObjectMove: (layerId: string, x: number, y: number) => void,
    onObjectModified: (layerId: string, x: number, y: number, rotation: number) => void
  ) => {
    if (!canvasRef.current) return;

    const maxWidth = 800;
    const maxHeight = 600;
    
    let canvasWidth = imgWidth;
    let canvasHeight = imgHeight;
    
    if (imgWidth > maxWidth || imgHeight > maxHeight) {
      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      canvasWidth = imgWidth * scale;
      canvasHeight = imgHeight * scale;
    }

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'white'
    });

    fabric.Image.fromURL(imageUrl).then((img) => {
      img.scaleToWidth(canvasWidth);
      img.scaleToHeight(canvasHeight);
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });
      canvas.add(img);
      canvas.sendObjectToBack(img);
      canvas.renderAll();
    });

    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && activeObject.type === 'text') {
        const fabricObject = activeObject as fabric.Text & { layerId?: string };
        const layerId = fabricObject.layerId;
        if (layerId) {
          onSelectionCreated(layerId);
        }
      }
    });

    canvas.on('selection:cleared', () => {
      onSelectionCleared();
    });

    canvas.on('object:moving', (e) => {
      const activeObject = e.target;
      if (activeObject && activeObject.type === 'text') {
        const fabricObject = activeObject as fabric.Text & { layerId?: string };
        const layerId = fabricObject.layerId;
        if (layerId) {
          onObjectMove(layerId, fabricObject.left || 0, fabricObject.top || 0);
        }
      }
    });

    canvas.on('object:modified', (e) => {
      const activeObject = e.target;
      if (activeObject && activeObject.type === 'text') {
        const fabricObject = activeObject as fabric.Text & { layerId?: string };
        const layerId = fabricObject.layerId;
        if (layerId) {
          onObjectModified(
            layerId, 
            fabricObject.left || 0, 
            fabricObject.top || 0,
            fabricObject.angle || 0
          );
        }
      }
    });

    fabricCanvasRef.current = canvas;
  }, []);

  const recreateFabricObjects = useCallback((canvas: fabric.Canvas, layers: TextLayer[]) => {
    // Clear existing text objects
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'text') {
        canvas.remove(obj);
      }
    });

    // Recreate text layers
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
    return updatedLayers;
  }, []);

  const exportCanvas = useCallback((originalDimensions: {width: number, height: number}) => {
    if (!fabricCanvasRef.current || !originalDimensions) return;

    const canvas = fabricCanvasRef.current;
    const currentWidth = canvas.getWidth();
    const currentHeight = canvas.getHeight();
    
    const multiplier = Math.max(
      originalDimensions.width / currentWidth,
      originalDimensions.height / currentHeight
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
  }, []);

  return {
    canvasRef,
    fabricCanvasRef,
    initializeCanvas,
    recreateFabricObjects,
    exportCanvas
  };
};