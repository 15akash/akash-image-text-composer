'use client';

import React, { useCallback, useEffect } from 'react';
import { useTextLayers, TextLayersProvider } from '@/contexts/TextLayersContext';
import { useCanvas } from '@/hooks/useCanvas';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUpload from './ImageUpload';
import Toolbar from './Toolbar';
import CanvasArea from './CanvasArea';
import LayersList from './LayersList';
import TextProperties from './TextProperties';

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
    resetProject,
    recreateFabricObjects
  } = useTextLayers();

  const { canvasRef, initializeCanvas, exportCanvas } = useCanvas(fabricCanvasRef);
  const { processImageFile } = useImageUpload();

  const handleImageUpload = useCallback((file: File) => {
    processImageFile(file, (imageUrl, dimensions) => {
      setImage(imageUrl, dimensions);
      setTimeout(() => {
        initializeCanvas(
          imageUrl,
          dimensions.width,
          dimensions.height,
          selectLayer,
          () => selectLayer(null),
          (layerId, x, y) => updateTextLayer(layerId, { x, y }),
          (layerId, x, y, rotation) => updateTextLayer(layerId, { x, y, rotation })
        );
      }, 100);
    });
  }, [processImageFile, setImage, initializeCanvas, selectLayer, updateTextLayer]);

  const handleAddTextLayer = useCallback(() => {
    if (fabricCanvasRef.current) {
      addTextLayer();
    }
  }, [addTextLayer, fabricCanvasRef]);

  const handleExportImage = useCallback(() => {
    if (state.originalImageDimensions) {
      exportCanvas(state.originalImageDimensions);
    }
  }, [exportCanvas, state.originalImageDimensions]);

  const handleNewImage = useCallback(() => {
    setImage(null, null);
    clearLayers();
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  }, [setImage, clearLayers, fabricCanvasRef]);

  // Effect to recreate fabric canvas and objects when state is restored
  useEffect(() => {
    if (state.uploadedImage && state.originalImageDimensions) {
      // Check if canvas needs to be initialized (after restore)
      if (!fabricCanvasRef.current || fabricCanvasRef.current.getObjects().length === 0) {
        // Initialize the canvas with the background image
        initializeCanvas(
          state.uploadedImage,
          state.originalImageDimensions.width,
          state.originalImageDimensions.height,
          selectLayer,
          () => selectLayer(null),
          (layerId, x, y) => updateTextLayer(layerId, { x, y }),
          (layerId, x, y, rotation) => updateTextLayer(layerId, { x, y, rotation })
        );
        
        // If we have text layers to restore, recreate them after canvas is ready
        if (state.textLayers.length > 0) {
          setTimeout(() => {
            if (fabricCanvasRef.current) {
              recreateFabricObjects(fabricCanvasRef.current, state.textLayers);
            }
          }, 200);
        }
      }
    }
  }, [state.uploadedImage, state.originalImageDimensions, initializeCanvas, selectLayer, updateTextLayer, recreateFabricObjects]);

  // Effect to handle fabric object recreation when explicitly requested (undo/redo)
  useEffect(() => {
    if (state.needsFabricRecreation && fabricCanvasRef.current && state.textLayers.length > 0 && state.uploadedImage) {
      // Wait a bit to ensure canvas is ready and state is stable
      const timer = setTimeout(() => {
        if (fabricCanvasRef.current) {
          recreateFabricObjects(fabricCanvasRef.current, state.textLayers);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [state.needsFabricRecreation, state.textLayers, state.uploadedImage, fabricCanvasRef, recreateFabricObjects]);


  const selectedLayerData = state.textLayers.find(layer => layer.id === state.selectedLayer);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        historyIndex={state.historyIndex}
        historyLength={state.history.length}
      />

      <div className="flex flex-1">
        {/* Main Canvas Area */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <h1 className="text-2xl font-bold mb-4">Image Text Composer</h1>
            
            {!state.uploadedImage ? (
              <ImageUpload onImageDrop={handleImageUpload} />
            ) : (
              <CanvasArea
                canvasRef={canvasRef}
                onAddText={handleAddTextLayer}
                onExport={handleExportImage}
                onNewImage={handleNewImage}
                onReset={resetProject}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        {state.uploadedImage && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Layers</h2>
            
            <LayersList
              layers={state.textLayers}
              selectedLayerId={state.selectedLayer}
              onSelectLayer={selectLayer}
              onMoveLayerUp={moveLayerUp}
              onMoveLayerDown={moveLayerDown}
              onDeleteLayer={deleteTextLayer}
            />

            {selectedLayerData && (
              <TextProperties
                layer={selectedLayerData}
                onUpdate={(updates) => updateTextLayer(selectedLayerData.id, updates)}
              />
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