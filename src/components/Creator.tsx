import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  Calendar, 
  Gauge, 
  Tag, 
  MapPin, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Eye,
  Rocket,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { VehicleData } from '../types';
import { SalesPage } from './SalesPage';
import { cn } from '../lib/utils';

export function Creator() {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [data, setData] = useState<VehicleData>({
    model: '',
    year: '',
    km: '',
    version: '',
    price: '',
    city: '',
    differentials: '',
    whatsapp: '',
    images: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.model.trim()) newErrors.model = 'Modelo é obrigatório';
    if (!data.year.trim()) newErrors.year = 'Ano é obrigatório';
    
    if (!data.km.trim()) {
      newErrors.km = 'Quilometragem é obrigatória';
    } else if (isNaN(Number(data.km)) || Number(data.km) < 0) {
      newErrors.km = 'Quilometragem inválida';
    }

    if (!data.price.trim()) {
      newErrors.price = 'Preço é obrigatório';
    } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (!data.city.trim()) newErrors.city = 'Cidade é obrigatória';

    const whatsappDigits = data.whatsapp.replace(/\D/g, '');
    if (!data.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (whatsappDigits.length < 10) {
      newErrors.whatsapp = 'WhatsApp inválido (mínimo 10 dígitos)';
    }

    if (data.images.length < 1) {
      newErrors.images = 'Adicione pelo menos uma foto do veículo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      const firstError = document.querySelector('.text-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleData: data })
      });
      const result = await response.json();
      setGeneratedId(result.id);
      setStep('preview');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar página.');
    } finally {
      setIsSaving(false);
    }
  };

  if (step === 'preview' && generatedId) {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-[60] bg-brand-red p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 size={24} />
            <span className="font-bold">Página Gerada com Sucesso!</span>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              readOnly 
              value={`${window.location.origin}/v/${generatedId}`}
              className="bg-white/20 border-none rounded-lg px-3 py-2 text-sm text-white w-full md:w-64 outline-none"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/v/${generatedId}`);
                alert('Link copiado!');
              }}
              className="bg-white text-brand-red px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Copiar Link
            </button>
            <button 
              onClick={() => setStep('form')}
              className="text-white hover:underline text-sm font-medium whitespace-nowrap"
            >
              Editar
            </button>
          </div>
        </div>
        <div className="pt-24 md:pt-16">
          <SalesPage data={data} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 bg-brand-red rounded-2xl mb-4"
          >
            <Rocket className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            AutoPage <span className="text-brand-red">Pro</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Crie páginas de vendas de alto impacto para seus veículos em minutos.
          </p>
        </header>

        {/* Form */}
        <div className="glass-card p-8 md:p-12 space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Car className="text-brand-red" />
              Informações do Veículo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Modelo</label>
                <input 
                  name="model" 
                  value={data.model} 
                  onChange={handleChange}
                  placeholder="Ex: BMW M3" 
                  className={cn("input-field w-full", errors.model && "border-red-500 focus:border-red-500 focus:ring-red-500")} 
                />
                {errors.model && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.model}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Versão</label>
                <input 
                  name="version" 
                  value={data.version} 
                  onChange={handleChange}
                  placeholder="Ex: Competition 3.0 Bi-Turbo" 
                  className="input-field w-full" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Ano</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                  <input 
                    name="year" 
                    value={data.year} 
                    onChange={handleChange}
                    placeholder="2024/2024" 
                    className={cn("input-field w-full pl-12", errors.year && "border-red-500 focus:border-red-500 focus:ring-red-500")} 
                  />
                </div>
                {errors.year && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.year}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Quilometragem</label>
                <div className="relative">
                  <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                  <input 
                    name="km" 
                    type="number"
                    value={data.km} 
                    onChange={handleChange}
                    placeholder="0" 
                    className={cn("input-field w-full pl-12", errors.km && "border-red-500 focus:border-red-500 focus:ring-red-500")} 
                  />
                </div>
                {errors.km && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.km}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Preço (R$)</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                  <input 
                    name="price" 
                    type="number"
                    value={data.price} 
                    onChange={handleChange}
                    placeholder="599000" 
                    className={cn("input-field w-full pl-12", errors.price && "border-red-500 focus:border-red-500 focus:ring-red-500")} 
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Cidade</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                  <input 
                    name="city" 
                    value={data.city} 
                    onChange={handleChange}
                    placeholder="São Paulo - SP" 
                    className={cn("input-field w-full pl-12", errors.city && "border-red-500 focus:border-red-500 focus:ring-red-500")} 
                  />
                </div>
                {errors.city && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.city}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/70">WhatsApp (com DDD)</label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                  <input 
                    name="whatsapp" 
                    value={data.whatsapp} 
                    onChange={handleChange}
                    placeholder="11999999999" 
                    className={cn("input-field w-full pl-12", errors.whatsapp && "border-red-500 focus:border-red-500 focus:ring-red-500")} 
                  />
                </div>
                {errors.whatsapp && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.whatsapp}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/70">Diferenciais (um por linha)</label>
                <textarea 
                  name="differentials" 
                  value={data.differentials} 
                  onChange={handleChange}
                  rows={4}
                  placeholder="Teto Solar&#10;Bancos em Couro&#10;Único Dono&#10;Revisado na Concessionária" 
                  className="input-field w-full resize-none" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Sparkles className="text-brand-red" />
              Fotos do Veículo
            </h2>
            <ImageUploader 
              images={data.images} 
              setImages={(imgs) => {
                setData(prev => ({ ...prev, images: imgs }));
                if (errors.images) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.images;
                    return newErrors;
                  });
                }
              }} 
            />
            {errors.images && <p className="text-red-500 text-sm flex items-center gap-1 font-medium"><AlertTriangle size={16} /> {errors.images}</p>}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1 py-4 text-xl"
            >
              {isSaving ? (
                <>
                  <Rocket className="animate-bounce" />
                  Gerando Página...
                </>
              ) : (
                <>
                  <Rocket />
                  Gerar Minha Página
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-white/30 text-sm">
          AutoPage Pro © 2024 - O melhor gerador de páginas automotivas.
        </footer>
      </div>
    </div>
  );
}
