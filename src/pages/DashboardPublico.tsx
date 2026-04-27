import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
import {
    AlertCircle,
    Users,
    ShieldCheck,
    Map,
    Building2,
    FileText,
    ArrowUpRight,
    X,
    Hash,
    ExternalLink
} from 'lucide-react';
import { getPermisos, getAusentismo, getPersonal, getEventos, getCentrosCostoByEmpresa, getProfileByToken, getNovedades } from '../services/hseService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { HSEPyramid } from '../components/HSEPyramid';
import { NexatechIcon } from '../components/NexatechIcon';

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

export const DashboardPublico: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [permisosData, setPermisosData] = useState<any[]>([]);
    const [eventosData, setEventosData] = useState<any[]>([]);
    const [novedadesData, setNovedadesData] = useState<any[]>([]);
    const [ausentismoData, setAusentismoData] = useState<any[]>([]);
    const [ausentismoRate, setAusentismoRate] = useState<string>('0%');
    const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
    const [selectedCentroId, setSelectedCentroId] = useState<string>('All');
    const [activeModal, setActiveModal] = useState<'permisos' | 'ausentismo' | 'novedades' | 'incidentes' | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token || hasFetched.current) return;
        hasFetched.current = true;
        loadClientAndData();
    }, [token]);

    const loadClientAndData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            // 1. Validar token y obtener perfil del cliente
            const profile = await getProfileByToken(token);
            if (!profile) {
                setError('Token inválido o no encontrado en el sistema.');
                setLoading(false);
                return;
            }
            if (!profile.empresa_cliente_id) {
                setError('El usuario tiene un token válido pero no tiene una empresa cliente asignada.');
                setLoading(false);
                return;
            }
            setClientProfile(profile);

            // 2. Cargar datos filtrados por la empresa del token
            const empresaId = profile.empresa_cliente_id;
            const profileCentroId = profile.centro_costo_id;

            const [permisos, eventos, ausencias, personal, centros, novedades] = await Promise.all([
                getPermisos({ empresaId, centroCostoId: profileCentroId || undefined }).catch(e => { console.error('P:', e); return []; }),
                getEventos({ empresaId, centroCostoId: profileCentroId || undefined }).catch(e => { console.error('E:', e); return []; }),
                getAusentismo().catch(e => { console.error('A:', e); return []; }),
                getPersonal().catch(e => { console.error('Per:', e); return []; }),
                getCentrosCostoByEmpresa(empresaId).catch(e => { console.error('C:', e); return []; }),
                getNovedades({ empresaId, centroCostoId: profileCentroId || undefined }).catch(e => { console.error('N:', e); return []; })
            ]);

            setPermisosData(permisos || []);
            setEventosData(eventos || []);
            setCentrosCosto(centros || []);
            setNovedadesData(novedades || []);
            setAusentismoData(ausencias || []);
            
            // Si tiene un centro fijo, lo seleccionamos
            if (profileCentroId) {
                setSelectedCentroId(profileCentroId);
            }

            // Calcular tasa de ausentismo
            if (personal && personal.length > 0) {
                const totalPersonal = personal.filter((p: any) => p.centro_costo_id).length;
                const ausentesTotales = ausencias ? ausencias.length : 0;
                if (totalPersonal > 0) {
                    const rate = ((ausentesTotales / totalPersonal) * 100).toFixed(1);
                    setAusentismoRate(`${rate}%`);
                }
            }
        } catch (err: any) {
            console.error('Error loading public dashboard:', err);
            setError('Error al cargar los datos. El token podría haber expirado o ser incorrecto.');
        } finally {
            setLoading(false);
        }
    };

    const filteredPermisos = permisosData.filter(p => {
        if (selectedCentroId === 'All') return true;
        return p.centro_costo_id === selectedCentroId || p.centro?.id === selectedCentroId;
    });

    const filteredEventos = eventosData.filter(e => {
        if (selectedCentroId === 'All') return true;
        return e.centro_costo_id === selectedCentroId || e.centro?.id === selectedCentroId;
    });

    const filteredNovedades = novedadesData.filter(n => {
        if (selectedCentroId === 'All') return true;
        return n.centro_costo_id === selectedCentroId || n.centro?.id === selectedCentroId;
    });

    const hseStats = {
        mti: filteredEventos.reduce((sum, e) => sum + (Number(e.num_tratamientos) || 0), 0),
        fai: filteredEventos.reduce((sum, e) => sum + (Number(e.num_auxilios) || 0), 0),
        nearMiss: filteredEventos.reduce((sum, e) => sum + (Number(e.num_incidentes) || 0), 0),
        aci: filteredEventos.filter(e => e.acto_condicion && e.acto_condicion.trim() !== '').length
    };

    const pieData = (() => {
        if (!filteredPermisos.length) return [];
        const conteos: Record<string, number> = {};
        filteredPermisos.forEach(p => {
            const t = p.tipo || 'Sin Tipo';
            conteos[t] = (conteos[t] || 0) + 1;
        });
        return Object.keys(conteos).map(key => ({
            name: key,
            value: conteos[key],
            porcentaje: ((conteos[key] / filteredPermisos.length) * 100).toFixed(1)
        })).sort((a, b) => b.value - a.value);
    })();

    const barChartData = (() => {
        const dataPorMes = MESES.map(mes => ({ name: mes } as any));
        const supervisoresSet = new Set<string>();
        filteredPermisos.forEach(p => {
            const date = new Date(p.fecha || p.created_at);
            const monthIndex = date.getUTCMonth();
            const supName = p.supervisor?.name || 'Sin Asignar';
            supervisoresSet.add(supName);
            dataPorMes[monthIndex][supName] = (dataPorMes[monthIndex][supName] || 0) + 1;
        });
        return { data: dataPorMes, supervisores: Array.from(supervisoresSet) };
    })();

    const EmptyState = () => (
        <div className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No se encontraron registros</p>
        </div>
    );

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                <p className="text-brand-text-muted font-black uppercase tracking-widest text-xs">Cargando Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mb-6 border border-red-100 shadow-xl shadow-red-500/5">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-brand-text mb-2">Acceso Denegado</h1>
                <p className="text-brand-text-muted font-medium max-w-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            {/* Header público sin logout */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <NexatechIcon className="w-10 h-10" />
                    <div>
                        <h1 className="text-lg font-black text-brand-text uppercase tracking-tight leading-none">Operaciones HSE</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest border border-brand-primary/10">
                                Vista Externa
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">|</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {clientProfile?.empresa_cliente?.name}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha de Reporte</p>
                    <p className="text-sm font-bold text-brand-text">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
                {/* Ocultar selector si hay un centro fijo asignado */}
                {!clientProfile?.centro_costo_id && (
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                                <Map className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtro Activo</p>
                                <p className="text-sm font-bold text-brand-text">Centro de Costo</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <select
                                value={selectedCentroId}
                                onChange={(e) => setSelectedCentroId(e.target.value)}
                                className="w-full bg-slate-50 border-transparent rounded-2xl py-3.5 px-6 font-bold text-brand-text focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all cursor-pointer"
                            >
                                <option value="All">Todos los centros disponibles</option>
                                {centrosCosto.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {clientProfile?.centro_costo_id && (
                    <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10 flex items-center gap-3">
                        <Map className="w-4 h-4 text-brand-primary" />
                        <p className="text-xs font-bold text-brand-primary">
                            Vista filtrada por sede específica
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={ShieldCheck} 
                        label="PERMISOS ACTIVOS" 
                        value={filteredPermisos.length.toString()} 
                        trend="+12%" 
                        color="blue" 
                        onClick={() => setActiveModal('permisos')}
                    />
                    <StatCard 
                        icon={Users} 
                        label="INDICADOR AUSENTISMO" 
                        value={ausentismoRate} 
                        trend="Actual" 
                        color="green" 
                        onClick={() => setActiveModal('ausentismo')}
                    />
                    <StatCard 
                        icon={FileText} 
                        label="NOVEDADES" 
                        value={filteredNovedades.length.toString()} 
                        trend="Reportadas" 
                        color="amber" 
                        onClick={() => setActiveModal('novedades')}
                    />
                    <StatCard 
                        icon={AlertCircle} 
                        label="INCIDENTES (MES)" 
                        value={(hseStats.nearMiss + hseStats.fai + hseStats.mti).toString()} 
                        trend="-15%" 
                        color="red" 
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
                                        {filteredPermisos.length > 0 ? filteredPermisos.map((p, idx) => (
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
                                                </div>
                                            </div>
                                        )) : <EmptyState />}
                                    </div>
                                )}

                                {/* VISTA AUSENTISMO */}
                                {activeModal === 'ausentismo' && (
                                    <div className="space-y-3">
                                        {ausentismoData.length > 0 ? ausentismoData.map((a, idx) => (
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
                                        {filteredNovedades.length > 0 ? filteredNovedades.map((n, idx) => (
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
                                        {filteredEventos.length > 0 ? filteredEventos.map((e, idx) => (
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

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-brand-text mb-1 italic">Tendencia de Validación</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Reportes procesados por mes</p>
                    
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData.data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                {barChartData.supervisores.map((sup, idx) => (
                                    <Bar key={sup} dataKey={sup} stackId="a" fill={COLORS[idx % COLORS.length]} radius={idx === barChartData.supervisores.length - 1 ? [4, 4, 0, 0] : 0} barSize={32} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>

            <footer className="h-16 border-t border-slate-100 flex items-center justify-center gap-2 bg-white/50 backdrop-blur-sm">
                <NexatechIcon className="w-4 h-4 opacity-50" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nexatech HSE · 2026</p>
            </footer>
        </div>
    );
};

// Componente de Tarjeta de Estadística Unificado
const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string;
    trend?: string;
    color: 'blue' | 'green' | 'amber' | 'red';
    onClick?: () => void;
}> = ({ icon: Icon, label, value, trend, color, onClick }) => {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-600 border-blue-200/50",
        green: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
        amber: "bg-amber-500/10 text-amber-600 border-amber-200/50",
        red: "bg-rose-500/10 text-rose-600 border-rose-200/50"
    };

    const trendClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        red: "bg-rose-50 text-rose-600 border-rose-100"
    };

    return (
        <div 
            onClick={onClick}
            className={cn(
                "bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
                onClick ? "cursor-pointer hover:border-brand-primary/20" : ""
            )}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-2xl", colorClasses[color])}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
            <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                {trend && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", trendClasses[color])}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
};
