import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  MapPin, 
  Calendar, 
  Gauge, 
  MessageCircle,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { VehicleData } from '../types';
import { formatCurrency, formatKM, cn } from '../lib/utils';

interface SalesPageProps {
  data: VehicleData;
  isPreview?: boolean;
}

export function SalesPage({ data, isPreview }: SalesPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (data.images.length > 1 && !isLightboxOpen) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % data.images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data.images.length, isLightboxOpen]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % data.images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + data.images.length) % data.images.length);

  const whatsappUrl = `https://wa.me/55${data.whatsapp.replace(/\D/g, '')}?text=Olá! Vi o anúncio do ${data.model} ${data.version} e gostaria de mais informações.`;

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-24">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={data.images[currentIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
            alt={data.model}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-black/30" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              <span className="bg-brand-red text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Destaque</span>
              <span className="bg-white/10 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{data.city}</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-extrabold tracking-tight leading-none">
              {data.model} <br />
              <span className="text-brand-red">{data.version}</span>
            </h1>
            <div className="flex items-center gap-6 text-lg md:text-xl text-white/80 font-medium">
              <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-red" /> {data.year}</div>
              <div className="flex items-center gap-2"><Gauge className="w-5 h-5 text-brand-red" /> {formatKM(Number(data.km))}</div>
            </div>
            <div className="text-3xl md:text-5xl font-display font-bold text-white">
              {formatCurrency(Number(data.price))}
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 md:px-8 pointer-events-none">
          <button onClick={prev} className="p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white pointer-events-auto transition-all">
            <ChevronLeft size={32} />
          </button>
          <button onClick={next} className="p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white pointer-events-auto transition-all">
            <ChevronRight size={32} />
          </button>
        </div>

        <button 
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-6 right-6 p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all"
        >
          <Maximize2 size={24} />
        </button>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          Galeria de Fotos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.images.map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setCurrentIndex(idx);
                setIsLightboxOpen(true);
              }}
              className="aspect-video rounded-xl overflow-hidden cursor-pointer bg-brand-gray"
            >
              <img src={img} className="w-full h-full object-cover" alt={`${data.model} view ${idx}`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Details Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-brand-red rounded-full" />
              Diferenciais do Veículo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.differentials.split('\n').filter(d => d.trim()).map((diff, i) => (
                <div key={i} className="flex items-start gap-3 p-4 glass-card">
                  <CheckCircle2 className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-white/90">{diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xl font-display font-bold">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70">
                <MapPin className="text-brand-red" />
                <span>Localização: {data.city}</span>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <MessageCircle className="text-brand-red" />
                <span>WhatsApp: {data.whatsapp}</span>
              </div>
            </div>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-4 text-lg"
            >
              <MessageCircle size={24} />
              Falar com Vendedor
            </a>
          </div>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <motion.a
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageCircle size={32} className="text-white" />
      </motion.a>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={40} />
            </button>
            
            <div className="relative w-full max-w-6xl aspect-video">
              <img 
                src={data.images[currentIndex]} 
                className="w-full h-full object-contain" 
                alt="Lightbox view" 
              />
              
              <div className="absolute inset-y-0 left-0 flex items-center">
                <button onClick={prev} className="p-4 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft size={60} />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button onClick={next} className="p-4 text-white/50 hover:text-white transition-colors">
                  <ChevronRight size={60} />
                </button>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
              {data.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                    currentIndex === idx ? "border-brand-red scale-110" : "border-transparent opacity-50"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" alt="Thumb" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
