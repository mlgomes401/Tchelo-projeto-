import React, { useState, useEffect, useRef } from 'react';
import {
    Car,
    Search,
    Plus,
    Edit3,
    Trash2,
    Eye,
    CheckCircle2,
    X,
    Image as ImageIcon,
    Loader2,
    Upload,
    Link as LinkIcon,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../../components/PageHeader';
import { cn, formatCurrency } from '../../../lib/utils';
import { VehicleData } from '../../../types';

interface VehicleResponse {
    id: string;
    data: VehicleData;
    status: string;
    created_at: string;
}

export default function Veiculos() {
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [urlInput, setUrlInput] = useState('');

    // Form state for new vehicle
    const [newVehicle, setNewVehicle] = useState<VehicleData>({
        model: '',
        year: '',
        km: '',
        version: '',
        price: '',
        city: '',
        differentials: '',
        whatsapp: '',
        instagram: '',
        color: '',
        description: '',
        images: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vehicles');
            const data = await res.json();
            setVehicles(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (vehicle?: VehicleResponse) => {
        if (vehicle) {
            setEditingVehicleId(vehicle.id);
            setNewVehicle(vehicle.data);
        } else {
            setEditingVehicleId(null);
            setNewVehicle({
                model: '', year: '', km: '', version: '', price: '',
                city: '', differentials: '', whatsapp: '', instagram: '',
                color: '', description: '',
                images: []
            });
        }
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingVehicleId(null);
        setUrlInput('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setNewVehicle(prev => ({
                    ...prev,
                    images: [...prev.images, base64]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const addImageUrl = () => {
        if (!urlInput.trim()) return;
        setNewVehicle(prev => ({
            ...prev,
            images: [...prev.images, urlInput.trim()]
        }));
        setUrlInput('');
    };

    const removeImage = (index: number) => {
        setNewVehicle(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newVehicle.images.length === 0) {
            alert('Adicione pelo menos uma foto do veículo.');
            return;
        }
        setIsSaving(true);
        try {
            const url = editingVehicleId ? `/api/vehicles/${editingVehicleId}` : '/api/vehicles';
            const method = editingVehicleId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleData: newVehicle })
            });
            if (res.ok) {
                closeModal();
                fetchData();
            } else {
                alert('Erro ao salvar veículo. Servidor retornou ' + res.status);
            }
        } catch (err) {
            alert('Erro ao salvar veículo');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteVehicle = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
        try {
            const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                alert('Erro ao excluir: O servidor recusou a conexão ou a rota não existe no momento. Reinicie o servidor.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de comunicação com o servidor.');
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        (v.data.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.data.version || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader
                    title="Gestão de Estoque"
                    subtitle="Gerencie seu catálogo de veículos e status de venda."
                    breadcrumbs={['Cadastros', 'Veículos']}
                />
                <button
                    onClick={() => openModal()}
                    className="btn-primary mb-10 flex items-center gap-2 px-8 py-4 rounded-2xl shadow-2xl shadow-brand-red/20 font-black uppercase tracking-widest text-[10px]"
                >
                    <Plus size={18} />
                    Cadastrar Veículo
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por modelo, marca ou ano..."
                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-brand-red/50 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Em Estoque</p>
                        <p className="text-xl font-black text-white">{vehicles.filter(v => v.status !== 'Vendido').length}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Car size={20} />
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Vendidos</p>
                        <p className="text-xl font-black text-white">{vehicles.filter(v => v.status === 'Vendido').length}</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
                    <p className="text-white/30 text-xs font-black uppercase tracking-widest">Carregando estoque...</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
                    <Car size={48} className="mx-auto mb-4" />
                    <p className="font-display font-bold">Nenhum veículo encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVehicles.map((v) => (
                        <div
                            key={v.id}
                            className="group glass-card overflow-hidden bg-slate-900/40 border-white/5 hover:border-brand-red/30 transition-all flex flex-col shadow-xl"
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={v.data.images[0] || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1?auto=format&fit=crop&q=80&w=1000'}
                                    alt={v.data.model}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />

                                <div className="absolute top-4 right-4">
                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg border",
                                        v.status === 'Vendido' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                            v.status === 'Reservado' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                                "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    )}>
                                        {v.status}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <p className="text-white font-black text-xl tracking-tighter drop-shadow-lg">
                                        {formatCurrency(Number(v.data.price))}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 flex-1 flex flex-col">
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1 tracking-tight group-hover:text-brand-red transition-colors line-clamp-1">
                                        {v.data.model}
                                    </h3>
                                    <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap">
                                        <span>{v.data.year}</span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <span>{Number(v.data.km).toLocaleString()} KM</span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <span className="line-clamp-1">{v.data.version}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openModal(v)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                                            title="Editar Veículo"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteVehicle(v.id)}
                                            className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <a
                                        href={`/v/${v.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        Ver Site
                                        <Eye size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[40px] my-auto shadow-2xl overflow-hidden">
                        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">{editingVehicleId ? 'Editar Veículo' : 'Novo Veículo'}</h2>
                                <p className="text-white/40 text-xs font-medium">Preencha os detalhes técnicos e adicione fotos.</p>
                            </div>
                            <button onClick={closeModal} className="p-3 bg-white/5 text-white/30 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </header>

                        <div className="p-10 grid lg:grid-cols-2 gap-12 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            {/* Technical Details */}
                            <form id="vehicle-form" onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Modelo</label>
                                        <input
                                            required
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.model}
                                            onChange={e => setNewVehicle(v => ({ ...v, model: e.target.value }))}
                                            placeholder="Ex: Porsche 911"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ano</label>
                                        <input
                                            required
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.year}
                                            onChange={e => setNewVehicle(v => ({ ...v, year: e.target.value }))}
                                            placeholder="2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Versão</label>
                                        <input
                                            required
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.version}
                                            onChange={e => setNewVehicle(v => ({ ...v, version: e.target.value }))}
                                            placeholder="Turbo S"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Quilometragem</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.km}
                                            onChange={e => setNewVehicle(v => ({ ...v, km: e.target.value }))}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Preço (R$)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.price}
                                            onChange={e => setNewVehicle(v => ({ ...v, price: e.target.value }))}
                                            placeholder="Ex: 120000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cidade/Local</label>
                                        <input
                                            required
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.city}
                                            onChange={e => setNewVehicle(v => ({ ...v, city: e.target.value }))}
                                            placeholder="São Paulo - SP"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cor <span className="text-white/20">(Opcional)</span></label>
                                        <input
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all placeholder:text-white/20"
                                            value={newVehicle.color || ''}
                                            onChange={e => setNewVehicle(v => ({ ...v, color: e.target.value }))}
                                            placeholder="Prata Metálico"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Tipo de Estoque</label>
                                        <div className="flex gap-4">
                                            {[{ value: 'proprio', label: '🏠 Estoque Próprio' }, { value: 'consignado', label: '🤝 Consignado' }].map(opt => (
                                                <label key={opt.value} className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold uppercase tracking-widest",
                                                    newVehicle.stockType === opt.value
                                                        ? "bg-brand-red/10 border-brand-red text-brand-red"
                                                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                                                )}>
                                                    <input
                                                        type="radio"
                                                        name="stockType"
                                                        value={opt.value}
                                                        checked={newVehicle.stockType === opt.value}
                                                        onChange={e => setNewVehicle(v => ({ ...v, stockType: e.target.value as 'proprio' | 'consignado' }))}
                                                        className="hidden"
                                                    />
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Descrição <span className="text-white/20">(Opcional)</span></label>
                                        <textarea
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:border-brand-red outline-none transition-all resize-none min-h-[80px] placeholder:text-white/20"
                                            value={newVehicle.description || ''}
                                            onChange={e => setNewVehicle(v => ({ ...v, description: e.target.value }))}
                                            placeholder="Detalhes adicionais, estado de conservação, acessórios..."
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* Image Management */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Fotos do Veículo</label>

                                    {/* Upload Trigger */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/10 rounded-[32px] p-8 text-center cursor-pointer hover:border-brand-red/30 hover:bg-brand-red/5 transition-all group"
                                    >
                                        <Upload className="mx-auto mb-3 text-white/20 group-hover:text-brand-red group-hover:scale-110 transition-all" size={32} />
                                        <p className="text-xs font-bold text-white mb-1">Upload de Arquivos</p>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">JPG ou PNG (Máx 5MB)</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>

                                    {/* URL Input */}
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white outline-none focus:border-brand-red/50"
                                                placeholder="Ou cole o link da foto aqui..."
                                                value={urlInput}
                                                onChange={e => setUrlInput(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={addImageUrl}
                                            type="button"
                                            className="p-3 bg-white/5 hover:bg-brand-red hover:text-white rounded-xl text-white/40 transition-all"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    {/* Preview Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <AnimatePresence mode='popLayout'>
                                            {newVehicle.images.map((img, idx) => (
                                                <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-white/10 group">
                                                    <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                                    <button
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-1 right-1 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </AnimatePresence>
                                        {newVehicle.images.length === 0 && (
                                            <div className="col-span-3 py-6 flex flex-col items-center justify-center border border-white/5 rounded-xl opacity-20">
                                                <ImageIcon size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Nenhuma foto</span>
                                            </div>
                                        )}
                                    </div>

                                    {newVehicle.images.length > 0 && (
                                        <p className="text-[10px] font-black text-brand-red uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 size={12} />
                                            {newVehicle.images.length} fotos selecionadas
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <footer className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-8 py-4 rounded-2xl text-white/40 font-bold text-xs hover:bg-white/5 transition-all uppercase tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                form="vehicle-form"
                                type="submit"
                                disabled={isSaving || newVehicle.images.length === 0}
                                className="btn-primary px-12 py-4 flex items-center gap-3 disabled:opacity-30 disabled:grayscale"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                {editingVehicleId ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
