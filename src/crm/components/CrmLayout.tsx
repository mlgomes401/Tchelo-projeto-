import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Plus, Calendar, Car, User, Target, X, Menu, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CrmLayoutProps {
    children: React.ReactNode;
}

export default function CrmLayout({ children }: CrmLayoutProps) {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isNewOpen, setIsNewOpen] = React.useState(false);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);

    return (
        <div className="flex min-h-screen bg-brand-dark">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col min-h-screen relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

                {/* Topbar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="text-white/50 flex items-center gap-2 text-sm font-medium">
                            <Calendar size={16} className="text-brand-red" />
                            <span>24 de Fevereiro, 2024</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative flex items-center">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.input
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 250, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        autoFocus
                                        placeholder="Pesquisar registros..."
                                        className="absolute right-8 h-10 bg-white/5 border border-white/10 rounded-full px-4 text-sm text-white outline-none focus:border-brand-red/50"
                                    />
                                )}
                            </AnimatePresence>
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition-all">
                                {isSearchOpen ? <X size={18} /> : <Search size={18} />}
                            </button>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition-all relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full" />
                            </button>
                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-12 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                                    >
                                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Notificações</h4>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-brand-red/10 rounded-xl relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
                                                <p className="text-white text-xs font-bold leading-tight mb-1">Novo lead de Financiamento</p>
                                                <p className="text-white/40 text-[10px] font-medium tracking-wide">Há 5 minutos - Tchelo Motors</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                                <p className="text-white/80 text-xs font-bold leading-tight mb-1">Aprovação crédito Santander</p>
                                                <p className="text-white/40 text-[10px] font-medium tracking-wide">Há 2 horas - Carlos Silva</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Quick Add Menu */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setIsNewOpen(!isNewOpen)}
                                className="flex items-center justify-center w-10 h-10 bg-brand-red hover:bg-red-700 text-white rounded-xl shadow-lg shadow-brand-red/20 transition-all font-black"
                            >
                                <Plus size={20} />
                            </button>
                            <AnimatePresence>
                                {isNewOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-14 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                                    >
                                        <a href="/crm/leads" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                            <Target size={14} className="text-brand-red" /> Lead
                                        </a>
                                        <a href="/crm/veiculos" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                            <Car size={14} className="text-blue-500" /> Veículo
                                        </a>
                                        <a href="/crm/usuarios" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                            <User size={14} className="text-purple-500" /> Usuário
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        <button
                            onClick={() => {
                                localStorage.removeItem('auth_token');
                                window.location.href = '/crm/login';
                            }}
                            className="text-white/50 hover:text-brand-red transition-colors relative"
                            title="Sair do Sistema"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 md:p-12 relative z-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div >
    );
}
