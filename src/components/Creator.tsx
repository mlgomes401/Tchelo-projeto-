import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  ArrowLeft,
  Share2,
  ExternalLink,
  Users,
  Instagram,
  X,
  Star
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { VehicleData } from '../types';
import { SalesPage } from './SalesPage';
import { cn } from '../lib/utils';
import { generateStandaloneHTML } from '../lib/htmlGenerator';
import { generateVehicleCopy } from '../lib/ai';

import { Link } from 'react-router-dom';
import { getAuthHeaders } from '../lib/api';

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
    description: '',
    whatsapp: '',
    instagram: '',
    images: []
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showVehicles, setShowVehicles] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles', { headers: getAuthHeaders() });
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVehicles([]);
    }
  };

  useEffect(() => {
    if (showVehicles) fetchVehicles();
  }, [showVehicles]);

  const updateVehicleStatus = async (id: string, status: string) => {
    // We need an endpoint for this, but for now let's just mock or add it to server.ts later
    // For now, I'll just show the list
  };

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
    if (!data.whatsapp?.trim() || (data.whatsapp || '').replace(/\D/g, '').length < 10) newErrors.whatsapp = 'WhatsApp inválido';
    if (data.images.length < 1) newErrors.images = 'Adicione pelo menos uma foto';

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
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleData: data })
      });
      const result = await response.json();
      if (!result.id) throw new Error("ID não retornado");
      setGeneratedId(result.id);
      setStep('preview');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar página no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadHTML = () => {
    const html = generateStandaloneHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.model || 'veiculo').replace(/\s+/g, '_')}_venda.html`;
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

  const generateInstagramPost = async () => {
    if (!data.model) return alert('Preencha o Modelo primeiro!');
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Crie uma legenda para o Instagram super engajadora para vender este carro: ${data.model} ${data.version} ${data.year} ${data.km}km. Liste alguns diferenciais rápido e termine com uma CTA para chamar no direct ou no link da bio. Use emojis.` })
      });
      const aiData = await res.json();
      if (!res.ok) throw new Error('Falha na IA');

      const postText = aiData.text || aiData.description;
      navigator.clipboard.writeText(postText);
      alert('Legenda para Instagram gerada e copiada para a área de transferência! Cole no seu post.');
    } catch (err) {
      alert('Erro ao gerar post para o Instagram.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const copyLink = () => {
    if (generatedId) {
      const link = `${window.location.origin}/v/${generatedId}`;
      navigator.clipboard.writeText(link);
      alert('Link da página copiado!');
    }
  };

  if (step === 'preview') {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-[60] bg-brand-dark/90 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            {generatedId && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                <CheckCircle2 size={14} />
                Salvo no Banco
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {generatedId && (
              <>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                >
                  <Share2 size={18} />
                  Copiar Link
                </button>
                <a
                  href={`/v/${generatedId}`}
                  target="_blank"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                >
                  <ExternalLink size={18} />
                  Abrir Link
                </a>
              </>
            )}
            <button
              onClick={copyCode}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              <Copy size={18} />
              HTML
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

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
              AutoPage <span className="text-brand-red">Pro</span>
            </h1>
            <div className="flex items-center gap-6">
              <Link
                to="/crm"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-red transition-colors"
              >
                <Users size={14} />
                Dashboard CRM
              </Link>
              <button
                onClick={() => setShowVehicles(!showVehicles)}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-red transition-colors"
              >
                <Car size={14} />
                Meus Veículos
              </button>
            </div>
          </div>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Crie páginas de vendas profissionais com banco de dados e exportação HTML.
          </p>
        </header>

        {showVehicles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                <Car className="text-brand-red" />
                Meu Estoque
              </h2>
              <button onClick={() => setShowVehicles(false)} className="text-white/30 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4">
              {vehicles.length === 0 ? (
                <p className="text-center py-8 text-white/30">Nenhum veículo cadastrado ainda.</p>
              ) : (
                vehicles.map((v) => (
                  <div key={v.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 gap-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-brand-gray shrink-0">
                        <img src={v.data?.images?.[0] || ''} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          {v.data.model} {v.data.version}
                          {v.data.featured && <Star size={12} className="text-purple-400 fill-purple-400" />}
                        </h4>
                        <p className="text-xs text-white/40">{v.data.year} • {v.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                      <button
                        onClick={async () => {
                          const newFeatured = !v.data.featured;
                          const newData = { ...v.data, featured: newFeatured };
                          await fetch(`/api/vehicles?id=${v.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: newData })
                          });
                          fetchVehicles();
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border",
                          v.data.featured ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                        )}
                      >
                        <Star size={16} className={cn(v.data.featured && "fill-purple-400")} />
                        <span className="hidden md:inline">Destaque</span>
                      </button>

                      <select
                        value={v.status}
                        onChange={async (e) => {
                          await fetch(`/api/vehicles?id=${v.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: e.target.value })
                          });
                          fetchVehicles();
                        }}
                        className="bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                      >
                        <option value="Disponível">Disponível</option>
                        <option value="Vendido">Vendido</option>
                        <option value="Reservado">Reservado</option>
                      </select>
                      <Link to={`/v/${v.id}`} target="_blank" className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white border border-transparent hover:border-white/10">
                        <ExternalLink size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        <div className="glass-card p-8 md:p-12 space-y-10">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                <Car className="text-brand-red" />
                Informações do Veículo
              </h2>
              <button
                onClick={async () => {
                  if (!data.model) return alert('Preencha o Modelo primeiro!');
                  setIsGeneratingAI(true);
                  try {
                    const aiResult = await generateVehicleCopy(`${data.model} ${data.version} ${data.year} ${data.km}km`);
                    setData(prev => ({ ...prev, differentials: aiResult.differentials, description: aiResult.description }));
                  } catch (err) {
                    alert('Erro ao gerar com IA.');
                  } finally {
                    setIsGeneratingAI(false);
                  }
                }}
                disabled={isGeneratingAI}
                className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
              >
                <Sparkles size={14} className={cn(isGeneratingAI && "animate-spin")} />
                Gerar Textos
              </button>
              <button
                onClick={generateInstagramPost}
                disabled={isGeneratingAI}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Instagram size={14} className={cn(isGeneratingAI && "animate-spin")} />
                Post Instagram
              </button>
            </div>

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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">WhatsApp</label>
                <input name="whatsapp" value={data.whatsapp} onChange={handleChange} placeholder="11999999999" className={cn("input-field w-full", errors.whatsapp && "border-red-500")} />
                {errors.whatsapp && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.whatsapp}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Instagram</label>
                <input name="instagram" value={data.instagram} onChange={handleChange} placeholder="@sua_loja" className={cn("input-field w-full", errors.instagram && "border-red-500")} />
                {errors.instagram && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> {errors.instagram}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/70">Diferenciais (Bullet points)</label>
                <textarea name="differentials" value={data.differentials} onChange={handleChange} rows={3} className="input-field w-full resize-none" placeholder="Ex: Único dono&#10;Laudo Cautelar Aprovado" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/70">Descrição Emocional (IA)</label>
                <textarea name="description" value={data.description} onChange={handleChange} rows={4} className="input-field w-full resize-none" placeholder="Deixe a IA gerar uma descrição vendedora para você..." />
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

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary w-full py-4 text-xl"
          >
            {isSaving ? (
              <>
                <Rocket className="animate-bounce" />
                Salvando no Banco...
              </>
            ) : (
              <>
                <Rocket /> Gerar e Salvar Página
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
