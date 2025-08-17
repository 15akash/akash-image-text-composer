import React from 'react';
import { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';

interface ImageUploadAreaProps {
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  getRootProps,
  getInputProps,
  isDragActive
}) => {
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="text-gray-500 text-lg">
          {isDragActive ? 'Drop the image here...' : 'Drag & drop an image here, or click to select'}
        </div>
        <div className="text-sm text-gray-400">
          Supports PNG, JPG, JPEG, GIF, BMP, WebP
        </div>
      </div>
    </div>
  );
};

export default ImageUploadArea;