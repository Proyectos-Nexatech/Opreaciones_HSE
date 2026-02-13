import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Building2, MapPin, ClipboardList, Plus, AlertCircle, MessageSquare, Info, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supervisoresHSE } from '../data/supervisoresHSE';
import { allPersonal, centrosCosto, empresasCliente } from '../data/sharedData';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ReporteEventoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: any) => void;
    initialData?: any;
}

export const ReporteEventoModal: React.FC<ReporteEventoModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
    const [shift, setShift] = useState<'Dia' | 'Noche'>('Dia');

    // Form state
    const [formData, setFormData] = useState({
        correo: '',
        supervisorId: '',
        fechaReporte: '',
        empresa: '',
        centroCostoId: '',
        ordenServicio: '',
        numIncidentes: 0,
        numAuxilios: 0,
        numTratamientos: 0,
        detalleSituaciones: '',
        informacionColaborador: '',
        personaInvolucradaId: '',
        actoCondicion: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData
            });
            if (initialData.jornada) setShift(initialData.jornada);
        }
    }, [initialData]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) {
                setFormData(prev => ({ ...prev, correo: data.user!.email! }));
            }
        });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...formData,
            jornada: shift,
            // Keep camelCase, the page will map it to snake_case
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="bg-brand-primary p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{initialData ? 'Editar Evento' : 'Reporte Eventos Filtrado'}</h2>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Registro de Incidentes y Eventos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90 bg-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {/* Fecha del Sistema */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Fecha del Sistema</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" readOnly value={currentTime} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-500 focus:outline-none" />
                        </div>
                    </div>

                    {/* Correo */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Correo</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                readOnly
                                value={formData.correo}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Persona que realiza el reporte */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Persona que realiza el reporte</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.supervisorId}
                                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none"
                            >
                                <option value="">Seleccione una opción</option>
                                {supervisoresHSE.map(s => <option key={`s-${s.id}`} value={s.id}>{s.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Plus className="w-4 h-4 text-gray-400 rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Fecha del Reporte */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Fecha del reporte</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={formData.fechaReporte}
                                onChange={(e) => setFormData({ ...formData, fechaReporte: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Jornada */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Jornada de Trabajo</label>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1.5">
                            {(['Dia', 'Noche'] as const).map(j => (
                                <button key={j} onClick={() => setShift(j)} className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", shift === j ? "bg-white text-brand-primary shadow-md" : "text-gray-500")}>
                                    {j}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Empresa & Centro de Costo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Empresa - Cliente</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={formData.empresa}
                                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-10 text-sm text-gray-800 focus:outline-none"
                                >
                                    <option value="">Seleccione una opción</option>
                                    {empresasCliente.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Centro de Costos</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={formData.centroCostoId}
                                    onChange={(e) => setFormData({ ...formData, centroCostoId: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-10 text-sm text-gray-800 focus:outline-none"
                                >
                                    <option value="">Seleccione una opción</option>
                                    {centrosCosto.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orden de Servicio */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Orden de Servicio</label>
                        <div className="relative">
                            <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.ordenServicio}
                                onChange={(e) => setFormData({ ...formData, ordenServicio: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Contadores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Numero de Incidentes</label>
                            <input
                                type="number"
                                value={formData.numIncidentes}
                                onChange={(e) => setFormData({ ...formData, numIncidentes: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Numero de Auxilios</label>
                            <input
                                type="number"
                                value={formData.numAuxilios}
                                onChange={(e) => setFormData({ ...formData, numAuxilios: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Numero de Tratamientos Medicos</label>
                            <input
                                type="number"
                                value={formData.numTratamientos}
                                onChange={(e) => setFormData({ ...formData, numTratamientos: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            />
                        </div>
                    </div>

                    {/* Detalle & Info */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Detalle de las Situaciones</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                            <textarea
                                value={formData.detalleSituaciones}
                                onChange={(e) => setFormData({ ...formData, detalleSituaciones: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Informacion recibida del Colaborador</label>
                        <div className="relative">
                            <Info className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                            <textarea
                                value={formData.informacionColaborador}
                                onChange={(e) => setFormData({ ...formData, informacionColaborador: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Persona Involucrada */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Nombre de la persona</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.personaInvolucradaId}
                                onChange={(e) => setFormData({ ...formData, personaInvolucradaId: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-10 text-sm text-gray-800 focus:outline-none"
                            >
                                <option value="">Seleccione una opción</option>
                                {allPersonal.map(p => <option key={`p-${p.id}`} value={p.id}>{p.name} - {p.role}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Acto o Condicion */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Acto o Condicion Insegura</label>
                        <div className="relative">
                            <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.actoCondicion}
                                onChange={(e) => setFormData({ ...formData, actoCondicion: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 rounded-2xl border-2 border-gray-100 text-xs font-black text-brand-text-muted hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-[0.2em]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-[2] flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand-primary text-white text-xs font-black hover:brightness-110 shadow-2xl shadow-brand-primary/30 transition-all active:scale-95 uppercase tracking-[0.2em]"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Guardar Cambios' : 'Registrar Evento'}
                        </button>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};
