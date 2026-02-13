import React, { useState, useEffect } from 'react';
import { ClipboardList, Filter, Search, Edit3, Trash2, Plus, Clock } from 'lucide-react';
import { ReporteNovedadesModal } from '../components/ReporteNovedadesModal';
import { getNovedades, createNovedad, updateNovedad, deleteNovedad as deleteNovedadService } from '../services/hseService';

export const Novedades: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNovedad, setEditingNovedad] = useState<any>(null);
    const [novedades, setNovedades] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const data = await getNovedades();
            console.log('Novedades data loaded:', data);
            const flat = (data || []).map((n: any) => ({
                ...n,
                id: n.id,
                time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                reporter: n.reporter || '',
                type: n.tipo || '',
                title: n.titulo || '',
                cause: n.descripcion || '',
                status: n.status || 'En Proceso',
                systemDate: n.created_at ? new Date(n.created_at).toLocaleString() : '',
                email: n.email || '',
                reportDate: n.fecha_reporte || '',
                shift: n.jornada || 'Dia',
                // Keep IDs for modal editing
                company: n.empresa_id || '',
                costCenter: n.cost_center_id || n.centro_costo_id || '', // Check which one it is
                // Relation objects for display
                companyName: n.empresa?.name || 'N/A',
                costCenterName: n.centro?.name || 'N/A',
                serviceOrder: n.orden_servicio || '',
            }));
            setNovedades(flat);
        } catch (err) {
            console.error('Error loading novedades:', err);
        } finally {
            // done
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = novedades.filter(n =>
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.reporter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.cause?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (data: any) => {
        try {
            console.log('Saving novedad with data:', data);
            const payload = {
                tipo: data.type || 'Novedad Operativa',
                titulo: data.title,
                descripcion: data.cause,
                status: data.status || 'En Proceso',
                reporter: data.reporter,
                email: data.email,
                fecha_reporte: data.reportDate || new Date().toISOString().split('T')[0],
                jornada: data.shift || 'Dia',
                orden_servicio: data.serviceOrder,
                empresa_id: data.company || null,
                centro_costo_id: data.costCenter || null,
            };

            if (editingNovedad) {
                await updateNovedad(editingNovedad.id, payload);
            } else {
                await createNovedad(payload);
            }
            setEditingNovedad(null);
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Error saving novedad:', err);
            alert('Error al guardar novedad: ' + (err instanceof Error ? err.message : 'Verifique los datos'));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este reporte de novedad?')) {
            try {
                await deleteNovedadService(id);
                loadData();
            } catch (err) {
                console.error('Error deleting novedad:', err);
            }
        }
    };

    const handleEdit = (novedad: any) => {
        setEditingNovedad(novedad);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Reporte de Novedades</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Bitácora diaria de cambios y eventos operativos significativos.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingNovedad(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Nueva Novedad
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[60vh]">
                <div className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                            <ClipboardList className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="font-bold text-brand-text tracking-tight">Bitácora Operativa</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative group hidden md:block mr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted transition-colors group-focus-within:text-brand-primary" />
                            <input
                                type="text"
                                placeholder="Filtrar novedades..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all w-64 shadow-inner"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-brand-text-muted hover:text-brand-primary transition-all shadow-sm"><Filter className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="p-4 md:p-8 space-y-8">
                    {filtered.map((item) => (
                        <div key={item.id} className="flex gap-4 md:gap-8 relative group">
                            <div className="flex flex-col items-center">
                                <span className="text-[11px] font-black text-brand-text-muted mb-3 font-mono bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 shadow-inner group-hover:text-brand-primary transition-colors">
                                    {item.time}
                                </span>
                                <div className="w-0.5 h-full bg-gray-100 flex-1 relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-brand-primary shadow-sm group-hover:scale-125 transition-transform" />
                                </div>
                            </div>
                            <div className="flex-1 bg-gray-50/30 p-4 md:p-8 rounded-[32px] border border-transparent group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-xl transition-all mb-4 relative overflow-hidden">
                                {/* Glass background decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary text-white rounded-full">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">{item.shift}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.1em] border-l border-gray-200 pl-3">{item.companyName}</span>
                                        <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.1em] border-l border-gray-200 pl-3 truncate max-w-[150px]">{item.costCenterName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2.5 text-brand-text-muted hover:text-brand-primary hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2.5 text-brand-text-muted hover:text-brand-error hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h4 className="text-lg font-black text-brand-text tracking-tight group-hover:text-brand-primary transition-colors mb-1">{item.title}</h4>
                                    <p className="text-xs font-bold text-brand-text-muted underline decoration-brand-primary/20 underline-offset-4">Por: {item.reporter}</p>
                                </div>
                                <p className="text-sm font-semibold text-brand-text-muted leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{item.cause}</p>

                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">OS: {item.serviceOrder}</span>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{item.reportDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Search className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-brand-text-muted font-black text-sm tracking-widest uppercase">No se encontraron registros</p>
                        </div>
                    )}
                </div>
            </div>

            <ReporteNovedadesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingNovedad}
            />
        </div>
    );
};
