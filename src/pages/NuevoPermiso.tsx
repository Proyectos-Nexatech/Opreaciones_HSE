import React from 'react';
import {
    FileEdit,
    Users,
    PenTool,
    Search,
    Calendar,
    Clock,
    MapPin,
    Info,
    Map as MapIcon,
    AlertTriangle,
    History,
    FileDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const NuevoPermiso: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Nuevo Permiso de Trabajo</h1>
                    <p className="text-brand-text-muted">Complete el formulario para solicitar autorización de actividades.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-text-muted font-bold uppercase tracking-widest">Estado:</span>
                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-500/20">
                        Borrador
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Form Card */}
                    <div className="bg-white text-slate-900 rounded-[32px] overflow-hidden shadow-2xl">
                        {/* Stepper */}
                        <div className="flex border-b border-slate-100 bg-slate-50/50">
                            {[
                                { id: 'general', label: 'General', icon: FileEdit, active: true },
                                { id: 'personal', label: 'Personal', icon: Users, active: false },
                                { id: 'firma', label: 'Firma', icon: PenTool, active: false },
                            ].map((step) => (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "flex-1 flex flex-col items-center gap-2 py-6 relative transition-all",
                                        step.active ? "bg-white" : "opacity-40 grayscale"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        step.active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-200 text-slate-500"
                                    )}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">{step.label}</span>
                                    {step.active && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-blue-600 rounded-full" />}
                                </div>
                            ))}
                        </div>

                        {/* Form Content */}
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold">Datos Generales</h3>
                                    <div className="p-1 bg-blue-50 rounded-full text-blue-500">
                                        <Info className="w-4 h-4 cursor-help" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Información básica del proyecto y ubicación.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Centro de Costos <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Buscar código o nombre de proyecto..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-md transition-all cursor-pointer">
                                            <Search className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            Fecha de Inicio <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            Hora de Inicio <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="time"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ubicación Exacta</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Ej: Nivel 2, Sala de Bombas #4"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Descripción del Trabajo <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Describa las actividades a realizar, herramientas a utilizar y el objetivo principal..."
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50/50 flex justify-end gap-3">
                            <button className="px-8 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all">Cancelar</button>
                            <button className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">Siguiente Paso</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Map Card */}
                    <div className="bg-brand-card rounded-[32px] border border-white/5 overflow-hidden group">
                        <div className="h-48 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1541888941259-7927394605cd?auto=format&fit=crop&q=80&w=400"
                                className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute top-4 left-4 z-20">
                                <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-md text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">Zona Segura</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <MapIcon className="w-5 h-5 text-blue-400" />
                                <h4 className="font-bold">Mapa de Planta</h4>
                            </div>
                            <p className="text-xs text-brand-text-muted leading-relaxed mb-6">
                                Verifique las zonas restringidas antes de solicitar permisos.
                            </p>
                            <button className="w-full py-3 rounded-2xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all">Abrir Mapa Completo</button>
                        </div>
                    </div>

                    {/* Safety Reminder */}
                    <div className="bg-amber-900/10 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                            <AlertTriangle className="w-24 h-24" />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-500 mb-1">Recordatorio de Seguridad</h4>
                                <p className="text-[11px] text-brand-text-muted leading-relaxed">
                                    Para trabajos en caliente, recuerde verificar la ausencia de materiales inflamables en un radio de 10 metros.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-brand-card rounded-[32px] border border-white/5 p-8">
                        <p className="text-[10px] text-brand-text-muted uppercase font-bold tracking-widest mb-6">Acciones Rápidas</p>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3">
                                    <History className="w-5 h-5 text-brand-text-muted group-hover:text-blue-400 transition-colors" />
                                    <span className="text-xs font-semibold">Ver historial de permisos</span>
                                </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3">
                                    <FileDown className="w-5 h-5 text-brand-text-muted group-hover:text-blue-400 transition-colors" />
                                    <span className="text-xs font-semibold">Descargar plantilla PDF</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
