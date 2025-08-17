'use client';

import React from 'react';
import { Button } from '@/foundations';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdClose } from 'react-icons/md';
import type { TextLayer } from '@/types/textLayers';

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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLayerUp(layer.id);
                }}
                variant="icon"
                size="sm"
              >
                <MdKeyboardArrowUp size={16} />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLayerDown(layer.id);
                }}
                variant="icon"
                size="sm"
              >
                <MdKeyboardArrowDown size={16} />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(layer.id);
                }}
                variant="icon"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <MdClose size={16} />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-500 truncate">{layer.text}</div>
        </div>
      ))}
    </div>
  );
};

export default LayersList;