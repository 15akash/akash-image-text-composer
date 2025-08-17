import React from 'react';
import { Button } from '@/foundations';
import HistoryIndicator from './HistoryIndicator';

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  currentIndex: number;
  hasAutoSavedData: boolean;
  onLoadAutoSave: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  historyLength,
  currentIndex,
  hasAutoSavedData,
  onLoadAutoSave
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
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            variant="outline"
            size="sm"
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </Button>
        </div>

        {historyLength > 1 && (
          <HistoryIndicator
            currentIndex={currentIndex}
            totalSteps={historyLength}
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        {hasAutoSavedData && (
          <Button
            onClick={onLoadAutoSave}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            📁 Load Auto-saved
          </Button>
        )}
        
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
          title="Clear all and reset to blank state"
        >
          🗑️ Reset
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;