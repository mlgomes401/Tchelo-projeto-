import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Trash2, User, Shield, Key, Loader2, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { cn } from '../../lib/utils';

interface AppUser {
    id: string;
    username: string;
    name: string;
    role: string;
    created_at: string;
}

export default function Usuarios() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    username: newUsername,
                    password: newPassword,
                    role: newRole
                })
            });

            if (res.ok) {
                await fetchUsers();
                setIsAddModalOpen(false);
                setNewName('');
                setNewUsername('');
                setNewPassword('');
                setNewRole('user');
            } else {
                const data = await res.json();
                setError(data.error || 'Erro ao criar usuário');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir usuário');
            }
        } catch (err) {
            alert('Erro ao conectar com o servidor');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Usuários"
                subtitle="Gerencie os acessos ao CRM"
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative group w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-red/50 transition-all focus:shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                    />
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-red/20 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span>Novo Usuário</span>
                </button>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 size={32} className="text-brand-red animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-900 border border-white/5 p-6 rounded-[24px] flex flex-col hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-red to-rose-400 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                        user.role === 'admin'
                                            ? "bg-brand-red/10 text-brand-red border border-brand-red/20"
                                            : "bg-white/5 text-white/50 border border-white/10"
                                    )}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-display font-bold text-white mb-1">{user.name}</h3>
                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                    <User size={14} />
                                    <span>@{user.username}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-white/30 hidden sm:block">
                                    Adicionado em {new Date(user.created_at).toLocaleDateString()}
                                </span>

                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors ml-auto sm:ml-0"
                                    title="Excluir Usuário"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-white/5 border-dashed rounded-[32px] bg-white/[0.02]">
                            <User className="mx-auto text-white/20 mb-4" size={48} />
                            <h3 className="text-white text-lg font-display font-medium mb-1">Nenhum Usuário Encontrado</h3>
                            <p className="text-white/40">Tente buscar por um termo diferente ou adicione um novo usuário.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-display font-bold text-white mb-6">Novo Usuário</h2>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                                        <AlertCircle size={18} className="shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-red/50 transition-colors"
                                        placeholder="Ex: João Silva"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Nome de Usuário (Login)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-red/50 transition-colors"
                                        placeholder="joaosilva"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-brand-red/50 transition-colors"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Nível de Acesso</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setNewRole('admin')}
                                            className={cn(
                                                "py-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                newRole === 'admin'
                                                    ? "bg-brand-red/10 border-brand-red text-brand-red"
                                                    : "bg-slate-950 border-white/5 text-white/50 hover:border-white/20"
                                            )}
                                        >
                                            <Shield size={20} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Administrador</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewRole('user')}
                                            className={cn(
                                                "py-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                newRole === 'user'
                                                    ? "bg-white/10 border-white/20 text-white"
                                                    : "bg-slate-950 border-white/5 text-white/50 hover:border-white/20"
                                            )}
                                        >
                                            <User size={20} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Usuário Padrão</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 py-3 bg-brand-red hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        {formLoading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>Salvar Usuário</>
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
