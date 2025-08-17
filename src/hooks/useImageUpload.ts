import { useState, useCallback } from 'react';
import { useDropzone, DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';

interface UseImageUploadReturn {
  uploadedImage: string | null;
  originalImageDimensions: {width: number, height: number} | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  resetImage: () => void;
}

export const useImageUpload = (
  onImageLoaded: (imageUrl: string, width: number, height: number) => void
): UseImageUploadReturn => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{width: number, height: number} | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        
        const img = new Image();
        img.onload = () => {
          setOriginalImageDimensions({ width: img.width, height: img.height });
          onImageLoaded(result, img.width, img.height);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  }, [onImageLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const resetImage = useCallback(() => {
    setUploadedImage(null);
    setOriginalImageDimensions(null);
  }, []);

  return {
    uploadedImage,
    originalImageDimensions,
    getRootProps,
    getInputProps,
    isDragActive,
    resetImage
  };
};