'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as fabric from 'fabric';
import { SketchPicker } from 'react-color';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/utils/common';
import type { TextLayer } from '@/model/model';

const ImageTextComposer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        
        const img = new Image();
        img.onload = () => {
          setOriginalImageDimensions({ width: img.width, height: img.height });
          
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
          }
          
          setTimeout(() => {
            initializeFabricCanvas(result, img.width, img.height);
          }, 100);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const initializeFabricCanvas = (imageUrl: string, imgWidth: number, imgHeight: number) => {
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
  };

  const addTextLayer = () => {
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

    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayerId);
  };

  const updateTextLayer = (layerId: string, updates: Partial<TextLayer>) => {
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
          fabricCanvasRef.current?.renderAll();
        }
        
        return updatedLayer;
      }
      return layer;
    }));
  };

  const deleteTextLayer = (layerId: string) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }
    
    setTextLayers(prev => prev.filter(l => l.id !== layerId));
    setSelectedLayer(null);
  };

  const moveLayerUp = (layerId: string) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.bringObjectForward(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const moveLayerDown = (layerId: string) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.sendObjectBackwards(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const exportImage = () => {
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
  };

  const selectedLayerData = textLayers.find(layer => layer.id === selectedLayer);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
          <h1 className="text-2xl font-bold mb-4">Image Text Composer</h1>
          
          {!uploadedImage ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <div className="text-gray-500 text-lg">
                  {isDragActive ? 'Drop the image here...' : 'Drag & drop an image here, or click to select'}
                </div>
                <div className="text-sm text-gray-400">
                  Supports PNG, JPG, JPEG, GIF, BMP, WebP
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <canvas ref={canvasRef} className="border border-gray-300 rounded" />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={addTextLayer}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Text
                </button>
                <button
                  onClick={exportImage}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Export PNG
                </button>
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setOriginalImageDimensions(null);
                    setTextLayers([]);
                    setSelectedLayer(null);
                    if (fabricCanvasRef.current) {
                      fabricCanvasRef.current.dispose();
                      fabricCanvasRef.current = null;
                    }
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  New Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadedImage && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Layers</h2>
          
          <div className="space-y-2 mb-6">
            {textLayers.map((layer, index) => (
              <div
                key={layer.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedLayer === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedLayer(layer.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Text {index + 1}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerUp(layer.id);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerDown(layer.id);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextLayer(layer.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 truncate">{layer.text}</div>
              </div>
            ))}
          </div>

          {selectedLayerData && (
            <div className="space-y-4">
              <h3 className="font-semibold">Text Properties</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Text</label>
                <textarea
                  value={selectedLayerData.text}
                  onChange={(e) => updateTextLayer(selectedLayer!, { text: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <select
                  value={selectedLayerData.fontFamily}
                  onChange={(e) => updateTextLayer(selectedLayer!, { fontFamily: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="number"
                    value={selectedLayerData.fontSize}
                    onChange={(e) => updateTextLayer(selectedLayer!, { fontSize: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="8"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight</label>
                  <select
                    value={selectedLayerData.fontWeight}
                    onChange={(e) => updateTextLayer(selectedLayer!, { fontWeight: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {FONT_WEIGHTS.map(weight => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full p-2 border border-gray-300 rounded flex items-center justify-between"
                  >
                    <span>{selectedLayerData.color}</span>
                    <div
                      className="w-6 h-6 border border-gray-300 rounded"
                      style={{ backgroundColor: selectedLayerData.color }}
                    />
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 z-10 mt-1">
                      <SketchPicker
                        color={selectedLayerData.color}
                        onChange={(color) => updateTextLayer(selectedLayer!, { color: color.hex })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedLayerData.opacity}
                  onChange={(e) => updateTextLayer(selectedLayer!, { opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{Math.round(selectedLayerData.opacity * 100)}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alignment</label>
                <select
                  value={selectedLayerData.textAlign}
                  onChange={(e) => updateTextLayer(selectedLayer!, { textAlign: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageTextComposer;