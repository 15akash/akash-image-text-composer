'use client';

import React from 'react';
import { TextLayer } from '@/contexts/TextLayersContext';

interface LayersListProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onMoveLayerUp: (layerId: string) => void;
  onMoveLayerDown: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
}

const LayersList: React.FC<LayersListProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onDeleteLayer
}) => {
  return (
    <div className="space-y-2 mb-6">
      {layers.map((layer, index) => (
        <div
          key={layer.id}
          className={`p-3 border rounded cursor-pointer ${
            selectedLayerId === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => onSelectLayer(layer.id)}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">Text {index + 1}</span>
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLayerUp(layer.id);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLayerDown(layer.id);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ↓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(layer.id);
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
  );
};

export default LayersList;