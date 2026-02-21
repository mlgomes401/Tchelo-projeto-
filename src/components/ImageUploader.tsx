import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { cn } from '../lib/utils';

interface ImageUploaderProps {
  images: string[];
  setImages: (images: string[]) => void;
}

export function ImageUploader({ images, setImages }: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedFile);
          });
        })
      );
      setImages([...images, ...compressedFiles]);
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setIsCompressing(false);
    }
  }, [images, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    minSize: 0,
    multiple: true,
  } as any);

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
          isDragActive ? "border-brand-red bg-brand-red/5" : "border-white/10 hover:border-white/20 bg-white/5"
        )}
      >
        <input {...getInputProps()} />
        {isCompressing ? (
          <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
        ) : (
          <Upload className="w-10 h-10 text-brand-red" />
        )}
        <div className="text-center">
          <p className="font-semibold">Clique ou arraste as fotos aqui</p>
          <p className="text-sm text-white/50">Mínimo recomendado: 10 fotos</p>
        </div>
      </div>

      {images.length > 0 && (
        <Reorder.Group
          axis="y"
          values={images}
          onReorder={setImages}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {images.map((img, index) => (
            <Reorder.Item
              key={img}
              value={img}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing"
            >
              <img src={img} className="w-full h-full object-cover" alt={`Upload ${index}`} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <GripVertical className="text-white w-6 h-6" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 p-1 bg-brand-red rounded-full text-white hover:scale-110 transition-transform"
              >
                <X size={14} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
