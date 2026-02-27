import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Car,
    Search,
    Filter,
    ArrowRight,
    MessageSquare,
    Calendar,
    Gauge,
    MapPin,
    TrendingUp,
    Instagram,
    Phone,
    ChevronRight,
    X,
    MessageCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { VehicleData } from '../types';
import { formatCurrency, formatKM, cn } from '../lib/utils';

interface VehicleWithId {
    id: string;
    data: VehicleData;
    status: string;
    created_at: string;
}

export default function Showcase() {
    const [vehicles, setVehicles] = useState<VehicleWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [storeName, setStoreName] = useState('AutoPage');
    const [storeWhatsapp, setStoreWhatsapp] = useState('');
    const [storeInstagram, setStoreInstagram] = useState('');

    const [welcomeText, setWelcomeText] = useState('');
    const [heroTitle, setHeroTitle] = useState('Encontre seu próximo<br />veículo <span class="text-brand-red">Premium</span>');
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadInfo, setLeadInfo] = useState({ name: '', phone: '', email: '', tradeIn: '', financing: '' });

    const location = useLocation();

    const whatsappUrl = `https://wa.me/55${storeWhatsapp.replace(/\\D/g, '')}?text=Olá! Vim pelo site da vitrine e gostaria de atendimento.`;

    const handleLeadCapture = async (e?: React.MouseEvent) => {
        if (!showLeadForm) {
            e?.preventDefault();
            setShowLeadForm(true);
            return;
        }

        try {
            const query = new URLSearchParams(location.search);
            const urlStoreId = query.get('store') || 'store_demo';
            const notes = `Contato Geral da Vitrine | Troca: ${leadInfo.tradeIn || 'Não informado'} | Financiar: ${leadInfo.financing || 'Não informado'}`;

            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicleId: 'vitrine_geral',
                    vehicleName: 'Contato Vitrine Geral',
                    clientName: leadInfo.name,
                    clientEmail: leadInfo.email,
                    clientPhone: leadInfo.phone,
                    origin: 'Site',
                    notes: notes,
                    storeId: urlStoreId
                })
            });
            window.open(whatsappUrl, '_blank');
            setShowLeadForm(false);
            setLeadInfo({ name: '', phone: '', email: '', tradeIn: '', financing: '' });
        } catch (error) {
            console.error("Failed to capture lead:", error);
            window.open(whatsappUrl, '_blank');
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const urlStoreId = query.get('store') || 'store_demo';

        // Métrica silenciosa de visita à loja
        fetch(`/api/settings?storeId=${urlStoreId}&action=view`, { method: 'POST' }).catch(() => { });

        const fetchVehiclesAndSettings = async () => {
            try {
                // Fetch settings
                const settingsRes = await fetch(`/api/settings?storeId=${urlStoreId}`).catch(() => null);
                if (settingsRes && settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    if (settingsData.storeName) {
                        setStoreName(settingsData.storeName);
                        document.title = `${settingsData.storeName} - Digital Showcase`;
                    }
                    if (settingsData.whatsapp) setStoreWhatsapp(settingsData.whatsapp);
                    if (settingsData.instagram) setStoreInstagram(settingsData.instagram);
                    if (settingsData.welcomeText) setWelcomeText(settingsData.welcomeText);
                    if (settingsData.heroTitle) setHeroTitle(settingsData.heroTitle);
                }

                // Fetch vehicles
                const res = await fetch(`/api/vehicles?storeId=${urlStoreId}`);
                if (!res.ok) throw new Error('API not ready');
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error('Invalid data format received');
                // Ensure data is parsed correctly (server returns JSON string for 'data' field)
                const formattedData = data.map((v: any) => ({
                    ...v,
                    data: typeof v.data === 'string' ? JSON.parse(v.data) : (v.data || {})
                }));
                setVehicles(formattedData.filter((v: VehicleWithId) => v.status !== 'Vendido'));
            } catch (err) {
                console.error('Error fetching data:', err);
                setVehicles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVehiclesAndSettings();
    }, []);

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.data.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.data.version.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' ||
            (selectedCategory === 'Destaques' && v.data.featured) ||
            v.status === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans relative">
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
                                    className="btn-primary w-full py-4 text-lg disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Abrir WhatsApp
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav className="h-20 border-b border-white/5 bg-brand-dark/80 backdrop-blur-2xl sticky top-0 z-[100] px-4 md:px-6">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                            <Car className="text-white w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-white font-medium text-lg tracking-wide">{storeName}</h1>
                            <span className="w-1 h-1 rounded-full bg-white/20 hidden md:block"></span>
                            <p className="text-white/40 text-xs tracking-widest uppercase hidden md:block">Showroom</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                        {storeInstagram && (
                            <a href={`https://instagram.com/${storeInstagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
                                <Instagram size={20} className="md:w-4 md:h-4" />
                                <span className="hidden md:inline">Instagram</span>
                            </a>
                        )}
                        <button onClick={handleLeadCapture} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
                            <Phone size={20} className="md:w-4 md:h-4" />
                            <span className="hidden md:inline">Contato</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red/10 border border-brand-red/20 rounded-full text-brand-red text-[10px] font-black uppercase tracking-widest"
                    >
                        <TrendingUp size={14} />
                        Ofertas Exclusivas de Hoje
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter"
                        dangerouslySetInnerHTML={{ __html: heroTitle }}
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 text-lg max-w-2xl mx-auto font-medium"
                    >
                        {welcomeText || 'Explore nossa curadoria de veículos selecionados com garantia de procedência e as melhores condições de financiamento.'}
                    </motion.p>
                </div>
            </section >

            {/* Filter Bar - Minimalist */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-50 mt-6 mb-10 md:mt-8 md:mb-12">
                <div className="flex flex-col gap-6">
                    {/* Minimal Search Input */}
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar veículos..."
                            className="w-full bg-transparent border-b border-white/20 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-brand-red transition-all placeholder:text-white/30 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-brand-red transition-colors" size={18} />
                    </div>

                    {/* Horizontal Scrollable Categories */}
                    <div className="flex items-center w-full overflow-x-auto pb-4 scrollbar-hide gap-3 snap-x">
                        {['Todos', 'Destaques', 'Disponível', 'Reservado'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap snap-start border hover:border-white/40",
                                    selectedCategory === cat
                                        ? "bg-white text-brand-dark border-white shadow-xl shadow-white/10"
                                        : "bg-transparent text-white/50 border-white/10 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid de Veículos */}
            < main className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-32" >
                {
                    loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6" >
                            <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
                            <p className="text-white/30 text-sm font-black uppercase tracking-[0.2em] animate-pulse">Consultando estoque...</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="py-32 text-center space-y-6 max-w-sm mx-auto">
                            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/5 rotate-12">
                                <Car size={40} className="text-white/10 -rotate-12" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white">Nenhum veículo disponível</h3>
                            <p className="text-white/30 text-sm">Não encontramos nenhum carro correspondente à sua busca no momento.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
                                className="text-brand-red font-black text-[10px] uppercase tracking-widest hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode='popLayout'>
                                {filteredVehicles.map((v, i) => (
                                    <motion.div
                                        key={v.id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            to={`/v/${v.id}`}
                                            className="group block glass-card overflow-hidden bg-slate-900/40 border-white/5 hover:border-brand-red/30 transition-all duration-500 shadow-xl"
                                        >
                                            <div className="overflow-hidden relative shrink-0 aspect-[16/10]">
                                                <img
                                                    src={v.data?.images?.[0] || ''}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    alt={v.data?.model || 'Carro'}
                                                />
                                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg",
                                                        v.status === 'Disponível' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                    )}>
                                                        {v.status}
                                                    </span>
                                                    {v.data?.featured && (
                                                        <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg bg-purple-500/20 text-purple-400 border-purple-500/30 w-fit">
                                                            ★ Destaque
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end transform opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <span className="text-white font-display font-black text-2xl tracking-tighter drop-shadow-xl">
                                                        {formatCurrency(Number(v.data.price))}
                                                    </span>
                                                    <div className="bg-brand-red text-white p-2 rounded-xl shadow-lg shadow-brand-red/30">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-display font-black text-white group-hover:text-brand-red transition-colors leading-tight">
                                                            {v.data.model}
                                                        </h3>
                                                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{v.data.version}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                                                    <div className="flex items-center gap-3 text-white/40">
                                                        <div className="p-2 bg-white/5 rounded-lg">
                                                            <Calendar size={14} className="text-brand-red" />
                                                        </div>
                                                        <span className="text-xs font-black tabular-nums">{v.data.year}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-white/40">
                                                        <div className="p-2 bg-white/5 rounded-lg">
                                                            <Gauge size={14} className="text-brand-red" />
                                                        </div>
                                                        <span className="text-xs font-black tabular-nums">{formatKM(Number(v.data.km))}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-white/20">
                                                        <MapPin size={12} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{v.data.city}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-brand-red font-black text-[10px] uppercase tracking-widest">
                                                        Ver Detalhes
                                                        <ChevronRight size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                }
            </main >

            {/* Footer */}
            < footer className="bg-slate-950 border-t border-white/5 py-20 px-6" >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="space-y-6 max-w-xs">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center">
                                <Car className="text-white" size={24} />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white uppercase truncate">{storeName}</h2>
                        </div>
                        <p className="text-white/30 text-sm leading-relaxed">
                            A plataforma definitiva para revendedores de veículos premium que buscam excelência digital.
                        </p>
                    </div>

                    <div className="flex gap-12">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Plataforma</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><Link to="/loja" className="hover:text-brand-red transition-colors">Estoque</Link></li>
                                <li><Link to="/crm" className="hover:text-brand-red transition-colors">CRM Elite</Link></li>
                                <li><button className="hover:text-brand-red transition-colors">Financiamento</button></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Suporte e Contato</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                {storeInstagram && (
                                    <li><a href={`https://instagram.com/${storeInstagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><Instagram size={14} /> {storeInstagram}</a></li>
                                )}
                                <li><a href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, '')}?text=Olá!`} target="_blank" rel="noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2"><Phone size={14} /> Suporte WhatsApp</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
                        © 2024 {storeName}. Todos os direitos reservados.
                    </p>
                </div>
            </footer >


        </div >
    );
}
