import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUpRight, BarChart3, AlertCircle, Plus, Search, Filter, Edit3, Trash2, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReporteAusentismoModal } from '../components/ReporteAusentismoModal';
import { getAusentismo, createAusentismo, updateAusentismo, deleteAusentismo as deleteAusentismoService } from '../services/hseService';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Ausentismo: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const data = await getAusentismo();
            const flat = (data || []).map((r: any) => ({
                ...r,
                id: r.id,
                absentPerson: r.persona_ausente || '',
                cause: r.causa || '',
                reportDate: r.fecha_reporte || '',
                shift: r.jornada || 'Dia',
                // Keep IDs for modal
                company: r.empresa_id || '',
                costCenter: r.centro_costo_id || '',
                // Names for display
                companyName: r.empresa?.name || 'N/A',
                costCenterName: r.centro?.name || 'N/A',
                serviceOrder: r.orden_servicio || '',
                reporter: r.reporter || '',
                email: r.email || '',
                systemDate: r.created_at ? new Date(r.created_at).toLocaleString() : '',
            }));
            setReports(flat);
        } catch (err) {
            console.error('Error loading ausentismo:', err);
        } finally {
            // done
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = reports.filter(r =>
        r.absentPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const counts = {
        Médico: reports.filter(r => r.cause === 'Médico').length,
        Familiar: reports.filter(r => r.cause === 'Familiar').length,
        Trámites: reports.filter(r => r.cause === 'Trámites').length,
        Otros: reports.filter(r => r.cause === 'Otros').length,
    };

    const handleSave = async (data: any) => {
        try {
            const payload = {
                persona_ausente: data.absentPerson,
                causa: data.cause,
                fecha_reporte: data.reportDate || new Date().toISOString().split('T')[0],
                jornada: data.shift || 'Dia',
                orden_servicio: data.serviceOrder,
                reporter: data.reporter,
                email: data.email,
                empresa_id: data.company || null,
                centro_costo_id: data.costCenter || null,
            };
            if (editingReport) {
                await updateAusentismo(editingReport.id, payload);
            } else {
                await createAusentismo(payload);
            }
            setEditingReport(null);
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Error saving ausentismo:', err);
            alert('Error al guardar ausentismo: ' + (err instanceof Error ? err.message : 'Verifique los datos'));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este registro de ausentismo?')) {
            try {
                await deleteAusentismoService(id);
                loadData();
            } catch (err) {
                console.error('Error deleting ausentismo:', err);
            }
        }
    };

    const handleEdit = (report: any) => {
        setEditingReport(report);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Reporte de Ausentismo</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Monitoreo de permisos, incapacidades y faltas injustificadas.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingReport(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Registrar Ausencia
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Tasa de Ausentismo', value: '4.2%', trend: '+0.5%', color: 'text-brand-primary', icon: BarChart3 },
                    { label: 'Incapacidades Actu.', value: reports.length.toString(), trend: 'Normal', color: 'text-brand-warning', icon: AlertCircle },
                    { label: 'Permisos Aprobados', value: (reports.length + 5).toString(), trend: 'Estable', color: 'text-brand-success', icon: Calendar },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-brand-primary/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-brand-text-muted group-hover:text-brand-primary transition-colors">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-brand-text-muted">{stat.trend}</span>
                        </div>
                        <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className={cn("text-3xl font-bold font-outfit", stat.color)}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-brand-text mb-1">Registro de Novedades Académicas/Médicas</h3>
                        <p className="text-brand-text-muted text-xs">Cargue los soportes de ausentismo para validación del área de salud.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted transition-colors group-focus-within:text-brand-primary" />
                            <input
                                type="text"
                                placeholder="Buscar ausente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all w-64 shadow-inner"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-brand-text-muted hover:text-brand-primary transition-all shadow-sm"><Filter className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/30">
                    {[
                        { reason: 'Médico', count: counts.Médico, color: 'bg-red-500' },
                        { reason: 'Familiar', count: counts.Familiar, color: 'bg-blue-500' },
                        { reason: 'Trámites', count: counts.Trámites, color: 'bg-green-500' },
                        { reason: 'Otros', count: counts.Otros, color: 'bg-gray-500' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-primary/30 transition-all group">
                            <div className={cn("w-3 h-3 rounded-full shadow-sm", item.color)} />
                            <div>
                                <p className="text-sm font-bold text-brand-text">{item.reason}</p>
                                <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">{item.count} Casos</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-brand-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>

                <div className="divide-y divide-gray-50">
                    {filtered.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all group">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary group-hover:scale-110 transition-transform shadow-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">{report.absentPerson}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                                            report.cause === 'Médico' ? "bg-red-100 text-red-600" :
                                                report.cause === 'Familiar' ? "bg-blue-100 text-blue-600" :
                                                    report.cause === 'Trámites' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {report.cause}
                                        </span>
                                        <span className="text-[10px] font-bold text-brand-text-muted border-l border-gray-200 pl-3">{report.companyName}</span>
                                        <span className="text-[10px] font-bold text-brand-text-muted border-l border-gray-200 pl-3">{report.costCenterName}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">Fecha Reporte</p>
                                    <p className="text-xs font-bold text-brand-text">{report.reportDate}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(report)}
                                        className="p-2.5 text-brand-text-muted hover:text-brand-primary hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report.id)}
                                        className="p-2.5 text-brand-text-muted hover:text-brand-error hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-20 text-center">
                            <p className="text-brand-text-muted font-black text-sm tracking-widest uppercase">No se encontraron registros de ausentismo</p>
                        </div>
                    )}
                </div>
            </div>

            <ReporteAusentismoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingReport}
            />
        </div>
    );
};
