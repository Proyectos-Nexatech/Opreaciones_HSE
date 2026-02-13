import React, { useState, useEffect } from 'react';
import { Search, Plus, Map, ChevronRight, Filter, Edit3, Trash2, Loader2 } from 'lucide-react';
import { getCentrosCosto, createCentroCosto, updateCentroCosto, deleteCentroCosto } from '../services/hseService';
import { CentroCostoModal } from '../components/CentroCostoModal';

export const CentrosCosto: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [centers, setCenters] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState<any>(null);

    const loadData = async () => {
        try {
            const data = await getCentrosCosto();
            setCenters(data || []);
        } catch (err) {
            console.error('Error loading centres:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = centers.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async (data: any) => {
        try {
            const payload = {
                name: data.name,
                code: data.code,
                location: data.location
            };

            if (editingCenter) {
                await updateCentroCosto(editingCenter.id, payload);
            } else {
                await createCentroCosto(payload);
            }
            loadData();
            setEditingCenter(null);
        } catch (err) {
            console.error('Error saving centre:', err);
            alert('Error al guardar el centro de costo');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este centro de costo?')) {
            try {
                await deleteCentroCosto(id);
                loadData();
            } catch (err) {
                console.error('Error deleting centre:', err);
                alert('Error al eliminar el centro de costo');
            }
        }
    };

    const handleEdit = (center: any) => {
        setEditingCenter(center);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Centros de Costo</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Gestión y monitoreo de unidades de negocio operativas.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar centro de costo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-80 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingCenter(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider ml-2">Centro_Costos</span>
                    <Filter className="w-4 h-4 text-brand-text-muted cursor-pointer" />
                </div>
                <div className="divide-y divide-gray-50">
                    {filtered.map((centro) => (
                        <div key={centro.id} className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-all group">
                            <div className="flex items-center gap-4 ml-2">
                                <div className="p-2 bg-brand-accent rounded-lg text-brand-primary">
                                    <Map className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">{centro.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(centro)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-brand-text-muted hover:text-brand-primary border border-transparent hover:border-gray-100 hover:shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(centro.id)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-brand-text-muted hover:text-brand-error border border-transparent hover:border-gray-100 hover:shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <ChevronRight className="w-4 h-4 text-brand-text-muted group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && centers.length > 0 && (
                        <div className="p-20 text-center">
                            <p className="text-brand-text-muted font-bold text-sm tracking-widest uppercase">No se encontraron resultados</p>
                        </div>
                    )}
                    {centers.length === 0 && (
                        <div className="p-20 text-center">
                            <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-4" />
                            <p className="text-brand-text-muted font-bold text-sm tracking-widest uppercase">Cargando centros de costo...</p>
                        </div>
                    )}
                </div>
            </div>

            <CentroCostoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingCenter}
            />
        </div>
    );
};
