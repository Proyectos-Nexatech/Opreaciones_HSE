import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Mail, User, Calendar, Building2, MapPin, Hash, AlertTriangle, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { allPersonal, empresasCliente, centrosCosto } from '../data/sharedData';
import { supervisoresHSE } from '../data/supervisoresHSE';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ReporteAusentismoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const ReporteAusentismoModal: React.FC<ReporteAusentismoModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [formData, setFormData] = useState({
        id: '',
        systemDate: '',
        email: '',
        reporter: '',
        reportDate: '',
        shift: 'Dia',
        company: '',
        costCenter: '',
        serviceOrder: '',
        absentPerson: '',
        cause: ''
    });

    const personnel = [
        ...allPersonal.map(p => ({ ...p, id: `p-${p.id}` })),
        ...supervisoresHSE.map(s => ({ ...s, id: `s-${s.id}` }))
    ];

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) {
                setFormData(prev => ({ ...prev, email: data.user!.email! }));
            }
        });
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        } else {
            const now = new Date();
            setFormData(prev => ({
                id: Math.random().toString(36).substr(2, 9),
                systemDate: now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO'),
                email: prev.email,
                reporter: '',
                reportDate: now.toISOString().split('T')[0],
                shift: 'Dia',
                company: '',
                costCenter: '',
                serviceOrder: '',
                absentPerson: '',
                cause: ''
            }));
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
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
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{initialData ? 'Editar Ausentismo' : 'Reporte Ausentismo Filtrado'}</h2>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Gestión de Novedades de Personal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90 bg-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Fecha del Sistema */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                                Fecha del Sistema
                            </label>
                            <input
                                disabled
                                type="text"
                                value={formData.systemDate}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 cursor-not-allowed shadow-inner"
                            />
                        </div>

                        {/* Correo */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Mail className="w-3.5 h-3.5 text-brand-primary" />
                                Correo
                            </label>
                            <input
                                disabled
                                type="email"
                                value={formData.email}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 cursor-not-allowed shadow-inner"
                                placeholder="cargando..."
                            />
                        </div>

                        {/* Personal que realiza el reporte */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <User className="w-3.5 h-3.5 text-brand-primary" />
                                Personal que realiza el Reporte
                            </label>
                            <select
                                required
                                value={formData.reporter}
                                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione personal...</option>
                                {personnel.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha del Reporte */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                                Fecha del Reporte
                            </label>
                            <input
                                required
                                type="date"
                                value={formData.reportDate}
                                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                            />
                        </div>

                        {/* Jornada de Trabajo */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Jornada de Trabajo</label>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, shift: 'Dia' })}
                                    className={cn(
                                        "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        formData.shift === 'Dia' ? "bg-white text-brand-primary shadow-sm ring-1 ring-gray-100" : "text-gray-400 hover:text-brand-text-muted"
                                    )}
                                >
                                    Día
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, shift: 'Noche' })}
                                    className={cn(
                                        "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        formData.shift === 'Noche' ? "bg-white text-brand-primary shadow-sm ring-1 ring-gray-100" : "text-gray-400 hover:text-brand-text-muted"
                                    )}
                                >
                                    Noche
                                </button>
                            </div>
                        </div>

                        {/* Empresa - Cliente */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                                Empresa - Cliente
                            </label>
                            <select
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione empresa...</option>
                                {empresasCliente.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Centro de Costos */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                                Centro de Costos
                            </label>
                            <select
                                required
                                value={formData.costCenter}
                                onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione centro...</option>
                                {centrosCosto.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Orden de Servicio */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Hash className="w-3.5 h-3.5 text-brand-primary" />
                                Orden de Servicio
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.serviceOrder}
                                onChange={(e) => setFormData({ ...formData, serviceOrder: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                                placeholder="Número de orden..."
                            />
                        </div>

                        {/* Nombre de la Persona */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <User className="w-3.5 h-3.5 text-brand-primary" />
                                Nombre de la Persona
                            </label>
                            <select
                                required
                                value={formData.absentPerson}
                                onChange={(e) => setFormData({ ...formData, absentPerson: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione persona ausente...</option>
                                {personnel.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Causa de Ausentismo */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                                Causa de Ausentismo
                            </label>
                            <select
                                required
                                value={formData.cause}
                                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione causa...</option>
                                <option value="Médico">Médico</option>
                                <option value="Familiar">Familiar</option>
                                <option value="Trámites">Trámites</option>
                                <option value="Otros">Otros</option>
                            </select>
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
                            type="submit"
                            className="flex-[2] flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand-primary text-white text-xs font-black hover:brightness-110 shadow-2xl shadow-brand-primary/30 transition-all active:scale-95 uppercase tracking-[0.2em]"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Guardar Cambios' : 'Registrar Ausentismo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
