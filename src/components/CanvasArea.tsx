'use client';

import React from 'react';
import { Button } from '@/foundations';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onAddText: () => void;
  onExport: () => void;
  onNewImage: () => void;
  onReset: () => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  onAddText,
  onExport,
  onNewImage,
  onReset
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <canvas ref={canvasRef} className="border border-gray-300 rounded" />
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onAddText} variant="primary">
          Add Text
        </Button>
        <Button onClick={onExport} variant="success">
          Export PNG
        </Button>
        <Button onClick={onNewImage} variant="secondary">
          New Image
        </Button>
        <Button onClick={onReset} variant="outline">
          Reset Project
        </Button>
      </div>
    </div>
  );
};

export default CanvasArea;