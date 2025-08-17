import React from 'react';
import { Button } from '@/foundations';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onAddTextLayer: () => void;
  onExportImage: () => void;
  onNewImage: () => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  onAddTextLayer,
  onExportImage,
  onNewImage
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <canvas ref={canvasRef} className="border border-gray-300 rounded" />
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={onAddTextLayer}
          variant="primary"
        >
          Add Text
        </Button>
        <Button
          onClick={onExportImage}
          variant="success"
        >
          Export PNG
        </Button>
        <Button
          onClick={onNewImage}
          variant="secondary"
        >
          New Image
        </Button>
      </div>
    </div>
  );
};

export default CanvasArea;