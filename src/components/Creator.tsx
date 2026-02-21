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
  Rocket,
  AlertTriangle,
  Download,
  Copy,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { VehicleData } from '../types';
import { SalesPage } from './SalesPage';
import { cn } from '../lib/utils';
import { generateStandaloneHTML } from '../lib/htmlGenerator';

export function Creator() {
  const [step, setStep] = useState<'form' | 'preview'>('form');
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
    if (!data.km.trim() || isNaN(Number(data.km))) newErrors.km = 'Quilometragem inválida';
    if (!data.price.trim() || isNaN(Number(data.price))) newErrors.price = 'Preço inválido';
    if (!data.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!data.whatsapp.trim() || data.whatsapp.replace(/\D/g, '').length < 10) newErrors.whatsapp = 'WhatsApp inválido';
    if (data.images.length < 1) newErrors.images = 'Adicione pelo menos uma foto';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) {
      const firstError = document.querySelector('.text-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setStep('preview');
  };

  const downloadHTML = () => {
    const html = generateStandaloneHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.model.replace(/\s+/g, '_')}_venda.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    const html = generateStandaloneHTML(data);
    navigator.clipboard.writeText(html);
    alert('Código HTML copiado para a área de transferência!');
  };

  if (step === 'preview') {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-[60] bg-brand-dark/80 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <button 
            onClick={() => setStep('form')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao Editor
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={copyCode}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              <Copy size={18} />
              Copiar Código
            </button>
            <button 
              onClick={downloadHTML}
              className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-brand-red/20 transition-all"
            >
              <Download size={18} />
              Baixar .HTML
            </button>
          </div>
        </div>
        <div className="pt-24 md:pt-20">
          <SalesPage data={data} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
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
            Crie páginas de vendas offline e independentes em segundos.
          </p>
        </header>

        <div className="glass-card p-8 md:p-12 space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Car className="text-brand-red" />
              Informações do Veículo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Modelo</label>
                <input name="model" value={data.model} onChange={handleChange} placeholder="Ex: BMW M3" className={cn("input-field w-full", errors.model && "border-red-500")} />
                {errors.model && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.model}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Versão</label>
                <input name="version" value={data.version} onChange={handleChange} placeholder="Ex: Competition" className="input-field w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Ano</label>
                <input name="year" value={data.year} onChange={handleChange} placeholder="2024/2024" className={cn("input-field w-full", errors.year && "border-red-500")} />
                {errors.year && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.year}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Quilometragem</label>
                <input name="km" type="number" value={data.km} onChange={handleChange} placeholder="0" className={cn("input-field w-full", errors.km && "border-red-500")} />
                {errors.km && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.km}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Preço (R$)</label>
                <input name="price" type="number" value={data.price} onChange={handleChange} placeholder="599000" className={cn("input-field w-full", errors.price && "border-red-500")} />
                {errors.price && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Cidade</label>
                <input name="city" value={data.city} onChange={handleChange} placeholder="São Paulo - SP" className={cn("input-field w-full", errors.city && "border-red-500")} />
                {errors.city && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.city}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/70">WhatsApp</label>
                <input name="whatsapp" value={data.whatsapp} onChange={handleChange} placeholder="11999999999" className={cn("input-field w-full", errors.whatsapp && "border-red-500")} />
                {errors.whatsapp && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.whatsapp}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/70">Diferenciais</label>
                <textarea name="differentials" value={data.differentials} onChange={handleChange} rows={4} className="input-field w-full resize-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Sparkles className="text-brand-red" />
              Fotos
            </h2>
            <ImageUploader images={data.images} setImages={(imgs) => setData(prev => ({ ...prev, images: imgs }))} />
            {errors.images && <p className="text-red-500 text-sm flex items-center gap-1"><AlertTriangle size={16} /> {errors.images}</p>}
          </div>

          <button onClick={handleGenerate} className="btn-primary w-full py-4 text-xl">
            <Eye /> Visualizar e Gerar HTML
          </button>
        </div>
      </div>
    </div>
  );
}
