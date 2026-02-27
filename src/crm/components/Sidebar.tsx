import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Kanban,
    Car,
    DollarSign,
    Mail,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    Search,
    Plus,
    Layout,
    Globe,
    ExternalLink,
    Instagram as InstaIcon,
    Phone
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/crm/dashboard' },
    { icon: Users, label: 'Gestor de Leads', path: '/crm/leads' },
    { icon: Kanban, label: 'Funil de Vendas', path: '/crm/funil' },
    { icon: Car, label: 'Estoque/Cadastro', path: '/crm/cadastros/veiculos' },
    { path: '/crm/loja', icon: Globe, label: 'Vitrine Digital' },
    { path: '/crm/financeiro', icon: DollarSign, label: 'Financeiro' },
    { path: '/crm/usuarios', icon: Users, label: 'Usuários' },
];

export default function Sidebar() {
    const location = useLocation();
    const [storeName, setStoreName] = useState('AutoPage');
    const [settings, setSettings] = useState<any>(null);
    const [userName, setUserName] = useState('Admin');
    const [userRole, setUserRole] = useState('admin');

    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedRole = localStorage.getItem('user_role');
        if (storedName) setUserName(storedName);
        if (storedRole) setUserRole(storedRole);

        fetch('/api/settings')
            .then(res => {
                if (!res.ok) throw new Error('API not ready');
                return res.json();
            })
            .then(data => {
                if (data.storeName) setStoreName(data.storeName);
                setSettings(data);
            })
            .catch(err => console.error("Sidebar settings error:", err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/crm/login');
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-white/5 flex flex-col z-50">
            {/* Brand */}
            <Link to="/crm/dashboard" className="p-8 block hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/20 text-white">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h1 className="text-white font-display font-bold text-lg tracking-tight truncate max-w-[120px]">{storeName}</h1>
                        <p className="text-brand-red text-[10px] font-bold uppercase tracking-[0.2em]">Elite CRM</p>
                    </div>
                </div>
            </Link>

            {/* Quick Search */}
            <div className="px-6 mb-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-brand-red/50 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-hide">
                <div className="px-4 mb-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Menu Principal</span>
                </div>

                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-white/40 group-hover:text-brand-red")} />
                                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} className="text-white/70" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Social & Site Quick Links */}
            <div className="px-4 py-4 space-y-2">
                <Link
                    to="/loja"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white transition-all text-xs font-bold"
                >
                    <ExternalLink size={16} />
                    Ver Site Público
                </Link>
            </div>

            {/* Footer Profile/Exit */}
            <div className="p-4 mt-auto border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red to-rose-400 p-[2px]">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-xs uppercase">
                                {storeName.substring(0, 2)}
                            </div>
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold truncate max-w-[100px]">{userName}</p>
                            <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">{userRole}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-white/30 hover:text-brand-red transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
