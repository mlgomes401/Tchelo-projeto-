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
import { Sparkles } from 'lucide-react';

export default function LojaVirtual() {
    const [settings, setSettings] = useState({
        storeName: 'AutoPage Pro',
        primaryColor: '#E31837',
        whatsapp: '',
        instagram: '',
        heroTitle: 'Encontre seu próximo<br />veículo <span className="text-brand-red">Premium</span>',
        welcomeText: 'Explore nossa curadoria de veículos selecionados com garantia de procedência e as melhores condições de financiamento.'
    });
    const [stats, setStats] = useState({ activeCars: 0, totalViews: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [storeId, setStoreId] = useState('store_demo');

    useEffect(() => {
        const savedStoreId = localStorage.getItem('store_id');
        if (savedStoreId) setStoreId(savedStoreId);
        // Fetch Settings
        fetch('/api/settings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Falha ao carregar configurações');
                return res.json();
            })
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setSettings(prev => ({ ...prev, ...data }));
                    if (data.views) {
                        setStats(prev => ({ ...prev, totalViews: parseInt(data.views, 10) }));
                    }
                }
                setIsLoaded(true);
            })
            .catch(err => {
                console.error("Settings load error:", err);
                setIsLoaded(true); // Permite ver a página mesmo com erro, mas mantém defaults se necessário
            });

        // Fetch Inventory Stats
        fetch('/api/vehicles', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
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
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(settings)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erro ao salvar configurações');
            }
            alert('Configurações salvas com sucesso!');
            window.location.reload();
        } catch (err: any) {
            console.error(err);
            alert('Falha ao salvar: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateAI = async () => {
        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/vehicles?storeId=' + storeId, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const vehicles = await res.json();
            const featured = vehicles.filter((v: any) => v.data && v.data.featured).slice(0, 5).map((v: any) => `${v.data.model} ${v.data.year}`).join(', ');

            const promptText = featured
                ? `Escreva UM ÚNICO PARÁGRAFO CURTO (máximo 3 linhas) de boas-vindas para uma loja de carros premium. Foco EXTREMO em vendas e conversão. Mencione que temos ofertas nestes destaques: ${featured}. Seja direto, persuasivo e minimalista. NUNCA use saudações genéricas.`
                : `Escreva UM ÚNICO PARÁGRAFO CURTO (máximo 3 linhas) de boas-vindas para uma loja de carros premium. Foco EXTREMO em conversão e escassez. Convide o cliente a ver o estoque exclusivo. Seja persuasivo e minimalista.`;

            const aiRes = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ prompt: promptText })
            });
            const data = await aiRes.json();
            if (!aiRes.ok) throw new Error(data.error || 'Falha na comunicação com a API de IA');

            const textResult = data.text || data.description;
            if (textResult) {
                setSettings({ ...settings, welcomeText: textResult });
            } else {
                alert('A IA não retornou um texto válido. Verifique as chaves de API.');
            }
        } catch (e: any) {
            console.error(e);
            alert('Erro ao comunicar com a IA: ' + e.message);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader
                title="Sua Vitrine Digital"
                subtitle="Gerencie sua loja pública e configurações de marca"
                breadcrumbs={['CRM', 'Vitrine Digital']}
                showBack
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">WhatsApp (Apenas Números)</label>
                                    <input
                                        value={settings.whatsapp}
                                        onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-3xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-medium"
                                        placeholder="Ex: 11999999999"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Instagram (Opcional)</label>
                                    <input
                                        value={settings.instagram}
                                        onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-3xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-medium"
                                        placeholder="Ex: @sua_loja"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Título Principal (Vitrine)</label>
                                <textarea
                                    value={(settings.heroTitle || '')
                                        .replace(/<br\s*\/?>/gi, '\n')
                                        .replace(/<span class="text-brand-red">(.*?)<\/span>/gi, '*$1*')
                                        .replace(/<span className="text-brand-red">(.*?)<\/span>/gi, '*$1*')}
                                    onChange={e => {
                                        const htmlVal = e.target.value
                                            .replace(/\n/g, '<br />')
                                            .replace(/\*(.*?)\*/g, '<span class="text-brand-red">$1</span>');
                                        setSettings({ ...settings, heroTitle: htmlVal });
                                    }}
                                    rows={3}
                                    className="w-full bg-slate-950 border border-white/10 rounded-3xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-medium leading-relaxed"
                                    placeholder="Ex: Encontre seu próximo veículo *Premium*"
                                />
                                <p className="text-[10px] text-white/30 font-medium ml-4 mt-2">Dica: Aperte ENTER para pular linha. Digite a palavra entre *asteriscos* para ela ficar vermelha (Ex: *Premium*).</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-4">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Texto de Boas Vindas (Vitrine)</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateAI}
                                        disabled={isGeneratingAI}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest disabled:opacity-50"
                                    >
                                        <Sparkles size={12} />
                                        {isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}
                                    </button>
                                </div>
                                <textarea
                                    value={settings.welcomeText || ''}
                                    onChange={e => setSettings({ ...settings, welcomeText: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-950 border border-white/10 rounded-3xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-medium leading-relaxed"
                                    placeholder="Escreva algo chamativo, ou use a IA para gerar."
                                />
                                <p className="text-[10px] text-white/30 font-medium ml-4 mt-2">Este texto aparece no banner principal da vitrine. Se gerar com a IA, ela lerá os carros que você marcou como "Destaque".</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
