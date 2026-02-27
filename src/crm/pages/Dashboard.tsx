import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    TrendingUp,
    Car,
    CheckCircle2,
    Target,
    ArrowUpRight,
    ExternalLink,
    Store,
    Sparkles,
    Loader2,
    Bot
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
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao gerar análise');
            setAiAnalysis(data.analysis);
        } catch (err: any) {
            console.error(err);
            alert('Falha ao gerar consultoria: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderAIAnalysis = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return (
                    <h4 key={i} className="text-xl font-display font-black text-white mt-8 mb-4 border-b border-white/10 pb-2">
                        {line.replace(/\*\*/g, '')}
                    </h4>
                );
            }
            if (line.startsWith('* ') || line.startsWith('- ')) {
                return (
                    <li key={i} className="text-white/70 ml-6 mb-2 flex items-start gap-2 text-sm">
                        <span className="text-brand-red mt-1">•</span>
                        <span>{line.substring(2).replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                    </li>
                );
            }
            if (line.trim() === '') return null; // Ignore empty lines to control spacing via margins

            // Bold parser inside text
            const boldParsed = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="text-white">{part.replace(/\*\*/g, '')}</strong>;
                }
                return part;
            });

            return <p key={i} className="text-white/70 leading-relaxed mb-4 text-sm font-medium">{boldParsed}</p>;
        });
    };

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

            {/* AI Sales Director */}
            <div className="glass-card p-1 bg-gradient-to-br from-brand-red/20 via-slate-900/40 to-slate-900/40 border border-brand-red/30 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Bot size={200} />
                </div>
                <div className="p-8 md:p-10 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-brand-red/20 rounded-2xl flex items-center justify-center border border-brand-red/30 shadow-[0_0_30px_rgba(227,29,45,0.2)]">
                                <Sparkles className="text-brand-red" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-black text-white tracking-tight">Gestor IA</h3>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Sua Consultoria de Vendas ao Vivo</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-brand-red hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(227,29,45,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Analisando Dados...
                                </>
                            ) : (
                                <>
                                    <Target size={16} />
                                    Gerar Análise Estratégica
                                </>
                            )}
                        </button>
                    </div>

                    {isAnalyzing && (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-brand-red/50 blur-xl rounded-full animate-pulse"></div>
                                <Bot size={48} className="text-brand-red relative animate-bounce" />
                            </div>
                            <p className="text-brand-red font-bold animate-pulse text-sm uppercase tracking-widest">Avaliando performance de vendas e formatando plano...</p>
                        </div>
                    )}

                    {!isAnalyzing && aiAnalysis && (
                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 md:p-10">
                            <div className="prose prose-invert max-w-none">
                                {renderAIAnalysis(aiAnalysis)}
                            </div>
                        </div>
                    )}

                    {!isAnalyzing && !aiAnalysis && (
                        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-10 text-center">
                            <p className="text-white/30 text-sm font-medium leading-relaxed">Clique no botão acima para que a IA analise todo o seu volume de leads, <br /> funil comercial e estoque de veículos para sugerir um plano de ação fulminante.</p>
                        </div>
                    )}
                </div>
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
