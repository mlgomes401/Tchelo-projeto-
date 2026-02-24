import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Trash2,
    X,
    Phone,
    Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../components/PageHeader';
import { cn } from '../../lib/utils';

interface Lead {
    id: number;
    vehicle_id: string;
    vehicle_name: string;
    client_name: string;
    client_phone: string;
    origin: string;
    status: string;
    notes: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    'Novo': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    'Em Atendimento': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'Fechado': 'text-green-500 bg-green-500/10 border-green-500/20',
    'Perdido': 'text-red-500 bg-red-500/10 border-red-500/20',
};

export default function GestorLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
            if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
        } catch (err) {
            alert('Erro ao atualizar status');
        }
    };

    const deleteLead = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir permanentemente este lead?')) return;
        try {
            await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            setSelectedLead(null);
            fetchData();
        } catch (err) {
            alert('Erro ao excluir lead');
        }
    };

    const filteredLeads = leads.filter(l => {
        const matchesFilter = filter === 'Todos' || l.status === filter;
        const matchesSearch = l.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-8">
            <PageHeader
                title="Gestor de Leads"
                subtitle="Controle total sobre seus contatos e oportunidades de venda."
                breadcrumbs={['Vendas', 'Gestão de Leads']}
            />

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <div className="flex flex-wrap items-center gap-3">
                    {['Todos', 'Novo', 'Em Atendimento', 'Fechado', 'Perdido'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all border",
                                filter === f
                                    ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20"
                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou veículo..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-brand-red/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Leads Table/List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
                        <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Carregando Leads...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="glass-card p-20 text-center space-y-6 bg-slate-900/40">
                        <div className="w-20 h-20 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                            <AlertCircle size={40} className="text-white/10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Nenhum lead encontrado</h3>
                            <p className="text-white/30 text-sm max-w-xs mx-auto">Tente ajustar seus filtros ou termos de pesquisa para encontrar o que procura.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredLeads.map((lead, i) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group glass-card p-6 bg-slate-900/40 border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 flex items-center justify-center text-brand-red text-xl font-black shadow-inner">
                                        {lead.client_name?.charAt(0) || 'L'}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-white tracking-tight">{lead.client_name}</h3>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                statusColors[lead.status] || 'text-white/40 bg-white/5 border-white/10'
                                            )}>
                                                {lead.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold">
                                            <span className="text-brand-red uppercase tracking-wider">{lead.vehicle_name}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span className="text-white/30 flex items-center gap-1.5"><CalendarIcon size={12} /> {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span className="text-white/30 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">{lead.origin}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden lg:flex flex-col items-end px-6 border-r border-white/5">
                                        <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-1">Contato</p>
                                        <p className="text-sm font-bold text-white">{lead.client_phone}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        <a
                                            href={`https://wa.me/55${(lead.client_phone || '').replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="flex items-center gap-2 px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-all border border-green-500/20 font-bold text-sm"
                                        >
                                            <MessageSquare size={18} />
                                            Atender
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lead Detail Drawer/Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

                            <header className="p-10 border-b border-white/5 flex items-center justify-between relative">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-brand-red/30">
                                        {selectedLead.client_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-display font-black text-white tracking-tighter mb-1">{selectedLead.client_name}</h2>
                                        <div className="flex items-center gap-4">
                                            <span className="text-brand-red font-bold text-sm uppercase tracking-widest">{selectedLead.vehicle_name}</span>
                                            <span className="text-white/20 font-bold text-sm">•</span>
                                            <span className="text-white/40 font-bold text-sm flex items-center gap-2"><Phone size={14} /> {selectedLead.client_phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </header>

                            <div className="p-10 grid md:grid-cols-2 gap-10 relative">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Gestão de Status</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Novo', 'Em Atendimento', 'Fechado', 'Perdido'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(selectedLead.id, s)}
                                                    className={cn(
                                                        "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                        selectedLead.status === s
                                                            ? "bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/20"
                                                            : "bg-white/5 border-white/5 text-white/30 hover:border-white/20 hover:text-white"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Clock size={12} className="text-brand-red" />
                                            Histórico do Lead
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex gap-4 border-l-2 border-brand-red/20 pl-4 py-1">
                                                <div className="w-2 h-2 bg-brand-red rounded-full mt-1.5 -ml-[21px] ring-4 ring-slate-900" />
                                                <div>
                                                    <p className="text-xs font-bold text-white mb-1">Lead gerado via {selectedLead.origin}</p>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{new Date(selectedLead.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-8">
                                    <div className="flex-1 space-y-4">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Notas e Observações</h4>
                                        <textarea
                                            className="w-full h-full min-h-[200px] bg-slate-950 border border-white/5 rounded-[32px] p-6 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-medium placeholder:text-white/10"
                                            placeholder="Descreva a negociação, interesses específicos..."
                                            defaultValue={selectedLead.notes}
                                            onBlur={(e) => {
                                                fetch(`/api/leads/${selectedLead.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ notes: e.target.value })
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <a
                                            href={`https://wa.me/55${(selectedLead.client_phone || '').replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="flex-1 py-5 bg-brand-red text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-brand-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <MessageSquare size={18} />
                                            Iniciar Conversa
                                        </a>
                                        <button onClick={() => deleteLead(selectedLead.id)} className="p-5 bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-2xl transition-all border border-white/5 hover:border-red-500/20" title="Excluir Lead">
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
