import React, { useEffect, useState, useRef } from 'react';
import {
    AlertCircle,
    Users,
    ShieldCheck,
    Map,
    Building2,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPermisos, getAusentismo, getPersonal, getEventos, getCentrosCostoByEmpresa } from '../services/hseService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { HSEPyramid } from '../components/HSEPyramid';
import { useAuth } from '../context/AuthContext';

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

const getPermitColor = (tipo: string) => {
    const lowerType = tipo.toLowerCase();
    if (lowerType === 'trabajo en caliente') return '#ef4444';
    if (lowerType === 'permisos generales' || lowerType === 'permiso general') return '#10b981';
    if (lowerType === 'espacios confinados') return '#f97316';
    if (lowerType === 'trabajo en alturas') return '#3b82f6';
    return '#9ca3af';
};

export const DashboardCliente: React.FC = () => {
    const { profile } = useAuth();
    const empresaId: string | null = profile?.empresa_cliente_id || null;
    const empresaNombre: string = profile?.empresa_cliente?.name || 'Mi Empresa';

    const [permisosData, setPermisosData] = useState<any[]>([]);
    const [eventosData, setEventosData] = useState<any[]>([]);
    const [ausentismoRate, setAusentismoRate] = useState<string>('0');
    const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
    const [selectedCentroId, setSelectedCentroId] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!empresaId || hasFetched.current) return;
        hasFetched.current = true;
        loadData();
    }, [empresaId]);

    const loadData = async () => {
        if (!empresaId) return;
        try {
            setLoading(true);
            const [permisos, eventos, ausencias, personal, centros] = await Promise.all([
                getPermisos({ empresaId }),
                getEventos({ empresaId }),
                getAusentismo(),
                getPersonal(),
                getCentrosCostoByEmpresa(empresaId)
            ]);

            setPermisosData(permisos || []);
            setEventosData(eventos || []);
            setCentrosCosto(centros || []);

            // Calcular tasa de ausentismo (conteo absoluto)
            if (ausencias) {
                setAusentismoRate(ausencias.length.toString());
            } else {
                setAusentismoRate('0');
            }
        } catch (error) {
            console.error('Error al cargar datos del dashboard cliente:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado adicional por centro de costo (seleccionable dentro de la empresa)
    const filteredPermisos = permisosData.filter(p => {
        if (selectedCentroId === 'All') return true;
        return p.centro_costo_id === selectedCentroId || p.centro?.id === selectedCentroId;
    });

    const filteredEventos = eventosData.filter(e => {
        if (selectedCentroId === 'All') return true;
        return e.centro_costo_id === selectedCentroId || e.centro?.id === selectedCentroId;
    });

    const hseStats = {
        mti: filteredEventos.reduce((sum: number, e: any) => sum + (Number(e.num_tratamientos) || 0), 0),
        fai: filteredEventos.reduce((sum: number, e: any) => sum + (Number(e.num_auxilios) || 0), 0),
        nearMiss: filteredEventos.reduce((sum: number, e: any) => sum + (Number(e.num_incidentes) || 0), 0),
        aci: filteredEventos.filter((e: any) => e.acto_condicion && e.acto_condicion.trim() !== '').length
    };

    const getChartData = () => {
        if (!filteredPermisos.length) return [];
        const conteos: Record<string, number> = {};
        filteredPermisos.forEach(p => {
            const t = p.tipo || 'Sin Tipo Especificado';
            conteos[t] = (conteos[t] || 0) + 1;
        });
        const total = filteredPermisos.length;
        return Object.keys(conteos).map(key => ({
            name: key,
            value: conteos[key],
            porcentaje: ((conteos[key] / total) * 100).toFixed(1)
        })).sort((a, b) => b.value - a.value);
    };

    const getBarChartData = () => {
        if (!filteredPermisos.length) return { data: [], supervisores: [] };
        const dataPorMes = MESES.map(mes => ({ name: mes } as any));
        const supervisoresSet = new Set<string>();
        filteredPermisos.forEach(p => {
            const fechaStr = p.fecha || p.created_at;
            if (!fechaStr) return;
            const date = new Date(fechaStr);
            const monthIndex = date.getUTCMonth();
            const supervisorName = p.supervisor?.name || 'Sin Asignar';
            supervisoresSet.add(supervisorName);
            dataPorMes[monthIndex][supervisorName] = (dataPorMes[monthIndex][supervisorName] || 0) + 1;
        });
        return { data: dataPorMes, supervisores: Array.from(supervisoresSet) };
    };

    const pieData = getChartData();
    const { data: barData, supervisores } = getBarChartData();

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

    const renderBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            let total = 0;
            payload.forEach((p: any) => total += p.value);
            return (
                <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-2xl min-w-[160px]">
                    <p className="text-xs font-black text-brand-text uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                        {label} <span className="text-brand-primary float-right">{total}</span>
                    </p>
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

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                <p className="text-brand-text-muted font-bold text-sm">Cargando su dashboard...</p>
            </div>
        );
    }

    if (!empresaId) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-brand-text">Sin empresa asignada</h2>
                <p className="text-brand-text-muted text-sm max-w-md">
                    Su cuenta no tiene una empresa cliente configurada. Por favor contacte al administrador del sistema para completar la configuración.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700 pb-10 px-4 md:px-8 pt-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                            <Building2 className="w-4 h-4 text-brand-primary" />
                        </div>
                        <span className="text-sm font-black text-brand-primary uppercase tracking-widest">
                            {empresaNombre}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text">
                        Resumen de Rendimiento HSE
                    </h1>
                    <p className="text-brand-text-muted text-sm mt-1">
                        Métricas de seguridad y operaciones de su empresa.
                    </p>
                </div>
            </div>

            {/* Filtro de Centro de Costo */}
            {centrosCosto.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Map className="w-4 h-4 text-brand-primary" />
                        <p className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest">
                            Centro de Costo
                        </p>
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                        <select
                            value={selectedCentroId}
                            onChange={(e) => setSelectedCentroId(e.target.value)}
                            className="w-full bg-gray-50 border border-transparent rounded-xl py-3 px-4 pr-10 text-sm font-bold text-brand-text focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none cursor-pointer transition-all appearance-none"
                        >
                            <option value="All">Todos los centros de costo</option>
                            {centrosCosto.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted pointer-events-none" />
                    </div>
                    {selectedCentroId !== 'All' && (
                        <button
                            onClick={() => setSelectedCentroId('All')}
                            className="text-xs font-bold text-brand-primary hover:underline flex-shrink-0"
                        >
                            Ver todos
                        </button>
                    )}
                </div>
            )}

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Permisos Totales"
                    value={filteredPermisos.length.toString()}
                    icon={ShieldCheck}
                />
                <StatCard
                    title="Indicador Ausentismo"
                    value={ausentismoRate}
                    icon={Users}
                />
                <StatCard
                    title="Centros de Costo"
                    value={centrosCosto.length.toString()}
                    icon={Map}
                />
                <StatCard
                    title="Incidentes"
                    value={(hseStats.nearMiss + hseStats.fai + hseStats.mti).toString()}
                    icon={AlertCircle}
                />
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Pirámide HSE */}
                    <HSEPyramid
                        mti={hseStats.mti}
                        fai={hseStats.fai}
                        nearMiss={hseStats.nearMiss}
                        aci={hseStats.aci}
                    />

                    {/* Tipos de Permisos */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-brand-text">Tipos de Permisos</h3>
                        </div>
                        <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-bold mb-6">
                            Distribución de reportes diarios
                        </p>

                        <div className="flex-1 flex flex-col justify-center min-h-[180px] relative">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={50}
                                            outerRadius={65}
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
                                            height={30}
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center">
                                    No hay permisos registrados{selectedCentroId !== 'All' ? ' para este centro de costo' : ' para su empresa'}.
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-50 mt-4">
                            {pieData.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPermitColor(item.name) }} />
                                        <span className="text-[10px] font-bold text-brand-text truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-brand-text">{item.porcentaje}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gráfico histórico */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-brand-text">Operaciones Totales</h3>
                            <p className="text-brand-text-muted text-[11px] mt-1">
                                Validaciones de permisos por mes · {empresaNombre}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 h-[300px] w-full">
                        {filteredPermisos.length > 0 ? (
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
                                No se encontraron registros para los filtros seleccionados.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
