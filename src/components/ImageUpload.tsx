'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageDrop: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageDrop }) => {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      onImageDrop(file);
    }
  }, [onImageDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

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

export default ImageUpload;