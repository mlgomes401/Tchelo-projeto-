import React, { useState, useEffect } from 'react';
import {
    Plus,
    MoreHorizontal,
    MessageSquare,
    Phone,
    Clock,
    Car,
    ChevronRight,
    Search,
    Filter,
    Loader2,
    X
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

const columns = [
    { id: 'Novo', title: 'Leads Novos', color: 'bg-yellow-500' },
    { id: 'Em Atendimento', title: 'Em Atendimento', color: 'bg-blue-500' },
    { id: 'Fechado', title: 'Venda Concluída', color: 'bg-green-500' },
    { id: 'Perdido', title: 'Perdido / Sem Retorno', color: 'bg-red-500' },
];

export default function CrmAutomotivo() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', phone: '', vehicle: '' });

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

    const moveLead = async (id: number, newStatus: string) => {
        try {
            await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        } catch (err) {
            alert('Erro ao mover lead');
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicleId: 'manual',
                    vehicleName: newLead.vehicle,
                    clientName: newLead.name,
                    clientPhone: newLead.phone,
                    origin: 'Manual'
                })
            });
            setShowAddModal(false);
            setNewLead({ name: '', phone: '', vehicle: '' });
            fetchData();
        } catch (err) {
            alert('Erro ao adicionar lead');
        }
    };

    return (
        <div className="h-full flex flex-col space-y-8 pb-10">
            <PageHeader
                title="Funil de Vendas"
                subtitle="Acompanhe sua jornada de vendas de forma visual e intuitiva."
                breadcrumbs={['Vendas', 'Funil Kanban']}
                actions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Novo Lead
                    </button>
                }
            />

            <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
                    </div>
                ) : (
                    <div className="flex gap-6 h-full min-w-[1200px]">
                        {columns.map((column) => (
                            <div
                                key={column.id}
                                className="flex-1 min-w-[300px] flex flex-col bg-slate-900/40 rounded-[32px] border border-white/5 p-4"
                            >
                                <header className="flex items-center justify-between mb-6 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", column.color)} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{column.title}</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 bg-white/5 px-2 py-1 rounded-md">
                                        {leads.filter(l => l.status === column.id).length}
                                    </span>
                                </header>

                                <div className="flex-1 space-y-4 overflow-y-auto px-1 scrollbar-hide min-h-[400px]">
                                    <AnimatePresence mode='popLayout'>
                                        {leads
                                            .filter(l => l.status === column.id)
                                            .map((lead) => (
                                                <motion.div
                                                    key={lead.id}
                                                    layout
                                                    drag
                                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                                    dragElastic={0.1}
                                                    onDragEnd={(_, info) => {
                                                        if (info.offset.x > 100) {
                                                            const nextIdx = (columns.findIndex(c => c.id === column.id) + 1) % columns.length;
                                                            moveLead(lead.id, columns[nextIdx].id);
                                                        } else if (info.offset.x < -100) {
                                                            const prevIdx = (columns.findIndex(c => c.id === column.id) - 1 + columns.length) % columns.length;
                                                            moveLead(lead.id, columns[prevIdx].id);
                                                        }
                                                    }}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="bg-slate-950 border border-white/5 p-5 rounded-2xl group hover:border-brand-red/30 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-lg z-10"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-red/10 group-hover:bg-brand-red transition-colors" />

                                                    <div className="space-y-4 relative z-10">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-white font-bold text-sm tracking-tight mb-1">{lead.client_name}</h4>
                                                                <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                                                    <Car size={10} className="text-brand-red" />
                                                                    {lead.vehicle_name}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => window.location.href = '/crm/leads'}
                                                                className="text-white/20 hover:text-white transition-colors"
                                                                title="Ver Detalhes do Lead"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                            <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold">
                                                                <Clock size={12} />
                                                                {new Date(lead.created_at).toLocaleDateString()}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <a
                                                                    href={`https://wa.me/55${(lead.client_phone || '').replace(/\D/g, '')}`}
                                                                    target="_blank"
                                                                    className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all font-bold"
                                                                >
                                                                    <MessageSquare size={14} />
                                                                </a>
                                                                <button
                                                                    onClick={() => {
                                                                        const nextIdx = (columns.findIndex(c => c.id === column.id) + 1) % columns.length;
                                                                        moveLead(lead.id, columns[nextIdx].id);
                                                                    }}
                                                                    className="p-2 bg-white/5 text-white/40 rounded-lg hover:text-brand-red hover:bg-white/10 transition-all"
                                                                >
                                                                    <ChevronRight size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>

                                    {leads.filter(l => l.status === column.id).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-10 border-2 border-dashed border-white/20 rounded-2xl">
                                            <Plus size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Arraste aqui</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Lead Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <header className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider">Novo Lead Manual</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 text-white/30 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </header>

                            <form onSubmit={handleAddLead} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nome do Cliente</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-brand-red/50 outline-none"
                                        value={newLead.name}
                                        onChange={e => setNewLead(v => ({ ...v, name: e.target.value }))}
                                        placeholder="Digite o nome..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">WhatsApp</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-brand-red/50 outline-none"
                                        value={newLead.phone}
                                        onChange={e => setNewLead(v => ({ ...v, phone: e.target.value }))}
                                        placeholder="11999999999"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Veículo de Interesse</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-brand-red/50 outline-none"
                                        value={newLead.vehicle}
                                        onChange={e => setNewLead(v => ({ ...v, vehicle: e.target.value }))}
                                        placeholder="Ex: BMW M3"
                                    />
                                </div>

                                <button type="submit" className="btn-primary w-full py-4 text-sm mt-4">
                                    Criar Lead
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
