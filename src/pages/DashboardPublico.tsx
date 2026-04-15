import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    AlertCircle,
    Users,
    ShieldCheck,
    Map,
    Building2,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { getPermisos, getAusentismo, getPersonal, getEventos, getCentrosCostoByEmpresa, getProfileByToken } from '../services/hseService';
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
    const [ausentismoRate, setAusentismoRate] = useState<string>('0%');
    const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
    const [selectedCentroId, setSelectedCentroId] = useState<string>('All');
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
            if (!profile || !profile.empresa_cliente_id) {
                setError('Token inválido o empresa no asignada.');
                setLoading(false);
                return;
            }
            setClientProfile(profile);

            // 2. Cargar datos filtrados por la empresa del token
            const empresaId = profile.empresa_cliente_id;
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickStat icon={ShieldCheck} label="Permisos" value={filteredPermisos.length.toString()} color="blue" />
                    <QuickStat icon={Users} label="Ausentismo" value={ausentismoRate} color="green" />
                    <QuickStat icon={Map} label="Centros" value={centrosCosto.length.toString()} color="amber" />
                    <QuickStat icon={AlertCircle} label="Incidentes" value={(hseStats.nearMiss + hseStats.fai + hseStats.mti).toString()} color="red" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <HSEPyramid 
                        mti={hseStats.mti} 
                        fai={hseStats.fai} 
                        nearMiss={hseStats.nearMiss} 
                        aci={hseStats.aci} 
                    />
                    
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-black text-brand-text mb-1 italic">Tipos de Trabajo</h3>
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

const QuickStat: React.FC<{ icon: any, label: string, value: string, color: 'blue' | 'green' | 'amber' | 'red' }> = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        red: "bg-rose-50 text-rose-600 border-rose-100"
    };
    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-brand-primary/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color]} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-brand-text">{value}</p>
        </div>
    );
};
