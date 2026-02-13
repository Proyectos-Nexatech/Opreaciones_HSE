import React, { useState } from 'react';
import { X, Calendar, User, Users, Mail, Building2, MapPin, ClipboardList, Plus, Save, Search, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supervisoresHSE } from '../data/supervisoresHSE';
import { allPersonal, centrosCosto, empresasCliente } from '../data/sharedData';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ReporteAsistenciaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const ReporteAsistenciaModal: React.FC<ReporteAsistenciaModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        supervisorId: '',
        date: new Date().toISOString().split('T')[0],
        shift: 'Dia' as 'Dia' | 'Noche',
        empresa: '',
        centro: '',
        orden: '',
        personId: '',
        status: 'A tiempo'
    });

    // Multi-select state
    const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch logged-in user email
    React.useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) {
                setFormData(prev => ({ ...prev, email: data.user!.email! }));
            }
        });
    }, []);

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData,
                // Only override shift if not present in initialData, otherwise trust it
                shift: initialData.shift || (initialData.h ? (initialData.h.includes('AM') ? 'Dia' : 'Noche') : 'Dia')
            });

            // Handle person selection for edit
            if (initialData.personId) {
                setSelectedPersons([initialData.personId]);
            } else if (initialData.name) {
                // Try to find person by name if ID is missing (legacy records)
                const person = allPersonal.find(p => p.name === initialData.name);
                if (person) {
                    setSelectedPersons([person.id]);
                }
            }
        } else {
            setFormData(prev => ({
                name: '',
                email: prev.email,
                supervisorId: '',
                date: new Date().toISOString().split('T')[0],
                shift: 'Dia',
                empresa: '',
                centro: '',
                orden: '',
                personId: '',
                status: 'A tiempo'
            }));
            setSelectedPersons([]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, personIds: selectedPersons });
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
                            <ClipboardList className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{initialData ? 'Editar Asistencia' : 'Reporte Asistencia'}</h2>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Control de Asistencia de Personal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90 bg-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {/* Fecha del Sistema */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Fecha del Sistema</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                readOnly
                                value={new Date().toLocaleString()}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-500 focus:outline-none"
                            />
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
                                value={formData.email}
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
                                {supervisoresHSE.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Plus className="w-4 h-4 text-gray-400 rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Fecha del Reporte */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Fecha del Reporte</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Jornada de Trabajo */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Jornada de Trabajo</label>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1.5">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, shift: 'Dia' })}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                                    formData.shift === 'Dia' ? "bg-white text-brand-primary shadow-md" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Dia
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, shift: 'Noche' })}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                                    formData.shift === 'Noche' ? "bg-white text-brand-primary shadow-md" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Noche
                            </button>
                        </div>
                    </div>

                    {/* Empresa - Cliente */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Empresa - Cliente</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.empresa}
                                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none"
                            >
                                <option value="">Seleccione una opción</option>
                                {empresasCliente.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Plus className="w-4 h-4 text-gray-400 rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Centro de Costos */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Centro de Costos</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.centro}
                                onChange={(e) => setFormData({ ...formData, centro: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none"
                            >
                                <option value="">Seleccione una opción</option>
                                {centrosCosto.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Plus className="w-4 h-4 text-gray-400 rotate-45" />
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
                                value={formData.orden}
                                onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                                placeholder="Ingrese orden de servicio"
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Seleccione la Persona (Multi-Select with Search & Checkboxes) */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Seleccione las Personas</label>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="relative border-b border-gray-100 bg-gray-50/50">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar personal..."
                                    className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none placeholder:text-gray-400 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                                {allPersonal.filter(p =>
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.role.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(p => (
                                    <label key={p.id} className="flex items-center gap-3 p-2.5 hover:bg-brand-primary/5 rounded-lg cursor-pointer transition-all group select-none">
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all shadow-sm",
                                            selectedPersons.includes(p.id)
                                                ? "bg-brand-primary border-brand-primary text-white scale-100"
                                                : "border-gray-200 bg-white text-transparent scale-95 group-hover:border-brand-primary/50 group-hover:scale-100"
                                        )}>
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedPersons.includes(p.id)}
                                            onChange={() => {
                                                if (selectedPersons.includes(p.id)) {
                                                    setSelectedPersons(prev => prev.filter(id => id !== p.id));
                                                } else {
                                                    setSelectedPersons(prev => [...prev, p.id]);
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-sm font-semibold transition-colors",
                                                selectedPersons.includes(p.id) ? "text-brand-primary" : "text-gray-700"
                                            )}>
                                                {p.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                                {p.role}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                                {allPersonal.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                        <User className="w-8 h-8 opacity-20 mb-2" />
                                        <p className="text-xs font-medium">No se encontraron resultados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-gray-400 font-medium">
                                {selectedPersons.length === 0 ? 'Ninguna persona seleccionada' : `${selectedPersons.length} persona${selectedPersons.length !== 1 ? 's' : ''} seleccionada${selectedPersons.length !== 1 ? 's' : ''}`}
                            </p>
                            {selectedPersons.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedPersons([])}
                                    className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors"
                                >
                                    Limpiar selección
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Conteo de Personal */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Conteo de Personal</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={selectedPersons.length}
                                readOnly
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-500 focus:outline-none"
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
                            type="submit"
                            className="flex-[2] flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand-primary text-white text-xs font-black hover:brightness-110 shadow-2xl shadow-brand-primary/30 transition-all active:scale-95 uppercase tracking-[0.2em]"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Guardar Cambios' : 'Registrar Asistencia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
