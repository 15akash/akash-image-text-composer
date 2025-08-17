'use client';

import React, { useState, useCallback, useEffect } from 'react';
import * as fabric from 'fabric';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useTextLayersWithHistory, type TextLayer } from '@/hooks/useTextLayersWithHistory';
import { useAutosave } from '@/hooks/useAutosave';
import ImageUploadArea from './ImageUploadArea';
import CanvasArea from './CanvasArea';
import LayersList from './LayersList';
import TextPropertiesPanel from './TextPropertiesPanel';
import EditorToolbar from './EditorToolbar';

const ImageTextComposer: React.FC = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { loadFromLocalStorage, hasAutoSavedData } = useAutosave();

  const {
    canvasRef,
    fabricCanvasRef,
    initializeFabricCanvas,
    exportImage,
    disposeCanvas
  } = useCanvasManager((layerId: string | null) => setSelectedLayer(layerId));

  const handleImageLoaded = useCallback((imageUrl: string, width: number, height: number) => {
    disposeCanvas();
    setTimeout(() => {
      initializeFabricCanvas(imageUrl, width, height);
    }, 100);
  }, [disposeCanvas, initializeFabricCanvas]);

  const recreateTextLayers = useCallback((layers: TextLayer[], fabricCanvas: fabric.Canvas) => {
    // Clear existing text objects
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'text') {
        fabricCanvas.remove(obj);
      }
    });

    // Recreate text layers
    layers.forEach(layer => {
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
      fabricCanvas.add(fabricText);
    });

    fabricCanvas.renderAll();
  }, []);

  const {
    uploadedImage,
    originalImageDimensions,
    getRootProps,
    getInputProps,
    isDragActive,
    resetImage,
    setImageData
  } = useImageUpload(handleImageLoaded);

  const {
    textLayers,
    selectedLayer,
    setSelectedLayer,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    moveLayerUp,
    moveLayerDown,
    clearTextLayers,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength,
    currentIndex,
    loadProject,
    resetProject
  } = useTextLayersWithHistory(uploadedImage, originalImageDimensions);

  // Load autosaved data on component mount
  useEffect(() => {
    const autoSavedData = loadFromLocalStorage();
    if (autoSavedData && hasAutoSavedData()) {
      console.log('Auto-restoring saved data:', autoSavedData);
      
      // Set the image data first
      if (autoSavedData.uploadedImage && autoSavedData.originalImageDimensions) {
        setImageData(autoSavedData.uploadedImage, autoSavedData.originalImageDimensions);
      }
      
      // Load the project state
      loadProject({
        textLayers: autoSavedData.textLayers,
        uploadedImage: autoSavedData.uploadedImage,
        originalImageDimensions: autoSavedData.originalImageDimensions
      });
      
      // If there's an image, initialize the canvas after a short delay
      if (autoSavedData.uploadedImage && autoSavedData.originalImageDimensions) {
        setTimeout(() => {
          handleImageLoaded(
            autoSavedData.uploadedImage!,
            autoSavedData.originalImageDimensions!.width,
            autoSavedData.originalImageDimensions!.height
          );
          
          // Recreate text layers after canvas is ready
          setTimeout(() => {
            if (fabricCanvasRef.current && autoSavedData.textLayers.length > 0) {
              recreateTextLayers(autoSavedData.textLayers, fabricCanvasRef.current);
            }
          }, 200);
        }, 100);
      }
    }
  }, [loadFromLocalStorage, hasAutoSavedData, loadProject, handleImageLoaded, setImageData, recreateTextLayers, fabricCanvasRef]);

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

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset everything? This will clear all your work and cannot be undone.')) {
      resetProject();
      resetImage();
      disposeCanvas();
    }
  }, [resetProject, resetImage, disposeCanvas]);

  const handleLoadAutoSave = useCallback(() => {
    const autoSavedData = loadFromLocalStorage();
    if (autoSavedData) {
      if (window.confirm('Load your auto-saved work? This will replace your current work.')) {
        // Set the image data first
        if (autoSavedData.uploadedImage && autoSavedData.originalImageDimensions) {
          setImageData(autoSavedData.uploadedImage, autoSavedData.originalImageDimensions);
        }
        
        loadProject({
          textLayers: autoSavedData.textLayers,
          uploadedImage: autoSavedData.uploadedImage,
          originalImageDimensions: autoSavedData.originalImageDimensions
        });
        
        // If there's an image, reload it
        if (autoSavedData.uploadedImage && autoSavedData.originalImageDimensions) {
          setTimeout(() => {
            handleImageLoaded(
              autoSavedData.uploadedImage!,
              autoSavedData.originalImageDimensions!.width,
              autoSavedData.originalImageDimensions!.height
            );
            
            // Recreate text layers after canvas is ready
            setTimeout(() => {
              if (fabricCanvasRef.current && autoSavedData.textLayers.length > 0) {
                recreateTextLayers(autoSavedData.textLayers, fabricCanvasRef.current);
              }
            }, 200);
          }, 100);
        }
      }
    }
  }, [loadFromLocalStorage, loadProject, handleImageLoaded, setImageData, recreateTextLayers, fabricCanvasRef]);

  const selectedLayerData = textLayers.find(layer => layer.id === selectedLayer);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <EditorToolbar
        onUndo={undo}
        onRedo={redo}
        onReset={handleReset}
        canUndo={canUndo}
        canRedo={canRedo}
        historyLength={historyLength}
        currentIndex={currentIndex}
        hasAutoSavedData={hasAutoSavedData()}
        onLoadAutoSave={handleLoadAutoSave}
      />
      
      <div className="flex flex-1">
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
    </div>
  );
};

export default ImageTextComposer;