import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    TrendingUp,
    Car,
    CheckCircle2,
    Target,
    ArrowUpRight,
    ExternalLink,
    Store
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface Stats {
    totalVehicles: number;
    soldVehicles: number;
    totalLeads: number;
    conversionRate: string;
    monthlyData: { month: string; count: number }[];
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState<'mensal' | 'semanal'>('mensal');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statsList = [
        { label: 'Total Veículos', value: stats?.totalVehicles, icon: Car, color: 'text-blue-500', trend: '+12%', path: '/crm/cadastros/veiculos' },
        { label: 'Veículos Vendidos', value: stats?.soldVehicles, icon: CheckCircle2, color: 'text-green-500', trend: '+5%', path: '/crm/cadastros/veiculos' },
        { label: 'Total Leads (Mês)', value: stats?.totalLeads, icon: MessageSquare, color: 'text-brand-red', trend: '+18%', path: '/crm/leads' },
        { label: 'Taxa de Conversão', value: `${stats?.conversionRate || 0}%`, icon: Target, color: 'text-purple-500', trend: '+2%', path: '/crm/funil' },
    ];

    return (
        <div className="space-y-10">
            <PageHeader
                title="Dashboard"
                subtitle="Bem-vindo ao centro de comando da sua revenda."
                breadcrumbs={['CRM', 'Visão Geral']}
                actions={
                    <div className="flex items-center gap-3">
                        <Link
                            to="/loja"
                            target="_blank"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Store size={18} />
                            Ver Vitrine Online
                        </Link>
                    </div>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsList.map((stat, i) => (
                    <Link key={i} to={stat.path || '#'}>
                        <StatCard {...stat} index={i} />
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 glass-card p-8 bg-slate-900/40 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-red/10 rounded-lg">
                                <TrendingUp size={20} className="text-brand-red" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Desempenho de Vendas</h3>
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                            <button onClick={() => setPeriodo('mensal')} className={cn("px-4 py-1 rounded-md text-xs font-bold transition-colors", periodo === 'mensal' ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}>Mensal</button>
                            <button onClick={() => setPeriodo('semanal')} className={cn("px-4 py-1 rounded-md text-xs font-bold transition-colors", periodo === 'semanal' ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}>Semanal</button>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.monthlyData || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E31D2D" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#E31D2D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                                />
                                <YAxis
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        border: '1px solid #ffffff10',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#E31D2D', marginBottom: '4px', fontWeight: 'black' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#E31D2D"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={4}
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lead Origins */}
                <div className="glass-card p-8 bg-slate-900/40 border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-brand-red/10 rounded-lg">
                            <ArrowUpRight size={20} className="text-brand-red" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Origem de Leads</h3>
                    </div>

                    <div className="space-y-6">
                        {(stats?.totalLeads || 0) > 0 ? [
                            { label: 'Site Oficial', value: 100, color: 'bg-brand-red' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white font-bold text-sm tracking-wide">{item.label}</p>
                                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{item.value}% Participação</p>
                                    </div>
                                    <span className="text-white/40 text-xs font-bold">{stats?.totalLeads}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color} shadow-[0_0_10px_rgba(227,29,45,0.3)]`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-white/10 uppercase font-black text-[10px] tracking-widest">
                                Sem dados de leads ainda
                            </div>
                        )}
                    </div>

                    <button onClick={() => navigate('/crm/relatorios')} className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>
        </div>
    );
}
