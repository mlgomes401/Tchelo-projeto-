import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Store,
    Palette,
    Globe,
    Shield,
    Bell,
    Save,
    CheckCircle2,
    Loader2,
    ChevronRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function Configuracao() {
    const [settings, setSettings] = useState({
        storeName: '',
        primaryColor: '#E31837',
        contactEmail: '',
        enableNotifications: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    useEffect(() => {
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
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            // Force reload or update context if needed
            window.location.reload(); // Simple way to update the sidebar name for now
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
                title="Configurações"
                subtitle="Gerencie as informações e preferências da sua plataforma"
                breadcrumbs={['CRM', 'Configurações']}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Salvar Alterações
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10 shadow-xl space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red">
                                <Store size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xl tracking-tighter uppercase">Minha Loja</h3>
                                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Identidade e marca</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Nome da Loja Virtual</label>
                                <input
                                    value={settings.storeName}
                                    onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-bold"
                                    placeholder="Ex: AutoPage Elite"
                                />
                                <p className="text-[9px] text-white/10 font-medium ml-4 uppercase tracking-widest italic">Este nome aparecerá na vitrine e nos títulos das páginas.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Cor Principal</label>
                                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <input
                                            type="color"
                                            value={settings.primaryColor}
                                            onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                            className="w-12 h-12 bg-transparent border-none rounded-lg cursor-pointer"
                                        />
                                        <span className="text-white/40 font-mono text-xs uppercase font-bold">{settings.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">E-mail de Contato</label>
                                    <input
                                        value={settings.contactEmail}
                                        onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-bold"
                                        placeholder="contato@loja.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10 shadow-xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Bell size={24} />
                            </div>
                            <h3 className="text-white font-black text-xl tracking-tighter uppercase">Notificações</h3>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 group hover:bg-white/[0.08] transition-all cursor-pointer"
                            onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}>
                            <div>
                                <p className="text-white font-bold text-sm">Alertas de Novos Leads</p>
                                <p className="text-white/20 text-[9px] uppercase font-black tracking-widest mt-1">Receba avisos instantâneos no navegador</p>
                            </div>
                            <div className={cn(
                                "w-14 h-8 rounded-full p-1 transition-all duration-300",
                                settings.enableNotifications ? "bg-green-500" : "bg-white/10"
                            )}>
                                <motion.div
                                    animate={{ x: settings.enableNotifications ? 24 : 0 }}
                                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl">
                        <Shield className="absolute top-0 right-0 text-white/5 w-48 h-48 -mr-16 -mt-16 -rotate-12 transition-transform group-hover:scale-110" />
                        <h4 className="text-white/20 font-black text-[10px] uppercase tracking-widest mb-10 relative z-10">Segurança do Sistema</h4>

                        <div className="space-y-4 relative z-10">
                            <button
                                onClick={() => window.location.href = '/crm/usuarios'}
                                className="w-full py-4 text-left px-6 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between group"
                            >
                                <span className="text-white/40 text-xs font-bold group-hover:text-white transition-colors">Gerenciar Usuários e Senhas</span>
                                <ChevronRight size={16} className="text-white/10 group-hover:text-brand-red" />
                            </button>
                            <button
                                onClick={() => {
                                    if (!is2FAEnabled) {
                                        alert('Um código de confirmação foi enviado para o seu e-mail. (Simulação)');
                                        setIs2FAEnabled(true);
                                    } else {
                                        setIs2FAEnabled(false);
                                    }
                                }}
                                className="w-full py-4 text-left px-6 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between group"
                            >
                                <span className={cn("text-xs font-bold transition-colors", is2FAEnabled ? "text-white" : "text-white/40 group-hover:text-white")}>Autenticação 2FA</span>
                                <span className={cn("text-[8px] font-black px-2 py-0.5 text-white rounded-full uppercase tracking-widest transition-colors", is2FAEnabled ? "bg-green-500" : "bg-brand-red")}>{is2FAEnabled ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-10">
                        <h4 className="text-white/30 font-black text-[10px] uppercase tracking-widest mb-6">Informações da Conta</h4>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-red to-orange-400 p-[2px]">
                                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-white text-xl">JD</div>
                            </div>
                            <div>
                                <p className="text-white font-black text-lg tracking-tight">John Doe</p>
                                <p className="text-brand-red text-[10px] font-black uppercase tracking-widest">Plano Platinum</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Uso de Dados</span>
                                <span className="text-[10px] font-black text-white tracking-widest">1.2GB / 10GB</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[12%] bg-brand-red rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
