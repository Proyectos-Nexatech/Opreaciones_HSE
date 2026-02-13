import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReporteAsistenciaModal } from '../components/ReporteAsistenciaModal';
import { getAsistencia, createAsistencia, updateAsistencia, deleteAsistencia as deleteAsistenciaService } from '../services/hseService';
import { allPersonal } from '../data/sharedData';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Asistencia: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const data = await getAsistencia();
            const flat = (data || []).map((r: any) => ({
                ...r,
                id: r.id,
                name: r.nombre_persona || '',
                h: r.hora_ingreso || '',
                status: r.status || 'A tiempo',
                img: (r.nombre_persona || 'NN').split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 2),

                // Map DB columns to Modal props
                empresa: r.empresa_id,
                centro: r.centro_costo_id,
                supervisorId: r.created_by,
                orden: r.orden_servicio,
                date: r.fecha,
                email: r.email,
                shift: r.jornada || 'Dia',
                // For 'h' (time), we keep it as 'h' for the table, but Modal might use it for logic? 
                // Modal uses 'formData.date'. 'formData.shift'.
            }));
            setRecords(flat);
        } catch (err) {
            console.error('Error loading asistencia:', err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async (data: any) => {
        console.log('Asistencia handleSave data:', data);
        try {
            if (editingRecord) {
                // Update existing record
                // If multiple persons selected during edit, we currently only update the record being edited
                // taking the first selected person if changed, or keeping existing logic.
                // Assuming we update the person if one is selected.
                const personId = data.personIds && data.personIds.length > 0 ? data.personIds[0] : null;
                const person = personId ? allPersonal.find(p => p.id === personId) : null;

                const payload = {
                    nombre_persona: person ? person.name : (data.name || editingRecord.name),
                    jornada: data.shift || 'Dia',
                    status: data.status || 'A tiempo',
                    // Preserve other fields or update if form has them
                    empresa_id: data.empresa || null,
                    centro_costo_id: data.centro || null,
                    orden_servicio: data.orden || null,
                    fecha: data.date,
                };
                await updateAsistencia(editingRecord.id, payload);
            } else {
                // Create new records
                if (data.personIds && data.personIds.length > 0) {
                    const promises = data.personIds.map((id: string) => {
                        const person = allPersonal.find(p => p.id === id);
                        const payload = {
                            nombre_persona: person ? person.name : 'Unknown',
                            hora_ingreso: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            status: data.status || 'A tiempo',
                            jornada: data.shift || 'Dia',
                            email: data.email,
                            empresa_id: data.empresa || null,
                            centro_costo_id: data.centro || null,
                            orden_servicio: data.orden || null,
                            fecha: data.date,
                            created_by: data.supervisorId || null
                        };
                        return createAsistencia(payload);
                    });
                    await Promise.all(promises);
                } else {
                    // Fallback if no person selected (should be blocked by validation ideally)
                    const payload = {
                        nombre_persona: 'Sin Asignar',
                        hora_ingreso: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        status: data.status || 'A tiempo',
                        jornada: data.shift || 'Dia',
                        fecha: data.date,
                    };
                    await createAsistencia(payload);
                }
            }
            setEditingRecord(null);
            loadData();
        } catch (err) {
            console.error('Error saving asistencia:', err);
        }
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este registro de asistencia?')) {
            try {
                await deleteAsistenciaService(id);
                loadData();
            } catch (err) {
                console.error('Error deleting asistencia:', err);
            }
        }
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Reporte de Asistencia</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Control de ingreso y validación de personal en sitio.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar personal..."
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <span className="text-lg">+</span> Registrar Ingreso
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-bold text-brand-text-muted uppercase tracking-widest mb-4">Resumen Diario</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-brand-text-muted">Presentes</span>
                                <span className="text-lg font-bold text-brand-success">142</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-brand-text-muted">Retrasos</span>
                                <span className="text-lg font-bold text-brand-warning">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-brand-text-muted">Faltantes</span>
                                <span className="text-lg font-bold text-brand-error">5</span>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Main Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Colaborador</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Hora Ingreso</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {records.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[11px] font-bold text-brand-text">
                                                        {row.img}
                                                    </div>
                                                    <span className="text-sm font-semibold text-brand-text">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-brand-text-muted">{row.h}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                                    row.status === 'A tiempo' ? "bg-brand-success/10 text-brand-success" : "bg-brand-warning/10 text-brand-warning"
                                                )}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="p-2 rounded-lg hover:bg-gray-50 text-brand-text-muted hover:text-brand-primary transition-all"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        className="p-2 rounded-lg hover:bg-gray-50 text-brand-text-muted hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="w-px h-4 bg-gray-100 mx-1" />
                                                    <button className="p-2 rounded-lg hover:bg-gray-50 text-brand-text-muted hover:text-brand-primary transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs font-semibold text-brand-text-muted">Mostrando {records.length} de 142 colaboradores</p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-brand-text transition-all">Anterior</button>
                                <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-brand-text transition-all shadow-sm">Siguiente</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReporteAsistenciaModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingRecord(null); }}
                onSave={handleSave}
                initialData={editingRecord}
            />
        </div>
    );
};
