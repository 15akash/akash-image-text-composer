import React from 'react';
import { SketchPicker } from 'react-color';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/utils/common';
import type { TextLayer } from '@/hooks/useTextLayersWithHistory';
import { Label, Input, Select, Button, Textarea, Slider } from '@/foundations';

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
        <Label>Text</Label>
        <Textarea
          value={selectedLayerData.text}
          onChange={(e) => onUpdateLayer({ text: e.target.value })}
          rows={3}
          resize="none"
        />
      </div>

      <div>
        <Label>Font Family</Label>
        <Select
          value={selectedLayerData.fontFamily}
          onChange={(e) => onUpdateLayer({ fontFamily: e.target.value })}
          options={FONT_FAMILIES}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Size</Label>
          <Input
            type="number"
            value={selectedLayerData.fontSize}
            onChange={(e) => onUpdateLayer({ fontSize: parseInt(e.target.value) })}
            min="8"
            max="200"
          />
        </div>
        <div>
          <Label>Weight</Label>
          <Select
            value={selectedLayerData.fontWeight}
            onChange={(e) => onUpdateLayer({ fontWeight: e.target.value })}
            options={FONT_WEIGHTS}
          />
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <div className="relative">
          <Button
            onClick={onToggleColorPicker}
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
                onChange={(color) => onUpdateLayer({ color: color.hex })}
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
          onChange={(e) => onUpdateLayer({ opacity: parseFloat(e.target.value) })}
          showValue
          valueDisplay={(value) => `${Math.round(value * 100)}%`}
        />
      </div>

      <div>
        <Label>Alignment</Label>
        <Select
          value={selectedLayerData.textAlign}
          onChange={(e) => onUpdateLayer({ textAlign: e.target.value })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ]}
        />
      </div>
    </div>
  );
};

export default TextPropertiesPanel;