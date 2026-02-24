import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Plus, Calendar, Car, User, Target, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CrmLayoutProps {
    children: React.ReactNode;
}

export default function CrmLayout({ children }: CrmLayoutProps) {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isNewOpen, setIsNewOpen] = React.useState(false);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

    return (
        <div className="flex min-h-screen bg-brand-dark">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
                        >
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content — no ml on mobile, ml-64 on desktop */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden w-0">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

                {/* Topbar */}
                <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="text-white/50 hidden sm:flex items-center gap-2 text-sm font-medium">
                            <Calendar size={16} className="text-brand-red" />
                            <span className="text-xs">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search */}
                        <div className="relative hidden sm:flex items-center">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.input
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 200, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        autoFocus
                                        placeholder="Pesquisar..."
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
                                        className="absolute right-0 top-12 w-72 md:w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                                    >
                                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Notificações</h4>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-brand-red/10 rounded-xl relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
                                                <p className="text-white text-xs font-bold leading-tight mb-1">Novo lead de Financiamento</p>
                                                <p className="text-white/40 text-[10px] font-medium">Há 5 minutos - Tchelo Motors</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Quick Add */}
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
                                        <a href="/crm/cadastros/veiculos" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                            <Car size={14} className="text-blue-500" /> Veículo
                                        </a>
                                        <a href="/crm/cadastros/clientes" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                            <User size={14} className="text-purple-500" /> Cliente
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="w-px h-6 bg-white/10" />

                        <button
                            onClick={() => {
                                localStorage.removeItem('auth_token');
                                window.location.href = '/crm/login';
                            }}
                            className="text-white/50 hover:text-brand-red transition-colors"
                            title="Sair"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 lg:p-12 relative z-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
