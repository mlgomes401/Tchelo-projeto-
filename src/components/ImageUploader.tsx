import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
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

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setImages(newImages);
    }
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden group bg-brand-gray border border-white/5"
            >
              <img src={img} className="w-full h-full object-cover" alt={`Upload ${index}`} />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-30 transition-colors"
                    title="Mover para trás"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-30 transition-colors"
                    title="Mover para frente"
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-red/80 hover:bg-brand-red rounded-lg text-white text-xs font-bold transition-colors"
                >
                  <X size={14} /> Remover
                </button>
              </div>

              {/* Index Badge */}
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md text-white/70">
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
