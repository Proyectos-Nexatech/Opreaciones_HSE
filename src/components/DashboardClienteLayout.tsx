import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NexatechIcon } from './NexatechIcon';
import { UserAvatar } from './UserAvatar';

export const DashboardClienteLayout: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const [showLogout, setShowLogout] = useState(false);

    const empresaNombre = profile?.empresa_cliente?.name || 'Dashboard Cliente';

    return (
        <div className="min-h-screen bg-brand-bg font-sans flex flex-col">
            {/* Header minimalista */}
            <header className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
                {/* Logo + Nombre sistema */}
                <div className="flex items-center gap-3">
                    <NexatechIcon className="w-8 h-8 flex-shrink-0" />
                    <div className="hidden sm:block">
                        <p className="text-xs font-black text-brand-primary uppercase tracking-widest leading-none">
                            Operaciones HSE
                        </p>
                        <p className="text-[10px] text-brand-text-muted font-semibold leading-none mt-0.5">
                            Panel de Cliente
                        </p>
                    </div>

                    {/* Separador */}
                    <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block" />

                    {/* Empresa asignada */}
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                            <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                        </div>
                        <span className="text-sm font-bold text-brand-text">
                            {empresaNombre}
                        </span>
                    </div>
                </div>

                {/* Usuario + Logout */}
                <div className="relative">
                    <button
                        onClick={() => setShowLogout(!showLogout)}
                        className="flex items-center gap-3 group hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                                {profile?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                            </p>
                            <p className="text-[11px] text-brand-text-muted font-medium">
                                {user?.email}
                            </p>
                        </div>
                        <div className="relative">
                            <UserAvatar user={user} name={profile?.full_name} size="md" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <ChevronDown className={`w-4 h-4 text-brand-text-muted transition-transform duration-200 ${showLogout ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown logout */}
                    {showLogout && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowLogout(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-50">
                                    <p className="text-xs font-black text-brand-text-muted uppercase tracking-widest mb-1">
                                        Sesión activa
                                    </p>
                                    <p className="text-sm font-bold text-brand-text truncate">
                                        {profile?.full_name || 'Usuario Cliente'}
                                    </p>
                                    <p className="text-xs text-brand-text-muted truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Contenido principal */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>

            {/* Footer con branding */}
            <footer className="py-3 px-6 bg-white border-t border-gray-100 flex items-center justify-center gap-2">
                <NexatechIcon className="w-4 h-4 opacity-40" />
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">
                    Powered by Nexatech · Operaciones HSE
                </p>
            </footer>
        </div>
    );
};
