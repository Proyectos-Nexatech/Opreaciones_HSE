import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    LayoutGrid,
    Users,
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPermisos, getAusentismo, getPersonal } from '../services/hseService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'meta';
    icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, icon: Icon }) => (
    <div className="bg-brand-card p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-brand-primary/30 transition-all hover:shadow-lg shadow-sm">
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

export const Dashboard: React.FC = () => {
    const [permisosData, setPermisosData] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0 });

    const [ausentismoRate, setAusentismoRate] = useState<string>('0%');

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
                const permisos = await getPermisos();
                setPermisosData(permisos || []);
                setStats({ total: permisos?.length || 0 });

                // Calcular Tasa de Ausentismo
                const [ausencias, personal] = await Promise.all([
                    getAusentismo(),
                    getPersonal()
                ]);

                if (personal && personal.length > 0) {
                    const totalPersonal = personal.filter((p: any) => p.centro_costo_id).length;
                    const ausentesTotales = ausencias ? ausencias.length : 0;
                    if (totalPersonal > 0) {
                        const rate = ((ausentesTotales / totalPersonal) * 100).toFixed(1);
                        setAusentismoRate(`${rate}%`);
                    } else {
                        setAusentismoRate('N/A');
                    }
                } else {
                    setAusentismoRate('N/A');
                }
            } catch (error) {
                console.error("Error al cargar data del dashboard:", error);
            }
        };
        loadDashboardData();
    }, []);

    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('All');
    const [selectedCentro, setSelectedCentro] = useState<string>('All');
    const [selectedSupervisor, setSelectedSupervisor] = useState<string>('All');

    const filteredPermisosData = permisosData.filter(p => {
        const matchesEmpresa = selectedEmpresa === 'All' || (p.empresa?.name || 'Sin Asignar') === selectedEmpresa;
        const matchesCentro = selectedCentro === 'All' || (p.centro?.name || 'Sin Asignar') === selectedCentro;
        const matchesSupervisor = selectedSupervisor === 'All' || (p.supervisor?.name || 'Sin Asignar') === selectedSupervisor;
        return matchesEmpresa && matchesCentro && matchesSupervisor;
    });

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
                    <Link
                        to="/reportes-permisos"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <span className="text-lg">+</span> Crear Reporte
                    </Link>
                </div>
            </div>

            {/* Filtros Dinámicos */}
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

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Permisos Activos" value={stats.total.toString()} trend="+12%" trendType="positive" icon={ShieldCheck} />
                <StatCard title="Indicador Ausentismo" value={ausentismoRate} trend="Actual" trendType="meta" icon={Users} />
                <StatCard title="Puntaje de Seguridad" value="98.5%" trend="+2%" trendType="meta" icon={Users} />
                <StatCard title="Incidentes (Mes)" value="12" trend="-15%" trendType="positive" icon={AlertCircle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico principal / Histórico General */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-2xl font-bold text-brand-text">Operaciones Totales</h3>
                            <p className="text-brand-text-muted text-sm mt-1">Validaciones de permisos por mes por Personal HSE</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <select className="bg-gray-50 border-none rounded-lg py-2 px-4 text-xs font-bold text-brand-text focus:ring-2 focus:ring-brand-primary/20 outline-none cursor-pointer">
                                <option>Este Año</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 mt-6 h-64 min-h-[256px]">
                        {permisosData.length > 0 ? (
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
                                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px' }}
                                    />
                                    {supervisores.map((sup, idx) => (
                                        <Bar
                                            key={sup}
                                            dataKey={sup}
                                            stackId="a"
                                            fill={COLORS[idx % COLORS.length]}
                                            radius={idx === supervisores.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            maxBarSize={40}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl w-full">
                                No hay registros de permisos disponibles.
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel lateral derecho: Gráfica de Torta de Permisos */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-brand-text">Tipos de Permisos</h3>
                            <button className="text-brand-primary text-xs font-bold hover:underline">Ver Todos</button>
                        </div>
                        <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-bold mb-6">
                            Distribución de reportes diarios
                        </p>

                        <div className="flex-1 flex flex-col justify-center min-h-[220px] relative">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getPermitColor(entry.name)} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={renderTooltip} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center">
                                    No hay permisos registrados para mostrar distribución.
                                </div>
                            )}
                        </div>

                        {/* Listado rápido opcional abajo de la torta */}
                        <div className="space-y-3 pt-4 border-t border-gray-50 mt-4">
                            {pieData.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPermitColor(item.name) }} />
                                        <span className="text-xs font-bold text-brand-text truncate max-w-[140px]">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-brand-text block">{item.porcentaje}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

