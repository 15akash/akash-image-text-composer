'use client';

import React, { useState, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { type TextLayer, useTextLayers } from '@/hooks/useTextLayers';
import ImageUploadArea from './ImageUploadArea';
import CanvasArea from './CanvasArea';
import LayersList from './LayersList';
import TextPropertiesPanel from './TextPropertiesPanel';

const ImageTextComposer: React.FC = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const {
    textLayers,
    selectedLayer,
    setSelectedLayer,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    moveLayerUp,
    moveLayerDown,
    clearTextLayers
  } = useTextLayers();

  const {
    canvasRef,
    fabricCanvasRef,
    initializeFabricCanvas,
    exportImage,
    disposeCanvas
  } = useCanvasManager(setSelectedLayer);

  const handleImageLoaded = useCallback((imageUrl: string, width: number, height: number) => {
    disposeCanvas();
    setTimeout(() => {
      initializeFabricCanvas(imageUrl, width, height);
    }, 100);
  }, [disposeCanvas, initializeFabricCanvas]);

  const {
    uploadedImage,
    originalImageDimensions,
    getRootProps,
    getInputProps,
    isDragActive,
    resetImage
  } = useImageUpload(handleImageLoaded);

  const handleAddTextLayer = useCallback(() => {
    addTextLayer(fabricCanvasRef.current);
  }, [addTextLayer, fabricCanvasRef]);

  const handleUpdateTextLayer = useCallback((updates: Partial<TextLayer>) => {
    if (selectedLayer) {
      updateTextLayer(selectedLayer, updates, fabricCanvasRef.current);
    }
  }, [selectedLayer, updateTextLayer, fabricCanvasRef]);

  const handleDeleteTextLayer = useCallback((layerId: string) => {
    deleteTextLayer(layerId, fabricCanvasRef.current);
  }, [deleteTextLayer, fabricCanvasRef]);

  const handleMoveLayerUp = useCallback((layerId: string) => {
    moveLayerUp(layerId, fabricCanvasRef.current);
  }, [moveLayerUp, fabricCanvasRef]);

  const handleMoveLayerDown = useCallback((layerId: string) => {
    moveLayerDown(layerId, fabricCanvasRef.current);
  }, [moveLayerDown, fabricCanvasRef]);

  const handleExportImage = useCallback(() => {
    exportImage(originalImageDimensions);
  }, [exportImage, originalImageDimensions]);

  const handleNewImage = useCallback(() => {
    resetImage();
    clearTextLayers();
    disposeCanvas();
  }, [resetImage, clearTextLayers, disposeCanvas]);

  const selectedLayerData = textLayers.find(layer => layer.id === selectedLayer);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
          <h1 className="text-2xl font-bold mb-4">Image Text Composer</h1>
          
          {!uploadedImage ? (
            <ImageUploadArea
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
            />
          ) : (
            <CanvasArea
              canvasRef={canvasRef}
              onAddTextLayer={handleAddTextLayer}
              onExportImage={handleExportImage}
              onNewImage={handleNewImage}
            />
          )}
        </div>
      </div>

      {uploadedImage && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Layers</h2>
          
          <LayersList
            textLayers={textLayers}
            selectedLayer={selectedLayer}
            onSelectLayer={setSelectedLayer}
            onMoveLayerUp={handleMoveLayerUp}
            onMoveLayerDown={handleMoveLayerDown}
            onDeleteLayer={handleDeleteTextLayer}
          />

          {selectedLayerData && (
            <TextPropertiesPanel
              selectedLayerData={selectedLayerData}
              showColorPicker={showColorPicker}
              onToggleColorPicker={() => setShowColorPicker(!showColorPicker)}
              onUpdateLayer={handleUpdateTextLayer}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImageTextComposer;