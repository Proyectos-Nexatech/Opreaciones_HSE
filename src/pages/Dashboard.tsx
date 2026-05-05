import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    LayoutGrid,
    Users,
    ShieldCheck,
    X,
    Hash,
    ExternalLink
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPermisos, getAusentismo, getPersonal, getEventos, getNovedades } from '../services/hseService';
import { FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { HSEPyramid } from '../components/HSEPyramid';
import { useUserFilter } from '../hooks/useUserFilter';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'meta';
    icon: React.ElementType;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, icon: Icon, onClick }) => (
    <div 
        onClick={onClick}
        className={cn(
            "bg-brand-card p-6 rounded-2xl border border-gray-100 relative overflow-hidden group transition-all hover:shadow-lg shadow-sm",
            onClick ? "cursor-pointer hover:border-brand-primary/30" : ""
        )}
    >
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-primary/5 rounded-xl text-brand-primary">
                <Icon className="w-5 h-5" />
            </div>
            <div className="p-2 border border-gray-100 rounded-full text-brand-text-muted group-hover:text-brand-primary group-hover:bg-brand-accent transition-all cursor-pointer">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
            </div>
        </div>
        <p className="text-brand-text-muted text-sm font-semibold mb-1 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-brand-text">{value}</h3>
            {trend && (
                <span className={cn(
                    "text-[11px] font-bold px-2.5 py-1 rounded-lg border",
                    trendType === 'positive' && "bg-brand-success/10 text-brand-success border-brand-success/20",
                    trendType === 'negative' && "bg-brand-error/10 text-brand-error border-brand-error/20",
                    trendType === 'meta' && "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                )}>
                    {trend}
                </span>
            )}
        </div>
    </div>
);

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORS = ['#126bf0', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];

const EmptyState = () => (
    <div className="py-12 text-center">
        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-brand-text-muted font-bold text-sm uppercase tracking-widest">No se encontraron registros</p>
    </div>
);

export const Dashboard: React.FC = () => {
    const { filterUserId, isAdmin } = useUserFilter();
    const [permisosData, setPermisosData] = useState<any[]>([]);
    const [eventosData, setEventosData] = useState<any[]>([]);
    const [novedadesData, setNovedadesData] = useState<any[]>([]);
    const [ausentismoData, setAusentismoData] = useState<any[]>([]);
    const [personalData, setPersonalData] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0 });
    const [activeModal, setActiveModal] = useState<'permisos' | 'ausentismo' | 'novedades' | 'incidentes' | null>(null);

    // Define color mappings for the specific permit types
    const getPermitColor = (tipo: string) => {
        const lowerType = tipo.toLowerCase();
        if (lowerType === 'trabajo en caliente') return '#ef4444'; // Rojo (es rojo)
        if (lowerType === 'permisos generales' || lowerType === 'permiso general') return '#10b981'; // Verde
        if (lowerType === 'espacios confinados') return '#f97316'; // Naranja
        if (lowerType === 'trabajo en alturas') return '#3b82f6'; // Azul
        return '#9ca3af'; // Gris por defecto si no coincide
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Cargar todo el set de datos inicial
                const [permisos, ausencias, personal, eventos, novedades] = await Promise.all([
                    getPermisos(filterUserId ? { userId: filterUserId } : undefined),
                    getAusentismo(filterUserId ? { userId: filterUserId } : undefined),
                    getPersonal(),
                    getEventos(filterUserId ? { userId: filterUserId } : undefined),
                    getNovedades(filterUserId ? { userId: filterUserId } : undefined)
                ]);

                setPermisosData(permisos || []);
                setAusentismoData(ausencias || []);
                setPersonalData(personal || []); // Necesitamos guardar el personal para el cálculo reactivo
                setEventosData(eventos || []);
                setNovedadesData(novedades || []);
                setStats({ total: permisos?.length || 0 });

            } catch (error) {
                console.error("Error al cargar data del dashboard:", error);
            }
        };
        loadDashboardData();
    }, [filterUserId]);

    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('All');
    const [selectedCentro, setSelectedCentro] = useState<string>('All');
    const [selectedSupervisor, setSelectedSupervisor] = useState<string>('All');

    const filteredPermisosData = permisosData.filter(p => {
        const matchesEmpresa = selectedEmpresa === 'All' || (p.empresa?.name || 'Sin Asignar') === selectedEmpresa;
        const matchesCentro = selectedCentro === 'All' || (p.centro?.name || 'Sin Asignar') === selectedCentro;
        const matchesSupervisor = selectedSupervisor === 'All' || (p.supervisor?.name || 'Sin Asignar') === selectedSupervisor;
        return matchesEmpresa && matchesCentro && matchesSupervisor;
    });

    const filteredEventosData = eventosData.filter(e => {
        const matchesEmpresa = selectedEmpresa === 'All' || (e.empresa?.name || 'Sin Asignar') === selectedEmpresa;
        const matchesCentro = selectedCentro === 'All' || (e.centro?.name || 'Sin Asignar') === selectedCentro;
        const matchesSupervisor = selectedSupervisor === 'All' || (e.supervisor?.name || 'Sin Asignar') === selectedSupervisor;
        return matchesEmpresa && matchesCentro && matchesSupervisor;
    });

    const filteredNovedadesData = novedadesData.filter(n => {
        const matchesEmpresa = selectedEmpresa === 'All' || (n.empresa?.name || 'Sin Asignar') === selectedEmpresa;
        const matchesCentro = selectedCentro === 'All' || (n.centro?.name || 'Sin Asignar') === selectedCentro;
        return matchesEmpresa && matchesCentro;
    });

    const filteredAusentismoData = ausentismoData.filter(a => {
        const matchesEmpresa = selectedEmpresa === 'All' || (a.empresa?.name || 'Sin Asignar') === selectedEmpresa;
        const matchesCentro = selectedCentro === 'All' || (a.centro?.name || 'Sin Asignar') === selectedCentro;
        const matchesSupervisor = selectedSupervisor === 'All' || a.reporter === selectedSupervisor || (a.email === selectedSupervisor);
        return matchesEmpresa && matchesCentro && matchesSupervisor;
    });

    // Calcular tasa de ausentismo de forma reactiva
    const currentAusentismoRate = (() => {
        if (!personalData || personalData.length === 0) return '0%';

        const filteredPersonal = personalData.filter(p => {
            const matchesEmpresa = selectedEmpresa === 'All' || (p.empresa?.name || 'Sin Asignar') === selectedEmpresa;
            const matchesCentro = selectedCentro === 'All' || (p.centro?.name || 'Sin Asignar') === selectedCentro;
            return matchesEmpresa && matchesCentro && p.centro_costo_id;
        });

        const totalPersonal = filteredPersonal.length;
        const ausentesTotales = filteredAusentismoData.length;

        // Ahora solo devolvemos el conteo de personas, no el porcentaje
        return ausentesTotales.toString();
    })();

    const hseStats = {
        mti: filteredEventosData.reduce((sum: number, e: any) => sum + (Number(e.num_tratamientos) || 0), 0),
        fai: filteredEventosData.reduce((sum: number, e: any) => sum + (Number(e.num_auxilios) || 0), 0),
        nearMiss: filteredEventosData.reduce((sum: number, e: any) => sum + (Number(e.num_incidentes) || 0), 0),
        aci: filteredEventosData.filter((e: any) => e.acto_condicion && e.acto_condicion.trim() !== '' && e.acto_condicion.trim() !== '0').length
    };

    const getChartData = () => {
        if (!filteredPermisosData.length) return [];

        const conteos: Record<string, number> = {};
        filteredPermisosData.forEach(p => {
            const t = p.tipo || 'Sin Tipo Especificado';
            conteos[t] = (conteos[t] || 0) + 1;
        });

        const total = filteredPermisosData.length;
        return Object.keys(conteos).map((key) => ({
            name: key,
            value: conteos[key],
            porcentaje: ((conteos[key] / total) * 100).toFixed(1)
        })).sort((a, b) => b.value - a.value);
    };

    const getBarChartData = () => {
        if (!filteredPermisosData.length) return { data: [], supervisores: [] };

        // Inicializar datos para cada mes
        const dataPorMes = MESES.map(mes => ({ name: mes } as any));
        const supervisoresSet = new Set<string>();

        filteredPermisosData.forEach(p => {
            // Usamos la fecha del reporte para agrupar
            const fechaStr = p.fecha || p.created_at;
            if (!fechaStr) return;

            // Extraer mes asumiendo fomato ISO / YYYY-MM-DD
            const date = new Date(fechaStr);
            // Compensar diferencia de zona horaria si la fecha viene de UTC
            const monthIndex = date.getUTCMonth(); // 0-11

            const supervisorName = p.supervisor?.name || 'Sin Asignar';
            supervisoresSet.add(supervisorName);

            // Sumar al conteo del mes y supervisor correspondiente
            if (dataPorMes[monthIndex][supervisorName]) {
                dataPorMes[monthIndex][supervisorName] += 1;
            } else {
                dataPorMes[monthIndex][supervisorName] = 1;
            }
        });

        return { data: dataPorMes, supervisores: Array.from(supervisoresSet) };
    };

    // Calculate options from original data
    const empresasOptions = Array.from(new Set(permisosData.map(p => p.empresa?.name || 'Sin Asignar'))).sort();
    const centrosOptions = Array.from(new Set(permisosData.map(p => p.centro?.name || 'Sin Asignar'))).sort();
    const supervisorOptions = Array.from(new Set(permisosData.map(p => p.supervisor?.name || 'Sin Asignar'))).sort();

    const pieData = getChartData();
    const { data: barData, supervisores } = getBarChartData();

    // Custom Tooltip para el PieChart
    const renderTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
                    <p className="text-xs font-bold text-brand-text">{data.name}</p>
                    <p className="text-brand-primary font-bold">{data.value} permisos</p>
                    {data.porcentaje && <p className="text-[10px] text-gray-500 font-semibold">{data.porcentaje}% del total</p>}
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip para el BarChart
    const renderBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            let total = 0;
            payload.forEach((p: any) => total += p.value);
            return (
                <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-2xl min-w-[160px]">
                    <p className="text-xs font-black text-brand-text uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">{label} <span className="text-brand-primary float-right">{total}</span></p>
                    <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-gray-600 truncate max-w-[120px]">{entry.name}</span>
                                </div>
                                <span className="text-brand-text ml-4">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700 pb-10 px-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text">Resumen de Rendimiento</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Revisa las analíticas y métricas de Operaciones HSE.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-brand-text font-semibold hover:bg-gray-50 transition-all shadow-sm">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Filtrar Fecha</span>
                    </button>
                </div>
            </div>

            {/* Filtros Dinámicos — Solo visibles para administradores */}
            {isAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-[11px] font-black text-brand-text-muted uppercase tracking-widest mb-2 px-1">Empresa Cliente</label>
                    <select
                        value={selectedEmpresa}
                        onChange={(e) => setSelectedEmpresa(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-brand-text focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none cursor-pointer transition-all appearance-none"
                    >
                        <option value="All">Todas las empresas</option>
                        {empresasOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-[11px] font-black text-brand-text-muted uppercase tracking-widest mb-2 px-1">Centro de Costo</label>
                    <select
                        value={selectedCentro}
                        onChange={(e) => setSelectedCentro(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-brand-text focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none cursor-pointer transition-all appearance-none"
                    >
                        <option value="All">Todos los centros</option>
                        {centrosOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-[11px] font-black text-brand-text-muted uppercase tracking-widest mb-2 px-1">Personal HSE</label>
                    <select
                        value={selectedSupervisor}
                        onChange={(e) => setSelectedSupervisor(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-brand-text focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none cursor-pointer transition-all appearance-none"
                    >
                        <option value="All">Todo el personal</option>
                        {supervisorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
            )}

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Permisos Activos" 
                    value={filteredPermisosData.length.toString()} 
                    trend="+12%" 
                    trendType="positive" 
                    icon={ShieldCheck} 
                    onClick={() => setActiveModal('permisos')}
                />
                <StatCard 
                    title="Indicador Ausentismo" 
                    value={currentAusentismoRate} 
                    trend="Actual" 
                    trendType="meta" 
                    icon={Users} 
                    onClick={() => setActiveModal('ausentismo')}
                />
                <StatCard 
                    title="Novedades" 
                    value={filteredNovedadesData.length.toString()} 
                    trend="Reportadas" 
                    trendType="meta" 
                    icon={FileText} 
                    onClick={() => setActiveModal('novedades')}
                />
                <StatCard 
                    title="Incidentes (Mes)" 
                    value={(hseStats.nearMiss + hseStats.fai + hseStats.mti).toString()} 
                    trend="-15%" 
                    trendType="positive" 
                    icon={AlertCircle} 
                    onClick={() => setActiveModal('incidentes')}
                />
            </div>

            {/* Modal de Detalle de Indicadores */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-brand-text italic capitalize">
                                    {activeModal === 'permisos' && 'Listado de Permisos'}
                                    {activeModal === 'ausentismo' && 'Detalle de Ausentismo'}
                                    {activeModal === 'novedades' && 'Bitácora de Novedades'}
                                    {activeModal === 'incidentes' && 'Registro de Incidentes'}
                                </h3>
                                <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mt-1">
                                    {activeModal === 'permisos' && 'Registros actuales según filtros'}
                                    {activeModal === 'ausentismo' && 'Personas ausentes y causas reportadas'}
                                    {activeModal === 'novedades' && 'Últimos eventos operativos registrados'}
                                    {activeModal === 'incidentes' && 'Consolidado de eventos de seguridad'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-brand-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {/* VISTA PERMISOS */}
                            {activeModal === 'permisos' && (
                                <div className="space-y-3">
                                    {filteredPermisosData.length > 0 ? filteredPermisosData.map((p, idx) => (
                                        <div key={p.id || idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 hover:bg-white transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                                                    <Hash className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-brand-text tracking-tight">{p.numero_formato || 'S/N'}</p>
                                                    <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">{p.tipo}</p>
                                                    {p.documento_url && (
                                                        <a href={p.documento_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-1 text-[9px] font-bold text-brand-primary hover:underline">
                                                            <ExternalLink className="w-2.5 h-2.5" /> Ver Documento
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-[10px]">
                                                <p className="font-black text-brand-text">{p.supervisor?.name || 'N/A'}</p>
                                                <p className="text-gray-400 font-bold">{p.fecha}</p>
                                                {p.hora_firma && (
                                                    <div className="flex items-center justify-end gap-1 mt-1 text-brand-primary font-black">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        <span>{p.hora_firma}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : <EmptyState />}
                                </div>
                            )}

                            {/* VISTA AUSENTISMO */}
                            {activeModal === 'ausentismo' && (
                                <div className="space-y-3">
                                    {filteredAusentismoData.length > 0 ? filteredAusentismoData.map((a, idx) => (
                                        <div key={a.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 hover:bg-white transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-sm font-black text-brand-text">{a.persona_ausente}</p>
                                                <span className="text-[9px] font-black bg-white px-2 py-1 rounded-lg border border-gray-100 text-gray-400">{a.fecha_reporte}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                                <p className="text-xs font-bold text-brand-text-muted italic">Causa: {a.causa}</p>
                                            </div>
                                        </div>
                                    )) : <EmptyState />}
                                </div>
                            )}

                            {/* VISTA NOVEDADES */}
                            {activeModal === 'novedades' && (
                                <div className="space-y-3">
                                    {filteredNovedadesData.length > 0 ? filteredNovedadesData.map((n, idx) => (
                                        <div key={n.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 hover:bg-white transition-all">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-black text-brand-text tracking-tight">{n.titulo}</p>
                                                    <p className="text-[10px] font-bold text-brand-text-muted mt-1 uppercase tracking-widest">{n.tipo || 'Novedad Operativa'}</p>
                                                </div>
                                                <span className="text-[9px] font-black bg-brand-primary/5 text-brand-primary px-2 py-1 rounded-lg border border-brand-primary/10">{n.fecha_reporte || new Date(n.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )) : <EmptyState />}
                                </div>
                            )}

                            {/* VISTA INCIDENTES */}
                            {activeModal === 'incidentes' && (
                                <div className="space-y-3">
                                    {filteredEventosData.length > 0 ? filteredEventosData.map((e, idx) => (
                                        <div key={e.id || idx} className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 hover:border-brand-primary/20 hover:bg-white transition-all">
                                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                                <div>
                                                    <p className="text-[11px] font-black text-brand-text uppercase tracking-wider">{e.persona_involucrada || e.informacion_colaborador || 'Personal Operativo'}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 mt-0.5">{e.fecha_reporte}</p>
                                                </div>
                                                <div className="px-3 py-1 bg-brand-error/5 text-brand-error rounded-full text-[9px] font-black border border-brand-error/10 uppercase">Registro HSE</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                                                    <p className="text-lg font-black text-brand-text leading-none">{e.num_incidentes || 0}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Incidentes</p>
                                                </div>
                                                <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                                                    <p className="text-lg font-black text-brand-text leading-none">{e.num_auxilios || 0}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Auxilios</p>
                                                </div>
                                                <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                                                    <p className="text-lg font-black text-brand-text leading-none">{e.num_tratamientos || 0}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Tratamientos</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <EmptyState />}
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <HSEPyramid 
                            mti={hseStats.mti} 
                            fai={hseStats.fai} 
                            nearMiss={hseStats.nearMiss} 
                            aci={hseStats.aci} 
                        />
                    </div>
                    
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-black text-brand-text mb-1 italic">Permisos de Trabajo</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Distribución por Peligrosidad</p>
                        
                        <div className="flex-1 min-h-[250px]">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={getPermitColor(entry.name)} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-50 rounded-3xl">Sin datos</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-black text-brand-text mb-1 italic">Permisos Revalidados</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Consolidado por Categoría</p>
                        
                        <div className="flex-1 min-h-[250px] mt-4">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={pieData} 
                                        layout="vertical" 
                                        margin={{ left: 40, right: 20, top: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            type="number" 
                                            axisLine={{ stroke: '#cbd5e1' }} 
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            axisLine={{ stroke: '#cbd5e1' }} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                            width={100} 
                                        />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                                        <Legend 
                                            verticalAlign="top" 
                                            align="left" 
                                            wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'black' }}
                                            formatter={() => <span className="text-slate-500">CANTIDAD</span>}
                                        />
                                        <Bar 
                                            dataKey="value" 
                                            barSize={24} 
                                            radius={[0, 4, 4, 0]}
                                        >
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={getPermitColor(entry.name)} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-50 rounded-3xl">Sin datos</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gráfico principal / Histórico General (Bottom) */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-brand-text">Operaciones Totales</h3>
                            <p className="text-brand-text-muted text-[11px] mt-1">Validaciones de permisos por mes por Personal HSE</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <select className="bg-gray-50 border-none rounded-lg py-2 px-4 text-xs font-bold text-brand-text focus:ring-2 focus:ring-brand-primary/20 outline-none cursor-pointer">
                                <option>Este Año</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 h-[300px] w-full">
                        {filteredPermisosData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                                    <Tooltip content={renderBarTooltip} cursor={{ fill: '#f9fafb' }} />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }}
                                    />
                                    {supervisores.map((sup, idx) => (
                                        <Bar
                                            key={sup}
                                            dataKey={sup}
                                            stackId="a"
                                            fill={COLORS[idx % COLORS.length]}
                                            radius={idx === supervisores.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            maxBarSize={30}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl w-full p-10 text-center">
                                No se encontraron registros de permisos para los filtros seleccionados.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

