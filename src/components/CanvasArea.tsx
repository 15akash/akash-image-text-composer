import React from 'react';

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
        <button
          onClick={onAddTextLayer}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Text
        </button>
        <button
          onClick={onExportImage}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Export PNG
        </button>
        <button
          onClick={onNewImage}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          New Image
        </button>
      </div>
    </div>
  );
};

export default CanvasArea;