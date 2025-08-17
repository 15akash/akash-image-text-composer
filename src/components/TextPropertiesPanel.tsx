import React from 'react';
import { SketchPicker } from 'react-color';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/utils/common';
import type { TextLayer } from '@/hooks/useTextLayers';

interface TextPropertiesPanelProps {
  selectedLayerData: TextLayer;
  showColorPicker: boolean;
  onToggleColorPicker: () => void;
  onUpdateLayer: (updates: Partial<TextLayer>) => void;
}

const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({
  selectedLayerData,
  showColorPicker,
  onToggleColorPicker,
  onUpdateLayer
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Text Properties</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea
          value={selectedLayerData.text}
          onChange={(e) => onUpdateLayer({ text: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Font Family</label>
        <select
          value={selectedLayerData.fontFamily}
          onChange={(e) => onUpdateLayer({ fontFamily: e.target.value })}
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
            onChange={(e) => onUpdateLayer({ fontSize: parseInt(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded"
            min="8"
            max="200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Weight</label>
          <select
            value={selectedLayerData.fontWeight}
            onChange={(e) => onUpdateLayer({ fontWeight: e.target.value })}
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
            onClick={onToggleColorPicker}
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
                onChange={(color) => onUpdateLayer({ color: color.hex })}
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
          onChange={(e) => onUpdateLayer({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">{Math.round(selectedLayerData.opacity * 100)}%</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Alignment</label>
        <select
          value={selectedLayerData.textAlign}
          onChange={(e) => onUpdateLayer({ textAlign: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
};

export default TextPropertiesPanel;