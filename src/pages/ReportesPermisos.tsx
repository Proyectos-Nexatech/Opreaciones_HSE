import React, { useState, useEffect, useRef } from 'react';
import {
    Filter,
    ChevronRight,
    X,
    Users,
    ChevronDown,
    Mail,
    Building2,
    FileText,
    Search,
    Map,
    Upload,
    Edit3,
    Trash2,
    Hash,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPermisos, getSupervisores, getEmpresas, getCentrosCosto, getPersonal, createPermiso, updatePermiso, deletePermiso } from '../services/hseService';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const ReportesPermisos: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [jornada, setJornada] = useState<'Dia' | 'Noche'>('Dia');
    const [reports, setReports] = useState<any[]>([]);
    const [supervisors, setSupervisors] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
    const [personal, setPersonal] = useState<any[]>([]);
    const [selectedPersonal, setSelectedPersonal] = useState<string[]>([]);
    const [personalDropdownOpen, setPersonalDropdownOpen] = useState(false);
    const [personalSearch, setPersonalSearch] = useState('');
    const [editingReport, setEditingReport] = useState<any>(null);
    const [, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Fetch logged-in user email
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) {
                setUserEmail(data.user.email);
            }
        });
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('Fetching all permit related data...');
            const results = await Promise.allSettled([
                getPermisos(),
                getSupervisores(),
                getEmpresas(),
                getCentrosCosto(),
                getPersonal()
            ]);
            console.log('Fetch results:', results.map(r => r.status));
            const permisosData = results[0].status === 'fulfilled' ? results[0].value : [];
            const supervisoresData = results[1].status === 'fulfilled' ? results[1].value : [];
            const empresasData = results[2].status === 'fulfilled' ? results[2].value : [];
            const centrosData = results[3].status === 'fulfilled' ? results[3].value : [];
            const personalData = results[4].status === 'fulfilled' ? results[4].value : [];

            // Log any failures for debugging
            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    const names = ['permisos', 'supervisores', 'empresas', 'centros', 'personal'];
                    console.error(`Error loading ${names[i]}:`, r.reason);
                }
            });

            setEmpresas(empresasData || []);
            setCentrosCosto(centrosData || []);
            setPersonal(personalData || []);
            // Flatten joined data for easy table access
            const flatReports = (permisosData || []).map((p: any) => ({
                ...p,
                empresa: p.empresa?.name || '',
                centro: p.centro?.name || '',
                supervisor: p.supervisor?.name || '',
                numero: p.numero_formato || '',
                hora: p.hora_firma || '',
                propietario: p.propietario_email || '',
                personal_ids: p.personal_ids || [],
            }));
            setReports(flatReports);
            // Build supervisor list with counts
            const supCounts: Record<string, number> = {};
            flatReports.forEach((r: any) => {
                if (r.supervisor) supCounts[r.supervisor] = (supCounts[r.supervisor] || 0) + 1;
            });
            const sups = (supervisoresData || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                count: supCounts[s.name] || 0
            }));
            setSupervisors(sups);
        } catch (err) {
            console.error('Error loading permisos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredReports = selectedSupervisor
        ? reports.filter((r: any) => r.supervisor === selectedSupervisor)
        : reports;

    const resetModal = () => {
        setIsModalOpen(false);
        setEditingReport(null);
        setSelectedPersonal([]);
        setPersonalSearch('');
        setPersonalDropdownOpen(false);
        setSaving(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current || saving) return;
        const fd = new FormData(formRef.current);
        const supervisorId = fd.get('supervisor') as string || null;
        const empresaId = fd.get('empresa') as string || null;
        const centroId = fd.get('centro') as string || null;
        const horaFirma = fd.get('hora_firma') as string;
        const payload: any = {
            jornada,
            supervisor_id: supervisorId || null,
            empresa_id: empresaId || null,
            centro_costo_id: centroId || null,
            orden_servicio: (fd.get('orden') as string) || null,
            tipo: fd.get('tipo') as string || 'Permisos Generales',
            numero_formato: (fd.get('numero_formato') as string) || null,
            hora_firma: horaFirma || null,
            fecha: (fd.get('fecha') as string) || null,
            personal_ids: selectedPersonal,
            personal_involucrado: selectedPersonal.length > 0 ? selectedPersonal[0] : null,
            propietario_email: (fd.get('propietario') as string) || null,
        };
        try {
            setSaving(true);
            console.log('Payload to save:', payload);
            if (editingReport) {
                await updatePermiso(editingReport.id, payload);
            } else {
                await createPermiso(payload);
            }
            console.log('Save successful!');
            resetModal();
            loadData();
        } catch (err: any) {
            console.error('Error saving permiso:', err);
            alert(`Error al guardar: ${err.message || 'Error desconocido'}`);
            setSaving(false);
        }
    };

    const handleEdit = (report: any) => {
        setEditingReport(report);
        setJornada(report.jornada);
        setSelectedPersonal(report.personal_ids || []);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este registro de permiso?')) {
            try {
                await deletePermiso(id);
                loadData();
            } catch (err) {
                console.error('Error deleting permiso:', err);
            }
        }
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            {/* Header section with title and actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Reporte Diario de Permisos</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Gestion de los diferentes Proyectos</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar reporte..."
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <span className="text-lg">+</span> Agregar Reporte
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Supervisor Sidebar */}
                <aside className="lg:w-72 flex flex-col gap-6 shrink-0">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
                            <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Supervisores HSE</span>
                            <Filter className="w-3.5 h-3.5 text-brand-text-muted" />
                        </div>

                        <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin">
                            <button
                                onClick={() => setSelectedSupervisor(null)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group",
                                    !selectedSupervisor
                                        ? "bg-brand-accent text-brand-primary font-bold shadow-sm"
                                        : "text-brand-text-muted hover:bg-gray-50 hover:text-brand-text"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", !selectedSupervisor ? "bg-brand-primary" : "bg-gray-200")} />
                                    <span>Todos los Registros</span>
                                </div>
                            </button>

                            {supervisors.map((sup) => (
                                <button
                                    key={sup.id}
                                    onClick={() => setSelectedSupervisor(sup.name)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group",
                                        selectedSupervisor === sup.name
                                            ? "bg-brand-accent text-brand-primary font-bold shadow-sm"
                                            : "text-brand-text-muted hover:bg-gray-50 hover:text-brand-text"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", selectedSupervisor === sup.name ? "bg-brand-primary" : "bg-gray-200 group-hover:bg-brand-primary/40")} />
                                        <span>{sup.name}</span>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                        selectedSupervisor === sup.name ? "bg-white text-brand-primary" : "bg-gray-100 text-brand-text-muted"
                                    )}>
                                        {sup.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content - Table */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="overflow-x-auto flex-1 h-full scrollbar-thin">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Fecha Reporte</th>
                                        {userEmail?.endsWith('@nexatech.com.co') && (
                                            <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Fecha Sistema</th>
                                        )}
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider text-center">Jornada</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Empresa</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">ID Formato</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                                            <td className="px-6 py-4 text-sm font-semibold text-brand-text">{report.fecha}</td>
                                            {userEmail?.endsWith('@nexatech.com.co') && (
                                                <td className="px-6 py-4 text-sm text-brand-text-muted">
                                                    {new Date(report.created_at).toLocaleString('es-CO')}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                                    report.jornada === 'Dia'
                                                        ? "bg-brand-warning/10 text-brand-warning"
                                                        : "bg-brand-primary/10 text-brand-primary"
                                                )}>
                                                    {report.jornada === 'Dia' ? 'Día' : 'Noche'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-brand-text-muted font-medium">{report.empresa}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-[11px] font-bold text-brand-text uppercase leading-tight">{report.centro}</p>
                                                <p className="text-[10px] text-brand-text-muted mt-0.5">{report.orden}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-sm shadow-brand-primary/20" />
                                                    <span className="text-sm font-semibold text-brand-text">{report.tipo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-brand-primary font-bold">#{report.numero}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(report)}
                                                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-brand-text-muted hover:text-brand-primary transition-all group/btn"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-brand-text-muted hover:text-red-500 transition-all group/btn"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="w-px h-4 bg-gray-100 mx-1" />
                                                    <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-brand-text-muted hover:text-brand-primary transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredReports.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-brand-text-muted">
                                    <div className="p-6 bg-gray-50 rounded-full mb-6 border border-gray-100">
                                        <FileText className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="font-bold text-sm">No se encontraron registros</p>
                                    <p className="text-xs mt-1">Intente ajustar los filtros de búsqueda</p>
                                </div>
                            )}
                        </div>

                        {/* Footer / Pagination */}
                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                            <p className="text-xs font-semibold text-brand-text-muted">
                                Mostrando <span className="text-brand-text">{filteredReports.length}</span> registros
                            </p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-brand-text transition-all disabled:opacity-50">Anterior</button>
                                <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-brand-text transition-all shadow-sm">Siguiente</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Clean Light Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-text/20 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-3xl rounded-[40px] shadow-2xl border border-white/20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-brand-primary p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{editingReport ? 'Editar Permiso' : 'Nuevo Registro de Permiso'}</h2>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Gestión de Permisos de Trabajo</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90 bg-white/10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form ref={formRef} onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-8 space-y-8 overflow-y-auto scrollbar-thin">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Propietario del Reporte</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <input
                                                    name="propietario"
                                                    type="email"
                                                    defaultValue={editingReport?.propietario || userEmail}
                                                    readOnly
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none text-gray-500 font-semibold shadow-sm cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Supervisor HSE Asignado</label>
                                            <div className="relative group">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <select
                                                    name="supervisor"
                                                    defaultValue={editingReport?.supervisor_id || ''}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all appearance-none cursor-pointer text-brand-text font-semibold shadow-sm"
                                                >
                                                    <option value="">Seleccionar Supervisor</option>
                                                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Centro de Costos</label>
                                            <div className="relative group">
                                                <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <select
                                                    name="centro"
                                                    defaultValue={editingReport?.centro_costo_id || ''}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all appearance-none cursor-pointer text-brand-text font-semibold shadow-sm"
                                                >
                                                    <option value="">Seleccionar Centro de Costos</option>
                                                    {centrosCosto.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Jornada Laboral</label>
                                            <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setJornada('Dia')}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                                        jornada === 'Dia' ? "bg-white text-brand-primary shadow-sm border border-gray-200" : "text-brand-text-muted hover:text-brand-text"
                                                    )}
                                                >
                                                    Día
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setJornada('Noche')}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                                        jornada === 'Noche' ? "bg-white text-brand-primary shadow-sm border border-gray-200" : "text-brand-text-muted hover:text-brand-text"
                                                    )}
                                                >
                                                    Noche
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Fecha Reporte</label>
                                            <div className="relative group">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <input
                                                    name="fecha"
                                                    type="date"
                                                    defaultValue={editingReport?.fecha || new Date().toISOString().split('T')[0]}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all text-brand-text font-semibold shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Empresa Ejecutora</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <select
                                                    name="empresa"
                                                    defaultValue={editingReport?.empresa_id || ''}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all appearance-none cursor-pointer text-brand-text font-semibold shadow-sm"
                                                >
                                                    <option value="">Seleccionar Empresa</option>
                                                    {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Orden de Servicio</label>
                                            <div className="relative group">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <input
                                                    name="orden"
                                                    type="text"
                                                    defaultValue={editingReport?.orden_servicio || ''}
                                                    placeholder="Ej: OS-2026-45"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all text-brand-text font-semibold shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Tipo de Tarea</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                <select
                                                    name="tipo"
                                                    defaultValue={editingReport?.tipo || 'Permisos Generales'}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 appearance-none text-brand-text font-semibold shadow-sm"
                                                >
                                                    <option>Permisos Generales</option>
                                                    <option>Trabajo en Caliente</option>
                                                    <option>Trabajo en Alturas</option>
                                                    <option>Espacios Confinados</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Número de Formato / ID</label>
                                                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mr-1">Hora Firma</label>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    name="numero_formato"
                                                    type="text"
                                                    defaultValue={editingReport?.numero_formato || ''}
                                                    placeholder="Ej: 36801"
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-mono text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 font-bold placeholder:text-brand-text-muted/40 shadow-sm"
                                                />
                                                <div className="relative group w-32">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                                    <input
                                                        name="hora_firma"
                                                        type="time"
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all text-brand-text font-bold shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Personal Involucrado</label>
                                        <div className="relative">
                                            {/* Selected chips + trigger */}
                                            <div
                                                onClick={() => setPersonalDropdownOpen(!personalDropdownOpen)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-10 text-sm focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary/50 transition-all cursor-pointer shadow-sm min-h-[48px] flex flex-wrap gap-2 items-center"
                                            >
                                                <Users className="absolute left-4 top-3.5 w-4 h-4 text-brand-text-muted" />
                                                {selectedPersonal.length === 0 && (
                                                    <span className="text-brand-text-muted font-semibold">Seleccionar del Listado Maestro...</span>
                                                )}
                                                {selectedPersonal.map(personId => {
                                                    const person = personal.find((p: any) => p.id === personId);
                                                    if (!person) return null;
                                                    return (
                                                        <span
                                                            key={personId}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold border border-brand-primary/20"
                                                        >
                                                            {person.name}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedPersonal(prev => prev.filter(id => id !== personId));
                                                                }}
                                                                className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                                <ChevronDown className={cn("absolute right-4 top-3.5 w-4 h-4 text-brand-text-muted transition-transform", personalDropdownOpen && "rotate-180")} />
                                            </div>

                                            {/* Dropdown panel */}
                                            {personalDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="p-3 border-b border-gray-100">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                                            <input
                                                                type="text"
                                                                value={personalSearch}
                                                                onChange={(e) => setPersonalSearch(e.target.value)}
                                                                placeholder="Buscar personal..."
                                                                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-brand-text"
                                                                onClick={(e) => e.stopPropagation()}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-52 overflow-y-auto scrollbar-thin">
                                                        {personal
                                                            .filter((p: any) =>
                                                                p.name.toLowerCase().includes(personalSearch.toLowerCase()) ||
                                                                (p.role || '').toLowerCase().includes(personalSearch.toLowerCase())
                                                            )
                                                            .map((person: any) => {
                                                                const isSelected = selectedPersonal.includes(person.id);
                                                                return (
                                                                    <button
                                                                        key={person.id}
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedPersonal(prev =>
                                                                                isSelected
                                                                                    ? prev.filter(id => id !== person.id)
                                                                                    : [...prev, person.id]
                                                                            );
                                                                        }}
                                                                        className={cn(
                                                                            "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all hover:bg-gray-50",
                                                                            isSelected && "bg-brand-primary/5"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                                                                            isSelected
                                                                                ? "bg-brand-primary border-brand-primary"
                                                                                : "border-gray-300"
                                                                        )}>
                                                                            {isSelected && (
                                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-semibold text-brand-text truncate">{person.name}</p>
                                                                            <p className="text-[11px] text-brand-text-muted">{person.role}</p>
                                                                        </div>
                                                                        {person.status && (
                                                                            <span className={cn(
                                                                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                                                person.status === 'Activo'
                                                                                    ? "bg-green-50 text-green-600"
                                                                                    : "bg-amber-50 text-amber-600"
                                                                            )}>
                                                                                {person.status}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                    {selectedPersonal.length > 0 && (
                                                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                                            <span className="text-xs font-bold text-brand-text-muted">
                                                                {selectedPersonal.length} persona{selectedPersonal.length !== 1 ? 's' : ''} seleccionada{selectedPersonal.length !== 1 ? 's' : ''}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setPersonalDropdownOpen(false); }}
                                                                className="text-xs font-bold text-brand-primary hover:underline"
                                                            >
                                                                Cerrar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-50 flex flex-col items-center">
                                        <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest self-start ml-1">Documento Adjunto (Permiso Firmado)</label>
                                        <label className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-brand-primary/30 transition-all group">
                                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary mb-2 group-hover:scale-110 transition-transform">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-bold text-brand-text">Cargar Archivo PDF / Imagen</p>
                                            <p className="text-[10px] text-brand-text-muted mt-1">Seleccione el documento firmado en campo</p>
                                            <input type="file" className="hidden" accept=".pdf,image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-white text-brand-text-muted border border-gray-200 hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[1.5] py-3.5 rounded-xl font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/10 hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {saving ? 'Guardando...' : editingReport ? 'Actualizar Registro' : 'Guardar y Validar'}
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(18, 107, 240, 0.2);
        }
      `}} />
        </div >
    );
};
