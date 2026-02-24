import React, { useState, useMemo, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    FileText,
    Calendar,
    Download,
    Plus,
    Filter,
    Search,
    ChevronRight,
    MoreVertical,
    X,
    Trash2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { cn, formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Transaction {
    id: string;
    description: string;
    category: string;
    amount: number;
    type: 'entrada' | 'saida';
    date: string;
    status: 'Concluído' | 'Pendente';
}

const initialTransactions: Transaction[] = [
    {
        id: '1',
        description: 'Venda Toyota Corolla XEI 2023',
        category: 'Venda de Veículo',
        amount: 145000,
        type: 'entrada',
        date: '24/05/2024',
        status: 'Concluído'
    },
    {
        id: '2',
        description: 'Manutenção Preventiva Frota',
        category: 'Serviços',
        amount: 4200.50,
        type: 'saida',
        date: '23/05/2024',
        status: 'Pendente'
    },
    {
        id: '3',
        description: 'Compra Chevrolet Onix 2022',
        category: 'Aumento de Estoque',
        amount: 72000,
        type: 'saida',
        date: '22/05/2024',
        status: 'Concluído'
    },
    {
        id: '4',
        description: 'Parcial Financiamento Santander',
        category: 'Comissão Financiamento',
        amount: 2850,
        type: 'entrada',
        date: '21/05/2024',
        status: 'Concluído'
    }
];

export default function Financeiro() {
    const [transactionList, setTransactionList] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [viewReceipt, setViewReceipt] = useState<Transaction | null>(null);
    const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'date' | 'status'>>({
        description: '',
        category: 'Venda de Veículo',
        amount: 0,
        type: 'entrada'
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/transactions');
            if (res.ok) {
                const data = await res.json();
                setTransactionList(data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const entrada = transactionList.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const saida = transactionList.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);
        return {
            balance: entrada - saida,
            entrada,
            saida
        };
    }, [transactionList]);

    const filteredTransactions = transactionList.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === 'Todas' || t.category === filterCategory;
        return matchSearch && matchCategory;
    });

    const exportCSV = () => {
        const headers = ["ID", "Descrição", "Categoria", "Valor", "Tipo", "Data", "Status"];
        const rows = transactionList.map(t => [t.id, t.description, t.category, t.amount, t.type, t.date, t.status]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_financeiro.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTransaction,
                    date: new Date().toLocaleDateString('pt-BR'),
                    status: 'Concluído'
                })
            });

            if (res.ok) {
                await fetchTransactions(); // Refresh list after adding
                setShowAddModal(false);
                setNewTransaction({
                    description: '',
                    category: 'Venda de Veículo',
                    amount: 0,
                    type: 'entrada'
                });
            }
        } catch (error) {
            console.error("Failed to add transaction:", error);
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTransactionList(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete transaction:", error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader
                title="Financeiro"
                subtitle="Gestão de fluxo de caixa, transações e balanço"
                breadcrumbs={['CRM', 'Financeiro']}
                actions={
                    <div className="flex gap-4">
                        <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900/40 hover:bg-slate-800 text-white/60 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                            <Download size={18} />
                            Exportar CSV
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20"
                        >
                            <Plus size={18} />
                            Nova Transação
                        </button>
                    </div>
                }
            />

            {/* Balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard index={0} label="Saldo em Conta" value={formatCurrency(stats.balance)} icon={Wallet} trend="+5.4k este mês" color="text-blue-500" />
                <StatCard index={1} label="Receitas (Total)" value={formatCurrency(stats.entrada)} icon={TrendingUp} trend="+12%" color="text-green-500" />
                <StatCard index={2} label="Despesas (Total)" value={formatCurrency(stats.saida)} icon={TrendingDown} trend="+2.1%" color="text-red-500" />
                <StatCard index={3} label="Transações" value={transactionList.length.toString()} icon={DollarSign} trend="Total geral" color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* transactions Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-white font-black text-xl tracking-tighter">Últimas Transações</h3>
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-1">Fluxo de caixa em tempo real</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filtrar por descrição..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs text-white outline-none focus:border-brand-red/50 transition-all font-bold w-64 placeholder:text-white/10"
                                    />
                                </div>
                                <select
                                    className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-brand-red/50 transition-all font-bold appearance-none cursor-pointer"
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                >
                                    <option value="Todas">Todas Categorias</option>
                                    <option value="Venda de Veículo">Venda de Veículo</option>
                                    <option value="Serviços">Serviços</option>
                                    <option value="Aumento de Estoque">Aumento de Estoque</option>
                                    <option value="Comissão Financiamento">Comissão Financiamento</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.01] text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                    <tr>
                                        <th className="px-8 py-6">Descrição</th>
                                        <th className="px-8 py-6">Categoria</th>
                                        <th className="px-8 py-6 text-center">Data</th>
                                        <th className="px-8 py-6 text-right">Valor</th>
                                        <th className="px-8 py-6 text-center">Status</th>
                                        <th className="px-8 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredTransactions.map((tx) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                key={tx.id}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg",
                                                            tx.type === 'entrada' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                                        )}>
                                                            {tx.type === 'entrada' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                                        </div>
                                                        <span className="text-white font-bold text-sm tracking-tight group-hover:text-brand-red transition-colors">{tx.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">{tx.category}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center text-white/20 text-xs tabular-nums font-bold">
                                                    {tx.date}
                                                </td>
                                                <td className="px-8 py-6 text-right tabular-nums">
                                                    <span className={cn(
                                                        "text-sm font-black",
                                                        tx.type === 'entrada' ? "text-green-400" : "text-white"
                                                    )}>
                                                        {tx.type === 'entrada' ? '+' : '-'} {formatCurrency(tx.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={cn(
                                                        "text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border transition-all",
                                                        tx.status === 'Concluído' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                                    )}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => deleteTransaction(tx.id)}
                                                            className="p-2.5 text-white/20 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button onClick={() => setViewReceipt(tx)} className="p-2.5 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Ver Comprovante">
                                                            <FileText size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Cash Flow and Cards */}
                <div className="space-y-8">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-white font-black text-sm uppercase tracking-widest">Metas Mensais</h4>
                        </div>

                        <div className="space-y-8">
                            {[
                                { name: 'Venda de Veículos', current: stats.entrada, target: Math.max(stats.entrada * 1.5, 50000), color: 'bg-brand-red' },
                                { name: 'Meta de Receita', current: stats.entrada, target: Math.max(stats.entrada * 2, 100000), color: 'bg-blue-500' }
                            ].map((goal) => {
                                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                                return (
                                    <div key={goal.name} className="group">
                                        <div className="flex items-center justify-between text-xs mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-white/40 font-black uppercase tracking-widest text-[9px] mb-1">{goal.name}</span>
                                                <span className="text-white font-black text-lg">{percent}%</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-white/20 text-[9px] font-black uppercase block">Faltam</span>
                                                <span className="text-white/40 font-black text-[10px]">R$ {((goal.target - goal.current) / 1000).toFixed(0)}k</span>
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={cn("h-full rounded-full shadow-lg", goal.color)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 rounded-[40px] p-8 relative overflow-hidden group shadow-2xl">
                        <CreditCard className="absolute top-0 right-0 text-white/5 w-48 h-48 -mr-16 -mt-16 -rotate-12 transition-transform group-hover:scale-110" />
                        <h4 className="text-white/20 font-black text-[10px] uppercase tracking-widest mb-10 relative z-10">Business Platinum</h4>

                        <div className="mb-10 relative z-10">
                            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest block mb-1">Saldo Real em Conta</span>
                            <span className="text-white font-black text-3xl tracking-tighter">{formatCurrency(stats.balance)}</span>
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => alert('Pagamento simulado com sucesso. Saldo atualizado!')} className="flex-1 bg-white text-slate-900 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg">
                                Pagar
                            </button>
                            <button onClick={() => alert('Transferência via PIX simulada com sucesso.')} className="flex-1 border border-white/10 text-white py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                Transferir PIX
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Comprovante */}
            <AnimatePresence>
                {viewReceipt && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="w-full max-w-sm bg-white rounded-3xl p-8 relative"
                        >
                            <button onClick={() => setViewReceipt(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-800"><X size={16} /></button>
                            <div className="text-center space-y-4">
                                <FileText size={48} className="mx-auto text-brand-red" />
                                <h3 className="font-black text-xl text-slate-800 uppercase">Comprovante</h3>
                                <div className="text-left bg-slate-50 p-4 rounded-xl space-y-2 mt-6">
                                    <p className="text-xs text-slate-500 uppercase font-bold">ID: <span className="text-slate-900">{viewReceipt.id}</span></p>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Data: <span className="text-slate-900">{viewReceipt.date}</span></p>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Categoria: <span className="text-slate-900">{viewReceipt.category}</span></p>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Status: <span className="text-slate-900">{viewReceipt.status}</span></p>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-3xl font-black text-slate-900">{viewReceipt.type === 'entrada' ? '+' : '-'} {formatCurrency(viewReceipt.amount)}</p>
                                    <p className="text-sm font-bold text-slate-500 mt-2">{viewReceipt.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Nova Transação Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[48px] shadow-2xl overflow-hidden shadow-brand-red/10"
                        >
                            <header className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Nova Transação</h2>
                                        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Registro Financeiro Pro</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </header>

                            <form onSubmit={handleAddTransaction} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-4 p-1.5 bg-white/5 rounded-3xl border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setNewTransaction({ ...newTransaction, type: 'entrada' })}
                                        className={cn(
                                            "py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all",
                                            newTransaction.type === 'entrada' ? "bg-green-500 text-white shadow-lg" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewTransaction({ ...newTransaction, type: 'saida' })}
                                        className={cn(
                                            "py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all",
                                            newTransaction.type === 'saida' ? "bg-red-500 text-white shadow-lg" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        Saída
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Descrição</label>
                                        <input
                                            required
                                            value={newTransaction.description}
                                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-bold placeholder:text-white/5"
                                            placeholder="Ex: Pagamento Fornecedor de Pneus"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Valor (R$)</label>
                                            <input
                                                required
                                                type="number"
                                                value={newTransaction.amount}
                                                onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-black"
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">Categoria</label>
                                            <select
                                                value={newTransaction.category}
                                                onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white text-sm outline-none focus:border-brand-red/50 transition-all font-black appearance-none cursor-pointer"
                                            >
                                                <option>Venda de Veículo</option>
                                                <option>Serviços</option>
                                                <option>Manutenção</option>
                                                <option>Aumento de Estoque</option>
                                                <option>Marketing</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-6 py-6 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-brand-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Confirmar Transação
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
