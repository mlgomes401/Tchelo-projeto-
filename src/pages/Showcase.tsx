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
    ChevronRight
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

    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const urlStoreId = query.get('store') || 'store_demo';

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
                }

                // Fetch vehicles
                const res = await fetch(`/api/vehicles?storeId=${urlStoreId}`);
                if (!res.ok) throw new Error('API not ready');
                const data = await res.json();
                // Ensure data is parsed correctly (server returns JSON string for 'data' field)
                const formattedData = data.map((v: any) => ({
                    ...v,
                    data: typeof v.data === 'string' ? JSON.parse(v.data) : v.data
                }));
                setVehicles(formattedData.filter((v: VehicleWithId) => v.status !== 'Vendido'));
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehiclesAndSettings();
    }, []);

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.data.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.data.version.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || v.status === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans">
            {/* Navigation */}
            <nav className="h-20 border-b border-white/5 bg-brand-dark/50 backdrop-blur-xl sticky top-0 z-[100] px-6">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/20">
                            <Car className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-white font-display font-bold text-lg tracking-tight uppercase max-w-[150px] truncate">{storeName}</h1>
                            <p className="text-brand-red text-[10px] font-bold uppercase tracking-[0.2em]">Showroom Digital</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {storeInstagram && (
                            <a
                                href={`https://instagram.com/${storeInstagram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-white/5 hover:bg-pink-500/10 text-white/50 hover:text-pink-500 rounded-xl transition-all"
                                title="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                        )}
                        <a href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, '')}?text=Olá! Vim pelo site da vitrine e gostaria de atendimento.`} target="_blank" rel="noreferrer" className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2">
                            <Phone size={16} />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-6">
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
                        className="text-5xl md:text-7xl font-display font-black tracking-tighter"
                    >
                        Encontre seu próximo<br />veículo <span className="text-brand-red">Premium</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 text-lg max-w-2xl mx-auto font-medium"
                    >
                        Explore nossa curadoria de veículos selecionados com garantia de procedência e as melhores condições de financiamento.
                    </motion.p>
                </div>
            </section >

            {/* Filter Bar */}
            < div className="max-w-7xl mx-auto px-6 sticky top-20 z-50 mt-12 mb-16" >
                <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-900/60 backdrop-blur-2xl border-white/10 shadow-2xl">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar por modelo, marca ou versão..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white outline-none focus:border-brand-red/30 transition-all font-medium placeholder:text-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {['Todos', 'Disponível', 'Reservado'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                    selectedCategory === cat
                                        ? "bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/20"
                                        : "bg-white/5 border-white/5 text-white/30 hover:border-white/20 hover:text-white"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div >

            {/* Grid de Veículos */}
            < main className="max-w-7xl mx-auto px-6 pb-32" >
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
                                            <div className="aspect-[16/10] overflow-hidden relative">
                                                <img
                                                    src={v.data.images[0]}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    alt={v.data.model}
                                                />
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg",
                                                        v.status === 'Disponível' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                    )}>
                                                        {v.status}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <span className="text-white font-display font-black text-2xl tracking-tighter">
                                                        {formatCurrency(Number(v.data.price))}
                                                    </span>
                                                    <div className="bg-brand-red text-white p-2 rounded-xl shadow-lg shadow-brand-red/30">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 space-y-6">
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-display font-black text-white group-hover:text-brand-red transition-colors leading-tight">
                                                        {v.data.model}
                                                    </h3>
                                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{v.data.version}</p>
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
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Suporte</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><button className="hover:text-brand-red transition-colors">Termos de Uso</button></li>
                                <li><button className="hover:text-brand-red transition-colors">Privacidade</button></li>
                                <li><button className="hover:text-brand-red transition-colors">Contato</button></li>
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
