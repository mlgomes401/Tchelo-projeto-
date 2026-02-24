import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Filter,
  TrendingUp,
  Car,
  DollarSign,
  PieChart as PieChartIcon,
  MessageSquare,
  ChevronRight,
  Search,
  MoreVertical,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatCurrency } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

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

interface Stats {
  totalVehicles: number;
  soldVehicles: number;
  totalLeads: number;
  conversionRate: string;
  monthlyData: { month: string; count: number }[];
}

export function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchData = async () => {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/stats')
      ]);
      const leadsData = await leadsRes.json();
      const statsData = await statsRes.json();
      setLeads(leadsData);
      setStats(statsData);
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
      fetchData(); // Refresh stats
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Excluir este lead?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(leads.filter(l => l.id !== id));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        <p className="text-white/50 font-medium">Carregando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4">
              <ArrowLeft size={18} />
              Voltar ao Editor
            </Link>
            <h1 className="text-4xl font-display font-extrabold flex items-center gap-4">
              <TrendingUp className="text-brand-red" />
              Dashboard Principal
            </h1>
            <p className="text-white/50">Visão geral da sua concessionária e gestão de leads.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Sistema Online</span>
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Veículos', value: stats?.totalVehicles, icon: Car, color: 'text-blue-500' },
            { label: 'Vendidos', value: stats?.soldVehicles, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Total Leads', value: stats?.totalLeads, icon: MessageSquare, color: 'text-brand-red' },
            { label: 'Taxa Conversão', value: `${stats?.conversionRate}%`, icon: TrendingUp, color: 'text-purple-500' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Geral</span>
              </div>
              <div>
                <h3 className="text-3xl font-display font-bold">{stat.value}</h3>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-8 space-y-6">
            <h3 className="text-xl font-display font-bold flex items-center gap-3">
              <TrendingUp className="text-brand-red" />
              Vendas Mensais
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyData || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E31D2D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E31D2D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#E31D2D" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xl font-display font-bold flex items-center gap-3">
              <PieChartIcon className="text-brand-red" />
              Origem dos Leads
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Site Direto', value: 65, color: 'bg-brand-red' },
                { label: 'Instagram', value: 20, color: 'bg-purple-500' },
                { label: 'Facebook', value: 10, color: 'bg-blue-600' },
                { label: 'Outros', value: 5, color: 'bg-white/20' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{item.label}</span>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={cn("h-full rounded-full", item.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leads Management Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Users className="text-brand-red" />
              Gestão de Leads
            </h2>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar lead ou veículo..."
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-red transition-all w-64"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                {['Todos', 'Novo', 'Em Atendimento', 'Fechado', 'Perdido'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      filter === f ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "text-white/40 hover:text-white"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredLeads.length === 0 ? (
              <div className="glass-card p-12 text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <AlertCircle className="text-white/20 w-8 h-8" />
                </div>
                <p className="text-white/30">Nenhum lead encontrado.</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red font-bold">
                      {lead.client_name?.charAt(0) || 'L'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold">{lead.client_name}</h3>
                        <span className={cn(
                          "px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          lead.status === 'Novo' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                          lead.status === 'Em Atendimento' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                          lead.status === 'Fechado' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          "bg-red-500/10 text-red-500 border border-red-500/20"
                        )}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="text-white/70 font-medium">{lead.vehicle_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{lead.origin}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                      <span className="text-sm font-bold">{lead.client_phone}</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">Telefone</span>
                    </div>

                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-red transition-colors"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Fechado">Fechado</option>
                      <option value="Perdido">Perdido</option>
                    </select>

                    <button 
                      onClick={() => setSelectedLead(lead)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    <a
                      href={`https://wa.me/55${(lead.client_phone || '').replace(/\D/g, '')}`}
                      target="_blank"
                      className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-500 transition-colors"
                    >
                      <MessageSquare size={20} />
                    </a>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 w-full max-w-2xl space-y-8 relative"
            >
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red text-3xl font-bold">
                  {selectedLead.client_name?.charAt(0) || 'L'}
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-display font-bold">{selectedLead.client_name || 'Interessado'}</h2>
                  <p className="text-white/50 flex items-center gap-2">
                    <MessageSquare size={16} /> {selectedLead.client_phone}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Interesse</h4>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <span className="font-bold">{selectedLead.vehicle_name}</span>
                      <Link to={`/v/${selectedLead.vehicle_id}`} target="_blank" className="text-brand-red hover:underline text-sm flex items-center gap-1">
                        Ver <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Status Atual</h4>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-red transition-colors"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Fechado">Fechado</option>
                      <option value="Perdido">Perdido</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Notas do Vendedor</h4>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-red transition-colors h-32 resize-none"
                      placeholder="Adicione observações sobre a negociação..."
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
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <button 
                  onClick={() => deleteLead(selectedLead.id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-sm font-bold"
                >
                  <Trash2 size={18} /> Excluir Lead
                </button>
                <a 
                  href={`https://wa.me/55${(selectedLead.client_phone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  className="btn-primary px-8 py-3"
                >
                  Iniciar Conversa
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
