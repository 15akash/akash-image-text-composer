'use client';

import React from 'react';
import { Button } from '@/foundations';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyIndex: number;
  historyLength: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyIndex,
  historyLength
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            variant="outline"
            size="sm"
          >
            ↶ Undo
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            variant="outline"
            size="sm"
          >
            ↷ Redo
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          History: {historyIndex + 1}/{historyLength}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;