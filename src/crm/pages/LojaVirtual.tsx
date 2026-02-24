import React, { useState, useEffect } from 'react';
import {
    Globe,
    ExternalLink,
    Palette,
    Car,
    Eye,
    Settings,
    Loader2,
    Save
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function LojaVirtual() {
    const [settings, setSettings] = useState({
        storeName: 'AutoPage Pro',
        primaryColor: '#E31837'
    });
    const [stats, setStats] = useState({ activeCars: 0, totalViews: 1245 });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [storeId, setStoreId] = useState('store_demo');

    useEffect(() => {
        // Obter storeId do token
        const token = localStorage.getItem('auth_token');
        if (token) {
            const parts = token.split('|');
            if (parts.length >= 2) setStoreId(parts[1]);
        }
        // Fetch Settings
        fetch('/api/settings')
            .then(res => {
                if (!res.ok) throw new Error('API not ready');
                return res.json();
            })
            .then(data => {
                setSettings(prev => ({ ...prev, ...data }));
            })
            .catch(err => console.error("Settings not loaded yet:", err))
            .finally(() => setIsLoaded(true));

        // Fetch Inventory Stats
        fetch('/api/vehicles')
            .then(res => {
                if (!res.ok) throw new Error('API not ready');
                return res.json();
            })
            .then(data => {
                const active = data.filter((v: any) => v.status !== 'Vendido').length;
                setStats(prev => ({ ...prev, activeCars: active }));
            })
            .catch(err => console.error("Stats not loaded yet:", err));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            // Reload to update sidebar if name changed
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader
                title="Sua Vitrine Digital"
                subtitle="Gerencie sua loja pública e configurações de marca"
                breadcrumbs={['CRM', 'Vitrine Digital']}
                actions={
                    <Link
                        to={`/loja?store=${storeId}`}
                        target="_blank"
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <ExternalLink size={16} />
                        Acessar Vitrine
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats & Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                                <Car size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xl tracking-tighter uppercase">Estoque Ativo</h3>
                                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Sincronizado na Vitrine</p>
                            </div>
                        </div>
                        <div className="text-5xl font-display font-black text-white">
                            {stats.activeCars} <span className="text-lg text-white/30 uppercase tracking-widest font-bold">veículos</span>
                        </div>
                        <Link to="/crm/cadastros/veiculos" className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-white transition-all">
                            Gerenciar Estoque
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-brand-red/20 to-transparent border border-brand-red/10 rounded-[40px] p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                                <Eye size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg tracking-tighter uppercase">Visitas Estimadas</h3>
                            </div>
                        </div>
                        <div className="text-4xl font-display font-black text-white">
                            {stats.totalViews} <span className="text-base text-brand-red uppercase tracking-widest font-bold">+12%</span>
                        </div>
                    </div>
                </div>

                {/* Configuration Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xl tracking-tighter uppercase">Configurações da Loja</h3>
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Personalize a identidade da sua vitrine pública</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Nome da Marca / Loja</label>
                                <input
                                    value={settings.storeName}
                                    onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                                    className="w-full bg-slate-950 border border-white/10 rounded-3xl py-5 px-8 text-white text-lg outline-none focus:border-brand-red/50 transition-all font-display font-bold"
                                    placeholder="Ex: Tchelo Motors"
                                />
                                <p className="text-[10px] text-white/30 font-medium ml-4 mt-2">Este nome aparecerá no cabeçalho e rodapé da sua vitrine pública.</p>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Palette size={14} className="text-white/40" />
                                    Aparência
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-between p-4 rounded-3xl border bg-brand-red/10 border-brand-red/30 text-white transition-all">
                                        <span className="text-xs font-bold">Modo Escuro (Elegante)</span>
                                        <div className="w-4 h-4 rounded-full bg-brand-red" />
                                    </button>
                                    <button disabled className="flex items-center justify-between p-4 rounded-3xl border bg-white/5 border-white/5 text-white/30 cursor-not-allowed">
                                        <span className="text-xs font-bold">Modo Claro (Em breve)</span>
                                        <div className="w-4 h-4 rounded-full bg-white/10" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
