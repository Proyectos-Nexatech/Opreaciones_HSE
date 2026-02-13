import React, { useState, useEffect } from 'react';
import {
    Users,
    ShieldCheck,
    Search,
    UserPlus,
    Key,
    BadgeCheck,
    ChevronRight,
    Edit3,
    Trash2,
    Shield,
    RotateCcw,
    Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserConfigModal, RoleConfigModal, ConfirmationModal } from '../components/ConfiguracionModal';
import { useAuth } from '../context/AuthContext';
import * as hseService from '../services/hseService';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Configuracion: React.FC = () => {
    const { profile } = useAuth();
    const isAdmin = profile?.role_name === 'Administrador';

    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // User Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Role Modal State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'Confirmar'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profilesData, rolesData] = await Promise.all([
                hseService.getProfiles(),
                hseService.getRoles()
            ]);
            setUsers(profilesData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Error loading configuration data:', error);
            alert('Error al cargar datos. Verifique la conexión con la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveUser = async (data: any) => {
        if (!isAdmin) return;
        try {
            if (editingUser) {
                await hseService.updateProfile(editingUser.id, {
                    full_name: data.full_name,
                    role_name: data.role_name,
                    status: data.status
                });
            } else {
                await hseService.createUser(data.email, data.full_name, data.role_name);
                alert('Usuario registrado exitosamente. Se ha enviado un correo de confirmación al usuario.');
            }
            await loadData();
            setEditingUser(null);
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(`Error al guardar usuario: ${error.message || 'Error desconocido'}`);
        }
    };

    const handleDeleteUser = (user: any) => {
        if (!isAdmin) return;

        if (user.status === 'Activo') {
            setConfirmModal({
                isOpen: true,
                title: 'Desactivar Usuario',
                message: `¿Desea DESACTIVAR el acceso de ${user.full_name || user.email}?\n\nEl usuario no podrá ingresar al sistema, pero se conservará su historial.`,
                isDestructive: true,
                confirmText: 'Desactivar',
                onConfirm: async () => {
                    try {
                        await hseService.updateProfile(user.id, { status: 'Inactivo' });
                        await loadData();
                    } catch (error: any) {
                        console.error('Error deactivating user:', error);
                        alert(`Error al desactivar usuario: ${error.message}`);
                    }
                }
            });
        } else {
            setConfirmModal({
                isOpen: true,
                title: 'Eliminar Usuario',
                message: `¿Está seguro de ELIMINAR PERMANENTEMENTE a ${user.full_name || user.email}?\n\nEsta acción es irreversible y podría fallar si el usuario tiene registros asociados.`,
                isDestructive: true,
                confirmText: 'Eliminar',
                onConfirm: async () => {
                    try {
                        await hseService.deleteProfile(user.id);
                        await loadData();
                    } catch (error: any) {
                        console.error('Error deleting user:', error);
                        alert('No se pudo eliminar el usuario. Es probable que tenga reportes o registros asociados.\n\nEl usuario permanecerá como "Inactivo".');
                    }
                }
            });
        }
    };

    const handleResetPassword = (email: string) => {
        if (!isAdmin) return;
        setConfirmModal({
            isOpen: true,
            title: 'Restablecer Contraseña',
            message: `¿Enviar correo de restablecimiento de contraseña a ${email}?`,
            isDestructive: false,
            confirmText: 'Enviar Correo',
            onConfirm: async () => {
                try {
                    await hseService.resetUserPassword(email);
                    alert('Correo de restablecimiento enviado exitosamente.');
                } catch (error: any) {
                    console.error('Error resetting password:', error);
                    alert(`Error al enviar el correo: ${error.message}`);
                }
            }
        });
    };

    const handleSaveRole = async (data: any) => {
        if (!isAdmin) return;
        try {
            if (editingRole) {
                await hseService.updateRole(editingRole.id, data);
            } else {
                await hseService.createRole(data);
            }
            await loadData();
            setEditingRole(null);
        } catch (error) {
            console.error('Error saving role:', error);
            alert('Error al guardar el rol');
        }
    };

    const handleDeleteRole = (id: string) => {
        if (!isAdmin) return;
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Rol',
            message: '¿Está seguro de eliminar este rol?\n\nSe desvincularán los usuarios que tengan este perfil asignado.',
            isDestructive: true,
            confirmText: 'Eliminar Rol',
            onConfirm: async () => {
                try {
                    await hseService.deleteRole(id);
                    await loadData();
                } catch (error) {
                    console.error('Error deleting role:', error);
                    alert('Error al eliminar el rol');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                <p className="text-brand-text-muted font-bold">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-4 md:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Configuración del Sistema</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Gestión avanzada de usuarios, roles y permisos del sistema.</p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        activeTab === 'users' ? (
                            <button
                                onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                            >
                                <UserPlus className="w-4 h-4" /> Nuevo Usuario
                            </button>
                        ) : (
                            <button
                                onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                            >
                                <Shield className="w-4 h-4" /> Crear Rol
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit mb-8 border border-gray-100">
                <button
                    onClick={() => setActiveTab('users')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all tabular-nums",
                        activeTab === 'users' ? "bg-white text-brand-primary shadow-sm ring-1 ring-gray-200" : "text-brand-text-muted hover:text-brand-text"
                    )}
                >
                    <Users className="w-4 h-4" />
                    Gestión de Usuarios
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all tabular-nums",
                        activeTab === 'roles' ? "bg-white text-brand-primary shadow-sm ring-1 ring-gray-200" : "text-brand-text-muted hover:text-brand-text"
                    )}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Roles y Permisos
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={loadData}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-text-muted hover:text-brand-text transition-all shadow-sm"
                            >
                                <RotateCcw className="w-4 h-4" /> Actualizar
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-5 text-[11px] font-black text-brand-text-muted uppercase tracking-widest border-b border-gray-100">Usuario</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-brand-text-muted uppercase tracking-widest border-b border-gray-100">Rol Asignado</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-brand-text-muted uppercase tracking-widest border-b border-gray-100">Estado</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-brand-text-muted uppercase tracking-widest border-b border-gray-100 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                                                        {(user.full_name || user.email || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-brand-text">{user.full_name || 'Sin nombre'}</p>
                                                        <p className="text-xs text-brand-text-muted">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-blue-50 rounded-md text-blue-600">
                                                        <Key className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-brand-text-muted">{user.role_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                                                    user.status === 'Activo' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Activo' ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResetPassword(user.email)}
                                                                title="Restablecer Contraseña"
                                                                className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }}
                                                                className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user)}
                                                                className="p-2 text-brand-text-muted hover:text-brand-error transition-colors hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="p-20 text-center">
                                    <p className="text-brand-text-muted font-black text-sm tracking-widest uppercase">No se encontraron usuarios</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map(role => {
                        const count = users.filter(u => u.role_name === role.name).length;
                        return (
                            <div key={role.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8 group hover:border-brand-primary/20 hover:shadow-xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingRole(role); setIsRoleModalOpen(true); }}
                                                className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors bg-gray-50 rounded-lg shadow-sm"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRole(role.id)}
                                                className="p-2 text-brand-text-muted hover:text-brand-error transition-colors bg-gray-50 rounded-lg shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-black text-brand-text mb-2 tracking-tight">{role.name}</h3>
                                <p className="text-xs font-bold text-brand-text-muted mb-6 leading-relaxed uppercase tracking-wider opacity-60 italic">{role.description}</p>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-3">Resumen de Permisos</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 text-[10px] font-black text-brand-text-muted rounded-xl uppercase tracking-wider">
                                            <BadgeCheck className="w-3 h-3 text-brand-primary" />
                                            {Array.isArray(role.permissions) ? role.permissions.length : 0} privilegios activos
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {users.filter(u => u.role_name === role.name).slice(0, 3).map((u) => (
                                                <div
                                                    key={u.id}
                                                    className="w-6 h-6 rounded-full border-2 border-white bg-brand-primary/10 flex items-center justify-center text-[8px] font-black text-brand-primary uppercase"
                                                    title={u.full_name || u.email}
                                                >
                                                    {(u.full_name || u.email || 'U')[0].toUpperCase()}
                                                </div>
                                            ))}
                                            {count > 3 && (
                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                                                    +{count - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold text-brand-text-muted">{count} {count === 1 ? 'usuario asignado' : 'usuarios asignados'}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-brand-text-muted group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <UserConfigModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
                initialData={editingUser}
                roles={roles.map(r => r.name)}
            />

            <RoleConfigModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={handleSaveRole}
                initialData={editingRole}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDestructive={confirmModal.isDestructive}
            />
        </div>
    );
};
