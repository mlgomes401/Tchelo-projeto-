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
  CheckCircle2,
  Instagram,
  ArrowLeft,
  Car
} from 'lucide-react';
import { VehicleData } from '../types';
import { formatCurrency, formatKM, cn } from '../lib/utils';
import { useParams, Link } from 'react-router-dom';

interface SalesPageProps {
  data: VehicleData;
  isPreview?: boolean;
}

export function SalesPage({ data, isPreview }: SalesPageProps) {
  const { id: vehicleId } = useParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ name: '', phone: '', email: '', tradeIn: '', financing: '' });
  const [storeName, setStoreName] = useState('AutoPage Elite');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeInstagram, setStoreInstagram] = useState('');

  useEffect(() => {
    let sId = (data as any).store_id;
    if (!sId && typeof window !== 'undefined') {
      const token = localStorage.getItem('autopage_token') || localStorage.getItem('token');
      if (token && token.includes('|')) {
        sId = token.split('|')[1];
      }
    }
    sId = sId || 'store_demo';

    fetch(`/api/settings?storeId=${sId}`)
      .then(res => res.json())
      .then(d => {
        if (d.storeName) setStoreName(d.storeName);
        if (d.whatsapp) setStoreWhatsapp(d.whatsapp);
        if (d.instagram) setStoreInstagram(d.instagram);
      })
      .catch(() => { });
  }, [data]);

  const finalWhatsapp = data.whatsapp || storeWhatsapp;
  const finalInstagram = data.instagram || storeInstagram;
  const whatsappUrl = `https://wa.me/55${(finalWhatsapp || '').replace(/\D/g, '')}?text=Olá! Vi o anúncio do ${data.model} ${data.version} e gostaria de mais informações.`;

  const handleLeadCapture = async (e?: React.MouseEvent) => {
    if (isPreview || !vehicleId) return;

    // If form is not shown yet, show it
    if (!showLeadForm) {
      e?.preventDefault();
      setShowLeadForm(true);
      return;
    }

    try {
      // Rastreador Meta Pixel (Etapa 4)
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: `${data.model} ${data.version}`,
          content_category: 'Vehicle'
        });
      }

      const notes = `Tem interesse em troca: ${leadInfo.tradeIn || 'Não informado'} | Pretende financiar: ${leadInfo.financing || 'Não informado'}`;

      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          vehicleName: `${data.model} ${data.version}`,
          clientName: leadInfo.name,
          clientEmail: leadInfo.email,
          clientPhone: leadInfo.phone,
          origin: 'Site',
          notes: notes
        })
      });
      // After capture, redirect to WhatsApp
      window.open(whatsappUrl, '_blank');
      setShowLeadForm(false);
    } catch (error) {
      console.error("Failed to capture lead:", error);
      window.open(whatsappUrl, '_blank');
    }
  };

  const toggleZoom = () => setZoom(prev => prev === 1 ? 2 : 1);

  const images = data.images || [];

  useEffect(() => {
    // Rastreador Meta Pixel (Etapa 4) - ViewContent
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: `${data.model} ${data.version}`,
        content_category: 'Vehicle',
        value: Number(data.price),
        currency: 'BRL'
      });
    }
  }, [data.model, data.version, data.price]);

  useEffect(() => {
    if (images.length > 1 && !isLightboxOpen) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length, isLightboxOpen]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };
  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-24">
      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 w-full max-w-md space-y-6 relative"
            >
              <button
                onClick={() => setShowLeadForm(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowLeadForm(false); }}
                className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors z-[120]"
              >
                <X size={24} />
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-brand-red w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold">Quase lá!</h3>
                <p className="text-white/60 text-sm">Informe seus dados para iniciar o atendimento via WhatsApp.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-white/40">Seu Nome</label>
                  <input
                    type="text"
                    placeholder="Como podemos te chamar?"
                    className="input-field w-full"
                    value={leadInfo.name}
                    onChange={e => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-white/40">Seu WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="input-field w-full"
                    value={leadInfo.phone}
                    onChange={e => setLeadInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-white/40">Seu E-mail <span className="text-white/20 normal-case font-normal">(opcional)</span></label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="input-field w-full"
                    value={leadInfo.email}
                    onChange={e => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-white/40">Tem veículo na troca?</label>
                  <select
                    className="input-field w-full"
                    value={leadInfo.tradeIn}
                    onChange={e => setLeadInfo(prev => ({ ...prev, tradeIn: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim, tenho carro na troca</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-white/40">Pretende Financiar?</label>
                  <select
                    className="input-field w-full"
                    value={leadInfo.financing}
                    onChange={e => setLeadInfo(prev => ({ ...prev, financing: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim, quero simular</option>
                    <option value="A Vista">Pagamento à vista</option>
                  </select>
                </div>
                <button
                  onClick={() => handleLeadCapture()}
                  disabled={!leadInfo.name || !leadInfo.phone}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 mt-4"
                >
                  <MessageCircle size={20} />
                  Abrir WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button and Store Header */}
      {!isPreview && (
        <div className="fixed top-0 left-0 right-0 z-[90] p-6 flex justify-between items-center pointer-events-none">
          <Link
            to={`/loja?store=${(data as any).store_id || 'store_demo'}`}
            className="flex items-center gap-2 px-6 py-3 bg-brand-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-bold text-sm hover:bg-white/10 transition-all group shadow-2xl pointer-events-auto"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>

          <div className="bg-brand-dark/80 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center">
              <Car className="text-white" size={16} />
            </div>
            <span className="font-display font-black text-xl tracking-tighter uppercase text-white">{storeName}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <AnimatePresence mode="wait">
          {images.length > 0 && (
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt={data.model}
            />
          )}
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
              {data.status && data.status !== 'Disponível' && (
                <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{data.status}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-extrabold tracking-tight leading-none">
              {data.model} <br />
              <span className="text-brand-red">{data.version}</span>
            </h1>
            <div className="flex items-center gap-6 text-lg md:text-xl text-white/80 font-medium pb-2">
              <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-red" /> {data.year}</div>
              <div className="flex items-center gap-2"><Gauge className="w-5 h-5 text-brand-red" /> {formatKM(Number(data.km))}</div>
              {data.color && <div className="flex items-center gap-2 max-w-[200px] truncate"><span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' }}></span> {data.color}</div>}
            </div>
            <div className="text-4xl md:text-6xl font-display font-black text-white drop-shadow-2xl flex items-center gap-6">
              {formatCurrency(Number(data.price))}
              <div className="h-10 w-px bg-white/20 hidden md:block"></div>
              <span className="text-sm font-bold text-brand-red uppercase tracking-widest hidden md:block">Vendido por<br /><span className="text-white">{storeName}</span></span>
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
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          Galeria de Fotos
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
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
        </motion.div>
      </motion.section>

      {/* Details Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {data.description && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-red rounded-full" />
                  Descrição do Veículo
                </h2>
                <div className="glass-card p-8 text-white/80 leading-relaxed font-medium whitespace-pre-line">
                  {data.description}
                </div>
              </div>
            )}

            {data.differentials && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-red rounded-full" />
                  Detalhes e Acessórios
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.differentials.split('\n').filter(d => d.trim()).map((diff, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 glass-card"
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                      <span className="text-white/90">{diff}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xl font-display font-bold">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70">
                <MapPin className="text-brand-red" />
                <span>Localização: {data.city}</span>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <MessageCircle className="text-brand-red" />
                <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={handleLeadCapture} className="hover:text-brand-red transition-colors">
                  WhatsApp: {finalWhatsapp}
                </a>
              </div>
              {finalInstagram && (
                <div className="flex items-center gap-4 text-white/70">
                  <Instagram className="text-brand-red" />
                  <a href={`https://instagram.com/${finalInstagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors">
                    Instagram: {finalInstagram}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Inicie seu atendimento agora</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLeadCapture}
                className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-[#25D366]/20 border-none"
              >
                <MessageCircle size={24} />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Floating Mobile WhatsApp Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-[90]">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLeadCapture}
          className="w-14 h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-bounce-subtle"
        >
          <MessageCircle size={28} />
        </a>
      </div>

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

            <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center overflow-hidden">
              {images.length > 0 && (
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  animate={{ scale: zoom }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={cn(
                    "w-full h-full object-contain transition-all cursor-zoom-in",
                    zoom > 1 && "cursor-zoom-out"
                  )}
                  onClick={toggleZoom}
                  alt="Lightbox view"
                />
              )}

              {zoom === 1 && (
                <>
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
                </>
              )}

              <button
                onClick={toggleZoom}
                className="absolute bottom-24 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
              >
                <Maximize2 size={24} className={cn(zoom > 1 && "rotate-180")} />
              </button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
              {images.map((img, idx) => (
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
    </div >
  );
}
