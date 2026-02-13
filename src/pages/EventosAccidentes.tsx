import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Plus, Trash2, Edit3 } from 'lucide-react';
import { ReporteEventoModal } from '../components/ReporteEventoModal';
import { getEventos, deleteEvento, createEvento, updateEvento } from '../services/hseService';


export const EventosAccidentes: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            const data = await getEventos();
            const flat = (data || []).map((e: any) => ({
                ...e,
                id: e.id,
                fechaReporte: e.fecha_reporte || '',
                jornada: e.jornada || 'Dia',
                // For modal select values (IDs)
                empresa: e.empresa_id || '',
                centroCostoId: e.centro_costo_id || '',
                supervisorId: e.supervisor_id || '',
                personaInvolucradaId: e.persona_involucrada || '',
                // For table display (Names)
                empresaName: e.empresa?.name || 'N/A',
                centroName: e.centro?.name || 'N/A',
                supervisorName: e.supervisor?.name || 'N/A',
                personaName: e.persona_involucrada || 'N/A', // Persona is text in this table?

                ordenServicio: e.orden_servicio || '',
                numIncidentes: e.num_incidentes || 0,
                numAuxilios: e.num_auxilios || 0,
                numTratamientos: e.num_tratamientos || 0,
                detalleSituaciones: e.detalle_situaciones || '',
                informacionColaborador: e.informacion_colaborador || '',
                actoCondicion: e.acto_condicion || '',
            }));
            setReports(flat);
        } catch (err) {
            console.error('Error loading eventos:', err);
        } finally {
            // done
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async (reportData: any) => {
        try {
            console.log('Eventos handleSave data:', reportData);

            // Map camelCase to snake_case for Supabase
            const payload = {
                fecha_reporte: reportData.fechaReporte || null,
                jornada: reportData.jornada,
                empresa_id: reportData.empresa || null,
                centro_costo_id: reportData.centroCostoId || null,
                orden_servicio: reportData.ordenServicio || null,
                num_incidentes: parseInt(reportData.numIncidentes) || 0,
                num_auxilios: parseInt(reportData.numAuxilios) || 0,
                num_tratamientos: parseInt(reportData.numTratamientos) || 0,
                detalle_situaciones: reportData.detalleSituaciones || null,
                informacion_colaborador: reportData.informacionColaborador || null,
                persona_involucrada: reportData.personaInvolucradaId || null,
                acto_condicion: reportData.actoCondicion || null,
                supervisor_id: reportData.supervisorId || null,
                // Any other fields that might be missing
            };

            if (editingReport) {
                await updateEvento(editingReport.id, payload);
            } else {
                await createEvento(payload);
            }
            await loadData();
            setIsModalOpen(false);
            setEditingReport(null);
        } catch (err) {
            console.error('Error saving event:', err);
            alert('Error al guardar el evento: ' + (err instanceof Error ? err.message : 'Verifique los datos'));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este reporte?')) {
            try {
                await deleteEvento(id);
                loadData();
            } catch (err) {
                console.error('Error deleting evento:', err);
            }
        }
    };

    const handleEdit = (report: any) => {
        setEditingReport(report);
        setIsModalOpen(true);
    };

    const filteredReports = reports.filter(r =>
        r.detalleSituaciones.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.personaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Eventos & Accidentes</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Gestión inmediata y seguimiento de incidentes de seguridad.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar reporte..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingReport(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-error text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-error/10 transition-all active:scale-95"
                    >
                        <ShieldAlert className="w-5 h-5" />
                        Nuevo Reporte
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-brand-error/10 rounded-2xl flex items-center justify-center text-brand-error mb-3">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider">Días sin Accidentes</h3>
                    <p className="text-4xl font-black text-brand-success font-outfit">428</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-brand-warning/10 rounded-2xl flex items-center justify-center text-brand-warning mb-3">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider">Incidentes del Mes</h3>
                    <p className="text-4xl font-black text-brand-warning font-outfit">{reports.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-3">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider">Auxilios Prestados</h3>
                    <p className="text-4xl font-black text-brand-primary font-outfit">
                        {reports.reduce((acc, r) => acc + (parseInt(r.numAuxilios) || 0), 0)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Empresa / Centro</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Detalle del Evento</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Personal Involucrado</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Indicadores</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-brand-text">{report.fechaReporte}</p>
                                        <p className="text-[10px] text-brand-text-muted uppercase font-bold">{report.jornada}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-brand-text">{report.empresaName}</p>
                                        <p className="text-[10px] text-brand-text-muted uppercase font-bold">{report.centroName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-brand-text max-w-xs truncate">{report.detalleSituaciones}</p>
                                        <p className="text-[10px] text-brand-error font-bold uppercase">{report.actoCondicion}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-brand-text">{report.personaName}</p>
                                        <p className="text-[10px] text-brand-text-muted uppercase font-bold">Ref: {report.supervisorName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {report.numIncidentes > 0 && <span className="px-2 py-0.5 bg-brand-error/10 text-brand-error text-[10px] font-bold rounded-lg">INC: {report.numIncidentes}</span>}
                                            {report.numAuxilios > 0 && <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-lg">AUX: {report.numAuxilios}</span>}
                                            {report.numTratamientos > 0 && <span className="px-2 py-0.5 bg-brand-warning/10 text-brand-warning text-[10px] font-bold rounded-lg">TRAT: {report.numTratamientos}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(report)}
                                                className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(report.id)}
                                                className="p-2 text-brand-text-muted hover:text-brand-error hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReporteEventoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingReport}
            />
        </div>
    );
};

const AlertCircle = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
