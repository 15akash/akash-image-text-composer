'use client';

import { useCallback } from 'react';

export const useImageUpload = () => {
  const processImageFile = useCallback((
    file: File,
    onImageLoaded: (imageUrl: string, dimensions: {width: number, height: number}) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        onImageLoaded(result, { width: img.width, height: img.height });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  return {
    processImageFile
  };
};