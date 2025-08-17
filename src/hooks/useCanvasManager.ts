import { useRef, useCallback } from 'react';
import * as fabric from 'fabric';

interface UseCanvasManagerReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  initializeFabricCanvas: (imageUrl: string, imgWidth: number, imgHeight: number) => void;
  exportImage: (originalImageDimensions: {width: number, height: number} | null) => void;
  disposeCanvas: () => void;
}

export const useCanvasManager = (
  setSelectedLayer: (layerId: string | null) => void
): UseCanvasManagerReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const initializeFabricCanvas = useCallback((imageUrl: string, imgWidth: number, imgHeight: number) => {
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
          setSelectedLayer(layerId);
        }
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedLayer(null);
    });

    fabricCanvasRef.current = canvas;
  }, [setSelectedLayer]);

  const exportImage = useCallback((originalImageDimensions: {width: number, height: number} | null) => {
    if (!fabricCanvasRef.current || !originalImageDimensions) return;

    const canvas = fabricCanvasRef.current;
    const currentWidth = canvas.getWidth();
    const currentHeight = canvas.getHeight();
    
    const multiplier = Math.max(
      originalImageDimensions.width / currentWidth,
      originalImageDimensions.height / currentHeight
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

  const disposeCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  }, []);

  return {
    canvasRef,
    fabricCanvasRef,
    initializeFabricCanvas,
    exportImage,
    disposeCanvas
  };
};