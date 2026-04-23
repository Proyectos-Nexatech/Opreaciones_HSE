import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Edit3, Trash2, Loader2, Calendar, Users, Clock, AlertCircle, X, UserCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReporteAsistenciaModal } from '../components/ReporteAsistenciaModal';
import { getAsistencia, createAsistencia, updateAsistencia, deleteAsistencia as deleteAsistenciaService, getPersonal, getSupervisores, getCentrosCosto, getEmpresas } from '../services/hseService';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
    return (name || 'NN').split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 2);
}
function formatDateLong(d: string) {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatDateShort(d: string) {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function groupByDate(records: any[]): { date: string; rows: any[] }[] {
    const map = new Map<string, any[]>();
    for (const r of records) {
        const key = r.date || 'Sin fecha';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
    }
    return Array.from(map.entries())
        .map(([date, rows]) => ({ date, rows }))
        .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        'A tiempo': 'bg-emerald-50 text-emerald-600',
        'Retraso': 'bg-amber-50 text-amber-600',
        'Tarde': 'bg-amber-50 text-amber-600',
        'Falta': 'bg-red-50 text-red-500',
    };
    return (
        <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider', map[status] ?? 'bg-gray-100 text-gray-500')}>
            {status}
        </span>
    );
}

// ── Day Detail Drawer ─────────────────────────────────────────────────────────

function DayDetail({ date, rows, onClose, onEdit, onDelete }: {
    date: string; rows: any[];
    onClose: () => void; onEdit: (r: any) => void; onDelete: (id: string) => void;
}) {
    const [search, setSearch] = useState('');
    const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

    return (
        <div className="fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <p className="text-[11px] font-bold text-brand-text-muted uppercase tracking-widest">Detalle de asistencia</p>
                        <h2 className="text-base font-bold text-brand-text mt-0.5 capitalize">{formatDateLong(date)}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-brand-text-muted transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-3 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                        <input type="text" placeholder="Buscar trabajador..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {filtered.length === 0
                        ? <div className="py-20 text-center"><p className="text-sm font-semibold text-brand-text-muted">Sin resultados</p></div>
                        : filtered.map(row => (
                            <div key={row.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-all group">
                                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-[11px] font-bold text-brand-primary flex-shrink-0">
                                    {initials(row.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-brand-text truncate">{row.name}</p>
                                    <p className="text-[11px] text-brand-text-muted">{row.h || '—'}</p>
                                </div>
                                <StatusBadge status={row.status} />
                                <div className="flex gap-1.5 transition-opacity">
                                    <button onClick={stop(() => onEdit(row))} className="p-2 rounded-xl bg-gray-50 hover:bg-brand-primary/10 text-brand-text-muted hover:text-brand-primary transition-all border border-gray-100 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={stop(() => onDelete(row.id))} className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 text-brand-text-muted hover:text-red-500 transition-all border border-gray-100 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-semibold text-brand-text-muted">{filtered.length} de {rows.length} registros</p>
                </div>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export const Asistencia: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [personal, setPersonal] = useState<any[]>([]);
    const [supervisores, setSupervisores] = useState<any[]>([]);
    const [centros, setCentros] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<{ date: string; rows: any[] } | null>(null);
    const [filterSupervisor, setFilterSupervisor] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [asistenciaData, personalData, supervisoresData, centrosData, empresasData] = await Promise.all([
                getAsistencia(), getPersonal(), getSupervisores(), getCentrosCosto(), getEmpresas()
            ]);
            setPersonal(personalData || []);
            setSupervisores(supervisoresData || []);
            setCentros(centrosData || []);
            setEmpresas(empresasData || []);

            const flat = (asistenciaData || []).map((r: any) => {
                const supervisor = (supervisoresData || []).find((s: any) => s.id === r.created_by);
                return {
                    ...r,
                    name: r.nombre_persona || '',
                    h: r.hora_ingreso || '',
                    status: r.status || 'A tiempo',
                    date: r.fecha,
                    shift: r.jornada || 'Dia',
                    empresa: r.empresa_id,
                    centro: r.centro_costo_id,
                    supervisorId: r.created_by,
                    supervisorName: supervisor?.name || '',
                    email: r.email,
                };
            });
            setRecords(flat);
        } catch (err) {
            console.error('Error loading asistencia:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── derived ────────────────────────────────────────────────────────────────

    // All unique supervisors from records
    const supervisoresEnRegistros = Array.from(
        new Map(records.filter(r => r.supervisorName).map(r => [r.supervisorId, r.supervisorName])).entries()
    ).map(([id, name]) => ({ id, name }));

    // Apply filters then group
    const filtered = records.filter(r => {
        if (filterSupervisor && r.supervisorId !== filterSupervisor) return false;
        if (searchDate && !formatDateShort(r.date).toLowerCase().includes(searchDate.toLowerCase())) return false;
        return true;
    });

    const grouped = groupByDate(filtered);
    const latestGroup = groupByDate(records)[0] ?? null;

    const latestPresentes = latestGroup?.rows.filter(r => r.status === 'A tiempo').length ?? 0;
    const latestRetrasos  = latestGroup?.rows.filter(r => r.status === 'Retraso' || r.status === 'Tarde').length ?? 0;
    const latestFaltas    = latestGroup?.rows.filter(r => r.status === 'Falta').length ?? 0;

    // ── handlers ───────────────────────────────────────────────────────────────

    const handleSave = async (data: any) => {
        try {
            if (editingRecord) {
                const personId = data.personIds?.[0] ?? null;
                const person = personId ? personal.find(p => p.id === personId) : null;
                await updateAsistencia(editingRecord.id, {
                    nombre_persona: person ? person.name : (data.name || editingRecord.name),
                    jornada: data.shift || 'Dia',
                    status: data.status || 'A tiempo',
                    empresa_id: data.empresa || null,
                    centro_costo_id: data.centro || null,
                    orden_servicio: data.orden || null,
                    fecha: data.date,
                });
            } else if (data.personIds?.length > 0) {
                await Promise.all(data.personIds.map((id: string) => {
                    const person = personal.find(p => p.id === id);
                    return createAsistencia({
                        nombre_persona: person ? person.name : 'Unknown',
                        hora_ingreso: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        status: data.status || 'A tiempo',
                        jornada: data.shift || 'Dia',
                        email: data.email,
                        empresa_id: data.empresa || null,
                        centro_costo_id: data.centro || null,
                        orden_servicio: data.orden || null,
                        fecha: data.date,
                        created_by: data.supervisorId || null,
                    });
                }));
            }
            setEditingRecord(null);
            await loadData();
        } catch (err) { console.error('Error saving:', err); }
    };

    const handleEdit = (record: any) => { setEditingRecord(record); setIsModalOpen(true); };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Está seguro de eliminar este registro?')) return;
        try {
            await deleteAsistenciaService(id);
            if (selectedDay) {
                const updated = selectedDay.rows.filter(r => r.id !== id);
                updated.length === 0 ? setSelectedDay(null) : setSelectedDay({ ...selectedDay, rows: updated });
            }
            await loadData();
        } catch (err) { console.error('Error deleting:', err); }
    };

    // ── render ─────────────────────────────────────────────────────────────────

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Reporte de Asistencia</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Control de ingreso y validación de personal en sitio.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                >
                    <span className="text-lg">+</span> Registrar Ingreso
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ── Sidebar ── */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Resumen último día */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-bold text-brand-text-muted uppercase tracking-widest mb-1">Resumen Diario</p>
                        {latestGroup && (
                            <p className="text-[11px] text-brand-primary font-semibold mb-4">{capitalize(formatDateShort(latestGroup.date))}</p>
                        )}
                        <div className="space-y-4">
                            {[
                                { label: 'Presentes', value: latestPresentes, color: 'text-emerald-500', Icon: Users },
                                { label: 'Retrasos',  value: latestRetrasos,  color: 'text-amber-500',   Icon: Clock },
                                { label: 'Faltantes', value: latestFaltas,    color: 'text-red-500',     Icon: AlertCircle },
                            ].map(({ label, value, color, Icon }) => (
                                <div key={label} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-brand-text-muted" />
                                        <span className="text-sm font-medium text-brand-text-muted">{label}</span>
                                    </div>
                                    <span className={cn('text-lg font-bold', color)}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {latestGroup && (
                            <button onClick={() => setSelectedDay(latestGroup)}
                                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary/8 hover:bg-brand-primary/15 text-brand-primary text-xs font-bold transition-all">
                                Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Días registrados */}
                    {!loading && grouped.length > 0 && (
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[11px] font-bold text-brand-text-muted uppercase tracking-widest mb-2">Historial</p>
                            <p className="text-3xl font-extrabold text-brand-text">{groupByDate(records).length}</p>
                            <p className="text-xs text-brand-text-muted mt-1">días registrados</p>
                        </div>
                    )}
                </div>

                {/* ── Main list ── */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Filters bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search by date */}
                        <div className="relative flex-1">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                            <input type="text" placeholder="Buscar por fecha..." value={searchDate}
                                onChange={e => setSearchDate(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all shadow-sm" />
                        </div>
                        {/* Filter by supervisor */}
                        <div className="relative min-w-[220px]">
                            <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted pointer-events-none" />
                            <select value={filterSupervisor} onChange={e => setFilterSupervisor(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-8 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all shadow-sm cursor-pointer">
                                <option value="">Todos los supervisores</option>
                                {supervisoresEnRegistros.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="col-span-3 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Fecha</div>
                            <div className="col-span-2 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider text-center">Total</div>
                            <div className="col-span-2 text-[11px] font-bold text-emerald-500 uppercase tracking-wider text-center">Presentes</div>
                            <div className="col-span-2 text-[11px] font-bold text-amber-500 uppercase tracking-wider text-center">Retrasos</div>
                            <div className="col-span-1 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Acciones</div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-4" />
                                <p className="font-bold text-sm tracking-widest uppercase text-brand-text-muted">Cargando...</p>
                            </div>
                        ) : grouped.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                                <p className="font-bold text-sm text-brand-text-muted">No se encontraron registros</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {grouped.map(group => {
                                    const presentes = group.rows.filter(r => r.status === 'A tiempo').length;
                                    const retrasos  = group.rows.filter(r => r.status === 'Retraso' || r.status === 'Tarde').length;
                                    const faltas    = group.rows.filter(r => r.status === 'Falta').length;
                                    const total     = group.rows.length;
                                    // Supervisor of this day (most common or first)
                                    const supName = group.rows.find(r => r.supervisorName)?.supervisorName || '';

                                    return (
                                        <div key={group.date}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/60 transition-all group cursor-pointer"
                                            onClick={() => setSelectedDay(group)}
                                        >
                                            {/* Date + supervisor */}
                                            <div className="col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-4 h-4 text-brand-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-brand-text truncate">{formatDateShort(group.date)}</p>
                                                        {supName && (
                                                            <p className="text-[10px] text-brand-text-muted truncate">{supName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-2 text-center">
                                                <span className="text-base font-extrabold text-brand-text">{total}</span>
                                            </div>

                                            {/* Presentes */}
                                            <div className="col-span-2 text-center">
                                                <span className="text-base font-extrabold text-emerald-500">{presentes}</span>
                                            </div>

                                            {/* Retrasos */}
                                            <div className="col-span-2 text-center">
                                                <span className="text-base font-extrabold text-amber-500">{retrasos}</span>
                                            </div>

                                            {/* Faltas */}
                                            <div className="col-span-2 text-center">
                                                <span className="text-base font-extrabold text-red-500">{faltas}</span>
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-1 flex justify-end items-center gap-2">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setSelectedDay(group); }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary/8 hover:bg-brand-primary/15 text-brand-primary transition-all shadow-sm"
                                                    title="Ver detalle"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`¿Está seguro de eliminar TODOS los registros del ${formatDateShort(group.date)}?`)) {
                                                            Promise.all(group.rows.map((r: any) => deleteAsistenciaService(r.id)))
                                                                .then(() => loadData())
                                                                .catch(err => console.error('Error deleting day:', err));
                                                        }
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all shadow-sm"
                                                    title="Eliminar día completo"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer */}
                        {!loading && grouped.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100">
                                <p className="text-xs font-semibold text-brand-text-muted">
                                    {grouped.length} {grouped.length === 1 ? 'día' : 'días'} · {filtered.length} registros totales
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Day detail drawer */}
            {selectedDay && (
                <DayDetail
                    date={selectedDay.date}
                    rows={selectedDay.rows}
                    onClose={() => setSelectedDay(null)}
                    onEdit={rec => { setSelectedDay(null); handleEdit(rec); }}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal */}
            <ReporteAsistenciaModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingRecord(null); }}
                onSave={handleSave}
                initialData={editingRecord}
            />
        </div>
    );
};
