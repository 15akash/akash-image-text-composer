'use client';

import React from 'react';
import { SketchPicker } from 'react-color';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/utils/common';
import { Label, Input, Select, Button, Textarea, Slider } from '@/foundations';
import type { TextLayer } from '@/types/textLayers';

interface TextPropertiesProps {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
}

const TextProperties: React.FC<TextPropertiesProps> = ({ layer, onUpdate }) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Text Properties</h3>
      
      <div>
        <Label>Text</Label>
        <Textarea
          value={layer.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          rows={3}
          resize="none"
        />
      </div>

      <div>
        <Label>Font Family</Label>
        <Select
          value={layer.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          options={FONT_FAMILIES}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Size</Label>
          <Input
            type="number"
            value={layer.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            min="8"
            max="200"
          />
        </div>
        <div>
          <Label>Weight</Label>
          <Select
            value={layer.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
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
            <span>{layer.color}</span>
            <div
              className="w-6 h-6 border border-gray-300 rounded"
              style={{ backgroundColor: layer.color }}
            />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-10 mt-1">
              <SketchPicker
                color={layer.color}
                onChange={(color) => onUpdate({ color: color.hex })}
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
          value={layer.opacity}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
          showValue
          valueDisplay={(value) => `${Math.round(value * 100)}%`}
        />
      </div>

      <div>
        <Label>Alignment</Label>
        <Select
          value={layer.textAlign}
          onChange={(e) => onUpdate({ textAlign: e.target.value })}
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

export default TextProperties;