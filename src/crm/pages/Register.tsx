import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Building2, User, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
    const [storeName, setStoreName] = useState('');
    const [storeWhatsapp, setStoreWhatsapp] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName, storeWhatsapp, name, username, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('store_id', data.storeId || '');
                navigate('/crm/dashboard');
            } else {
                setError(data.error || 'Erro ao criar conta. Tente novamente.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8 space-y-3"
                >
                    <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand-red/20">
                        <Car className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-black text-white tracking-tighter">Criar Conta</h1>
                        <p className="text-white/40 text-sm mt-1">Configure sua loja em segundos</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="pb-3 border-b border-white/10 mb-2">
                            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Dados da Loja</p>
                        </div>

                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                value={storeName}
                                onChange={e => setStoreName(e.target.value)}
                                placeholder="Nome da loja *"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                value={storeWhatsapp}
                                onChange={e => setStoreWhatsapp(e.target.value)}
                                placeholder="WhatsApp da loja"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 transition-all"
                            />
                        </div>

                        <div className="pb-3 border-b border-white/10 mb-2 pt-2">
                            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Dados de Acesso</p>
                        </div>

                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Seu nome *"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Usuário *"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                placeholder="Senha *"
                                required
                                minLength={6}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Criando conta...' : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Criar Minha Loja
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-6">
                        Já tem conta?{' '}
                        <Link to="/crm/login" className="text-brand-red hover:text-red-400 font-bold transition-colors">
                            Fazer login
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
