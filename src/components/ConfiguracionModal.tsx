import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, ShieldCheck, BadgeCheck, Type, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    roles: string[];
}

export const UserConfigModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    roles
}) => {
    const [formData, setFormData] = useState({
        id: '',
        full_name: '',
        email: '',
        role_name: '',
        status: 'Activo'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id || '',
                full_name: initialData.full_name || '',
                email: initialData.email || '',
                role_name: initialData.role_name || roles[0] || '',
                status: initialData.status || 'Activo'
            });
        } else {
            setFormData({
                id: '',
                full_name: '',
                email: '',
                role_name: roles[0] || '',
                status: 'Activo'
            });
        }
    }, [initialData, isOpen, roles]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                <div className="bg-brand-primary p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Configuración de Acceso</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <User className="w-3 h-3 text-brand-primary" /> Nombre Completo
                            </label>
                            <input
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Mail className="w-3 h-3 text-brand-primary" /> Correo Electrónico
                            </label>
                            <input
                                required
                                type="email"
                                disabled={!!initialData}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner disabled:opacity-50"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                    <Shield className="w-3 h-3 text-brand-primary" /> Rol Asignado
                                </label>
                                <select
                                    required
                                    value={formData.role_name}
                                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                    <BadgeCheck className="w-3 h-3 text-brand-primary" /> Estado
                                </label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-[10px] font-black text-brand-text-muted hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-primary text-white text-[10px] font-black hover:brightness-110 shadow-xl shadow-brand-primary/20 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface RolePermissionsMatrixProps {
    permissions: string[];
    onToggle: (perm: string) => void;
    onToggleSection: (section: string, active: boolean) => void;
}

const RolePermissionsMatrix: React.FC<RolePermissionsMatrixProps> = ({ permissions, onToggle, onToggleSection }) => {
    const sections = [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'personal', name: 'Personal' },
        { id: 'personal_hse', name: 'Personal HSE' },
        { id: 'centros_costo', name: 'Centros de Costo' },
        { id: 'empresas', name: 'Empresas Cliente' },
        { id: 'reportes', name: 'Reportes HSE' },
        { id: 'asistencia', name: 'Asistencia' },
        { id: 'novedades', name: 'Novedades' },
        { id: 'ausentismo', name: 'Ausentismo' },
        { id: 'configuracion', name: 'Configuración' },
    ];

    const actions = [
        { id: 'ver', name: 'Ver' },
        { id: 'crear', name: 'Crear' },
        { id: 'editar', name: 'Editar' },
        { id: 'eliminar', name: 'Borrar' },
    ];

    const isChecked = (section: string, action: string) => permissions.includes(`${section}:${action}`);
    const isSectionFull = (section: string) => actions.every(a => isChecked(section, a.id));

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Matriz de Permisos por Sección</label>
            <div className="bg-gray-50 border border-gray-100 rounded-[32px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100/50 text-center">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Sección del Aplicativo</th>
                            <th className="px-4 py-4 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] border-l border-gray-200 bg-brand-primary/5">TODO</th>
                            {actions.map(action => (
                                <th key={action.id} className="px-4 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">{action.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sections.map(section => (
                            <tr key={section.id} className="hover:bg-white transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">{section.name}</span>
                                </td>
                                <td className="px-4 py-4 text-center border-l border-gray-100 bg-gray-50/30">
                                    <button
                                        type="button"
                                        onClick={() => onToggleSection(section.id, !isSectionFull(section.id))}
                                        className={cn(
                                            "w-7 h-7 rounded-xl border-2 inline-flex items-center justify-center transition-all",
                                            isSectionFull(section.id)
                                                ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110"
                                                : "border-gray-300 bg-white hover:border-brand-primary/40"
                                        )}
                                        title="Alternar todos los permisos de esta sección"
                                    >
                                        <ShieldCheck className={cn("w-4 h-4", isSectionFull(section.id) ? "animate-in zoom-in" : "opacity-40")} />
                                    </button>
                                </td>
                                {actions.map(action => {
                                    const permId = `${section.id}:${action.id}`;
                                    const active = isChecked(section.id, action.id);
                                    return (
                                        <td key={action.id} className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onToggle(permId)}
                                                className={cn(
                                                    "w-6 h-6 rounded-lg border-2 inline-flex items-center justify-center transition-all",
                                                    active
                                                        ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                                                        : "border-gray-200 bg-white hover:border-brand-primary/40"
                                                )}
                                            >
                                                {active && <BadgeCheck className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const RoleConfigModal: React.FC<RoleModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: Math.random().toString(36).substr(2, 9),
                name: '',
                description: '',
                permissions: []
            });
        }
    }, [initialData, isOpen]);

    const togglePermission = (perm: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const toggleSection = (sectionId: string, active: boolean) => {
        const actions = ['ver', 'crear', 'editar', 'eliminar'];
        const sectionPerms = actions.map(a => `${sectionId}:${a}`);

        setFormData(prev => {
            const filteredPerms = prev.permissions.filter(p => !sectionPerms.includes(p));
            return {
                ...prev,
                permissions: active ? [...filteredPerms, ...sectionPerms] : filteredPerms
            };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-brand-primary p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">{initialData ? 'Editar Rol' : 'Nuevo Rol'}</h2>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Configuración de Privilegios por Sección</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <Type className="w-3 h-3 text-brand-primary" /> Nombre del Rol
                            </label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                                placeholder="Ej: Supervisor Regional"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                <FileText className="w-3 h-3 text-brand-primary" /> Descripción Breve
                            </label>
                            <input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                                placeholder="Describa el alcance de este perfil..."
                            />
                        </div>
                    </div>

                    <RolePermissionsMatrix
                        permissions={formData.permissions}
                        onToggle={togglePermission}
                        onToggleSection={toggleSection}
                    />

                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-8 px-8 py-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-[10px] font-black text-brand-text-muted hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-primary text-white text-[10px] font-black hover:brightness-110 shadow-xl shadow-brand-primary/20 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Actualizar Privilegios' : 'Guardar Nuevo Rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
