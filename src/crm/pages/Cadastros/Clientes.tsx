import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Trash2,
    Search,
    X,
    CheckCircle2,
    Mail,
    Phone,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../../components/PageHeader';
import { cn } from '../../../lib/utils';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    status: string;
    created_at: string;
}

export default function Clientes() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        status: 'Ativo'
    });

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient)
            });
            if (res.ok) {
                await fetchClients();
                setShowAddModal(false);
                setNewClient({ name: '', email: '', phone: '', cpf: '', status: 'Ativo' });
            }
        } catch (err) {
            console.error('Erro ao salvar cliente:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteClient = async (id: string) => {
        if (!confirm('Deseja excluir este cliente?')) return;
        try {
            const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setClients(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            console.error('Erro ao excluir cliente:', err);
        }
    };

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Cadastro de Clientes"
                subtitle="Gerencie sua base de clientes"
                breadcrumbs={['CRM', 'Clientes']}
                actions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20"
                    >
                        <Plus size={18} />
                        Novo Cliente
                    </button>
                }
            />

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou telefone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-brand-red/50 transition-all font-medium placeholder:text-white/20"
                />
            </div>

            {/* Clientes List */}
            {loading ? (
                <div className="text-center py-24 text-white/20 font-bold">Carregando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                    <Users className="mx-auto text-white/10" size={64} />
                    <p className="text-white/30 font-bold uppercase tracking-widest text-xs">
                        {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all"
                    >
                        <Plus size={16} /> Cadastrar Agora
                    </button>
                </div>
            ) : (
                <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                <tr>
                                    <th className="px-8 py-6">Cliente</th>
                                    <th className="px-8 py-6">E-mail</th>
                                    <th className="px-8 py-6">Telefone</th>
                                    <th className="px-8 py-6">CPF</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((c) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            key={c.id}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                                                        <User size={18} />
                                                    </div>
                                                    <span className="text-white font-bold text-sm group-hover:text-brand-red transition-colors">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-white/50 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-white/20" />
                                                    {c.email || <span className="text-white/20 italic">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-white/50 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-white/20" />
                                                    {c.phone || <span className="text-white/20 italic">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-white/40 text-sm tabular-nums">
                                                {c.cpf || <span className="text-white/20 italic">—</span>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    c.status === 'Ativo'
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-white/5 text-white/30"
                                                )}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => deleteClient(c.id)}
                                                    className="p-2 bg-white/5 hover:bg-red-500/10 rounded-xl text-white/20 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Novo Cliente</h2>
                                    <p className="text-white/40 text-xs font-medium">Preencha os dados do cliente</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white/5 text-white/30 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </header>

                            <form onSubmit={handleSave} className="p-8 space-y-5">
                                {[
                                    { label: 'Nome Completo *', field: 'name', type: 'text', placeholder: 'João da Silva', required: true },
                                    { label: 'E-mail', field: 'email', type: 'email', placeholder: 'joao@email.com', required: false },
                                    { label: 'Telefone / WhatsApp', field: 'phone', type: 'tel', placeholder: '(11) 99999-9999', required: false },
                                    { label: 'CPF', field: 'cpf', type: 'text', placeholder: '000.000.000-00', required: false },
                                ].map(({ label, field, type, placeholder, required }) => (
                                    <div key={field} className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</label>
                                        <input
                                            type={type}
                                            required={required}
                                            placeholder={placeholder}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={(newClient as any)[field]}
                                            onChange={e => setNewClient(prev => ({ ...prev, [field]: e.target.value }))}
                                        />
                                    </div>
                                ))}

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl text-white/40 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !newClient.name}
                                        className="flex-1 py-4 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />
                                        ) : (
                                            <><CheckCircle2 size={16} /> Salvar Cliente</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
