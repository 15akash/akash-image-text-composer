'use client';

import React, { useCallback } from 'react';
import * as fabric from 'fabric';
import { useDropzone } from 'react-dropzone';
import { SketchPicker } from 'react-color';
import { useTextLayers, TextLayersProvider } from '@/contexts/TextLayersContext';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/utils/common';
import { Label, Input, Select, Button, Textarea, Slider } from '@/foundations';

const ImageTextComposerContent: React.FC = () => {
  const {
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
    recreateFabricObjects
  } = useTextLayers();

  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

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
          selectLayer(layerId);
        }
      }
    });

    canvas.on('selection:cleared', () => {
      selectLayer(null);
    });

    canvas.on('object:moving', (e) => {
      const activeObject = e.target;
      if (activeObject && activeObject.type === 'text') {
        const fabricObject = activeObject as fabric.Text & { layerId?: string };
        const layerId = fabricObject.layerId;
        if (layerId) {
          updateTextLayer(layerId, { 
            x: fabricObject.left || 0, 
            y: fabricObject.top || 0 
          });
        }
      }
    });

    canvas.on('object:modified', (e) => {
      const activeObject = e.target;
      if (activeObject && activeObject.type === 'text') {
        const fabricObject = activeObject as fabric.Text & { layerId?: string };
        const layerId = fabricObject.layerId;
        if (layerId) {
          updateTextLayer(layerId, { 
            x: fabricObject.left || 0, 
            y: fabricObject.top || 0,
            rotation: fabricObject.angle || 0
          });
        }
      }
    });

    fabricCanvasRef.current = canvas;

    // If we have restored text layers, recreate them on the canvas
    if (state.textLayers.length > 0) {
      setTimeout(() => {
        recreateFabricObjects(canvas, state.textLayers);
      }, 100);
    }
  }, [fabricCanvasRef, selectLayer, recreateFabricObjects, state.textLayers]);

  // Effect to recreate fabric canvas and objects when state is restored
  React.useEffect(() => {
    if (state.uploadedImage && state.originalImageDimensions) {
      // Check if canvas needs to be initialized (after restore)
      if (!fabricCanvasRef.current || fabricCanvasRef.current.getObjects().length === 0) {
        // Initialize the canvas with the background image
        initializeFabricCanvas(state.uploadedImage, state.originalImageDimensions.width, state.originalImageDimensions.height);
      } else if (state.textLayers.length > 0) {
        // Only recreate text objects if fabric objects are missing (after restore)
        const needsRecreation = state.textLayers.some(layer => !layer.fabricObject);
        if (needsRecreation) {
          // Wait a bit to ensure canvas is fully ready
          const timer = setTimeout(() => {
            if (fabricCanvasRef.current) {
              recreateFabricObjects(fabricCanvasRef.current, state.textLayers);
            }
          }, 100);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [state.uploadedImage, state.originalImageDimensions, state.textLayers, fabricCanvasRef, recreateFabricObjects, initializeFabricCanvas]);



  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
          setImage(result, { width: img.width, height: img.height });
          setTimeout(() => {
            initializeFabricCanvas(result, img.width, img.height);
          }, 100);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  }, [setImage, initializeFabricCanvas]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const handleNewImage = useCallback(() => {
    setImage(null, null);
    clearLayers();
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  }, [setImage, clearLayers, fabricCanvasRef]);

  const selectedLayerData = state.textLayers.find(layer => layer.id === state.selectedLayer);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={undo}
              disabled={!canUndo}
              variant="outline"
              size="sm"
            >
              ↶ Undo
            </Button>
            <Button
              onClick={redo}
              disabled={!canRedo}
              variant="outline"
              size="sm"
            >
              ↷ Redo
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            History: {state.historyIndex + 1}/{state.history.length}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Canvas Area */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <h1 className="text-2xl font-bold mb-4">Image Text Composer</h1>
            
            {!state.uploadedImage ? (
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
                  <Button onClick={addTextLayer} variant="primary">
                    Add Text
                  </Button>
                  <Button onClick={exportImage} variant="success">
                    Export PNG
                  </Button>
                  <Button onClick={handleNewImage} variant="secondary">
                    New Image
                  </Button>
                  <Button onClick={resetProject} variant="outline">
                    Reset Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {state.uploadedImage && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Layers</h2>
            
            {/* Layers List */}
            <div className="space-y-2 mb-6">
              {state.textLayers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`p-3 border rounded cursor-pointer ${
                    state.selectedLayer === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => selectLayer(layer.id)}
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

            {/* Text Properties */}
            {selectedLayerData && (
              <div className="space-y-4">
                <h3 className="font-semibold">Text Properties</h3>
                
                <div>
                  <Label>Text</Label>
                  <Textarea
                    value={selectedLayerData.text}
                    onChange={(e) => updateTextLayer(selectedLayerData.id, { text: e.target.value })}
                    rows={3}
                    resize="none"
                  />
                </div>

                <div>
                  <Label>Font Family</Label>
                  <Select
                    value={selectedLayerData.fontFamily}
                    onChange={(e) => updateTextLayer(selectedLayerData.id, { fontFamily: e.target.value })}
                    options={FONT_FAMILIES}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Size</Label>
                    <Input
                      type="number"
                      value={selectedLayerData.fontSize}
                      onChange={(e) => updateTextLayer(selectedLayerData.id, { fontSize: parseInt(e.target.value) })}
                      min="8"
                      max="200"
                    />
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <Select
                      value={selectedLayerData.fontWeight}
                      onChange={(e) => updateTextLayer(selectedLayerData.id, { fontWeight: e.target.value })}
                      options={FONT_WEIGHTS}
                    />
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="relative">
                    <Button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      variant="outline"
                      className="justify-between"
                    >
                      <span>{selectedLayerData.color}</span>
                      <div
                        className="w-6 h-6 border border-gray-300 rounded"
                        style={{ backgroundColor: selectedLayerData.color }}
                      />
                    </Button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 z-10 mt-1">
                        <SketchPicker
                          color={selectedLayerData.color}
                          onChange={(color) => updateTextLayer(selectedLayerData.id, { color: color.hex })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Slider
                    label="Opacity"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedLayerData.opacity}
                    onChange={(e) => updateTextLayer(selectedLayerData.id, { opacity: parseFloat(e.target.value) })}
                    showValue
                    valueDisplay={(value) => `${Math.round(value * 100)}%`}
                  />
                </div>

                <div>
                  <Label>Alignment</Label>
                  <Select
                    value={selectedLayerData.textAlign}
                    onChange={(e) => updateTextLayer(selectedLayerData.id, { textAlign: e.target.value })}
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' }
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ImageTextComposer: React.FC = () => {
  return (
    <TextLayersProvider>
      <ImageTextComposerContent />
    </TextLayersProvider>
  );
};

export default ImageTextComposer;